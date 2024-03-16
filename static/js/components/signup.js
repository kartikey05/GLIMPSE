const SignupPage = Vue.component("signup", {
  data: function () {
    return {
      errorMessage: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      error_1: false,
      error_2: false,
      error_3: false
    }
  },

  template: `
  <div class="container" style="max-width: 400px; margin: 0 auto; padding-top: 50px;">
  <h2 style="text-align: center; margin-bottom: 20px;">Sign Up for Glimpse</h2>
  <div style="border: 2px solid #ccc; border-radius: 5%; background-color: #f2f2f2; padding: 20px;">
    <div class="form-group">
      <label for="email" style="font-weight: bold;">Email:</label>
      <input v-model="email" ref="email" v-bind:class="[error_3 ? 'email' : '', 'form-control']" type="email" class="form-control" id="email" placeholder="Enter Email ID" required style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
    </div>
    <div class="form-group">
      <label for="username" style="font-weight: bold;">Username:</label>
      <input v-model="username" ref="username"  v-bind:class="[error_1 ? 'username' : '', 'form-control']" type="text" class="form-control" id="username" placeholder="Enter username" required style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
    </div>
    <div class="form-group">
      <label for="password" style="font-weight: bold;">Password:</label>
      <input v-model="password" ref="password" v-bind:class="[error_2 ? 'password' : '', 'form-control']" type="password" class="form-control" id="password" placeholder="Enter password" required style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
    </div>
    <div class="form-group">
      <label for="confirmPassword" style="font-weight: bold;">Confirm Password:</label>
      <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword" placeholder="Enter confirm password" required style="width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; box-sizing: border-box; border-radius: 4px;">
    </div>
    <button @click="signUp()"  class="btn btn-primary" style="width: 100%; background-color: #007bff; color: white; padding: 14px 20px; margin-top: 20px; border: none; border-radius: 4px; cursor: pointer;">Sign Up</button>
  </div>
  <p v-if="errorMessage" class="text-danger" style="margin-top: 20px; text-align: center; font-weight: bold;">{{ errorMessage }}</p>
  <p class="mt-3" style="text-align: center;">Already have an account? <a style="color: #007bff;"><router-link to="/login">Log In</router-link></a></p>
</div>
  
    `,

  methods: {
    signUp: function (event) {
      this.error = "";
      var url = `/api/user`;
      console.log(url);

      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this.username, email: this.email, password: this.password }) }).then(response => {
        if (!response.ok) {
          response.json().then(data => {
            this.error = data["error_message"]
            if (data["error_code"] == "BE104") {
              this.error_3 = true
              this.email = ""
              this.$refs.email.focus();
            } else if (data["error_code"] == "BE105") {
              this.error_1 = true
              this.username = ""
              this.$refs.username.focus()
            } else if (data["error_code"] == "BE106") {
              this.error_3 = true
              this.email = ""
              this.$refs.email.focus();
            }
          })
        } else if (response.ok) {
          this.loginUser();
        }
      })
    },
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
            localStorage.setItem('auth_token', data['token']));
          window.location = "/";
        }
      })
    },
  },
})

export default SignupPage