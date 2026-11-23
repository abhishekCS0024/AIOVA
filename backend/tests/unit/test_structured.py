import httpx
import pytest
from groq import BadRequestError
from pydantic import BaseModel

from app.ai import structured


class Out(BaseModel):
    value: int


class FakeLLM:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.calls = []

    def invoke(self, messages):
        self.calls.append(messages)
        item = self.responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return type("Msg", (), {"content": item})()


def _json_mode_error() -> BadRequestError:
    request = httpx.Request("POST", "https://api.groq.com")
    body = {"error": {"code": "json_validate_failed", "failed_generation": '{"value": 1}}'}}
    return BadRequestError("bad json", response=httpx.Response(400, request=request), body=body)


@pytest.fixture
def prompts(monkeypatch):
    monkeypatch.setattr(structured, "load_prompt", lambda name: "{schema}")


def test_retries_after_schema_validation_error(monkeypatch, prompts):
    llm = FakeLLM('{"value": "not a number"}', '{"value": 2}')
    monkeypatch.setattr(structured, "get_llm", lambda: llm)
    assert structured.invoke_structured("x", Out).value == 2
    assert "failed schema validation" in llm.calls[1][-1].content


def test_retries_after_groq_json_mode_rejection(monkeypatch, prompts):
    llm = FakeLLM(_json_mode_error(), '{"value": 3}')
    monkeypatch.setattr(structured, "get_llm", lambda: llm)
    assert structured.invoke_structured("x", Out).value == 3
    assert llm.calls[1][-2].content == '{"value": 1}}'  # model sees its broken output


def test_gives_up_after_one_retry(monkeypatch, prompts):
    llm = FakeLLM("nope", "still nope")
    monkeypatch.setattr(structured, "get_llm", lambda: llm)
    with pytest.raises(structured.StructuredOutputError):
        structured.invoke_structured("x", Out)
