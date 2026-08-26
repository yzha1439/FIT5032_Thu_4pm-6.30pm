<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <a
    class="skip-link"
    href="#main-content"
  >
    Skip to main content
  </a>

  <header class="site-header">
    <div class="site-container site-header__layout">
      <a
        class="brand"
        href="#home"
        aria-label="PlayPath Melbourne home"
        @click="closeMenu"
      >
        <span
          class="brand__symbol"
          aria-hidden="true"
        >
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
        <span class="sr-only">
          Toggle navigation
        </span>

        <span aria-hidden="true">
          {{ menuOpen ? '×' : '☰' }}
        </span>
      </button>

      <nav
        id="primary-navigation"
        class="primary-nav"
        :class="{ 'primary-nav--open': menuOpen }"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          @click="closeMenu"
        >
          Home
        </a>

        <a
          href="#activities"
          @click="closeMenu"
        >
          Explore
        </a>

        <a
          class="primary-nav__action"
          href="#get-involved"
          @click="closeMenu"
        >
          Get involved
        </a>
      </nav>
    </div>
  </header>
</template>