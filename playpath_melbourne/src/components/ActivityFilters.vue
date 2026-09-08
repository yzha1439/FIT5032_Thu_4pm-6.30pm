<script setup>
defineProps({
  search: {
    type: String,
    required: true,
  },

  suburb: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  accessibility: {
    type: String,
    required: true,
  },

  cost: {
    type: String,
    required: true,
  },

  suburbs: {
    type: Array,
    required: true,
  },

  types: {
    type: Array,
    required: true,
  },
})

defineEmits([
  'update:search',
  'update:suburb',
  'update:type',
  'update:accessibility',
  'update:cost',
  'clear',
])
</script>

<template>
  <div class="filter-panel">
    <div class="filter-panel__search">
      <label for="activity-search"> Search all activities </label>

      <div class="search-control">
        <span aria-hidden="true">⌕</span>

        <input
          id="activity-search"
          :value="search"
          type="search"
          placeholder="Search by activity, club or suburb"
          @input="$emit('update:search', $event.target.value)"
        />
      </div>
    </div>

    <fieldset>
      <legend>Refine your route</legend>

      <div class="filter-grid">
        <div class="field-group">
          <label for="suburb-filter"> Suburb </label>

          <select
            id="suburb-filter"
            :value="suburb"
            @change="$emit('update:suburb', $event.target.value)"
          >
            <option value="All">All suburbs</option>

            <option v-for="item in suburbs" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label for="type-filter"> Activity type </label>

          <select
            id="type-filter"
            :value="type"
            @change="$emit('update:type', $event.target.value)"
          >
            <option value="All">All activity types</option>

            <option v-for="item in types" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label for="accessibility-filter"> Accessibility </label>

          <select
            id="accessibility-filter"
            :value="accessibility"
            @change="$emit('update:accessibility', $event.target.value)"
          >
            <option value="All">All options</option>

            <option value="Yes">Fully accessible</option>

            <option value="Partial">Partially accessible</option>
          </select>
        </div>

        <div class="field-group">
          <label for="cost-filter"> Cost </label>

          <select
            id="cost-filter"
            :value="cost"
            @change="$emit('update:cost', $event.target.value)"
          >
            <option value="All">Any cost</option>

            <option value="Free">Free</option>

            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>
    </fieldset>

    <button class="clear-button" type="button" @click="$emit('clear')">Clear all filters</button>
  </div>
</template>
