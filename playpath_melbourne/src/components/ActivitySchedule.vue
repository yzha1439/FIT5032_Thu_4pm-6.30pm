<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { safeJsonRead, safeJsonWrite } from '../services/security.js'

const props = defineProps({ activities: { type: Array, required: true } })
const registrations = ref([])
const calendarCursor = ref(new Date())

function loadSchedule() {
  registrations.value = safeJsonRead('playpathExpressionsOfInterest', [])

  const firstActivity = scheduledActivities.value[0]?.activity
  if (firstActivity && !calendarInitialised.value) {
    calendarCursor.value = new Date(`${firstActivity.date.slice(0, 7)}-01T00:00:00`)
    calendarInitialised.value = true
  }
}

const calendarInitialised = ref(false)

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

const calendarTitle = computed(() =>
  new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' }).format(calendarCursor.value),
)

const calendarDays = computed(() => {
  const year = calendarCursor.value.getFullYear()
  const month = calendarCursor.value.getMonth()
  const first = new Date(year, month, 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const isoDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')

    return {
      isoDate,
      day: date.getDate(),
      currentMonth: date.getMonth() === month,
      bookings: scheduledActivities.value.filter((entry) => entry.activity.date === isoDate),
    }
  })
})

function changeMonth(offset) {
  calendarCursor.value = new Date(
    calendarCursor.value.getFullYear(),
    calendarCursor.value.getMonth() + offset,
    1,
  )
}

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

    <div class="calendar-view" aria-labelledby="calendar-view-title">
      <div class="calendar-view__header">
        <button type="button" aria-label="Show previous month" @click="changeMonth(-1)">←</button>
        <h4 id="calendar-view-title">{{ calendarTitle }}</h4>
        <button type="button" aria-label="Show next month" @click="changeMonth(1)">→</button>
      </div>

      <div class="calendar-grid" role="grid" :aria-label="`Bookings for ${calendarTitle}`">
        <span
          v-for="weekday in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          :key="weekday"
          role="columnheader"
        >
          {{ weekday }}
        </span>
        <div
          v-for="day in calendarDays"
          :key="day.isoDate"
          role="gridcell"
          :aria-label="`${day.isoDate}${day.bookings.length ? `, ${day.bookings.map((entry) => entry.activity.name).join(', ')}` : ', no booking'}`"
          :class="{
            'calendar-day--outside': !day.currentMonth,
            'calendar-day--booked': day.bookings.length,
          }"
        >
          <time :datetime="day.isoDate">{{ day.day }}</time>
          <span v-for="entry in day.bookings" :key="entry.registrationId">
            {{ entry.activity.name }}
          </span>
        </div>
      </div>
      <p class="calendar-help">Calendar dates with a saved pass are highlighted.</p>
    </div>
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

.calendar-view {
  padding-top: 0.5rem;
  border-top: 2px dashed var(--border);
}

.calendar-view__header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.calendar-view__header h4 {
  margin: 0;
  text-align: center;
}

.calendar-view__header button {
  min-width: 44px;
  min-height: 44px;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 5px;
  font-weight: 900;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.3rem;
}

.calendar-grid > span {
  padding-block: 0.35rem;
  font-size: 0.78rem;
  font-weight: 900;
  text-align: center;
}

.calendar-grid [role='gridcell'] {
  min-height: 5.5rem;
  min-width: 0;
  padding: 0.4rem;
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.calendar-grid [role='gridcell'] time,
.calendar-grid [role='gridcell'] span {
  display: block;
}

.calendar-grid [role='gridcell'] time {
  font-weight: 850;
}

.calendar-grid [role='gridcell'] span {
  margin-top: 0.3rem;
  overflow-wrap: anywhere;
  color: var(--ink);
  font-size: 0.72rem;
  font-weight: 750;
  line-height: 1.25;
}

.calendar-grid .calendar-day--outside {
  color: var(--ink-soft);
  opacity: 0.55;
}

.calendar-grid .calendar-day--booked {
  background: var(--lime);
  border: 2px solid var(--ink);
}

.calendar-help {
  color: var(--ink-soft);
  font-size: 0.9rem;
}

@media (max-width: 575px) {
  .schedule-list li {
    grid-template-columns: auto 1fr;
  }

  .schedule-list button {
    grid-column: 1 / -1;
  }

  .calendar-grid [role='gridcell'] {
    min-height: 3rem;
  }

  .calendar-grid [role='gridcell'] span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
}
</style>
