<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { safeJsonRead, safeJsonWrite } from '../services/security.js'

const props = defineProps({ activities: { type: Array, required: true } })
const registrations = ref([])

function loadSchedule() {
  registrations.value = safeJsonRead('playpathExpressionsOfInterest', [])
}

const scheduledActivities = computed(() =>
  registrations.value
    .map((registration) => {
      const activity = props.activities.find(
        (item) => String(item.id) === String(registration.activityId),
      )
      return activity ? { registrationId: registration.id, activity } : null
    })
    .filter(Boolean)
    .sort((first, second) => first.activity.date.localeCompare(second.activity.date)),
)

function removeBooking(registrationId) {
  const remaining = registrations.value.filter((item) => item.id !== registrationId)
  if (safeJsonWrite('playpathExpressionsOfInterest', remaining)) {
    registrations.value = remaining
    window.dispatchEvent(new Event('playpath-registration-change'))
  }
}

onMounted(() => {
  loadSchedule()
  window.addEventListener('playpath-registration-change', loadSchedule)
  window.addEventListener('storage', loadSchedule)
})

onBeforeUnmount(() => {
  window.removeEventListener('playpath-registration-change', loadSchedule)
  window.removeEventListener('storage', loadSchedule)
})
</script>

<template>
  <section class="activity-schedule" aria-labelledby="schedule-title">
    <div>
      <p class="eyebrow">Personal calendar</p>
      <h3 id="schedule-title">My activity schedule</h3>
      <p>
        Saved passes appear here in date order. Activities on the same day cannot be double-booked.
      </p>
    </div>

    <ol v-if="scheduledActivities.length" class="schedule-list">
      <li v-for="entry in scheduledActivities" :key="entry.registrationId">
        <time :datetime="entry.activity.date">
          <strong>{{ new Date(`${entry.activity.date}T00:00:00`).getDate() }}</strong>
          <span>{{ entry.activity.dateLabel.split(' ').slice(1).join(' ') }}</span>
        </time>
        <div>
          <strong>{{ entry.activity.name }}</strong>
          <span>{{ entry.activity.location.venue }}, {{ entry.activity.suburb }}</span>
        </div>
        <button
          type="button"
          :aria-label="`Remove ${entry.activity.name} from schedule`"
          @click="removeBooking(entry.registrationId)"
        >
          Remove
        </button>
      </li>
    </ol>
    <p v-else class="schedule-empty">Create a Community Pass to add your first activity.</p>
  </section>
</template>

<style scoped>
.activity-schedule {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 6px 26px 6px 26px;
  box-shadow: 8px 8px 0 var(--lavender);
}

.activity-schedule h3,
.activity-schedule p {
  margin-block: 0.35rem 0;
}

.schedule-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.schedule-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--lavender);
  border: 2px solid var(--ink);
  border-radius: 6px 16px 6px 16px;
}

.schedule-list time,
.schedule-list li > div {
  display: grid;
}

.schedule-list time {
  min-width: 4.5rem;
  padding: 0.5rem;
  color: white;
  background: var(--primary);
  text-align: center;
  border-radius: 4px;
}

.schedule-list time strong {
  font-size: 1.5rem;
}

.schedule-list button {
  padding: 0.5rem 0.7rem;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 5px;
  font-weight: 800;
  cursor: pointer;
}

.schedule-empty,
.schedule-list li > div span {
  color: var(--ink-soft);
}

@media (max-width: 575px) {
  .schedule-list li {
    grid-template-columns: auto 1fr;
  }

  .schedule-list button {
    grid-column: 1 / -1;
  }
}
</style>
