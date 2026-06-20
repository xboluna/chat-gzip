import os

from flask import Blueprint, abort, current_app, jsonify, request, send_from_directory

from app.services.corpora import corpus_catalog, get_corpus_spec
from app.services.gzip_lm import build_prompt, generate_reply

api_bp = Blueprint("api", __name__, url_prefix="/api")
main = Blueprint("main", __name__)


@api_bp.route("/health")
def health():
    return jsonify({"status": "ok"})


@api_bp.route("/corpora")
def corpora():
    return jsonify(corpus_catalog())


@api_bp.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(silent=True) or {}

    corpus_id = (payload.get("corpus_id") or "").strip()
    if not corpus_id:
        return jsonify({"message": "corpus_id is required"}), 400

    spec = get_corpus_spec(corpus_id)
    if spec is None or not spec.enabled:
        return jsonify({"message": "corpus not available"}), 400

    messages = payload.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify({"message": "messages must be a non-empty list"}), 400

    for index, message in enumerate(messages):
        if not isinstance(message, dict):
            return jsonify({"message": f"messages[{index}] must be an object"}), 400
        role = message.get("role")
        content = message.get("content")
        if role not in ("user", "assistant"):
            return jsonify({"message": f"messages[{index}].role is invalid"}), 400
        if not isinstance(content, str):
            return jsonify({"message": f"messages[{index}].content must be a string"}), 400

    if messages[-1].get("role") != "user":
        return jsonify({"message": "last message must be from the user"}), 400

    prompt = build_prompt(messages)
    if not prompt.strip():
        return jsonify({"message": "prompt cannot be empty"}), 400

    temperature = payload.get("temperature", 0.5)
    try:
        temperature = float(temperature)
    except (TypeError, ValueError):
        return jsonify({"message": "temperature must be a number"}), 400

    try:
        result = generate_reply(
            corpus_id=corpus_id,
            messages=messages,
            temperature=temperature,
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
