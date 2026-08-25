<script setup>
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ActivityDirectory from './components/ActivityDirectory.vue'
import GetInvolvedForm from './components/GetInvolvedForm.vue'
import { activities } from './data/activities.js'

const selectedActivityId = ref('')

const featuredActivities = computed(() => activities.filter((activity) => activity.featured))

function chooseActivity(activity) {
  selectedActivityId.value = String(activity.id)

  document.querySelector('#get-involved')?.scrollIntoView({
    behavior: 'smooth',
  })
}
</script>

<template>
  <AppHeader />

  <main id="main-content">
    <section id="home" class="hero" aria-labelledby="hero-title">
      <div class="site-container hero__layout">
        <div class="hero__content">
          <p class="eyebrow">Move locally. Act on climate.</p>

          <h1 id="hero-title">Healthier journeys for people and the planet</h1>

          <p class="hero__lead">
            PlayPath Melbourne connects residents with affordable community sport, walking groups
            and social rides while supporting safer, lower-emission travel.
          </p>

          <div class="hero__actions">
            <a class="button button--primary" href="#activities"> Explore activities </a>

            <a class="button button--secondary" href="#get-involved"> Get involved </a>
          </div>
        </div>

        <aside class="impact-card" aria-label="PlayPath community impact">
          <p class="impact-card__label">Community impact</p>

          <strong> {{ activities.length }} local activities </strong>

          <span> Across walking, cycling, running and community sport </span>

          <div class="impact-card__stats">
            <div>
              <strong>10</strong>
              <span>suburbs</span>
            </div>

            <div>
              <strong>9</strong>
              <span>free events</span>
            </div>

            <div>
              <strong>11</strong>
              <span>beginner options</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="site-container section" aria-labelledby="featured-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured this month</p>

          <h2 id="featured-title">Start with a local activity</h2>
        </div>

        <a class="text-link" href="#activities">
          See the full directory
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div class="featured-grid">
        <article v-for="activity in featuredActivities" :key="activity.id" class="featured-card">
          <span class="pill">
            {{ activity.type }}
          </span>

          <h3>{{ activity.name }}</h3>

          <p>{{ activity.description }}</p>

          <ul class="meta-list" aria-label="Activity information">
            <li>{{ activity.dateLabel }}</li>
            <li>{{ activity.suburb }}</li>

            <li>
              {{ activity.cost === 0 ? 'Free' : `$${activity.cost}` }}
            </li>
          </ul>

          <button class="text-button" type="button" @click="chooseActivity(activity)">
            Register interest
            <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </section>

    <ActivityDirectory :activities="activities" @select="chooseActivity" />

    <section class="why-section" aria-labelledby="why-title">
      <div class="site-container section">
        <div class="section-heading section-heading--light">
          <div>
            <p class="eyebrow eyebrow--light">Why active travel?</p>

            <h2 id="why-title">Small journeys create meaningful change</h2>
          </div>
        </div>

        <div class="benefit-grid">
          <article>
            <span class="benefit-number">01</span>

            <h3>Lower emissions</h3>

            <p>Replace short car trips with walking, cycling and shared community journeys.</p>
          </article>

          <article>
            <span class="benefit-number">02</span>

            <h3>Stronger communities</h3>

            <p>Meet neighbours and local clubs through welcoming, low-cost activities.</p>
          </article>

          <article>
            <span class="benefit-number">03</span>

            <h3>Healthier routines</h3>

            <p>Build accessible movement into everyday life at a comfortable pace.</p>
          </article>
        </div>
      </div>
    </section>

    <GetInvolvedForm :activities="activities" :selected-activity-id="selectedActivityId" />
  </main>

  <footer class="site-footer">
    <div class="site-container site-footer__layout">
      <div>
        <strong>PlayPath Melbourne</strong>

        <p>
          A fictional not-for-profit supporting climate action through community sport and active
          travel.
        </p>
      </div>

      <nav aria-label="Footer navigation">
        <a href="#home">Home</a>
        <a href="#activities">Activities</a>
        <a href="#get-involved">Get involved</a>
      </nav>

      <p>© 2026 PlayPath Melbourne</p>
    </div>
  </footer>
</template>
