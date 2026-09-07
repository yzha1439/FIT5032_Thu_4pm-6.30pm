<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { activities } from '../data/activities.js'
import { useAuth } from '../services/auth.js'
import { getRatingSummary, getUserRating, saveRating } from '../services/ratings.js'

const { currentUser } = useAuth()

const form = reactive({
  activityId: String(activities[0]?.id ?? ''),
  score: 0,
  review: '',
})

const error = ref('')
const successMessage = ref('')
const revision = ref(0)

const ratingSummaries = computed(() => {
  /*
   * Accessing revision makes this computed value refresh
   * whenever a new rating is saved.
   */
  revision.value

  return activities.map((activity) => ({
    ...activity,
    ...getRatingSummary(activity.id),
  }))
})

const selectedActivity = computed(() =>
  activities.find((activity) => activity.id === Number(form.activityId)),
)

watch([() => form.activityId, currentUser], loadExistingUserRating, {
  immediate: true,
})

function loadExistingUserRating() {
  error.value = ''
  successMessage.value = ''

  if (!currentUser.value) {
    form.score = 0
    form.review = ''
    return
  }

  const existingRating = getUserRating(form.activityId, currentUser.value.id)

  form.score = existingRating?.score ?? 0

  form.review = existingRating?.review ?? ''
}

function chooseScore(score) {
  form.score = score
  error.value = ''
}

function submitRating() {
  error.value = ''
  successMessage.value = ''

  try {
    saveRating({
      activityId: form.activityId,
      score: form.score,
      review: form.review,
      user: currentUser.value,
    })

    successMessage.value = 'Your rating has been saved.'

    revision.value += 1
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error ? caughtError.message : 'The rating could not be saved.'
  }
}
</script>

<template>
  <section id="ratings" class="ratings-section" aria-labelledby="ratings-title">
    <div class="site-container ratings-container">
      <div class="ratings-heading">
        <p class="eyebrow eyebrow--light">Community ratings</p>

        <h2 id="ratings-title">Rate your PlayPath experience</h2>

        <p>Share feedback and see the aggregated rating for each community activity.</p>
      </div>

      <div class="ratings-layout">
        <form class="rating-form" novalidate @submit.prevent="submitRating">
          <div class="rating-field">
            <label for="rating-activity"> Activity </label>

            <select id="rating-activity" v-model="form.activityId">
              <option
                v-for="activity in activities"
                :key="activity.id"
                :value="String(activity.id)"
              >
                {{ activity.name }}
              </option>
            </select>
          </div>

          <fieldset class="star-field">
            <legend>Your rating</legend>

            <div class="stars">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                :aria-label="`${star} out of 5 stars`"
                :aria-pressed="form.score === star"
                @click="chooseScore(star)"
              >
                {{ star <= form.score ? '★' : '☆' }}
              </button>
            </div>

            <p class="selected-score">
              {{ form.score ? `${form.score} out of 5 selected` : 'No rating selected' }}
            </p>
          </fieldset>

          <div class="rating-field">
            <label for="rating-review">
              Short review
              <span>Optional</span>
            </label>

            <textarea id="rating-review" v-model="form.review" rows="4" maxlength="240"></textarea>

            <small> {{ form.review.length }}/240 </small>
          </div>

          <p v-if="!currentUser" class="sign-in-message">
            You must sign in before submitting a rating.
          </p>

          <p v-if="error" class="rating-error" role="alert">
            {{ error }}
          </p>

          <p v-if="successMessage" class="rating-success" role="status">
            {{ successMessage }}
          </p>

          <button class="button button--coral" type="submit" :disabled="!currentUser">
            Save rating
          </button>

          <p v-if="currentUser" class="rating-update-note">
            Submitting another rating for the same activity updates your previous rating.
          </p>
        </form>

        <div class="rating-results" aria-live="polite">
          <article v-for="item in ratingSummaries" :key="item.id" class="rating-result">
            <div>
              <h3>{{ item.name }}</h3>

              <span>
                {{ item.count }}
                {{ item.count === 1 ? 'rating' : 'ratings' }}
              </span>
            </div>

            <strong
              :aria-label="item.count ? `${item.average.toFixed(1)} out of 5` : 'Not yet rated'"
            >
              {{ item.count ? item.average.toFixed(1) : 'New' }}

              <span aria-hidden="true"> ★ </span>
            </strong>
          </article>
        </div>
      </div>

      <div
        v-if="selectedActivity && getRatingSummary(selectedActivity.id).ratings.length"
        class="reviews-section"
      >
        <h3>
          Reviews for
          {{ selectedActivity.name }}
        </h3>

        <article
          v-for="rating in getRatingSummary(selectedActivity.id).ratings"
          :key="rating.id"
          class="review-card"
        >
          <div class="review-card__heading">
            <strong>
              {{ rating.userName }}
            </strong>

            <span> {{ rating.score }}/5 ★ </span>
          </div>

          <p v-if="rating.review">
            {{ rating.review }}
          </p>

          <p v-else class="review-card__empty">No written review supplied.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ratings-section {
  color: white;
  background: var(--ink);
}

.ratings-container {
  padding-block: clamp(4.5rem, 9vw, 8rem);
}

.ratings-heading {
  max-width: 760px;
  margin-bottom: 2.5rem;
}

.ratings-heading > p:last-child {
  color: #dedbea;
  font-size: 1.05rem;
}

.ratings-layout {
  display: grid;
  gap: 1.5rem;
}

.rating-form,
.rating-results,
.reviews-section {
  padding: clamp(1.25rem, 4vw, 2rem);

  color: var(--ink);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 6px 26px 6px 26px;
}

.rating-form {
  display: grid;
  align-content: start;
  gap: 1.1rem;

  box-shadow: 8px 8px 0 var(--coral);
}

.rating-results {
  display: grid;
  align-content: start;

  box-shadow: 8px 8px 0 var(--lime);
}

.rating-field label,
.star-field legend {
  display: block;
  margin-bottom: 0.4rem;

  font-weight: 800;
}

.rating-field label span {
  color: var(--ink-soft);
  font-size: 0.8rem;
  font-weight: 400;
}

.rating-field select,
.rating-field textarea {
  width: 100%;
  min-height: 48px;
  padding: 0.72rem 0.8rem;

  color: var(--ink);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 4px 14px 4px 14px;
}

.rating-field textarea {
  resize: vertical;
}

.rating-field small {
  display: block;
  margin-top: 0.3rem;

  color: var(--ink-soft);
  text-align: right;
}

.star-field {
  padding: 0;
  margin: 0;
  border: 0;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.stars button {
  padding: 0.1rem;

  color: #8a5500;
  background: transparent;
  border: 0;

  font-size: 2.4rem;
  line-height: 1;
  cursor: pointer;
}

.selected-score,
.rating-update-note {
  margin: 0.4rem 0 0;

  color: var(--ink-soft);
  font-size: 0.8rem;
}

.sign-in-message,
.rating-error,
.rating-success {
  margin: 0;
  padding: 0.75rem;

  border-left: 4px solid;

  font-size: 0.85rem;
  font-weight: 800;
}

.sign-in-message {
  color: var(--primary-dark);
  background: var(--lavender);
  border-color: var(--primary);
}

.rating-error {
  color: var(--error);
  background: #fff1f3;
  border-color: var(--error);
}

.rating-success {
  color: var(--success);
  background: #e4f6e9;
  border-color: var(--success);
}

.rating-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 0.85rem 0;

  border-bottom: 1px solid var(--border);
}

.rating-result:last-child {
  border-bottom: 0;
}

.rating-result h3 {
  margin-bottom: 0.2rem;
  font-size: 1rem;
}

.rating-result div > span {
  color: var(--ink-soft);
  font-size: 0.78rem;
}

.rating-result > strong {
  color: var(--primary-dark);
  white-space: nowrap;
}

.rating-result > strong span {
  color: #8a5500;
}

.reviews-section {
  display: grid;
  gap: 1rem;

  margin-top: 2rem;
}

.review-card {
  padding: 1rem;

  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 4px 14px 4px 14px;
}

.review-card__heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.review-card__heading span {
  color: #8a5500;
  font-weight: 900;
}

.review-card p {
  margin: 0.7rem 0 0;
}

.review-card__empty {
  color: var(--ink-soft);
  font-style: italic;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (min-width: 768px) {
  .ratings-layout {
    grid-template-columns:
      minmax(0, 0.9fr)
      minmax(0, 1.1fr);
  }
}
</style>
