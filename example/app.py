"""
Author: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
Date: 2024-04-22 17:51:38
LastEditors: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
LastEditTime: 2024-04-22 19:46:22
FilePath: /flask-marked-sample/example/app.py
Description: 
jdiaan@163.com
Copyright (c) 2024 by github @jdiaan, bilibili UID=24334629, All Rights Reserved.
"""

import sys
import os

path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

from flask import Flask, render_template
from flask_marked import MarkedForm
from flask_marked import Marked

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
marked = Marked(app)


@app.route("/", methods=["GET", "POST"])
def index():
    form = MarkedForm()
    if form.validate_on_submit():
        text = form.pagedown.data
        form.text.data = "提交成功！"

    return render_template("marked/index.html", form=form)


if __name__ == "__main__":
    app.run(debug=True)
