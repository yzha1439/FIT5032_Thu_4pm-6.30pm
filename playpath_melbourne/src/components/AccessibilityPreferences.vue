<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { safeJsonRead, safeJsonWrite } from '../services/security.js'

const STORAGE_KEY = 'playpathAccessibilityPreferences'
const panelOpen = ref(false)
const announcement = ref('')
const preferences = reactive({
  largeText: false,
  highContrast: false,
  reduceMotion: false,
})

function applyPreferences() {
  const root = document.documentElement
  root.classList.toggle('user-large-text', preferences.largeText)
  root.classList.toggle('user-high-contrast', preferences.highContrast)
  root.classList.toggle('user-reduced-motion', preferences.reduceMotion)
}

function updatePreference(key, label) {
  preferences[key] = !preferences[key]
  safeJsonWrite(STORAGE_KEY, { ...preferences })
  applyPreferences()
  announcement.value = `${label} ${preferences[key] ? 'enabled' : 'disabled'}.`
}

function resetPreferences() {
  Object.assign(preferences, {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
  })
  safeJsonWrite(STORAGE_KEY, { ...preferences })
  applyPreferences()
  announcement.value = 'Accessibility preferences reset.'
}

watch(panelOpen, (open) => {
  if (open) announcement.value = 'Accessibility preferences opened.'
})

function openPanel() {
  panelOpen.value = true
}

onMounted(() => {
  const stored = safeJsonRead(STORAGE_KEY, {})
  Object.assign(preferences, {
    largeText: Boolean(stored.largeText),
    highContrast: Boolean(stored.highContrast),
    reduceMotion: Boolean(stored.reduceMotion),
  })
  applyPreferences()
  window.addEventListener('playpath-open-accessibility', openPanel)
})

onBeforeUnmount(() => {
  window.removeEventListener('playpath-open-accessibility', openPanel)
})
</script>

<template>
  <aside class="accessibility-preferences" aria-label="Accessibility preferences">
    <button
      class="accessibility-preferences__toggle"
      type="button"
      :aria-expanded="panelOpen"
      aria-controls="accessibility-preferences-panel"
      @click="panelOpen = !panelOpen"
    >
      Accessibility
      <span aria-hidden="true">{{ panelOpen ? '−' : '+' }}</span>
    </button>

    <div v-show="panelOpen" id="accessibility-preferences-panel" class="accessibility-panel">
      <p>Adjust this browser without changing your account.</p>
      <div class="accessibility-panel__controls">
        <button
          type="button"
          :aria-pressed="preferences.largeText"
          @click="updatePreference('largeText', 'Larger text')"
        >
          Larger text
        </button>
        <button
          type="button"
          :aria-pressed="preferences.highContrast"
          @click="updatePreference('highContrast', 'High contrast')"
        >
          High contrast
        </button>
        <button
          type="button"
          :aria-pressed="preferences.reduceMotion"
          @click="updatePreference('reduceMotion', 'Reduced motion')"
        >
          Reduce motion
        </button>
        <button type="button" @click="resetPreferences">Reset</button>
      </div>
    </div>

    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </aside>
</template>

<style scoped>
.accessibility-preferences {
  position: fixed;
  z-index: 45;
  right: 1rem;
  bottom: 1rem;
  max-width: min(25rem, calc(100vw - 2rem));
}

.accessibility-preferences__toggle,
.accessibility-panel button {
  min-height: 44px;
  padding: 0.6rem 0.85rem;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 5px;
  font-weight: 850;
  cursor: pointer;
}

.accessibility-preferences__toggle {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
  box-shadow: var(--shadow-small);
}

.accessibility-panel {
  margin-bottom: 0.7rem;
  padding: 1rem;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 6px 20px 6px 20px;
  box-shadow: 8px 8px 0 var(--ink);
}

.accessibility-panel p {
  margin-bottom: 0.75rem;
}

.accessibility-panel__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.accessibility-panel button {
  background: white;
}

.accessibility-panel button[aria-pressed='true'] {
  color: white;
  background: var(--primary);
}
</style>
