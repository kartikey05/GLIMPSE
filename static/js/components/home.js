const HomePage = Vue.component("home",{
    template: `
    <div class="container">
  <div class="row">
    <div class="col-md-12 text-center">
      <!-- Heading -->
      <h1 class="heading" style="font-size: 5rem; font-weight: bold; color: #333; margin-top: 5rem;">Welcome to Glimpse</h1>
      <!-- Tagline -->
      <p class="tagline" style="font-size: 2rem; font-weight: bold; color: #333; margin-top: 1rem;">Discover the world through Glimpse</p>
      <!-- Buttons -->
      <div class="text-center" style="padding: 0; margin-top: 3rem;">
        <button @click="login" class="btn btn-lg btn-primary" style="padding: 1rem 2rem; font-size: 2rem; font-weight: bold;">Log In</button>
        <button  @click="signUp" class="btn btn-lg btn-outline-primary" style="padding: 1rem 2rem; font-size: 2rem; font-weight: bold; margin-left: 1rem;">Sign Up</button>
      </div>
    </div>
  </div>
</div>

    `,
    methods: {
      login(){
        window.location = `/?#/login`;
      },
      signUp(){
        window.location = `/?#/signup`;
      },
    }
})

export default HomePage