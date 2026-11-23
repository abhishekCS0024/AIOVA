from pathlib import Path

import pytest

SAMPLES = Path(__file__).resolve().parents[2] / "samples" / "DEV-2026-041"


@pytest.fixture
def samples_dir() -> Path:
    return SAMPLES
