<script setup>
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ActivityDirectory from './components/ActivityDirectory.vue'
import GetInvolvedForm from './components/GetInvolvedForm.vue'
import { activities } from './data/activities.js'

const selectedActivityId = ref('')

const featuredActivities = computed(() =>
  activities.filter((activity) => activity.featured),
)

const suburbCount = computed(
  () =>
    new Set(
      activities.map((activity) => activity.suburb),
    ).size,
)

const freeActivityCount = computed(
  () =>
    activities.filter(
      (activity) => activity.cost === 0,
    ).length,
)

function chooseActivity(activity) {
  selectedActivityId.value = String(activity.id)

  document
    .querySelector('#get-involved')
    ?.scrollIntoView({
      behavior: 'smooth',
    })
}
</script>

<template>
  <AppHeader />

  <main id="main-content">
    <!-- Hero section -->
    <section
      id="home"
      class="hero"
      aria-labelledby="hero-title"
    >
      <div class="hero__shape hero__shape--one"></div>
      <div class="hero__shape hero__shape--two"></div>

      <div class="site-container hero__layout">
        <div class="hero__content">
          <p class="eyebrow eyebrow--light">
            Melbourne moves differently
          </p>

          <h1 id="hero-title">
            Move through the city.
            <span>Change how it moves.</span>
          </h1>

          <p class="hero__lead">
            Discover affordable community sport, walking
            groups and social rides while supporting
            healthier, lower-emission journeys across
            Melbourne.
          </p>

          <div class="hero__actions">
            <a
              class="button button--primary"
              href="#activities"
            >
              Explore local activities
            </a>

            <a
              class="button button--outline-light"
              href="#get-involved"
            >
              Get involved
            </a>
          </div>

          <dl class="hero__statistics">
            <div>
              <dt>{{ activities.length }}</dt>
              <dd>local activities</dd>
            </div>

            <div>
              <dt>{{ suburbCount }}</dt>
              <dd>Melbourne suburbs</dd>
            </div>

            <div>
              <dt>{{ freeActivityCount }}</dt>
              <dd>free activities</dd>
            </div>
          </dl>
        </div>

        <!-- Original Melbourne route illustration -->
        <div
          class="route-map"
          aria-label="Stylised active travel route connecting Melbourne suburbs"
        >
          <div class="route-map__heading">
            <span>PlayPath route</span>
            <strong>Melbourne network</strong>
          </div>

          <div
            class="route-line route-line--purple"
            aria-hidden="true"
          ></div>

          <div
            class="route-line route-line--coral"
            aria-hidden="true"
          ></div>

          <div
            class="route-line route-line--lime"
            aria-hidden="true"
          ></div>

          <div class="route-stop route-stop--footscray">
            <span aria-hidden="true"></span>
            Footscray
          </div>

          <div class="route-stop route-stop--parkville">
            <span aria-hidden="true"></span>
            Parkville
          </div>

          <div class="route-stop route-stop--carlton">
            <span aria-hidden="true"></span>
            Carlton
          </div>

          <div class="route-stop route-stop--richmond">
            <span aria-hidden="true"></span>
            Richmond
          </div>

          <div class="route-stop route-stop--stkilda">
            <span aria-hidden="true"></span>
            St Kilda
          </div>

          <p class="route-map__note">
            Community sport · Walking · Cycling
          </p>
        </div>
      </div>
    </section>

    <!-- Featured activities -->
    <section
      class="featured-section"
      aria-labelledby="featured-title"
    >
      <div class="site-container section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              Featured this month
            </p>

            <h2 id="featured-title">
              Three ways to start moving
            </h2>

            <p>
              Beginner-friendly activities selected from
              the PlayPath Melbourne community directory.
            </p>
          </div>

          <a
            class="section-link"
            href="#activities"
          >
            View full directory
            <span aria-hidden="true">↘</span>
          </a>
        </div>

        <div class="featured-grid">
          <article
            v-for="(activity, index) in featuredActivities"
            :key="activity.id"
            class="featured-card"
          >
            <div
              class="featured-card__number"
              aria-hidden="true"
            >
              0{{ index + 1 }}
            </div>

            <div class="featured-card__header">
              <span class="activity-type">
                {{ activity.type }}
              </span>

              <span
                class="activity-status"
                :class="{
                  'activity-status--limited':
                    activity.status === 'Limited',
                }"
              >
                {{ activity.status }}
              </span>
            </div>

            <h3>{{ activity.name }}</h3>

            <p>{{ activity.description }}</p>

            <dl class="featured-card__details">
              <div>
                <dt>Date</dt>
                <dd>{{ activity.dateLabel }}</dd>
              </div>

              <div>
                <dt>Suburb</dt>
                <dd>{{ activity.suburb }}</dd>
              </div>

              <div>
                <dt>Cost</dt>

                <dd>
                  {{
                    activity.cost === 0
                      ? 'Free'
                      : `$${activity.cost}`
                  }}
                </dd>
              </div>
            </dl>

            <button
              class="arrow-button"
              type="button"
              @click="chooseActivity(activity)"
            >
              Register interest
              <span aria-hidden="true">→</span>
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- Dynamic activity directory -->
    <ActivityDirectory
      :activities="activities"
      @select="chooseActivity"
    />

    <!-- Community impact -->
    <section
      class="impact-section"
      aria-labelledby="impact-title"
    >
      <div class="site-container section">
        <div class="impact-section__heading">
          <p class="eyebrow eyebrow--light">
            Why active travel?
          </p>

          <h2 id="impact-title">
            One local journey can create three kinds of
            change.
          </h2>
        </div>

        <div class="impact-grid">
          <article>
            <span
              class="impact-grid__number"
              aria-hidden="true"
            >
              01
            </span>

            <h3>Climate</h3>

            <p>
              Replace short private-car trips with walking,
              cycling and shared community journeys.
            </p>
          </article>

          <article>
            <span
              class="impact-grid__number"
              aria-hidden="true"
            >
              02
            </span>

            <h3>Community</h3>

            <p>
              Meet neighbours, volunteers and local clubs
              through welcoming activities.
            </p>
          </article>

          <article>
            <span
              class="impact-grid__number"
              aria-hidden="true"
            >
              03
            </span>

            <h3>Wellbeing</h3>

            <p>
              Make regular movement more accessible,
              social and enjoyable.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Validated form -->
    <GetInvolvedForm
      :activities="activities"
      :selected-activity-id="selectedActivityId"
    />
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="site-container site-footer__layout">
      <div>
        <a
          class="footer-brand"
          href="#home"
        >
          PlayPath Melbourne
        </a>

        <p>
          Climate action through community sport and
          active travel.
        </p>
      </div>

      <nav aria-label="Footer navigation">
        <a href="#home">Home</a>
        <a href="#activities">Explore</a>
        <a href="#get-involved">Get involved</a>
      </nav>

      <p class="site-footer__copyright">
        © 2026 PlayPath Melbourne
      </p>
    </div>
  </footer>
</template>