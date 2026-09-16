import { createRouter, createWebHistory } from 'vue-router'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/register',
    },
    {
      path: '/register',
      name: 'register',
      component: FirebaseRegisterView,
    },
    {
      path: '/signin',
      name: 'signin',
      component: FirebaseSigninView,
    },
  ],
})

export default router