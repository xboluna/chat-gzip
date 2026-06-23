import json
import os
from typing import Any

from flask import Blueprint, Response, abort, current_app, jsonify, request, send_from_directory, stream_with_context

from app.services.corpora import (
    DEFAULT_MAX_BYTES,
    DEFAULT_TEMPERATURE,
    MAX_BEAM_WIDTH,
    MAX_GENERATED_BYTES,
    MAX_HORIZON,
    MIN_BEAM_WIDTH,
    MIN_GENERATED_BYTES,
    MIN_HORIZON,
    MIN_TEMPERATURE,
    corpus_catalog,
    get_corpus_spec,
)
from app.services.gzip_lm import build_prompt, generate_reply, generate_reply_stream

api_bp = Blueprint("api", __name__, url_prefix="/api")
main = Blueprint("main", __name__)


@api_bp.route("/health")
def health():
    return jsonify({"status": "ok"})


@api_bp.route("/corpora")
def corpora():
    return jsonify(corpus_catalog())


def _parse_chat_payload() -> tuple[dict[str, Any] | None, tuple[Any, int] | None]:
    payload = request.get_json(silent=True) or {}

    corpus_id = (payload.get("corpus_id") or "").strip()
    if not corpus_id:
        return None, (jsonify({"message": "corpus_id is required"}), 400)

    spec = get_corpus_spec(corpus_id)
    if spec is None or not spec.enabled:
        return None, (jsonify({"message": "corpus not available"}), 400)

    messages = payload.get("messages")
    if not isinstance(messages, list) or not messages:
        return None, (jsonify({"message": "messages must be a non-empty list"}), 400)

    for index, message in enumerate(messages):
        if not isinstance(message, dict):
            return None, (
                jsonify({"message": f"messages[{index}] must be an object"}),
                400,
            )
        role = message.get("role")
        content = message.get("content")
        if role not in ("user", "assistant"):
            return None, (
                jsonify({"message": f"messages[{index}].role is invalid"}),
                400,
            )
        if not isinstance(content, str):
            return None, (
                jsonify({"message": f"messages[{index}].content must be a string"}),
                400,
            )

    if messages[-1].get("role") != "user":
        return None, (jsonify({"message": "last message must be from the user"}), 400)

    prompt = build_prompt(messages)
    if not prompt.strip():
        return None, (jsonify({"message": "prompt cannot be empty"}), 400)

    temperature = payload.get("temperature", DEFAULT_TEMPERATURE)
    try:
        temperature = float(temperature)
    except (TypeError, ValueError):
        return None, (jsonify({"message": "temperature must be a number"}), 400)

    if temperature < MIN_TEMPERATURE:
        return None, (
            jsonify({"message": f"temperature must be at least {MIN_TEMPERATURE}"}),
            400,
        )

    max_bytes = payload.get("max_bytes", DEFAULT_MAX_BYTES)
    try:
        max_bytes = int(max_bytes)
    except (TypeError, ValueError):
        return None, (jsonify({"message": "max_bytes must be an integer"}), 400)

    if max_bytes < MIN_GENERATED_BYTES or max_bytes > MAX_GENERATED_BYTES:
        return (
            None,
            (
                jsonify(
                    {
                        "message": (
                            f"max_bytes must be between {MIN_GENERATED_BYTES} "
                            f"and {MAX_GENERATED_BYTES}"
                        )
                    }
                ),
                400,
            ),
        )

    horizon = payload.get("horizon")
    if horizon is not None:
        try:
            horizon = int(horizon)
        except (TypeError, ValueError):
            return None, (jsonify({"message": "horizon must be an integer"}), 400)
        if horizon < MIN_HORIZON or horizon > MAX_HORIZON:
            return (
                None,
                (
                    jsonify(
                        {
                            "message": (
                                f"horizon must be between {MIN_HORIZON} and {MAX_HORIZON}"
                            )
                        }
                    ),
                    400,
                ),
            )

    beam_width = payload.get("beam_width")
    if beam_width is not None:
        try:
            beam_width = int(beam_width)
        except (TypeError, ValueError):
            return None, (jsonify({"message": "beam_width must be an integer"}), 400)
        if beam_width < MIN_BEAM_WIDTH or beam_width > MAX_BEAM_WIDTH:
            return (
                None,
                (
                    jsonify(
                        {
                            "message": (
                                f"beam_width must be between {MIN_BEAM_WIDTH} "
                                f"and {MAX_BEAM_WIDTH}"
                            )
                        }
                    ),
                    400,
                ),
            )

    return (
        {
            "corpus_id": corpus_id,
            "messages": messages,
            "temperature": temperature,
            "max_bytes": max_bytes,
            "horizon": horizon,
            "beam_width": beam_width,
        },
        None,
    )


def _wants_stream() -> bool:
    stream = request.args.get("stream", "")
    return stream.lower() in ("1", "true", "yes")


@api_bp.route("/chat", methods=["POST"])
def chat():
    parsed, error = _parse_chat_payload()
    if error is not None:
        return error

    assert parsed is not None

    if _wants_stream():
        def event_stream():
            try:
                for event in generate_reply_stream(
                    corpus_id=parsed["corpus_id"],
                    messages=parsed["messages"],
                    temperature=parsed["temperature"],
                    max_bytes=parsed["max_bytes"],
                    horizon=parsed.get("horizon"),
                    beam_width=parsed.get("beam_width"),
                ):
                    event_type = event["type"]
                    yield f"event: {event_type}\ndata: {json.dumps(event)}\n\n"
            except FileNotFoundError:
                payload = {"message": "corpus file missing on server"}
                yield f"event: error\ndata: {json.dumps(payload)}\n\n"
            except Exception as exc:
                current_app.logger.exception("chat stream generation failed")
                payload = {"message": str(exc)}
                yield f"event: error\ndata: {json.dumps(payload)}\n\n"

        return Response(
            stream_with_context(event_stream()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    try:
        result = generate_reply(
            corpus_id=parsed["corpus_id"],
            messages=parsed["messages"],
            temperature=parsed["temperature"],
            max_bytes=parsed["max_bytes"],
            horizon=parsed.get("horizon"),
            beam_width=parsed.get("beam_width"),
        )
    except FileNotFoundError:
        return jsonify({"message": "corpus file missing on server"}), 500
    except Exception as exc:
        current_app.logger.exception("chat generation failed")
        return jsonify({"message": str(exc)}), 500

    return jsonify(result)


@main.route("/")
def index():
    return send_from_directory(current_app.static_folder, "index.html")


@main.route("/assets/<path:filename>")
def assets(filename: str):
    assets_dir = os.path.join(current_app.static_folder, "assets")
    return send_from_directory(assets_dir, filename)


@main.route("/<path:path>")
def spa_fallback(path: str):
    if path.startswith("api/"):
        abort(404)

    candidate_path = os.path.join(current_app.static_folder, path)
    if os.path.isfile(candidate_path):
        return send_from_directory(current_app.static_folder, path)

    return send_from_directory(current_app.static_folder, "index.html")
