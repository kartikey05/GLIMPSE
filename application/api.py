from flask_restful import Resource, reqparse
from flask_restful import fields, marshal_with

from flask import jsonify, make_response, request, send_from_directory, send_file

from application.database import db
from application.models import User, Post, Following, Likes
from application.validation import NotFoundError, BusinessValidationError, CustomError

from werkzeug.security import generate_password_hash, check_password_hash

#from flask_login import current_user

from app import app

import werkzeug

from werkzeug.utils import secure_filename

from functools import wraps
import uuid
import jwt

import os

import json

from datetime import datetime

from app import api

import base64

from application import tasks

output_fields = {
	"id" : fields.Integer,
	"username" : fields.String,
	"email" : fields.String,
	"followers_count": fields.Integer,
	"followings_count": fields.Integer,
	"posts_count": fields.Integer,
}

create_user_parser = reqparse.RequestParser()
create_user_parser.add_argument('username')
create_user_parser.add_argument('email')
create_user_parser.add_argument('password')

update_user_parser = reqparse.RequestParser()
update_user_parser.add_argument('email')

output_fields_post = {
	'id': fields.Integer,
	'title': fields.String,
	'description': fields.String,
	'image': fields.String(attribute=lambda obj1: base64.b64encode(obj1.image).decode('utf-8')),
	'timestamp': fields.DateTime(dt_format='rfc822'),
	'likes_count': fields.Integer,
	'user_id': fields.Integer
}


def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
        token = None
        if 'x-access-tokens' in request.headers:
           token = request.headers['x-access-tokens']
 
        if not token:
           return jsonify({'message': 'a valid token is missing'})
        try:
           data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           user = db.session.query(User).filter(User.id == int(data['public_id'])).first()

           current_user = {"id": user.id, "username": user.username, "password": user.password, "email": user.email, "followers_count": user.followers_count, "posts_count": user.posts_count}
        except:
           return jsonify({'message': 'token is invalid'})
 
        return f(current_user = current_user, *args, **kwargs)
   return decorator

class LoginAPI(Resource):
	def get(self, username, password):
		# Getting the User from the database based on the username
		user = None
		if '@' in username:
			user = db.session.query(User).filter(User.email == username).first()
		else:
			user = db.session.query(User).filter(User.username == username).first()

		if user:
			if check_password_hash(user.password, password):
			# return a valid user JSON
			# 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=45)
				# return "OK", 200
				token = jwt.encode({'public_id' : user.id, }, app.config['SECRET_KEY'], "HS256")
				return jsonify({'token' : token})
			else:
			# return 404 error
				raise BusinessValidationError(status_code=404, error_code="BE102", error_message="Incorrect password!")
		else:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")

class UserAPI(Resource):
	@token_required
	@marshal_with(output_fields)
	def get(self, current_user):
		# Get the User from database based on username
		
		user = db.session.query(User).filter(User.username == current_user["username"]).first()

		if user:
			return user			
		else:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")

	@token_required
	@marshal_with(output_fields)	
	def put(self, username, current_user):
		args = update_user_parser.parse_args()
		email = args.get("email", None)
		if email is None:
			raise BusinessValidationError(status_code=400, error_code="BE1002", error_message="email is required")

		if not '@' in email:
			raise BusinessValidationError(status_code=400, error_code="BE1004", error_message="Invalid email")

		user = db.session.query(User).filter(User.email == email).first()

		if user and user.username != username:
			raise BusinessValidationError(status_code=400, error_code="BE1006", error_message="This email already exists")

		# Check if the user exists
		user = db.session.query(User).filter(User.username == username).first()

		if user is None:
			raise NotFoundError(status_code=404)

		user.email = email
		db.session.add(user)
		db.session.commit()

		return user

	@token_required
	def delete(self, username, current_user):
		# Check if the user exists
		user = db.session.query(User).filter(User.username == username).first()

		if user is None:
			raise NotFoundError(status_code=404)

		db.session.delete(user)
		db.session.commit()

		return "", 200

	def post(self):
		args = create_user_parser.parse_args()
		username = args.get("username", None)
		email = args.get("email", None)
		password = args.get("password", None)

		if username is None:
			raise BusinessValidationError(status_code=400, error_code="BE1001", error_message="username is required")

		if email is None:
			raise BusinessValidationError(status_code=400, error_code="BE1002", error_message="email is required")

		if password is None:
			raise BusinessValidationError(status_code=400, error_code="BE1003", error_message="password is required")

		
		user1 = db.session.query(User).filter(User.username == username).first()

		user2 = db.session.query(User).filter(User.email == email).first()

		if user1:
			raise BusinessValidationError(status_code=400, error_code="BE105", error_message="Username already exists")

		if not '@' in email:
			raise BusinessValidationError(status_code=400, error_code="BE104", error_message="Invalid email")

		if user2:
			raise BusinessValidationError(status_code=400, error_code="BE106", error_message="Email already in use")

		new_user = User(username = username, email=email, password = generate_password_hash(password, method='sha256'))
		db.session.add(new_user)
		db.session.commit()
		return "", 201

class UserDetailsAPI(Resource):
	@token_required
	@marshal_with(output_fields)
	def get(self, user_id, current_user):
		# Get the User from database based on username
		
		user = db.session.query(User).filter(User.id == user_id).first()

		if user:
			return user			
		else:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")


class SearchUserAPI(Resource):
	@token_required
	def get(self, query, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		users = None
		if query == "all":
			users = User.query.order_by(User.followers_count.desc()).all()
		else:
			users = User.query.filter(User.username.like(f"%{query}%")).order_by(User.followers_count.desc()).all()
		print(users)

		result = []

		for user in users:
			result.append({"id": user.id, "username": user.username, "email": user.email, "followers_count": user.followers_count, "posts_count": user.posts_count})

		print(result)
		return result

class PostAPI(Resource):
	@token_required
	@marshal_with(output_fields_post)
	def post(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		file = request.files['file']
		
		data = request.form.to_dict()

		title = data["title"]
		desc = data["description"]
		print(file)
		print(title, desc)

		if not title:
			raise BusinessValidationError(status_code=404, error_code="BE108", error_message="Title not found!")
		if not desc:
			raise BusinessValidationError(status_code=404, error_code="BE109", error_message="Description not found!")
		
		image = None

		if (file):
			image = file.read()
		else:
			raise BusinessValidationError(status_code=404, error_code="BE103", error_message="Image not found!")

		post = Post(title=data['title'], description=data['description'], timestamp = datetime.utcnow(),image=image, user_id=current_user["id"])
		db.session.add(post)
		user = db.session.query(User).filter(User.id == current_user["id"]).first()
		user.posts_count += 1

		db.session.add(user)
		db.session.commit()
		return post
	
	@token_required
	@marshal_with(output_fields_post)
	def put(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		file = None
		
		try:
			file = request.files['file']
		except:
			file = None
		
		data = request.form.to_dict()
		
		id = data["id"]
		title = data["title"]
		description = data["description"]

		if not title:
			raise BusinessValidationError(status_code=404, error_code="BE108", error_message="Title not found!")
		if not description:
			raise BusinessValidationError(status_code=404, error_code="BE109", error_message="Description not found!")

		post = Post.query.filter_by(id = id).order_by(Post.timestamp).first()

		if not post:
			raise BusinessValidationError(status_code=404, error_code="BE104", error_message="Post not found!")
		
		if post.user_id != current_user["id"]:
			raise BusinessValidationError(status_code=401, error_code="BE105", error_message="Not allowed to change other's post!")

		image = None

		if (file):
			image = file.read()
			post.image = image
		
		post.title = title
		post.description = description
		post.timestamp = datetime.utcnow()

		db.session.add(post)
		db.session.commit()
		return post

	@marshal_with(output_fields_post)
	@token_required
	def get(self, post_id, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		post = Post.query.filter_by(id = post_id).order_by(Post.timestamp).first()

		return post

	@token_required
	def delete(self, post_id, current_user):
		post = Post.query.filter_by(id = post_id).order_by(Post.timestamp).first()

		if not post:
			raise BusinessValidationError(status_code=404, error_code="BE104", error_message="Post not found!")
		
		if post.user_id != current_user["id"]:
			raise BusinessValidationError(status_code=401, error_code="BE105", error_message="Not allowed to delete other's post!")
		
		db.session.delete(post)
		user = db.session.query(User).filter(User.id == current_user["id"]).first()
		user.posts_count -= 1

		db.session.add(user)
		db.session.commit()

		return "", 200



class AllPostsAPI(Resource):
	@token_required
	def get(self, user_id, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		posts = Post.query.filter_by(user_id = user_id).order_by(Post.timestamp.desc()).all()

		result = []

		for post in posts:
			result.append({"id":post.id, "title": post.title, "description":post.description, "timestamp":post.timestamp.isoformat(), "image": base64.b64encode(post.image).decode('utf-8'), "likes_count": post.likes_count})

		return result


class AllFeedPostsAPI(Resource):
	@token_required
	def get(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		
		following = Following.query.filter_by(follower_id = current_user["id"]).all()

		user_ids = []

		for followed in following:
			user_ids.append(followed.followed_id)

		print(user_ids)
		
		posts = Post.query.filter(Post.user_id.in_(user_ids)).order_by(Post.timestamp.desc()).all()

		print(posts)

		result = []

		for post in posts:
			user = db.session.query(User).filter(User.id == post.user_id).first()
			result.append({"id":post.id, "title": post.title, "description":post.description, "timestamp":post.timestamp.isoformat(), "image": base64.b64encode(post.image).decode('utf-8'), "likes_count": post.likes_count, "username": user.username, "user_id": user.id})

		return result


class AllFollowingAPI(Resource):
	@token_required
	def get(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		following = Following.query.filter_by(follower_id = current_user["id"]).all()

		user_ids = []

		for followed in following:
			user_ids.append(followed.followed_id)
		
		users = User.query.filter(User.id.in_(user_ids)).order_by(User.followers_count.desc()).all()

		result = []

		for user in users:
			result.append({"id": user.id, "username": user.username, "email": user.email, "followers_count": user.followers_count, "posts_count": user.posts_count})

		return result


class AllFollowersAPI(Resource):
	@token_required
	def get(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		following = Following.query.filter_by(followed_id = current_user["id"]).all()

		user_ids = []

		for followed in following:
			user_ids.append(followed.follower_id)
		
		users = User.query.filter(User.id.in_(user_ids)).order_by(User.followers_count.desc()).all()

		result = []

		for user in users:
			result.append({"id": user.id, "username": user.username, "email": user.email, "followers_count": user.followers_count, "posts_count": user.posts_count})

		return result

class FollowingAPI(Resource):
	@token_required
	def get(self, user_id, current_user):

		if user_id == current_user["id"]:
			raise BusinessValidationError(status_code=404, error_code="BE107", error_message="Cannot follow/unfollow to self!")

		following = Following.query.filter_by(follower_id = current_user["id"], followed_id = user_id).first()

		if following:
			raise BusinessValidationError(status_code=404, error_code="BE108", error_message="Already following this user!")

		following = Following(follower_id = current_user["id"], followed_id = user_id)

		db.session.add(following)

		user = db.session.query(User).filter(User.id == user_id).first()
		user.followers_count += 1

		db.session.add(user)

		user = db.session.query(User).filter(User.id == current_user["id"]).first()
		user.followings_count += 1

		db.session.add(user)
		db.session.commit()

		return "", 200
	
	@token_required
	def delete(self, user_id, current_user):

		if user_id == current_user["id"]:
			raise BusinessValidationError(status_code=404, error_code="BE107", error_message="Cannot follow/unfollow to self!")

		following = Following.query.filter_by(follower_id = current_user["id"], followed_id = user_id).first()

		if not following:
			raise BusinessValidationError(status_code=404, error_code="BE106", error_message="Not following this user!")

		db.session.delete(following)
		user = db.session.query(User).filter(User.id == user_id).first()
		user.followers_count -= 1

		db.session.add(user)

		user = db.session.query(User).filter(User.id == current_user["id"]).first()
		user.followings_count -= 1

		db.session.add(user)

		db.session.commit()

		return "", 200
	

class LikesAPI(Resource):
	@token_required
	def get(self, post_id, current_user):

		liking = Likes.query.filter_by(post_id = post_id, user_id = current_user["id"]).first()

		if liking:
			raise BusinessValidationError(status_code=404, error_code="BE109", error_message="Already liked this post!")

		liking = Likes(post_id = post_id, user_id = current_user["id"])

		db.session.add(liking)

		post = db.session.query(Post).filter(Post.id == post_id).first()

		if not post:
			raise BusinessValidationError(status_code=404, error_code="BE104", error_message="Post not found!")
		
		post.likes_count += 1

		db.session.add(post)
		db.session.commit()

		return "", 200
	
	@token_required
	def delete(self, post_id, current_user):

		liking = Likes.query.filter_by(post_id = post_id, user_id = current_user["id"]).first()

		if not liking:
			raise BusinessValidationError(status_code=404, error_code="BE109", error_message="Not liked this post!")

		db.session.delete(liking)

		post = db.session.query(Post).filter(Post.id == post_id).first()

		if not post:
			raise BusinessValidationError(status_code=404, error_code="BE104", error_message="Post not found!")
		
		post.likes_count -= 1

		db.session.add(post)
		db.session.commit()

		return "", 200

class AllLikedPostsAPI(Resource):
	@token_required
	def get(self, current_user):
		user = db.session.query(User).filter(User.username == current_user["username"]).first()
		if not user:
			raise BusinessValidationError(status_code=404, error_code="BE101", error_message="User not found!")
		
		likings = Likes.query.filter_by(user_id = current_user["id"]).all()

		post_ids = []

		for liking in likings:
			post_ids.append(liking.post_id)

		posts = Post.query.filter(Post.id.in_(post_ids)).order_by(Post.likes_count.desc()).all()

		result = []

		for post in posts:
			result.append({"id":post.id, "title": post.title, "description":post.description, "timestamp":post.timestamp.isoformat(), "image": base64.b64encode(post.image).decode('utf-8'), "likes_count": post.likes_count})

		return result


class ExportPosts(Resource):
	@token_required
	def get(self, current_user):
		job = tasks.ExportPosts.apply_async([current_user["id"], current_user["username"]])

		file, filename = job.wait()

		response = send_file(
	    	file,
	    	mimetype="text/csv",
	    	as_attachment=True,
	    	download_name=filename
		)

		return response