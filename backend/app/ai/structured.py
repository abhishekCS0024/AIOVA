"""Call the LLM and validate its JSON against a Pydantic model.

On invalid output, retry once with the error appended (docs §7). Invalid output
shows up two ways: JSON that fails Pydantic validation, or Groq's JSON mode
rejecting malformed JSON outright (HTTP 400 `json_validate_failed`).
"""

import json
import logging
from typing import TypeVar

from groq import BadRequestError
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, ValidationError

from app.ai.llm import get_llm
from app.ai.prompts import load_prompt
from app.core.config import settings

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class StructuredOutputError(RuntimeError):
    """The model kept returning output that does not match the schema."""


def _json_mode_failure(exc: BadRequestError) -> str | None:
    """Return the model's failed generation if Groq rejected it as invalid JSON."""
    body = exc.body if isinstance(exc.body, dict) else {}
    error = body.get("error", body)
    if error.get("code") != "json_validate_failed":
        return None
    return error.get("failed_generation", "")


def invoke_structured(prompt_name: str, schema: type[T], **variables) -> T:
    system = load_prompt("system")
    user = load_prompt(prompt_name).format(
        schema=json.dumps(schema.model_json_schema()), **variables
    )
    messages = [SystemMessage(system), HumanMessage(user)]

    last_error: Exception | None = None
    for attempt in range(settings.llm_validation_retries + 1):
        try:
            raw = get_llm().invoke(messages).content
            return schema.model_validate_json(raw)
        except ValidationError as exc:
            last_error, bad_output, problem = exc, raw, f"failed schema validation:\n{exc}"
        except BadRequestError as exc:
            bad_output = _json_mode_failure(exc)
            if bad_output is None:
                raise
            last_error, problem = exc, "is not valid JSON (check brackets and quoting)"

        logger.warning("%s: invalid output on attempt %d", prompt_name, attempt + 1)
        messages += [
            AIMessage(bad_output),
            HumanMessage(f"Your previous output {problem}\nReturn the corrected JSON only."),
        ]
    raise StructuredOutputError(f"{prompt_name}: model output failed validation") from last_error
