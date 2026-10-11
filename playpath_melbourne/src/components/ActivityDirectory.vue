<script setup>
import { computed, ref, watch } from 'vue'
import ActivityCard from './ActivityCard.vue'
import ActivityFilters from './ActivityFilters.vue'
import ActivityMap from './ActivityMap.vue'
import ActivityRating from './ActivityRating.vue'
import ExportActions from './ExportActions.vue'

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
const sortKey = ref('date')
const sortDirection = ref('asc')
const currentPage = ref(1)
const rowsPerPage = 10
const collator = new Intl.Collator('en-AU', { numeric: true, sensitivity: 'base' })
const exportColumns = [
  { key: 'activity', label: 'Activity', width: 2.2 },
  { key: 'club', label: 'Organisation', width: 1.8 },
  { key: 'date', label: 'Date', width: 1.2 },
  { key: 'suburb', label: 'Suburb', width: 1.2 },
  { key: 'type', label: 'Type', width: 1.2 },
  { key: 'cost', label: 'Cost', width: 0.8 },
  { key: 'access', label: 'Access', width: 1 },
]

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

const sortedActivities = computed(() =>
  [...filteredActivities.value].sort((first, second) => {
    const firstValue = first[sortKey.value]
    const secondValue = second[sortKey.value]
    const comparison =
      typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : collator.compare(String(firstValue), String(secondValue))

    return sortDirection.value === 'asc' ? comparison : -comparison
  }),
)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(sortedActivities.value.length / rowsPerPage)),
)

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return sortedActivities.value.slice(start, start + rowsPerPage)
})

const exportRows = computed(() =>
  sortedActivities.value.map((activity) => ({
    activity: activity.name,
    club: activity.club,
    date: activity.dateLabel,
    suburb: activity.suburb,
    type: activity.type,
    cost: activity.cost === 0 ? 'Free' : `$${activity.cost}`,
    access: activity.accessibility,
  })),
)

const resultRange = computed(() => {
  if (!sortedActivities.value.length) return '0 results'
  const start = (currentPage.value - 1) * rowsPerPage + 1
  const end = Math.min(start + rowsPerPage - 1, sortedActivities.value.length)
  return `${start}-${end} of ${sortedActivities.value.length}`
})

watch([search, suburb, type, accessibility, cost], () => {
  currentPage.value = 1
})

watch(pageCount, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function sortBy(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

function sortIndicator(key) {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function clearFilters() {
  search.value = ''
  suburb.value = 'All'
  type.value = 'All'
  accessibility.value = 'All'
  cost.value = 'All'
  currentPage.value = 1
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

      <ActivityMap :activities="sortedActivities" @register="$emit('select', $event)" />

      <div class="results-heading">
        <p class="result-count" aria-live="polite">
          <strong>
            {{ filteredActivities.length }}
          </strong>

          {{ filteredActivities.length === 1 ? 'activity found' : 'activities found' }}
        </p>

        <span class="results-heading__line"></span>
      </div>

      <ExportActions
        title="PlayPath Melbourne activity directory"
        filename="playpath-activities"
        :columns="exportColumns"
        :rows="exportRows"
      />

      <div v-if="filteredActivities.length" class="activity-table-wrapper">
        <table class="activity-table">
          <caption class="sr-only">
            PlayPath Melbourne activity search results
          </caption>

          <thead>
            <tr>
              <th scope="col" :aria-sort="ariaSort('name')">
                <button class="sort-button" type="button" @click="sortBy('name')">
                  Activity <span aria-hidden="true">{{ sortIndicator('name') }}</span>
                </button>
              </th>
              <th scope="col" :aria-sort="ariaSort('date')">
                <button class="sort-button" type="button" @click="sortBy('date')">
                  Date <span aria-hidden="true">{{ sortIndicator('date') }}</span>
                </button>
              </th>
              <th scope="col" :aria-sort="ariaSort('suburb')">
                <button class="sort-button" type="button" @click="sortBy('suburb')">
                  Suburb <span aria-hidden="true">{{ sortIndicator('suburb') }}</span>
                </button>
              </th>
              <th scope="col" :aria-sort="ariaSort('type')">
                <button class="sort-button" type="button" @click="sortBy('type')">
                  Type <span aria-hidden="true">{{ sortIndicator('type') }}</span>
                </button>
              </th>
              <th scope="col" :aria-sort="ariaSort('cost')">
                <button class="sort-button" type="button" @click="sortBy('cost')">
                  Cost <span aria-hidden="true">{{ sortIndicator('cost') }}</span>
                </button>
              </th>
              <th scope="col" :aria-sort="ariaSort('accessibility')">
                <button class="sort-button" type="button" @click="sortBy('accessibility')">
                  Access <span aria-hidden="true">{{ sortIndicator('accessibility') }}</span>
                </button>
              </th>
              <th scope="col">Rating</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="activity in paginatedActivities" :key="activity.id">
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
          v-for="activity in paginatedActivities"
          :key="activity.id"
          :activity="activity"
          @select="$emit('select', $event)"
        />
      </div>

      <nav
        v-if="filteredActivities.length"
        class="table-pagination"
        aria-label="Activity results pages"
      >
        <p aria-live="polite">Showing {{ resultRange }}</p>
        <div>
          <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ pageCount }}</span>
          <button type="button" :disabled="currentPage === pageCount" @click="currentPage += 1">
            Next
          </button>
        </div>
      </nav>

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
