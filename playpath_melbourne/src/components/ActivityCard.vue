<script setup>
defineProps({ activity: { type: Object, required: true } })
defineEmits(['select'])
</script>

<template>
  <article class="activity-card">
    <div class="activity-card__top">
      <span class="pill">{{ activity.type }}</span>
      <span class="status" :class="{ 'status--limited': activity.status === 'Limited' }">{{
        activity.status
      }}</span>
    </div>
    <h3>{{ activity.name }}</h3>
    <p>{{ activity.description }}</p>
    <dl class="activity-details">
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
        <dd>{{ activity.cost === 0 ? 'Free' : `$${activity.cost}` }}</dd>
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
      class="button button--small button--primary"
      type="button"
      @click="$emit('select', activity)"
    >
      Register interest
    </button>
  </article>
</template>
