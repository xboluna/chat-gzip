from __future__ import annotations

import re
import time
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any, Literal, TypedDict

from app.services import gzipt
from app.services.corpora import (
    CONTEXT_LIMIT_BYTES,
    DEFAULT_BEAM_WIDTH,
    DEFAULT_COMPRESSION_LEVEL,
    DEFAULT_HORIZON,
    DEFAULT_MAX_BYTES,
    DEFAULT_TEMPERATURE,
    DEFAULT_WORKERS,
    MAX_GENERATED_BYTES,
    MIN_GENERATED_BYTES,
    MIN_TEMPERATURE,
    corpus_alphabet_for_id,
    load_corpus_bytes,
    merge_alphabet,
)

DEFAULT_STOP_SEQUENCES = (b"\x00",)


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


class ChatChunkEvent(TypedDict):
    type: Literal["chunk"]
    content: str


class ChatPreviewEvent(TypedDict):
    type: Literal["preview"]
    content: str


class ChatDoneEvent(TypedDict):
    type: Literal["done"]
    meta: dict[str, Any]


ChatStreamEvent = ChatChunkEvent | ChatPreviewEvent | ChatDoneEvent


@dataclass(frozen=True)
class GenerationParams:
    corpus: bytes
    prompt_bytes: bytes
    temperature: float
    max_bytes: int
    alphabet: tuple[int, ...]


def _generation_params(
    *,
    corpus_id: str,
    prompt_bytes: bytes,
    temperature: float,
    max_bytes: int,
) -> GenerationParams:
    return GenerationParams(
        corpus=load_corpus_bytes(corpus_id),
        prompt_bytes=prompt_bytes,
        max_bytes=max(
            MIN_GENERATED_BYTES,
            min(MAX_GENERATED_BYTES, int(max_bytes)),
        ),
        temperature=max(MIN_TEMPERATURE, min(2.0, float(temperature))),
        alphabet=merge_alphabet(
            corpus_alphabet_for_id(corpus_id),
            prompt_bytes,
        ),
    )


def _preview_suffix(committed_raw: bytes, tentative: bytes) -> str:
    if not tentative:
        return ""
    committed_text = sanitize_output(committed_raw.decode("utf-8", errors="replace"))
    combined_text = sanitize_output(
        (committed_raw + tentative).decode("utf-8", errors="replace"),
    )
    if combined_text.startswith(committed_text):
        return combined_text[len(committed_text) :]
    return sanitize_output(tentative.decode("utf-8", errors="replace"))


def generate_reply_stream(
    *,
    corpus_id: str,
    messages: list[dict[str, Any]],
    temperature: float = DEFAULT_TEMPERATURE,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> Iterator[ChatStreamEvent]:
    prompt_text = build_prompt(messages)
    prompt_bytes = prompt_text.encode("utf-8", errors="replace")
    context_bytes = len(prompt_bytes)

    params = _generation_params(
        corpus_id=corpus_id,
        prompt_bytes=prompt_bytes,
        temperature=temperature,
        max_bytes=max_bytes,
    )

    started = time.perf_counter()
    raw = bytearray()
    last_sanitized_len = 0

    for kind, payload in gzipt.generate_stream_events(
        params.corpus,
        params.prompt_bytes,
        params.max_bytes,
        beam_width=DEFAULT_BEAM_WIDTH,
        horizon=DEFAULT_HORIZON,
        level=DEFAULT_COMPRESSION_LEVEL,
        workers=DEFAULT_WORKERS,
        temperature=params.temperature,
        alphabet=params.alphabet,
        stop_sequences=DEFAULT_STOP_SEQUENCES,
    ):
        if kind == "preview":
            yield {
                "type": "preview",
                "content": _preview_suffix(raw, payload),
            }
            continue

        raw.extend(payload)
        sanitized = sanitize_output(raw.decode("utf-8", errors="replace"))
        if len(sanitized) > last_sanitized_len:
            yield {
                "type": "chunk",
                "content": sanitized[last_sanitized_len:],
            }
            last_sanitized_len = len(sanitized)

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    yield {
        "type": "done",
        "meta": {
            "elapsed_ms": elapsed_ms,
            "bytes_generated": len(raw),
            "corpus_id": corpus_id,
            "temperature": params.temperature,
            "max_bytes": params.max_bytes,
            "context_bytes": context_bytes,
            "context_limit_bytes": CONTEXT_LIMIT_BYTES,
        },
    }


def generate_reply(
    *,
    corpus_id: str,
    messages: list[dict[str, Any]],
    temperature: float = DEFAULT_TEMPERATURE,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> dict[str, Any]:
    prompt_text = build_prompt(messages)
    prompt_bytes = prompt_text.encode("utf-8", errors="replace")
    context_bytes = len(prompt_bytes)

    params = _generation_params(
        corpus_id=corpus_id,
        prompt_bytes=prompt_bytes,
        temperature=temperature,
        max_bytes=max_bytes,
    )

    started = time.perf_counter()
    raw = gzipt.generate(
        params.corpus,
        params.prompt_bytes,
        params.max_bytes,
        beam_width=DEFAULT_BEAM_WIDTH,
        horizon=DEFAULT_HORIZON,
        level=DEFAULT_COMPRESSION_LEVEL,
        workers=DEFAULT_WORKERS,
        temperature=params.temperature,
        alphabet=params.alphabet,
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
            "temperature": params.temperature,
            "max_bytes": params.max_bytes,
            "context_bytes": context_bytes,
            "context_limit_bytes": CONTEXT_LIMIT_BYTES,
        },
    }
