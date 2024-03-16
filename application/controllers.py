from flask import Flask, request, redirect, url_for
from flask import render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy 

from flask import current_app as app
from application.models import User, Post, Following
from application.database import db
from app import login_manager
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user

from werkzeug.security import generate_password_hash, check_password_hash

from werkzeug.utils import secure_filename

from datetime import datetime

import os

from app import cache


@app.route("/", methods = ["GET"])
@cache.cached(timeout=50)
def dashboard():
	return render_template("index.html")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))