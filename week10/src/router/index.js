import { createRouter, createWebHistory } from 'vue-router'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import AddBookView from '../views/AddBookView.vue'
import GetBookCountView from '../views/GetBookCountView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
import GetAllBookAPIView from '../views/GetAllBookAPIView.vue'

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
    {
      path: '/add-book',
      name: 'add-book',
      component: AddBookView,
    },
    {
      path: '/book-count',
      name: 'book-count',
      component: GetBookCountView,
    },
    {
      path: '/WeatherCheck',
      name: 'GetWeather',
      component: WeatherView,
    },
    {
      path: '/CountBookAPI',
      name: 'CountBookAPI',
      component: CountBookAPI,
    },
    {
      path: '/GetAllBookAPI',
      name: 'GetAllBookAPI',
      component: GetAllBookAPIView,
    },
  ],
})

export default router