<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <nav>
      <RouterLink to="/register">
        Register
      </RouterLink>

      <RouterLink to="/signin">
        Sign In
      </RouterLink>

      <RouterLink to="/add-book">
        Add Book
      </RouterLink>

      <RouterLink to="/book-count">
        Book Counter
      </RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.site-header {
  padding: 16px 24px;
  background: #1f2937;
}

nav {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
}

a {
  color: #cbd5e1;
  font-weight: 700;
  text-decoration: none;
}

a:hover,
a.router-link-active {
  color: white;
}
</style>