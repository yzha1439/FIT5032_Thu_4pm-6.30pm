<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const online = ref(navigator.onLine)
const hasChanged = ref(false)

function updateStatus() {
  online.value = navigator.onLine
  hasChanged.value = true
}

onMounted(() => {
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <p
    v-if="!online || hasChanged"
    class="connection-status"
    :class="{ 'connection-status--online': online }"
    role="status"
    aria-live="polite"
  >
    {{
      online
        ? 'Connection restored. Online features are available.'
        : 'You are offline. Browsing and local pass saving remain available.'
    }}
  </p>
</template>

<style scoped>
.connection-status {
  position: sticky;
  top: 0;
  z-index: 1200;
  margin: 0;
  padding: 0.65rem 1rem;
  color: white;
  background: var(--error);
  text-align: center;
  font-weight: 800;
}

.connection-status--online {
  color: var(--ink);
  background: var(--lime);
}
</style>
