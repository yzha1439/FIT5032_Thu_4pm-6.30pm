<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  users: { type: Array, required: true },
})

const chartView = ref('roles')

const roleData = computed(() => {
  const members = props.users.filter((user) => user.role === 'member').length
  const administrators = props.users.filter((user) => user.role === 'admin').length
  const total = Math.max(props.users.length, 1)

  return [
    { label: 'Members', value: members, percent: (members / total) * 100 },
    { label: 'Administrators', value: administrators, percent: (administrators / total) * 100 },
  ]
})

const signupData = computed(() => {
  const counts = new Map()

  props.users.forEach((user) => {
    if (!user.createdAt) return
    const date = new Date(user.createdAt)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  const rows = [...counts.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .slice(-6)
  const maximum = Math.max(...rows.map(([, value]) => value), 1)

  return rows.map(([month, value]) => ({ month, value, percent: (value / maximum) * 100 }))
})

const roleChartLabel = computed(() =>
  roleData.value.map((item) => `${item.label}: ${item.value}`).join('. '),
)

const signupChartLabel = computed(() =>
  signupData.value.length
    ? signupData.value.map((item) => `${item.month}: ${item.value}`).join('. ')
    : 'No monthly registration data is available.',
)
</script>

<template>
  <section class="admin-insights" aria-labelledby="insights-title">
    <div>
      <p class="eyebrow">Firestore insights</p>
      <h3 id="insights-title">User analytics</h3>
      <p>Choose a view to explore summaries generated from the current Firestore user records.</p>
    </div>

    <div class="chart-controls" role="group" aria-label="Choose user analytics view">
      <button type="button" :aria-pressed="chartView === 'roles'" @click="chartView = 'roles'">
        Accounts by role
      </button>
      <button type="button" :aria-pressed="chartView === 'signups'" @click="chartView = 'signups'">
        Registrations by month
      </button>
    </div>

    <div class="insight-grid" aria-live="polite">
      <figure v-if="chartView === 'roles'">
        <figcaption>Accounts by role</figcaption>
        <div class="role-chart" role="img" :aria-label="roleChartLabel">
          <div v-for="item in roleData" :key="item.label" class="chart-row">
            <span>{{ item.label }}</span>
            <div class="chart-track" aria-hidden="true">
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </figure>

      <figure v-else>
        <figcaption>Registrations by month</figcaption>
        <div v-if="signupData.length" class="month-chart" role="img" :aria-label="signupChartLabel">
          <div v-for="item in signupData" :key="item.month" class="month-column">
            <strong>{{ item.value }}</strong>
            <span class="month-bar" :style="{ height: `${Math.max(item.percent, 8)}%` }"></span>
            <span>{{ item.month }}</span>
          </div>
        </div>
        <p v-else class="empty-chart">
          Registration dates will appear as new accounts are created.
        </p>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.admin-insights {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 6px 26px 6px 26px;
  box-shadow: 8px 8px 0 var(--lavender);
}

.admin-insights h3,
.admin-insights p,
figure {
  margin-block: 0.35rem 0;
}

.insight-grid {
  display: grid;
  gap: 1rem;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.chart-controls button {
  padding: 0.65rem 0.9rem;
  color: var(--ink);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 5px;
  font-weight: 850;
  cursor: pointer;
}

.chart-controls button[aria-pressed='true'] {
  color: white;
  background: var(--primary);
}

figure {
  min-width: 0;
  padding: 1rem;
  background: var(--lavender);
  border: 2px solid var(--ink);
  border-radius: 6px 18px 6px 18px;
}

figcaption {
  margin-bottom: 1rem;
  font-weight: 900;
}

.role-chart,
.chart-row {
  display: grid;
  gap: 0.5rem;
}

.chart-row {
  grid-template-columns: minmax(7rem, 1fr) minmax(5rem, 3fr) 2rem;
  align-items: center;
}

.chart-track {
  height: 1rem;
  overflow: hidden;
  background: white;
  border: 1px solid var(--ink);
  border-radius: 999px;
}

.chart-track span,
.month-bar {
  display: block;
  background: var(--primary);
}

.chart-track span {
  height: 100%;
}

.month-chart {
  min-height: 12rem;
  display: flex;
  align-items: end;
  gap: 0.75rem;
}

.month-column {
  height: 10rem;
  flex: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.month-bar {
  width: min(2rem, 80%);
  align-self: end;
  border: 1px solid var(--ink);
  border-radius: 4px 4px 0 0;
}

.empty-chart {
  color: var(--ink-soft);
}
</style>
