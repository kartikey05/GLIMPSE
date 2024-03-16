const FeedPage = Vue.component("feed", {
  data: function () {
    return {
      posts: [],
      user: "",
      showFollowers: false,
      followers: [],
      showFollowings: false,
      followings: [],
      query: "",
      liked_posts: []
    }
  },
  template: `
  <div class="container" style="max-width: 800px; margin: 0 auto; padding-top: 50px;">
    <div class="row justify-content-between">
        <div class="col-auto">
            <h2 class="mb-0">Glimpse</h2>
        </div>
        <div class="col-auto">
        <div class="row justify-content-between align-items-center" style="display: flex;">
        <div class="col-sm-8" style="display: flex;">
          <input type="text" class="form-control" placeholder="Search Users" v-model="query"
            style="flex: 1; margin-right: 5px;">
          <button @click="search" type="submit" class="btn btn-primary" style="flex: 0;">Search</button>
        </div>
        <div class="col-sm-4 text-right">
          <button class="btn btn-danger" @click="logout()"
            style="background-color: #dc3545; border-color: #dc3545;">Logout</button>
        </div>
      </div>
      

        </div>
    </div>
    <hr class="my-4">
    <div class="row">
        <div class="col-7">
            <div class="d-flex justify-content-between">
                <h4 class="p-2 align-self-start">Feed</h4>
                <button @click="newPost" class="p-2 align-self-end btn btn-outline"
                    style="display: inline-flex; align-items: center;  border-color: #000;"><span
                        class="material-icons md-24" style="margin-right: 5px;">add_circle</span>Create Post</button>
            </div>
            <hr>
            <div v-for="post in posts" :key="post.id" class="card my-3">
                <img :src="imageSrc(post.image)" class="card-img-top" alt="image" style="object-fit: cover;">
                <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h5 class="card-title p-0 align-self-start">Likes - {{ post.likes_count }}</h5>
                  <a @click="like(post.id)" class="p-2 align-self-end" v-if="!liked_posts.some(item => item.id === post.id)" type="button">Like</a>
                  <a @click="unlike(post.id)" class="p-2 align-self-end" v-else type="button">Unlike</a>
                </div>
              
                
                    <h6 class="p-0">By <a @click="showProfile(post.user_id)" class="p-0" type="button">{{post.username}}</a></h6>
                    <h5 class="card-title">{{ post.title }}</h5>
                    <p class="card-text">{{ post.description }}</p>
                </div>
            </div>
        </div>
        <div class="col-5" style="text-align: right;">
            <h5 class="mb-0">Welcome, {{ user.username }}</h5>
            <br>
            <div class="profile-stat" >
                <span class="profile-stat-title" style="font-size: 18px;">Posts - {{user.posts_count}},<a @click="exportPosts()" class="p-2 align-self-end" type="button">Export</a></span>
              </div>
              <div class="profile-stat">
   
                <span class="profile-stat-title" style="font-size: 18px;">Followers - {{user.followers_count}}</span>
              </div>
              <div class="profile-stat">
   
                <span class="profile-stat-title" style="font-size: 18px;">Followings - {{user.followings_count}}</span>
              </div>
            <a @click="showProfile(user.id)" class="p-2 align-self-end" type="button">View Profile</a>
            <hr>
            <div class="d-flex justify-content-between">
                <h5 class="p-2 align-self-start">My followers ({{ user.followers_count }})</h5>

                <div @click="toggleVisibilityFollowers" class="p-2 align-self-end" role="button" v-if="showFollowers"><span
                        class="material-icons md-24" style="margin-right: 5px;">expand_less</span></div>
                <div @click="toggleVisibilityFollowers" class="p-2 align-self-end" role="button" v-else><span
                        class="material-icons md-24" style="margin-right: 5px;">expand_more</span></div>
            </div>
            <div v-if="showFollowers">
                <div v-for="follower in followers">
                    <hr>
                    <div class="d-flex justify-content-between">
                        <h4 class="p-2 align-self-start">{{follower.username}}</h4>
                        <a @click="showProfile(follower.id)" class="p-2 align-self-end" type="button">View Profile</a>
                    </div>
                </div>
            </div>
            <hr>
          
            <div class="d-flex justify-content-between">
                <h5 class="p-2 align-self-start">My followings ({{ followings.length }})</h5>

                <div @click="toggleVisibilityFollowings" class="p-2 align-self-end" role="button" v-if="showFollowings"><span
                        class="material-icons md-24" style="margin-right: 5px;">expand_less</span></div>
                <div @click="toggleVisibilityFollowings" class="p-2 align-self-end" role="button" v-else><span
                        class="material-icons md-24" style="margin-right: 5px;">expand_more</span></div>
            </div>
            <div v-if="showFollowings">
                <div v-for="following in followings">
                    <hr>
                    <div class="d-flex justify-content-between">
                        <h4 class="p-2 align-self-start">{{following.username}}</h4>
                        <a @click="showProfile(following.id)" class="p-2 align-self-end" type="button">View Profile</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
  mounted() {
    this.getFeed();
    this.grabUserDetails();
    this.grabFollowers();
    this.grabFollowing();
    this.grabLikedPosts();
  },
  methods: {
    exportPosts() {
      var url = `/api/export_posts`
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
      .then( res => res.blob())
      .then( blob => {
        saveAs(blob, 'download.csv')
      });
    },
    like(post_id) {
      var url = `/api/like_post/${post_id}`
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            this.getFeed();
            this.grabLikedPosts();
          }
        });
    },
    unlike(post_id) {
      var url = `/api/like_post/${post_id}`
      fetch(url, {
        method: 'DELETE',
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            this.getFeed();
            this.grabLikedPosts();
          }
        });
    },
    search: function() {
      const query = this.query || 'all';

      window.location = `/?#/search/${query}`
    },
    showProfile(id){
      window.location = `/?#/profile/${id}`;
    },
    newPost() {
      window.location = '/?#/new_post';
    },
    toggleVisibilityFollowers() {
      this.showFollowers = !this.showFollowers;
    },
    toggleVisibilityFollowings() {
      this.showFollowings = !this.showFollowings;
    },
    grabFollowers() {
      var url = "/api/followers"
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.followers = data;
              console.log(data)
            })
          }
        });
    },
    grabFollowing() {
      var url = "/api/following"
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.followings = data;
              console.log(data)
            })
          }
        });
    },
    grabLikedPosts() {
      var url = "/api/liked_posts"
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.liked_posts = data;
              console.log(data)
            })
          }
        });
    },
    grabUserDetails() {
      var url = "/api/user"
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.user = data;
            })
          }
        });
    },
    imageSrc(base64String) {
      return `data:image/;base64,${base64String}`;
    },
    logout() {
      new Promise((resolve, reject) => {
        try {
          localStorage.removeItem("auth_token");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .then(() => {
        // Code to execute after the auth_token is set in local storage
        window.location = '/?#/home';
      })
    },
    getFeed() {
      var url = "/api/feed"
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.posts = data;
              console.log(data)
            })
          }
        });
    }
  }
})

export default FeedPage