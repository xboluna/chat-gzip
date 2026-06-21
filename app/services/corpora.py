from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"

CONTEXT_LIMIT_BYTES = 32768
MIN_GENERATED_BYTES = 32
MAX_GENERATED_BYTES = 1048
DEFAULT_MAX_BYTES = 64
MIN_TEMPERATURE = 0.2
DEFAULT_TEMPERATURE = 1.0
DEFAULT_BEAM_WIDTH = 16
DEFAULT_WORKERS = 4


@dataclass(frozen=True)
class CorpusSpec:
    id: str
    label: str
    filename: str
    enabled: bool


CORPORA: tuple[CorpusSpec, ...] = (
    CorpusSpec("tiny-shakespeare", "Tiny Shakespeare", "tiny-shakespeare.txt", True),
    CorpusSpec("http-status", "HTTP talk", "http-status.txt", True),
    CorpusSpec("movie-quotes", "and the oscar goes to", "movie-quotes.txt", True),
    CorpusSpec("vc-glossary", "VC slop", "vc-glossary.txt", True),
    CorpusSpec("copypasta", "navy seal energy", "copypasta.txt", True),
    CorpusSpec("tech-twitter", "twitterverse", "tech-twitter.txt", True),
    CorpusSpec("sports-commentary", "GOOOAL", "sports-commentary.txt", True),
)

DEFAULT_CORPUS_ID = "tiny-shakespeare"


def corpus_catalog() -> dict:
    return {
        "corpora": [
            {"id": c.id, "label": c.label, "enabled": c.enabled}
            for c in CORPORA
        ],
        "default": DEFAULT_CORPUS_ID,
    }


def get_corpus_spec(corpus_id: str) -> CorpusSpec | None:
    for corpus in CORPORA:
        if corpus.id == corpus_id:
            return corpus
    return None


def load_corpus_bytes(corpus_id: str) -> bytes:
    spec = get_corpus_spec(corpus_id)
    if spec is None or not spec.enabled:
        raise ValueError(f"Corpus not available: {corpus_id}")

    path = DATA_DIR / spec.filename
    if not path.is_file():
        raise FileNotFoundError(f"Corpus file missing: {path}")

    return path.read_bytes()
