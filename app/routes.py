import os

from flask import Blueprint, abort, current_app, jsonify, send_from_directory

api_bp = Blueprint("api", __name__, url_prefix="/api")
main = Blueprint("main", __name__)


@api_bp.route("/health")
def health():
    return jsonify({"status": "ok"})


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
