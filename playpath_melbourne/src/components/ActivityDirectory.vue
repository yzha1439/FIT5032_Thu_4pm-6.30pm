<script setup>
import { computed, ref } from 'vue'
import ActivityCard from './ActivityCard.vue'
import ActivityFilters from './ActivityFilters.vue'
import ActivityRating from './ActivityRating.vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
  },
})

defineEmits(['select'])

const search = ref('')
const suburb = ref('All')
const type = ref('All')
const accessibility = ref('All')
const cost = ref('All')

const suburbs = computed(() =>
  [...new Set(props.activities.map((activity) => activity.suburb))].sort(),
)

const types = computed(() => [...new Set(props.activities.map((activity) => activity.type))].sort())

const filteredActivities = computed(() => {
  const searchTerm = search.value.trim().toLowerCase()

  return props.activities.filter((activity) => {
    const searchableValues = [activity.name, activity.club, activity.suburb]

    const matchesSearch =
      searchTerm === '' ||
      searchableValues.some((value) => value.toLowerCase().includes(searchTerm))

    const matchesSuburb = suburb.value === 'All' || activity.suburb === suburb.value

    const matchesType = type.value === 'All' || activity.type === type.value

    const matchesAccessibility =
      accessibility.value === 'All' || activity.accessibility === accessibility.value

    const matchesCost =
      cost.value === 'All' || (cost.value === 'Free' ? activity.cost === 0 : activity.cost > 0)

    return matchesSearch && matchesSuburb && matchesType && matchesAccessibility && matchesCost
  })
})

function clearFilters() {
  search.value = ''
  suburb.value = 'All'
  type.value = 'All'
  accessibility.value = 'All'
  cost.value = 'All'
}
</script>

<template>
  <section id="activities" class="directory-section" aria-labelledby="directory-title">
    <div class="site-container section">
      <div class="directory-heading">
        <p class="directory-heading__number">02 / Explore</p>

        <div>
          <p class="eyebrow">Activity directory</p>

          <h2 id="directory-title">Find your path through Melbourne</h2>

          <p>Search and compare community sport, walking and cycling activities.</p>
        </div>
      </div>

      <ActivityFilters
        v-model:search="search"
        v-model:suburb="suburb"
        v-model:type="type"
        v-model:accessibility="accessibility"
        v-model:cost="cost"
        :suburbs="suburbs"
        :types="types"
        @clear="clearFilters"
      />

      <div class="results-heading">
        <p class="result-count" aria-live="polite">
          <strong>
            {{ filteredActivities.length }}
          </strong>

          {{ filteredActivities.length === 1 ? 'activity found' : 'activities found' }}
        </p>

        <span class="results-heading__line"></span>
      </div>

      <div v-if="filteredActivities.length" class="activity-table-wrapper">
        <table class="activity-table">
          <caption class="sr-only">
            PlayPath Melbourne activity search results
          </caption>

          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Date</th>
              <th scope="col">Suburb</th>
              <th scope="col">Type</th>
              <th scope="col">Cost</th>
              <th scope="col">Access</th>
              <th scope="col">Rating</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="activity in filteredActivities" :key="activity.id">
              <td>
                <strong>{{ activity.name }}</strong>
                <small>{{ activity.club }}</small>
              </td>

              <td>{{ activity.dateLabel }}</td>
              <td>{{ activity.suburb }}</td>
              <td>{{ activity.type }}</td>

              <td>
                {{ activity.cost === 0 ? 'Free' : `$${activity.cost}` }}
              </td>

              <td>{{ activity.accessibility }}</td>

              <td class="rating-table-cell">
                <details>
                  <summary>Rate activity</summary>
                  <ActivityRating :activity="activity" />
                </details>
              </td>

              <td>
                <button class="table-action" type="button" @click="$emit('select', activity)">
                  Register
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredActivities.length" class="activity-cards">
        <ActivityCard
          v-for="activity in filteredActivities"
          :key="activity.id"
          :activity="activity"
          @select="$emit('select', $event)"
        />
      </div>

      <div v-else class="empty-state">
        <span class="empty-state__symbol" aria-hidden="true"> ↯ </span>

        <h3>No activities match this route</h3>

        <p>Try changing or clearing your current filters.</p>

        <button class="button button--secondary" type="button" @click="clearFilters">
          Clear filters
        </button>
      </div>
    </div>
  </section>
</template>
