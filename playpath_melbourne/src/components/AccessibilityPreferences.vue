<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { safeJsonRead, safeJsonWrite } from '../services/security.js'

const STORAGE_KEY = 'playpathAccessibilityPreferences'
const panelOpen = ref(false)
const announcement = ref('')
const speechSupported = ref(false)
const voiceSupported = ref(false)
const listening = ref(false)
let recognition = null
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

function speakPageGuide() {
  if (!speechSupported.value) {
    announcement.value = 'Audio guide is not supported in this browser.'
    return
  }

  window.speechSynthesis.cancel()
  const guide =
    'PlayPath Melbourne helps you discover inclusive community activities. Use Explore to search and filter activities, use the map to choose a venue, and use Get involved to register. You can also use the keyboard to move through controls.'
  const utterance = new SpeechSynthesisUtterance(guide)
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
  announcement.value = 'Audio guide started.'
}

function toggleVoiceSearch() {
  if (!recognition) {
    announcement.value = 'Voice input is not supported in this browser.'
    return
  }

  if (listening.value) {
    recognition.stop()
    return
  }

  listening.value = true
  announcement.value = 'Listening for an activity name, suburb, or activity type.'
  try {
    recognition.start()
  } catch {
    listening.value = false
    announcement.value = 'Voice input could not start. Check microphone permission and try again.'
  }
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
  speechSupported.value = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  voiceSupported.value = Boolean(Recognition)
  if (Recognition) {
    recognition = new Recognition()
    recognition.lang = 'en-AU'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) {
        window.dispatchEvent(new CustomEvent('playpath-voice-search', { detail: transcript }))
        announcement.value = `Voice search applied: ${transcript}.`
      }
    }
    recognition.onerror = (event) => {
      listening.value = false
      announcement.value = event.error === 'not-allowed'
        ? 'Microphone permission was denied. Allow microphone access for this site.'
        : event.error === 'no-speech'
          ? 'No speech was detected. Please try again.'
          : 'Voice input could not be completed. Please try again.'
    }
    recognition.onend = () => {
      listening.value = false
    }
  }
  window.addEventListener('playpath-open-accessibility', openPanel)
})

onBeforeUnmount(() => {
  recognition?.stop()
  window.speechSynthesis?.cancel()
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
        <button type="button" :disabled="!speechSupported" @click="speakPageGuide">
          {{ speechSupported ? 'Play audio guide' : 'Audio guide unavailable' }}
        </button>
        <button type="button" :disabled="!voiceSupported" :aria-pressed="listening" @click="toggleVoiceSearch">
          {{ voiceSupported ? (listening ? 'Stop voice search' : 'Voice search') : 'Voice search unavailable' }}
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
