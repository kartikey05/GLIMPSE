const SearchPage = Vue.component("search",{
    props: {
      query: {
        type: String,
        required: true
      }
    },
    data: function () {
      return {
        userObj: "",
        users: [],
        following: []
      }
  },
    template: `
    <div class="profile"
    style="max-width: 800px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <h1>Search results for - {{query}}</h1>

    <div class="profile-posts col-7" style="margin-top: 30px;">
        <h2 style="font-size: 2em;">Users:</h2>
        <div v-for="user in users">
            <div v-if="user.id != userObj.id" class="card my-3">
                <div class="card-body d-flex justify-content-between">
                    <h5 class="card-title p-2 align-self-start">{{ user.username }}</h5>
                    <a @click="follow(user.id)" class="p-2 align-self-end"
                        v-if="!following.some(item => item.id === user.id)" type="button">Follow</a>
                    <a @click="unfollow(user.id)" class="p-2 align-self-end" v-else type="button">Unfollow</a>
                </div>
                <p class=" card-text" style="margin-left:23px;">Email - {{ user.email }}</p>
                <p class=" card-text" style="margin-left:23px;">Followers - {{ user.followers_count }}</p>
                <p class=" card-text" style="margin-left:23px; margin-bottom: 23px;">Posts count - {{ user.posts_count
                    }}</p>
            </div>
        </div>
    </div>
    </div>
    `,
    mounted() {
      this.grabUserDetails();
      this.grabUsers();
      this.grabFollowing();
    },
    methods: {
      follow(user_id) {
        var url = `/api/follow/${user_id}`
        fetch(url, {
          headers: {
            'x-access-tokens': localStorage.getItem('auth_token')
          },
        })
          .then(response => {
            if (response.ok) {
              this.grabFollowing();
            }
          });
      },
      unfollow(user_id) {
        var url = `/api/follow/${user_id}`
        fetch(url, {
          method: 'DELETE',
          headers: {
            'x-access-tokens': localStorage.getItem('auth_token')
          },
        })
          .then(response => {
            if (response.ok) {
              this.grabFollowing();
            }
          });
      },
      grabUserDetails() {
        var url = `/api/user`
        fetch(url, {
          headers: {
            'x-access-tokens': localStorage.getItem('auth_token')
          },
        })
          .then(response => {
            if (response.ok) {
              response.json().then(data => {
                this.userObj = data;
              })
            }
          });
      },
      grabUsers() {
        const query = this.query || 'default-query';
        var url = `/api/search/${query}`
        fetch(url, {
          headers: {
            'x-access-tokens': localStorage.getItem('auth_token')
          },
        })
          .then(response => {
            if (response.ok) {
              response.json().then(data => {
                this.users = data;
                console.log(data);
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
                this.following = data;
                console.log(data)
              })
            }
          });
      },
    }
})

export default SearchPage