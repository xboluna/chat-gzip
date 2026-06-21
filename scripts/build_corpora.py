#!/usr/bin/env python3
"""Build corpus text files from public sources (≤32 KiB each)."""

from __future__ import annotations

import csv
import io
import json
import re
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MAX_BYTES = 32768

TECH_TWITTER = """\
Unpopular opinion: {thing} was better before they added types.
Hot take: {company} is a {one_word} company cosplaying as a {tech} company.
{language} is just {other_language} with extra steps and worse {tld} domains.
I don't hate {framework}, I just think {alternative} solved the problem better in 2014.
Real devs don't use {tool}. They use {other_tool} and pretend it's different.
The {hype_cycle} is over. We're entering the {new_hype} era now.
If your startup isn't using {buzzword}, you're already behind.
Normalize {weird_practice} in production. It's actually fine.
This could've been a {simple_thing} but they shipped a {complex_thing} instead.
Thread: why {popular_thing} is a trap and {obscure_thing} is the future 🧵
Controversial: {job_title} should learn to {unexpected_skill} before writing code.
Everyone's building {product} but nobody's solving {real_problem}.
The best engineers I know still deploy on {old_platform} and sleep well.
Stop optimizing {metric}. Start optimizing {better_metric}.
VCs will fund {silly_idea} but ignore {useful_idea} every time.
Your {architecture} isn't microservices, it's distributed monolith with extra latency.
We don't need another {category} app. We need fewer meetings about {category}.
If you're not embarrassed by v1, you launched too late — unless v1 is {bad_example}.
The real 10x engineer uses {editor} and refuses to explain why.
AI won't replace developers. It'll replace developers who don't use {ai_tool}.
"""

SPORTS_COMMENTARY = """\
{"minute": 1, "event": "kickoff", "text": "And we're underway — a bright start expected from the home side."}
{"minute": 7, "event": "chance", "text": "Lovely build-up play from the left flank, but the final ball just evades the striker."}
{"minute": 12, "event": "goal", "text": "GOAL! A thunderous strike from the edge of the box — the keeper had no chance."}
{"minute": 18, "event": "yellow_card", "text": "A cynical foul to stop the counter — the referee reaches for the yellow."}
{"minute": 24, "event": "corner", "text": "Corner to the visitors. The set-piece specialist steps up."}
{"minute": 31, "event": "save", "text": "Brilliant reflex save! The goalkeeper tips it onto the bar."}
{"minute": 38, "event": "offside", "text": "Flag's up — inches offside, but the linesman got it right."}
{"minute": 45, "event": "halftime", "text": "Half-time whistle. A tight contest so far — managers will have work to do."}
{"minute": 52, "event": "substitution", "text": "Fresh legs coming on — the manager looking to change the tempo."}
{"minute": 58, "event": "penalty", "text": "PENALTY! Handball in the box — no arguments from the defender."}
{"minute": 63, "event": "goal", "text": "He slots it home! Cool as you like from twelve yards."}
{"minute": 71, "event": "chance", "text": "Header from six yards — somehow over the bar. The striker holds his head."}
{"minute": 79, "event": "red_card", "text": "Straight red! A reckless challenge and the game has turned on its head."}
{"minute": 84, "event": "chance", "text": "One-on-one with the keeper — he drags it wide. That could've been the winner."}
{"minute": 90, "event": "fulltime", "text": "Full-time whistle. A dramatic finish — both sides will feel they could've done more."}
{"minute": 3, "event": "foul", "text": "Late challenge in midfield — free kick in a dangerous area."}
{"minute": 15, "event": "chance", "text": "The winger cuts inside and curls one just past the far post."}
{"minute": 27, "event": "goal", "text": "Own goal! Deflection off the defender — cruel for the away side."}
{"minute": 41, "event": "var", "text": "VAR check in progress — the stadium falls silent."}
{"minute": 55, "event": "goal", "text": "Equalizer! The crowd erupts — momentum has swung completely."}
{"minute": 67, "event": "injury", "text": "Concern here — the physio is on. Play resumes after a brief stoppage."}
{"minute": 88, "event": "chance", "text": "Desperate defending on the line — somehow cleared off the goal line."}
{"minute": 92, "event": "goal", "text": "Winner in stoppage time! Absolute scenes at the final whistle."}
{"minute": 10, "event": "chance", "text": "Counter-attack at pace — the through ball is just too heavy."}
{"minute": 22, "event": "yellow_card", "text": "Second yellow in two minutes — the referee is losing patience."}
{"minute": 35, "event": "free_kick", "text": "Free kick twenty-five yards out — the wall is set, five men strong."}
{"minute": 48, "event": "goal", "text": "What a start to the second half — a curling effort into the top corner."}
{"minute": 61, "event": "substitution", "text": "Tactical change — a defensive midfielder replaced by an attacking option."}
{"minute": 74, "event": "chance", "text": "The cross finds the back post — headed wide with the goal gaping."}
{"minute": 86, "event": "corner", "text": "Another corner — pressure building, the away defence under siege."}
"""


def truncate(text: str, max_bytes: int = MAX_BYTES) -> str:
    encoded = text.encode("utf-8")
    if len(encoded) <= max_bytes:
        return text
    return encoded[:max_bytes].decode("utf-8", errors="ignore").rstrip()


def write_corpus(filename: str, text: str) -> int:
    text = truncate(text.strip() + "\n")
    path = DATA_DIR / filename
    path.write_text(text, encoding="utf-8")
    return path.stat().st_size


def build_typescript_errors() -> str:
    url = "https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/diagnosticMessages.json"
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.load(resp)
    lines: list[str] = ["TypeScript Compiler Errors", ""]
    for message, info in sorted(data.items(), key=lambda item: item[1].get("code", 0)):
        code = info.get("code")
        if code is None:
            continue
        lines.append(f"TS{code}: {message}")
    return "\n".join(lines)


def build_http_status() -> str:
    url = "https://www.iana.org/assignments/http-status-codes/http-status-codes.txt"
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    lines = [
        "HTTP Status Code Registry",
        "",
        "1xx: Informational - Request received, continuing process",
        "2xx: Success - The action was successfully received, understood, and accepted",
        "3xx: Redirection - Further action must be taken in order to complete the request",
        "4xx: Client Error - The request contains bad syntax or cannot be fulfilled",
        "5xx: Server Error - The server failed to fulfill an apparently valid request",
        "",
    ]
    for line in raw.splitlines():
        match = re.match(r"^\s+(\d{3})\s+(.+?)\s+\[", line)
        if match:
            code, description = match.groups()
            lines.append(f"{code} {description.strip()}")
    return "\n".join(lines)


def build_movie_quotes() -> str:
    url = "https://raw.githubusercontent.com/prasertcbs/basic-dataset/master/movie_quotes.csv"
    with urllib.request.urlopen(url, timeout=30) as resp:
        content = resp.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    lines: list[str] = []
    for row in reader:
        quote = row.get("quote", "").strip()
        movie = row.get("movie", "").strip()
        year = row.get("year", "").strip()
        if quote:
            lines.append(f'"{quote}" — {movie} ({year})')
    return "\n".join(lines)


def build_genz_slang() -> str:
    url = "https://raw.githubusercontent.com/kaspercools/genz-dataset/main/genz_slang.csv"
    with urllib.request.urlopen(url, timeout=30) as resp:
        content = resp.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    lines: list[str] = ["Gen Z / Internet Slang", ""]
    for row in reader:
        keyword = row.get("keyword", "").strip()
        description = row.get("description", "").strip()
        if keyword and description:
            lines.append(f"{keyword} | {description}")
    return "\n".join(lines)


def build_vc_glossary() -> str:
    url = "https://valueaddvc.com/vc-glossary/"
    with urllib.request.urlopen(url, timeout=30) as resp:
        html = resp.read().decode("utf-8")
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html)
    entries: list[str] = ["Startup / VC Glossary", ""]
    seen: set[str] = set()

    def add_entry(term: str, definition: str) -> None:
        term = unescape(term.strip())
        definition = unescape(definition.replace("\\n", " ").strip())
        if term in seen or len(term) < 2 or not definition:
            return
        seen.add(term)
        entries.append(f"{term} | {definition}")

    for chunk in chunks:
        unescaped = chunk.encode("utf-8").decode("unicode_escape")
        if unescaped.startswith("{"):
            try:
                payload = json.loads(unescaped)
            except json.JSONDecodeError:
                payload = None
            if isinstance(payload, dict) and payload.get("@type") == "FAQPage":
                for entity in payload.get("mainEntity", []):
                    question = entity.get("name", "")
                    answer = entity.get("acceptedAnswer", {}).get("text", "")
                    add_entry(question, answer)
        for term, definition in re.findall(
            r'"children":"([^"]+)"\}\]\s*,\s*\["\$","p",null,\{"className":"[^"]*","children":"((?:\\.|[^"\\])*)"',
            unescaped,
        ):
            add_entry(term, definition)

    if len(entries) < 10:
        raise RuntimeError("Failed to extract VC glossary entries")
    return "\n".join(entries)


def build_copypasta() -> str:
    url = "https://raw.githubusercontent.com/louisabraham/copypasta-data/master/copypasta.txt"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def build_cocktails() -> str:
    url = "https://raw.githubusercontent.com/micahcochran/json-cookbook/master/cookbook-100.json"
    with urllib.request.urlopen(url, timeout=30) as resp:
        recipes = json.load(resp)
    lines: list[str] = ["Cocktail Recipes", ""]
    for recipe in recipes:
        name = recipe.get("name", "Untitled")
        lines.append(f"# {name}")
        for ingredient in recipe.get("recipeIngredient", []):
            lines.append(f"- {ingredient}")
        instructions = recipe.get("recipeInstructions", [])
        if isinstance(instructions, list):
            for step in instructions:
                if isinstance(step, dict):
                    text = step.get("text", "")
                else:
                    text = str(step)
                if text.strip():
                    lines.append(text.strip())
        elif isinstance(instructions, str) and instructions.strip():
            lines.append(instructions.strip())
        lines.append("")
    return "\n".join(lines)


def build_tech_twitter() -> str:
    slots = {
        "thing": ["JavaScript", "CSS", "REST", "monoliths", "SQL", "email"],
        "company": ["Uber", "WeWork", "Theranos", "OpenAI", "Stripe", "Palantir"],
        "one_word": ["payments", "logistics", "wellness", "AI", "fintech", "defense"],
        "tech": ["SaaS", "platform", "marketplace", "protocol", "framework"],
        "language": ["TypeScript", "Rust", "Go", "Python", "Java"],
        "other_language": ["JavaScript", "C", "Ruby", "PHP", "C++"],
        "tld": [".io", ".ai", ".dev", ".app", ".cloud"],
        "framework": ["React", "Next.js", "Django", "Rails", "Spring"],
        "alternative": ["jQuery", "PHP", "vanilla JS", "shell scripts", "Excel"],
        "tool": ["Docker", "Kubernetes", "Jira", "Slack", "Notion"],
        "other_tool": ["bash", "spreadsheets", "email", "a whiteboard"],
        "hype_cycle": ["microservices", "serverless", "blockchain", "Web3"],
        "new_hype": ["agents", "local-first", "edge compute", "vibes-based engineering"],
        "buzzword": ["AI agents", "vector databases", "RAG", "fine-tuning"],
        "weird_practice": ["deploying on Fridays", "skipping tests", "one-file apps"],
        "simple_thing": ["cron job", "bash script", "Postgres table", "static site"],
        "complex_thing": ["event mesh", "data lakehouse", "platform team"],
        "popular_thing": ["Kubernetes", "GraphQL", "microservices", "the cloud"],
        "obscure_thing": ["SQLite", "monoliths", "cron", "plain HTTP"],
        "job_title": ["PMs", "designers", "founders", "VPs"],
        "unexpected_skill": ["grep", "SQL", "read logs", "use the terminal"],
        "product": ["AI wrappers", "dashboards", "note apps", "chatbots"],
        "real_problem": ["onboarding", "latency", "support tickets", "churn"],
        "old_platform": ["a VPS", "Heroku", "a single EC2 box", "shared hosting"],
        "metric": ["lines of code", "story points", "meetings", "velocity"],
        "better_metric": ["deploy frequency", "incident time", "user retention"],
        "silly_idea": ["AI for pets", "Uber for X", "blockchain social"],
        "useful_idea": ["better error messages", "faster CI", "cheaper hosting"],
        "architecture": ["architecture", "stack", "platform", "infra"],
        "category": ["productivity", "AI", "collaboration", "analytics"],
        "bad_example": ["a blockchain PDF signer", "chat for dogs", "NFT receipts"],
        "editor": ["Vim", "Emacs", "Neovim", "a mechanical keyboard"],
        "ai_tool": ["Copilot", "Cursor", "Claude", "ChatGPT"],
    }
    lines = ["Tech Twitter Hot Takes", ""]
    template_lines = [line.strip() for line in TECH_TWITTER.strip().splitlines() if line.strip()]
    idx = 0
    for template in template_lines:
        for _ in range(3):
            values = {key: options[idx % len(options)] for key, options in slots.items()}
            lines.append(template.format(**values))
            idx += 1
    return "\n".join(lines)


def build_sports_commentary() -> str:
    return SPORTS_COMMENTARY.strip()


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    builders = [
        ("typescript-errors.txt", build_typescript_errors),
        ("http-status.txt", build_http_status),
        ("movie-quotes.txt", build_movie_quotes),
        ("genz-slang.txt", build_genz_slang),
        ("vc-glossary.txt", build_vc_glossary),
        ("copypasta.txt", build_copypasta),
        ("tech-twitter.txt", build_tech_twitter),
        ("cocktails.txt", build_cocktails),
        ("sports-commentary.txt", build_sports_commentary),
    ]
    for filename, builder in builders:
        size = write_corpus(filename, builder())
        print(f"{filename}: {size:,} bytes")


if __name__ == "__main__":
    main()
