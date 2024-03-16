const LoginPage = Vue.component("login",{
    data: function(){
        return {
            // error: "",
            username: "",
            password: "",
            error_1: false,
            error_2: false
        }
    },

    template: `
    <div style="max-width: 400px; margin: 0 auto; padding-top: 50px;">
        <h2 style="text-align: center; margin-bottom: 4rem;">Log In to Glimpse</h2>
        <form style="border: 2px solid #ccc; border-radius: 5%; background-color: #f2f2f2; padding: 20px;">
            <div style="margin-bottom: 1rem;">
                <label for="username" style="font-weight: bold;">Username or Email:</label>
                <input v-model="username"  ref="username" v-bind:class="[error_1 ? 'username' : '', 'form-control']" type="text" id="username" placeholder="Enter username or email" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 1rem;">
                <label for="password" style="font-weight: bold;">Password:</label>
                <input v-model="password" ref="password" v-bind:class="[error_2 ? 'password' : '', 'form-control']" type="password" id="password" placeholder="Enter password" style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
            </div>
            <button @click="loginUser()" type="submit" style="width: 100%; background-color: #007bff; color: white; padding: 14px 20px; margin-top: 20px; border: none; border-radius: 4px; cursor: pointer;">Log In</button>
        </form>
        <p style="text-align: center; margin-top: 3rem; font-size: 1.2rem;">Don't have an account? <router-link to="/signup" style="color: #007bff;">Sign Up</router-link></p>
    </div>

    `,
    methods: {
        loginUser() {
            this.error = "";
            this.loading = true;
            var url = `/api/login/${this.username}/${this.password}`;
        
            fetch(url).then(response => {
              if (!response.ok) {
                response.json().then(data => {
                  this.error = data["error_message"]
                  if (data["error_code"] == "BE101") {
                    this.error_1 = true
                    this.username = ""
                    this.$refs.username.focus();
                  } else if (data["error_code"] == "BE102") {
                    this.error_2 = true
                    this.password = ""
                    this.$refs.password.focus()
                  }
                })
              } else if (response.ok) {
                response.json().then(data =>

                  new Promise((resolve, reject) => {
                    try {
                      localStorage.setItem('auth_token', data['token']);
                      resolve();
                    } catch (error) {
                      reject(error);
                    }
                  })
                  .then(() => {
                    // Code to execute after the auth_token is set in local storage
                    window.location = "/?#/";
                  }))
              }
            })
          },
    }
})

export default LoginPage