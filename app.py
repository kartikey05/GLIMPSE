import os
from flask import Flask
from flask_restful import Resource, Api
from application import config, workers
from application.config import LocalDevelopementConfig
from application.database import db
from flask_login import LoginManager
from application.models import User
from flask_caching import Cache

app = None
api = None
login_manager = LoginManager()
celery = None
cache = None

def Create_app():
    app = Flask(__name__, template_folder = "templates")
    if os.getenv('ENV') == "production":
        raise Exception("Currently no production config is setup")
    else:
        print("Starting Local Developement")
        app.config.from_object(LocalDevelopementConfig)
    
    db.init_app(app)
    api = Api(app)
    app.app_context().push()

    #Create celery
    celery = workers.celery

    celery.conf.update(
      broker_url = app.config["CELERY_BROKER_URL"],
      result_backend = app.config["CELERY_RESULT_BACKEND"]
      )
    celery.Task = workers.ContextTask
    #user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    #security = Security(app, user_datastore)
    #csrf = CSRFProtect(app)
    
    login_manager.init_app(app)

    cache = Cache(app)
    app.app_context().push()
    print("Create app complete")

    return app, api, celery, cache

app, api, celery, cache = Create_app()

# Import all the controllers so they are loaded
from application.controllers import *

"""
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(403)
def not_allowed(e):
    return render_template('403.html'), 403

@app.errorhandler(401)
def unauthorized(e):
    return render_template('login.html')
"""



from application.api import LoginAPI
api.add_resource(LoginAPI, "/api/login/<string:username>/<string:password>")

from application.api import UserAPI
api.add_resource(UserAPI, "/api/user", "/api/user_ud/<string:username>")

from application.api import UserDetailsAPI
api.add_resource(UserDetailsAPI, "/api/user/<int:user_id>")

from application.api import SearchUserAPI
api.add_resource(SearchUserAPI, "/api/search/<string:query>")

from application.api import PostAPI
api.add_resource(PostAPI, "/api/post", "/api/post/<int:post_id>")

from application.api import AllPostsAPI
api.add_resource(AllPostsAPI, "/api/posts/<int:user_id>")

from application.api import AllFeedPostsAPI
api.add_resource(AllFeedPostsAPI, "/api/feed")

from application.api import AllFollowingAPI
api.add_resource(AllFollowingAPI, "/api/following")

from application.api import AllFollowersAPI
api.add_resource(AllFollowersAPI, "/api/followers")

from application.api import FollowingAPI
api.add_resource(FollowingAPI, "/api/follow/<int:user_id>")

from application.api import LikesAPI
api.add_resource(LikesAPI, "/api/like_post/<int:post_id>")

from application.api import AllLikedPostsAPI
api.add_resource(AllLikedPostsAPI, "/api/liked_posts")

from application.api import ExportPosts
api.add_resource(ExportPosts, "/api/export_posts")

from application.api import *

if __name__ == '__main__':
    #Run the Flask app
    app.run(
        host = '0.0.0.0',
        debug = True
    )

