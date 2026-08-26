<script setup>
import { computed } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

const activityClass = computed(() =>
  props.activity.type
    .toLowerCase()
    .replaceAll(' ', '-'),
)
</script>

<template>
  <article
    class="activity-card"
    :class="`activity-card--${activityClass}`"
  >
    <div class="activity-card__route"></div>

    <div class="activity-card__top">
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

    <dl class="activity-card__details">
      <div>
        <dt>Date</dt>
        <dd>{{ activity.dateLabel }}</dd>
      </div>

      <div>
        <dt>Suburb</dt>
        <dd>{{ activity.suburb }}</dd>
      </div>

      <div>
        <dt>Club</dt>
        <dd>{{ activity.club }}</dd>
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

      <div>
        <dt>Accessibility</dt>
        <dd>{{ activity.accessibility }}</dd>
      </div>

      <div>
        <dt>Level</dt>
        <dd>{{ activity.level }}</dd>
      </div>
    </dl>

    <button
      class="button button--primary button--small"
      type="button"
      @click="$emit('select', activity)"
    >
      Register interest
    </button>
  </article>
</template>