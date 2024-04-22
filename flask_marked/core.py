"""
Author: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
Date: 2024-04-22 17:43:14
LastEditors: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
LastEditTime: 2024-04-22 21:37:01
FilePath: /flask-marked-sample/flask_marked/core.py
Description: 
jdiaan@163.com
Copyright (c) 2024 by github @jdiaan, bilibili UID=24334629, All Rights Reserved.
"""

from flask import Blueprint
from flask import current_app


class _Marked(object):
    def __init__(self, bp_name, url_prefix, filter_scripts, filter_css, highlight_type):
        self.bp_name = bp_name
        self.url_prefix = url_prefix
        self.filter_scripts = filter_scripts
        self.filter_css = filter_css
        self.highlight_type = highlight_type


class Marked(object):
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.state = self.init_app(app)
        else:
            self.state = None

    def init_app(self, app):
        marked_bp_name = app.config.get("MARKED_BP_NAME", "_marked")
        marked_bp_url_prefix = app.config.get("MARKED_BP_URL_PREFIX", "/marked")
        marked_filter_scripts = app.config.get("MARKED_FILTER_SCRIPTS", [])
        marked_filter_css = app.config.get("MARKED_FILTER_CSS", [])
        marked_highlight_type = app.config.get("MARKED_HIGHLIGHT_TYPE", "github-dark")

        bp = Blueprint(
            marked_bp_name,
            __name__,
            url_prefix=marked_bp_url_prefix,
            template_folder="templates",
            static_folder="static",
        )
        app.register_blueprint(bp)

        state = _Marked(
            bp_name=marked_bp_name,
            url_prefix=marked_bp_url_prefix,
            filter_scripts=marked_filter_scripts,
            filter_css=marked_filter_css,
            highlight_type=marked_highlight_type,
        )
        app.extensions = getattr(app, "extensions", {})
        app.extensions["marked"] = state

        @app.context_processor
        def context_processor():
            return self.context_processor()

    @staticmethod
    def context_processor():
        return {
            "bp_name": current_app.extensions["marked"].bp_name,
            "filter_scripts": current_app.extensions["marked"].filter_scripts,
            "filter_css": (current_app.extensions["marked"].filter_css),
            "highlight_type": current_app.extensions["marked"].highlight_type,
        }
