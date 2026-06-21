from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"

CONTEXT_LIMIT_BYTES = 32768
MAX_GENERATED_BYTES = 100
DEFAULT_TEMPERATURE = 0.5
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
    CorpusSpec("typescript-errors", "TypeScript Errors", "typescript-errors.txt", True),
    CorpusSpec("http-status", "HTTP Status Codes", "http-status.txt", True),
    CorpusSpec("movie-quotes", "Movie Quotes", "movie-quotes.txt", True),
    CorpusSpec("genz-slang", "Gen Z Slang", "genz-slang.txt", True),
    CorpusSpec("vc-glossary", "Startup / VC Glossary", "vc-glossary.txt", True),
    CorpusSpec("copypasta", "Reddit Copypasta", "copypasta.txt", True),
    CorpusSpec("tech-twitter", "Tech Twitter", "tech-twitter.txt", True),
    CorpusSpec("cocktails", "Cocktail Recipes", "cocktails.txt", True),
    CorpusSpec("sports-commentary", "Sports Commentary", "sports-commentary.txt", True),
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
