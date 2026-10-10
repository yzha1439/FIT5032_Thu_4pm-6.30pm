<script setup>
import { computed } from 'vue'
import { activities } from '../data/activities.js'
import { getRatingSummary } from '../services/ratings.js'

const ratingSummaries = computed(() =>
  activities.map((activity) => ({
    ...activity,
    ...getRatingSummary(activity.id),
  })),
)
</script>

<template>
  <section id="ratings" class="ratings-section" aria-labelledby="ratings-title">
    <div class="site-container ratings-container">
      <div class="ratings-heading">
        <p class="eyebrow eyebrow--light">Community ratings</p>
        <h2 id="ratings-title">PlayPath community feedback</h2>
        <p>
          Compare community feedback here. To leave or update your own rating, open the relevant
          activity on the Explore page.
        </p>
        <a class="button button--coral" href="#activities">Explore and rate activities</a>
      </div>

      <div class="rating-results" aria-live="polite">
        <article v-for="item in ratingSummaries" :key="item.id" class="rating-result">
          <div class="rating-result__heading">
            <div>
              <h3>{{ item.name }}</h3>
              <span>{{ item.count }} {{ item.count === 1 ? 'rating' : 'ratings' }}</span>
            </div>
            <strong :aria-label="item.count ? `${item.average.toFixed(1)} out of 5` : 'Not rated'">
              {{ item.count ? item.average.toFixed(1) : 'New' }} <span aria-hidden="true">★</span>
            </strong>
          </div>

          <div v-if="item.ratings.length" class="review-list">
            <article v-for="rating in item.ratings" :key="rating.id" class="review-card">
              <div>
                <strong>{{ rating.userName }}</strong>
                <span>{{ rating.score }}/5 ★</span>
              </div>
              <p>{{ rating.review || 'No written review supplied.' }}</p>
            </article>
          </div>
          <p v-else class="no-reviews">Be the first member to rate this activity.</p>
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

.ratings-heading > p:last-of-type {
  color: #dedbea;
  font-size: 1.05rem;
}

.rating-results {
  display: grid;
  gap: 1.25rem;
}

.rating-result {
  padding: clamp(1.25rem, 4vw, 2rem);
  color: var(--ink);
  background: white;
  border-radius: 6px 26px 6px 26px;
  box-shadow: 8px 8px 0 var(--lime);
}

.rating-result__heading,
.review-card > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.rating-result h3 {
  margin: 0;
}

.rating-result__heading > strong {
  color: var(--primary);
  font-size: 1.5rem;
  white-space: nowrap;
}

.review-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px dashed var(--border);
}

.review-card {
  padding: 0.85rem;
  background: var(--paper);
  border-left: 4px solid var(--coral);
}

.review-card p,
.no-reviews {
  margin: 0.35rem 0 0;
  color: var(--ink-soft);
}

@media (min-width: 768px) {
  .rating-results {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
