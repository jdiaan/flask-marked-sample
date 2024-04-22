"""
Author: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
Date: 2024-04-22 17:43:14
LastEditors: github @jdiaan, bilibili UID=24334629, jdiaan@163.com
LastEditTime: 2024-04-22 22:32:53
FilePath: /flask-marked-sample/flask_marked/form.py
Description: 
jdiaan@163.com
Copyright (c) 2024 by github @jdiaan, bilibili UID=24334629, All Rights Reserved.
"""

from flask_wtf import FlaskForm
from wtforms.fields import SubmitField
from wtforms.fields import StringField


class MarkedForm(FlaskForm):
    text = StringField("文本输入框", validators=None)
    submit = SubmitField("提交")
