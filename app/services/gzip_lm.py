from __future__ import annotations

import re
import time
from typing import Any

from app.services import gzipt
from app.services.corpora import (
    CONTEXT_LIMIT_BYTES,
    DEFAULT_BEAM_WIDTH,
    DEFAULT_TEMPERATURE,
    DEFAULT_WORKERS,
    MAX_GENERATED_BYTES,
    load_corpus_bytes,
)

DEFAULT_STOP_SEQUENCES = (b"\n\n", b"\x00")


def build_prompt(messages: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for message in messages:
        content = (message.get("content") or "").strip()
        if content:
            parts.append(content)
    return "\n".join(parts)


def sanitize_output(text: str) -> str:
    cleaned = text.replace("\x00", "")
    cleaned = re.sub(r"[ \t]+\n", "\n", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned


def generate_reply(
    *,
    corpus_id: str,
    messages: list[dict[str, Any]],
    temperature: float = DEFAULT_TEMPERATURE,
) -> dict[str, Any]:
    prompt_text = build_prompt(messages)
    prompt_bytes = prompt_text.encode("utf-8", errors="replace")
    context_bytes = len(prompt_bytes)

    corpus = load_corpus_bytes(corpus_id)
    clamped_temp = max(0.0, min(2.0, float(temperature)))

    started = time.perf_counter()
    raw = gzipt.generate(
        corpus,
        prompt_bytes,
        MAX_GENERATED_BYTES,
        beam_width=DEFAULT_BEAM_WIDTH,
        workers=DEFAULT_WORKERS,
        temperature=clamped_temp,
        stop_sequences=DEFAULT_STOP_SEQUENCES,
    )
    elapsed_ms = int((time.perf_counter() - started) * 1000)

    content = sanitize_output(raw.decode("utf-8", errors="replace"))

    return {
        "content": content,
        "meta": {
            "elapsed_ms": elapsed_ms,
            "bytes_generated": len(raw),
            "corpus_id": corpus_id,
            "temperature": clamped_temp,
            "context_bytes": context_bytes,
            "context_limit_bytes": CONTEXT_LIMIT_BYTES,
        },
    }
