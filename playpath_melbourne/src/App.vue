<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AppHeader from './components/AppHeader.vue'
import ActivityDirectory from './components/ActivityDirectory.vue'
import AuthPanel from './components/AuthPanel.vue'
import RatingPanel from './components/RatingPanel.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import GetInvolvedForm from './components/GetInvolvedForm.vue'
import ConnectionStatus from './components/ConnectionStatus.vue'

import { activities } from './data/activities.js'
import { useAuth } from './services/auth.js'

const { isAdmin } = useAuth()

const validPages = ['home', 'activities', 'ratings', 'get-involved', 'account', 'admin']

const currentPage = ref('home')
const selectedActivityId = ref('')

const featuredActivities = computed(() => activities.filter((activity) => activity.featured))

const suburbCount = computed(() => new Set(activities.map((activity) => activity.suburb)).size)

const freeActivityCount = computed(
  () => activities.filter((activity) => activity.cost === 0).length,
)

function pageFromAddress() {
  const page = window.location.hash.replace(/^#/, '').trim() || 'home'

  return validPages.includes(page) ? page : 'home'
}

function allowedPage(page) {
  /*
   * Everyone may view Ratings.
   * RatingPanel prevents guests from submitting.
   *
   * Only administrators may view Admin.
   */
  if (page === 'admin' && !isAdmin.value) {
    return 'account'
  }

  return page
}

function displayPage(requestedPage, addHistory = true) {
  const safePage = validPages.includes(requestedPage) ? requestedPage : 'home'

  const nextPage = allowedPage(safePage)

  currentPage.value = nextPage

  const nextAddress = `#${nextPage}`

  if (addHistory && window.location.hash !== nextAddress) {
    window.history.pushState(
      {
        page: nextPage,
      },
      '',
      nextAddress,
    )
  }

  /*
   * Immediately return to the top.
   * There is no smooth vertical movement.
   */
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })

    document.querySelector('#main-content')?.focus({
      preventScroll: true,
    })
  })
}

function handleHistoryChange() {
  displayPage(pageFromAddress(), false)
}

function chooseActivity(activity) {
  selectedActivityId.value = String(activity.id)

  displayPage('get-involved')
}

onMounted(() => {
  displayPage(pageFromAddress(), false)

  window.addEventListener('popstate', handleHistoryChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleHistoryChange)
})
</script>

<template>
  <AppHeader :current-page="currentPage" @navigate="displayPage" />
  <ConnectionStatus />

  <!-- Home page -->
  <main v-if="currentPage === 'home'" id="main-content" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__shape hero__shape--one" aria-hidden="true"></div>

      <div class="hero__shape hero__shape--two" aria-hidden="true"></div>

      <div class="site-container hero__layout">
        <div class="hero__content">
          <p class="eyebrow eyebrow--light">Melbourne moves differently</p>

          <h1 id="hero-title">
            Move through the city.

            <span> Change how it moves. </span>
          </h1>

          <p class="hero__lead">
            Discover affordable community sport, walking groups and social rides while supporting
            healthier, lower-emission journeys across Melbourne.
          </p>

          <div class="hero__actions">
            <button class="button button--primary" type="button" @click="displayPage('activities')">
              Explore local activities
            </button>

            <button
              class="button button--outline-light"
              type="button"
              @click="displayPage('get-involved')"
            >
              Get involved
            </button>
          </div>

          <dl class="hero__statistics">
            <div>
              <dt>
                {{ activities.length }}
              </dt>

              <dd>local activities</dd>
            </div>

            <div>
              <dt>{{ suburbCount }}</dt>
              <dd>Melbourne suburbs</dd>
            </div>

            <div>
              <dt>
                {{ freeActivityCount }}
              </dt>

              <dd>free activities</dd>
            </div>
          </dl>
        </div>

        <div
          class="route-map"
          aria-label="Stylised active travel route connecting Melbourne suburbs"
        >
          <div class="route-map__heading">
            <span>PlayPath route</span>
            <strong> Melbourne network </strong>
          </div>

          <div class="route-line route-line--purple" aria-hidden="true"></div>

          <div class="route-line route-line--coral" aria-hidden="true"></div>

          <div class="route-line route-line--lime" aria-hidden="true"></div>

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

          <p class="route-map__note">Community sport · Walking · Cycling</p>
        </div>
      </div>
    </section>

    <section class="featured-section" aria-labelledby="featured-title">
      <div class="site-container section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Featured this month</p>

            <h2 id="featured-title">Three ways to start moving</h2>

            <p>
              Beginner-friendly activities selected from the PlayPath Melbourne community directory.
            </p>
          </div>

          <button
            class="section-link page-link-button"
            type="button"
            @click="displayPage('activities')"
          >
            View full directory
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div class="featured-grid">
          <article
            v-for="(activity, index) in featuredActivities"
            :key="activity.id"
            class="featured-card"
          >
            <div class="featured-card__number" aria-hidden="true">0{{ index + 1 }}</div>

            <div class="featured-card__header">
              <span class="activity-type">
                {{ activity.type }}
              </span>

              <span
                class="activity-status"
                :class="{
                  'activity-status--limited': activity.status === 'Limited',
                }"
              >
                {{ activity.status }}
              </span>
            </div>

            <h3>{{ activity.name }}</h3>

            <p>
              {{ activity.description }}
            </p>

            <dl class="featured-card__details">
              <div>
                <dt>Date</dt>

                <dd>
                  {{ activity.dateLabel }}
                </dd>
              </div>

              <div>
                <dt>Suburb</dt>

                <dd>
                  {{ activity.suburb }}
                </dd>
              </div>

              <div>
                <dt>Cost</dt>

                <dd>
                  {{ activity.cost === 0 ? 'Free' : `$${activity.cost}` }}
                </dd>
              </div>
            </dl>

            <button class="arrow-button" type="button" @click="chooseActivity(activity)">
              Register interest
              <span aria-hidden="true">→</span>
            </button>
          </article>
        </div>
      </div>
    </section>

    <section class="impact-section" aria-labelledby="impact-title">
      <div class="site-container section">
        <div class="impact-section__heading">
          <p class="eyebrow eyebrow--light">Why active travel?</p>

          <h2 id="impact-title">One local journey can create three kinds of change.</h2>
        </div>

        <div class="impact-grid">
          <article>
            <span class="impact-grid__number" aria-hidden="true"> 01 </span>

            <h3>Climate</h3>

            <p>
              Replace short private-car trips with walking, cycling and shared community journeys.
            </p>
          </article>

          <article>
            <span class="impact-grid__number" aria-hidden="true"> 02 </span>

            <h3>Community</h3>

            <p>Meet neighbours, volunteers and local clubs through welcoming activities.</p>
          </article>

          <article>
            <span class="impact-grid__number" aria-hidden="true"> 03 </span>

            <h3>Wellbeing</h3>

            <p>Make regular movement more accessible, social and enjoyable.</p>
          </article>
        </div>
      </div>
    </section>
  </main>

  <!-- Explore page -->
  <main v-else-if="currentPage === 'activities'" id="main-content" tabindex="-1">
    <ActivityDirectory :activities="activities" @select="chooseActivity" />
  </main>

  <!-- Ratings page -->
  <main v-else-if="currentPage === 'ratings'" id="main-content" tabindex="-1">
    <RatingPanel />
  </main>

  <!-- Get involved page -->
  <main v-else-if="currentPage === 'get-involved'" id="main-content" tabindex="-1">
    <GetInvolvedForm :activities="activities" :selected-activity-id="selectedActivityId" />
  </main>

  <!-- Account page -->
  <main v-else-if="currentPage === 'account'" id="main-content" tabindex="-1">
    <AuthPanel />
  </main>

  <!-- Administrator page -->
  <main v-else-if="currentPage === 'admin'" id="main-content" tabindex="-1">
    <AdminDashboard />
  </main>

  <footer class="site-footer">
    <div class="site-container site-footer__layout">
      <div>
        <button class="footer-brand footer-link-button" type="button" @click="displayPage('home')">
          PlayPath Melbourne
        </button>

        <p>Climate action through community sport and active travel.</p>
      </div>

      <nav aria-label="Footer navigation">
        <button type="button" @click="displayPage('home')">Home</button>

        <button type="button" @click="displayPage('activities')">Explore</button>

        <button type="button" @click="displayPage('ratings')">Ratings</button>

        <button type="button" @click="displayPage('get-involved')">Get involved</button>
      </nav>

      <p class="site-footer__copyright">© 2026 PlayPath Melbourne</p>
    </div>
  </footer>
</template>

<style scoped>
.page-link-button,
.footer-link-button,
.site-footer nav button {
  padding: 0;

  color: inherit;
  background: transparent;
  border: 0;

  font: inherit;
  cursor: pointer;
}

.page-link-button {
  color: var(--primary);
  font-weight: 900;
  text-decoration: underline;
}

.footer-link-button {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: white;
}

.site-footer nav button {
  color: #dedbea;
  text-decoration: underline;
}

#main-content:focus {
  outline: none;
}
</style>
