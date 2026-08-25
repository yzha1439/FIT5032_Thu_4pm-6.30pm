<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <div class="site-container site-header__layout">
      <a class="brand" href="#home" @click="closeMenu">
        <span class="brand__mark" aria-hidden="true">P</span>
        <span><strong>PlayPath</strong><small>Melbourne</small></span>
      </a>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">Toggle navigation</span>
        <span aria-hidden="true">{{ menuOpen ? '×' : '☰' }}</span>
      </button>

      <nav
        id="primary-navigation"
        class="primary-nav"
        :class="{ 'primary-nav--open': menuOpen }"
        aria-label="Main navigation"
      >
        <a href="#home" @click="closeMenu">Home</a>
        <a href="#activities" @click="closeMenu">Explore activities</a>
        <a href="#get-involved" @click="closeMenu">Get involved</a>
      </nav>
    </div>
  </header>
</template>
