<script setup>
import { ref } from 'vue'
import { useAuth } from '../services/auth.js'

defineProps({
  currentPage: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['navigate'])

const menuOpen = ref(false)

const { currentUser, isAdmin } = useAuth()

function navigate(page) {
  menuOpen.value = false
  emit('navigate', page)
}

function skipToContent() {
  document.querySelector('#main-content')?.focus()
}
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="skipToContent">
    Skip to main content
  </a>

  <header class="site-header">
    <div class="site-container site-header__layout">
      <a
        class="brand"
        href="#home"
        aria-label="PlayPath Melbourne home"
        @click.prevent="navigate('home')"
      >
        <span class="brand__symbol" aria-hidden="true">
          <span class="brand__route"></span>

          <span class="brand__stop brand__stop--one"></span>

          <span class="brand__stop brand__stop--two"></span>
        </span>

        <span class="brand__text">
          <strong>PlayPath</strong>
          <small>Melbourne</small>
        </span>
      </a>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only"> Toggle navigation </span>

        <span aria-hidden="true">
          {{ menuOpen ? '×' : '☰' }}
        </span>
      </button>

      <nav
        id="primary-navigation"
        class="primary-nav"
        :class="{
          'primary-nav--open': menuOpen,
        }"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          :aria-current="currentPage === 'home' ? 'page' : undefined"
          @click.prevent="navigate('home')"
        >
          Home
        </a>

        <a
          href="#activities"
          :aria-current="currentPage === 'activities' ? 'page' : undefined"
          @click.prevent="navigate('activities')"
        >
          Explore
        </a>

        <a
          href="#ratings"
          :aria-current="currentPage === 'ratings' ? 'page' : undefined"
          @click.prevent="navigate('ratings')"
        >
          Ratings
        </a>

        <a
          href="#get-involved"
          :aria-current="currentPage === 'get-involved' ? 'page' : undefined"
          @click.prevent="navigate('get-involved')"
        >
          Get involved
        </a>

        <a
          v-if="isAdmin"
          href="#admin"
          :aria-current="currentPage === 'admin' ? 'page' : undefined"
          @click.prevent="navigate('admin')"
        >
          Admin
        </a>

        <a
          class="primary-nav__action"
          href="#account"
          :aria-current="currentPage === 'account' ? 'page' : undefined"
          @click.prevent="navigate('account')"
        >
          {{ currentUser ? currentUser.name : 'Sign in' }}
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.primary-nav a[aria-current='page'] {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
}

.primary-nav__action[aria-current='page'] {
  text-decoration-color: var(--lime);
}
</style>
