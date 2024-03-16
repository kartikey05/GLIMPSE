from .database import db
from flask_login import UserMixin
from sqlalchemy.orm import relationship
from datetime import datetime


# Define a User model
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement = True, primary_key = True)
    username = db.Column(db.String)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    followers_count = db.Column(db.Integer, nullable=False, default=0)
    followings_count = db.Column(db.Integer, nullable=False, default=0)
    posts_count = db.Column(db.Integer, nullable=False, default=0)
    active = db.Column(db.Boolean())
    posts = db.relationship('Post', backref='user', cascade='all,delete')

    def __repr__(self):
        return f"User({self.username}, {self.email})"


class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer,autoincrement = True, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    image = db.Column(db.LargeBinary, nullable=True)
    likes_count = db.Column(db.Integer, nullable=False, default=0)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))

    def __repr__(self):
        return f"Post({self.title}, {self.description})"
    
class Likes(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer,autoincrement = True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    
class Following(db.Model):
    __tablename__ = 'following'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)