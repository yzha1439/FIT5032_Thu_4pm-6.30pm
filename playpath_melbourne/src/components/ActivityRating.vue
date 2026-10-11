<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAuth } from '../services/auth.js'
import { getRatingSummary, getUserRating, saveRating } from '../services/ratings.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['changed'])
const { currentUser, isAdmin } = useAuth()
const form = reactive({ score: 0, review: '' })
const error = ref('')
const successMessage = ref('')
const revision = ref(0)

const existingRating = computed(() => {
  revision.value
  return currentUser.value ? getUserRating(props.activity.id, currentUser.value.id) : null
})

const summary = computed(() => {
  revision.value
  return getRatingSummary(props.activity.id)
})

watch(
  [() => props.activity.id, currentUser],
  () => {
    const rating = existingRating.value
    form.score = rating?.score ?? 0
    form.review = rating?.review ?? ''
    error.value = ''
    successMessage.value = ''
  },
  { immediate: true },
)

function chooseScore(score) {
  form.score = score
  error.value = ''
}

function submitRating() {
  error.value = ''
  successMessage.value = ''
  const wasUpdate = Boolean(existingRating.value)

  try {
    saveRating({
      activityId: props.activity.id,
      score: form.score,
      review: form.review,
      user: currentUser.value,
    })
    revision.value += 1
    successMessage.value = wasUpdate
      ? 'Your rating has been updated.'
      : 'Your rating has been saved.'
    emit('changed')
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error ? caughtError.message : 'The rating could not be saved.'
  }
}
</script>

<template>
  <div class="activity-rating">
    <div class="activity-rating__summary" aria-live="polite">
      <strong>{{ summary.count ? summary.average.toFixed(1) : 'New' }} ★</strong>
      <span>{{ summary.count }} {{ summary.count === 1 ? 'rating' : 'ratings' }}</span>
    </div>

    <p v-if="!currentUser" class="activity-rating__notice">
      <a href="#account">Sign in as a member to rate this activity.</a>
    </p>

    <p v-else-if="isAdmin" class="activity-rating__notice">
      Ratings are available to standard member accounts only.
    </p>

    <form v-else class="activity-rating__form" @submit.prevent="submitRating">
      <fieldset>
        <legend>Your rating for {{ activity.name }}</legend>
        <div class="activity-rating__stars">
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
      </fieldset>

      <label :for="`review-${activity.id}`"> Short review <span>(optional)</span> </label>
      <textarea
        :id="`review-${activity.id}`"
        v-model="form.review"
        rows="2"
        maxlength="240"
      ></textarea>
      <small>{{ form.review.length }}/240</small>

      <p v-if="error" class="activity-rating__error" role="alert">{{ error }}</p>
      <p v-if="successMessage" class="activity-rating__success" role="status">
        {{ successMessage }}
      </p>

      <button class="button button--coral button--small" type="submit">
        {{ existingRating ? 'Update rating' : 'Save rating' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.activity-rating {
  display: grid;
  gap: 0.7rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px dashed var(--border);
}

.activity-rating__summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.activity-rating__summary strong {
  color: var(--primary);
  font-size: 1.15rem;
}

.activity-rating__summary span,
.activity-rating__notice,
.activity-rating small {
  color: var(--ink-soft);
  font-size: 0.78rem;
}

.activity-rating__notice {
  margin: 0;
  font-weight: 700;
}

.activity-rating__form {
  display: grid;
  gap: 0.55rem;
}

.activity-rating fieldset {
  padding: 0;
  border: 0;
}

.activity-rating legend,
.activity-rating label {
  font-size: 0.78rem;
  font-weight: 800;
}

.activity-rating label span {
  color: var(--ink-soft);
  font-weight: 400;
}

.activity-rating__stars {
  display: flex;
  gap: 0.15rem;
}

.activity-rating__stars button {
  padding: 0.15rem;
  color: #b44d00;
  background: transparent;
  border: 0;
  font-size: 1.55rem;
  cursor: pointer;
}

.activity-rating textarea {
  width: 100%;
  padding: 0.55rem;
  border: 2px solid var(--ink);
  border-radius: 4px 12px 4px 12px;
  resize: vertical;
}

.activity-rating__error,
.activity-rating__success {
  margin: 0;
  padding: 0.5rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.activity-rating__error {
  color: var(--error);
  background: #fff1f3;
}

.activity-rating__success {
  color: var(--success);
  background: #edf9f3;
}
</style>
