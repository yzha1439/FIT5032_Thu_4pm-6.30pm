<template>
  <div>
    <!-- Navigation -->
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">

        <li class="nav-item">
          <router-link
            to="/"
            class="nav-link"
            active-class="active"
          >
            Home (Week 5)
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/about"
            class="nav-link"
            active-class="active"
          >
            About
          </router-link>
        </li>

      </ul>
    </header>

    <!-- Current page appears here -->
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>