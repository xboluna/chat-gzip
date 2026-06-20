"""gzip as a language model: beam-search text generation by compression.

Vendored from https://github.com/nathan-barry/gzipt with stop-sequence support.
"""

from __future__ import annotations

import math
import random
import zlib
from concurrent.futures import ThreadPoolExecutor

GZIP_WINDOW = 32768
DEFAULT_WINDOW = 30000


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
    """Generate ``length`` bytes continuing ``prompt``, primed by ``corpus``.

    After each committed span, halts early if ``prompt + generated`` ends with
    (or contains) any configured stop sequence.
    """
    rng = random.Random(seed)
    if alphabet is None:
        alphabet = corpus_alphabet(corpus + prompt)
    corpus_window = corpus[:window]
    pool = ThreadPoolExecutor(workers) if workers > 1 else None

    out = bytearray()
    try:
        while len(out) < length:
            recent = (bytes(prompt) + bytes(out))[-tail:]
            ctx = corpus_window + recent

            beams: list[bytes] = [b""]
            beam_lens: list[int] = [0]
            for _ in range(horizon):
                cand = [h + bytes([b]) for h in beams for b in alphabet]
                lens = candidate_lengths(ctx, cand, level=level, pool=pool)
                order = sorted(range(len(cand)), key=lens.__getitem__)[:beam_width]
                beams = [cand[i] for i in order]
                beam_lens = [lens[i] for i in order]

            if temperature <= 0:
                span = beams[0]
            else:
                best = beam_lens[0]
                weights = [math.exp(-(L - best) / temperature) for L in beam_lens]
                span = rng.choices(beams, weights=weights, k=1)[0]

            candidate = bytes(out) + span
            truncated, stopped = _truncate_at_stop(candidate, stop_sequences)
            out.clear()
            out.extend(truncated)

            if stopped:
                break

            if len(out) >= length:
                break
    finally:
        if pool is not None:
            pool.shutdown(wait=False)

    return bytes(out[:length])
