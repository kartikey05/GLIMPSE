const ProfilePage = Vue.component("profile", {
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      posts: [],
      user: "",
      showFollowers: false,
      followers: [],
      self: false,
      liked_posts: []
    }
  },
  template: `
    <div class="profile" style="max-width: 800px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
            <h1>Profile - {{user.username}}</h1>
            <div class="profile-stats" style=" margin-bottom: 20px;">
              <div class="profile-stat" >
                <br />
                <span class="profile-stat-title" style="font-size: 18px;">Posts - {{user.posts_count}}</span>
              </div>
              <div class="profile-stat">
                <span class="profile-stat-title" style="font-size: 18px;">Followers - {{user.followers_count}}</span>
              </div>
              <div class="profile-stat">
   
                <span class="profile-stat-title" style="font-size: 18px;">Followings - {{user.followings_count}}</span>
              </div>
            </div>
            <div class="profile-posts col-7" style="margin-top: 30px;">
            <h2 style="font-size: 2em;">Posts:</h2>
            <div v-for="post in posts" :key="post.id" class="card my-3">
              <img :src="imageSrc(post.image)" class="card-img-top" alt="image" style="object-fit: cover;">
              <div class="card-body d-flex justify-content-between">
                  <h5 class="card-title p-2 align-self-start">Likes - {{ post.likes_count }}</h5>
                  <div v-if="!self" class="p-2 align-self-end">
                    <a @click="like(post.id)" class="p-2 align-self-end" v-if="!liked_posts.some(item => item.id === post.id)" type="button">Like</a>
                    <a @click="unlike(post.id)" class="p-2 align-self-end" v-else type="button">Unlike</a>
                  </div>
                  
                  <div v-else class="p-2 align-self-end">
                  <a @click="edit(post.id)" class="p-2 align-self-end" type="button">Edit</a>
                  <a @click="deletePost(post.id)" class="p-2 align-self-end" type="button">Delete</a>
                  </div>
              </div>
              <div class="card-body">
              <h5 class="card-title">{{ post.title }}</h5>
              <p class="card-text">{{ post.description }}</p>
          </div>
              </div>
          </div>
          </div>
        </div>
    `,
  mounted() {
    this.grabUserDetails();
    this.getPosts();
    this.grabLikedPosts();

  },
  methods: {
    edit(post_id) {
      window.location = `/?#/edit_post/${post_id}`
    },
    deletePost(post_id) {
      console.log(post_id);
      var url = `/api/post/${post_id}`;
      fetch(url, {
        method: 'DELETE',
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            this.getPosts();
            this.grabLikedPosts();
            this.grabUserDetails();
          }
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
            this.getPosts();
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
            this.getPosts();
            this.grabLikedPosts();
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
    imageSrc(base64String) {
      return `data:image/;base64,${base64String}`;
    },
    grabUserDetails() {
      var url = `/api/user/${this.userId}`
      fetch(url, {
        headers: {
          'x-access-tokens': localStorage.getItem('auth_token')
        },
      })
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.user = data;
              console.log(data);
              if (this.user.id == this.userId) {
                this.self = true;
              }
            })
          }
        });
    },
    getPosts() {
      var url = `/api/posts/${this.userId}`
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

export default ProfilePage