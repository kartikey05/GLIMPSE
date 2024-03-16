import SearchPage from "./components/search.js"
import LoginPage from "./components/login.js"
import SignupPage from "./components/signup.js"
import FeedPage from "./components/feed.js"
import ProfilePage from "./components/profile.js"
import NewPostPage from "./components/new_post.js"
import EditPostPage from "./components/edit_post.js"
import HomePage from "./components/home.js"

const routes = [
    {
        path: '/', component: FeedPage, meta: {
            requiresAuth: true
        }
    },
    { path: '/login', component: LoginPage },
    { path: '/home', component: HomePage },
    { path: '/signup', component: SignupPage },
    {
        path: '/feed',name: 'feed', component: FeedPage, meta: {
            requiresAuth: true
        }
    },
    {
        path: '/new_post', component: NewPostPage, meta: {
            requiresAuth: true
        }
    },
    {
        path: '/edit_post/:postId', component: EditPostPage, 
        props: true, meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profile/:userId',
        name: 'profile',
        props: true, component: ProfilePage, meta: {
            requiresAuth: true
        }
    },
    {
        path: '/search/:query',
        name: 'search',
        props: true, component: SearchPage, meta: {
            requiresAuth: true
        }
    },
]

const router = new VueRouter({
    routes: routes
})

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('auth_token')

    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        next('/home')
    } else {
        next()
    }
})

export default router