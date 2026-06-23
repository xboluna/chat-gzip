"""gzip as a language model: beam-search text generation by compression.

Vendored from https://github.com/nathan-barry/gzipt with stop-sequence support.
"""

from __future__ import annotations

import heapq
import math
import random
import zlib
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from typing import Literal

GZIP_WINDOW = 32768
DEFAULT_WINDOW = 30000

_worker_pool: ThreadPoolExecutor | None = None
_worker_pool_size = 0


def get_worker_pool(workers: int) -> ThreadPoolExecutor | None:
    global _worker_pool, _worker_pool_size
    if workers <= 1:
        return None
    if _worker_pool is None or _worker_pool_size != workers:
        if _worker_pool is not None:
            _worker_pool.shutdown(wait=False, cancel_futures=True)
        _worker_pool = ThreadPoolExecutor(
            max_workers=workers,
            thread_name_prefix="gzipt",
        )
        _worker_pool_size = workers
    return _worker_pool


def warm_worker_pool(workers: int = 1) -> None:
    pool = get_worker_pool(workers)
    if pool is not None:
        pool.submit(lambda: None).result()


def corpus_alphabet(data: bytes) -> tuple[int, ...]:
    return tuple(sorted(set(data))) or tuple(range(256))


def candidate_lengths(
    context: bytes,
    sequences: list[bytes],
    *,
    level: int = 9,
    pool: ThreadPoolExecutor | None = None,
) -> list[int]:
    base = zlib.compressobj(level)
    head = len(base.compress(context))

    def length_for(seq: bytes) -> int:
        clone = base.copy()
        return head + len(clone.compress(seq) + clone.flush(zlib.Z_FINISH))

    if pool is not None:
        return list(pool.map(length_for, sequences))
    return [length_for(seq) for seq in sequences]


def _truncate_at_stop(text: bytes, stop_sequences: tuple[bytes, ...]) -> tuple[bytes, bool]:
    """Return text truncated before the earliest stop sequence, and whether we stopped."""
    earliest: int | None = None
    for stop in stop_sequences:
        if not stop:
            continue
        idx = text.find(stop)
        if idx != -1 and (earliest is None or idx < earliest):
            earliest = idx
    if earliest is None:
        return text, False
    return text[:earliest], True


StreamKind = Literal["preview", "commit"]


def generate_stream_events(
    corpus: bytes,
    prompt: bytes,
    length: int,
    *,
    window: int = DEFAULT_WINDOW,
    horizon: int = 24,
    beam_width: int = 32,
    temperature: float = 0.5,
    tail: int = 80,
    level: int = 9,
    workers: int = 1,
    alphabet: tuple[int, ...] | None = None,
    seed: int | None = None,
    stop_sequences: tuple[bytes, ...] = (b"\n\n", b"\x00"),
) -> Iterator[tuple[StreamKind, bytes]]:
    """Yield beam-search previews while searching and commits when a span is chosen."""
    rng = random.Random(seed)
    if alphabet is None:
        alphabet = corpus_alphabet(corpus + prompt)
    corpus_window = corpus[:window]
    pool = get_worker_pool(workers)

    out = bytearray()
    while len(out) < length:
        recent = (bytes(prompt) + bytes(out))[-tail:]
        ctx = corpus_window + recent

        beams: list[bytes] = [b""]
        beam_lens: list[int] = [0]
        for _ in range(horizon):
            cand = [h + bytes([byte]) for h in beams for byte in alphabet]
            lens = candidate_lengths(ctx, cand, level=level, pool=pool)
            order = heapq.nsmallest(beam_width, range(len(cand)), key=lens.__getitem__)
            beams = [cand[i] for i in order]
            beam_lens = [lens[i] for i in order]
            yield ("preview", beams[0])

        if temperature <= 0:
            span = beams[0]
        else:
            best = beam_lens[0]
            weights = [math.exp(-(L - best) / temperature) for L in beam_lens]
            span = rng.choices(beams, weights=weights, k=1)[0]

        prev_len = len(out)
        candidate = bytes(out) + span
        truncated, stopped = _truncate_at_stop(candidate, stop_sequences)
        out.clear()
        out.extend(truncated)

        new_bytes = bytes(out[prev_len:])
        if new_bytes:
            yield ("commit", new_bytes)
        yield ("preview", b"")

        if stopped:
            break

        if len(out) >= length:
            break


def generate_stream(
    corpus: bytes,
    prompt: bytes,
    length: int,
    *,
    window: int = DEFAULT_WINDOW,
    horizon: int = 24,
    beam_width: int = 32,
    temperature: float = 0.5,
    tail: int = 80,
    level: int = 9,
    workers: int = 1,
    alphabet: tuple[int, ...] | None = None,
    seed: int | None = None,
    stop_sequences: tuple[bytes, ...] = (b"\n\n", b"\x00"),
) -> Iterator[bytes]:
    """Yield each committed span while generating up to ``length`` bytes."""
    for kind, payload in generate_stream_events(
        corpus,
        prompt,
        length,
        window=window,
        horizon=horizon,
        beam_width=beam_width,
        temperature=temperature,
        tail=tail,
        level=level,
        workers=workers,
        alphabet=alphabet,
        seed=seed,
        stop_sequences=stop_sequences,
    ):
        if kind == "commit":
            yield payload


def generate(
    corpus: bytes,
    prompt: bytes,
    length: int,
    *,
    window: int = DEFAULT_WINDOW,
    horizon: int = 24,
    beam_width: int = 32,
    temperature: float = 0.5,
    tail: int = 80,
    level: int = 9,
    workers: int = 1,
    alphabet: tuple[int, ...] | None = None,
    seed: int | None = None,
    stop_sequences: tuple[bytes, ...] = (b"\n\n", b"\x00"),
) -> bytes:
    """Generate ``length`` bytes continuing ``prompt``, primed by ``corpus``."""
    out = bytearray()
    for chunk in generate_stream(
        corpus,
        prompt,
        length,
        window=window,
        horizon=horizon,
        beam_width=beam_width,
        temperature=temperature,
        tail=tail,
        level=level,
        workers=workers,
        alphabet=alphabet,
        seed=seed,
        stop_sequences=stop_sequences,
    ):
        out.extend(chunk)
    return bytes(out[:length])
