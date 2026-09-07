import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initialiseAuth } from './services/auth.js'

async function startApplication() {
  try {
    await initialiseAuth()

    createApp(App).mount('#app')
  } catch (error) {
    console.error('The application could not be initialised.', error)

    const appElement = document.querySelector('#app')

    if (appElement) {
      /*
       * textContent is used instead of innerHTML to avoid
       * creating an HTML injection location.
       */
      appElement.textContent =
        'PlayPath Melbourne could not start. Clear this sites stored data and try again.'
    }
  }
}

startApplication()
