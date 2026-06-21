from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config


def create_app(config_class=Config):
    app = Flask(__name__, static_folder="static")
    app.config.from_object(config_class)

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
    app.config["PREFERRED_URL_SCHEME"] = "https"

    from app.routes import api_bp, main

    origins = app.config.get("CORS_ORIGINS", ["http://127.0.0.1:5173"])
    CORS(api_bp, supports_credentials=True, origins=origins)

    app.register_blueprint(main)
    app.register_blueprint(api_bp)

    from app.services.corpora import warm_runtime_caches

    warm_runtime_caches()

    return app
