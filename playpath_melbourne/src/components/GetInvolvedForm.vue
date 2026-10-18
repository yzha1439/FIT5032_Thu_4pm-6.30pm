<script setup>
import { computed, reactive, ref, watch } from 'vue'

import { useAuth } from '../services/auth.js'
import { emailCommunityPass } from '../services/email.js'
import { safeJsonRead } from '../services/security.js'
import ActivitySchedule from './ActivitySchedule.vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
  },

  selectedActivityId: {
    type: String,
    default: '',
  },
})

const form = reactive({
  fullName: '',
  email: '',
  postcode: '',
  activityId: '',
  message: '',
  consent: false,
  emailPass: true,
})

const errors = reactive({
  fullName: '',
  email: '',
  postcode: '',
  activityId: '',
  message: '',
  consent: '',
})

const successMessage = ref('')
const submitError = ref('')
const isSubmitting = ref(false)
const { currentUser, isAuthenticated } = useAuth()

const registrationStorageKey = computed(() =>
  currentUser.value?.id ? `playpathExpressionsOfInterest:${currentUser.value.id}` : '',
)

function registrationsForCurrentUser() {
  if (!registrationStorageKey.value || !currentUser.value) return []

  const existing = safeJsonRead(registrationStorageKey.value, null)
  if (Array.isArray(existing)) return existing

  const legacy = safeJsonRead('playpathExpressionsOfInterest', [])
  const matching = Array.isArray(legacy)
    ? legacy.filter(
        (registration) =>
          registration.email?.trim().toLowerCase() === currentUser.value.email.toLowerCase(),
      )
    : []

  if (matching.length) {
    localStorage.setItem(registrationStorageKey.value, JSON.stringify(matching))
  }

  return matching
}

const canEmailPass = computed(
  () => isAuthenticated.value && Boolean(currentUser.value?.emailVerified),
)

const selectedActivity = computed(() =>
  props.activities.find((activity) => String(activity.id) === String(form.activityId)),
)

const selectedActivityFeeNote = computed(() => {
  if (!selectedActivity.value) return ''

  const fee = selectedActivity.value.cost === 0 ? 'Free' : `$${selectedActivity.value.cost}`
  return `${fee} activity fee shown for information only. No online payment is collected.`
})

watch(
  currentUser,
  (user) => {
    if (!user) return
    if (!form.fullName) form.fullName = user.name
    if (!form.email) form.email = user.email
  },
  { immediate: true },
)

watch(
  () => props.selectedActivityId,
  (activityId) => {
    const activityExists = props.activities.some((activity) => String(activity.id) === activityId)

    if (activityExists) {
      form.activityId = activityId
    }
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validateForm() {
  clearErrors()

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Enter at least two characters for your name.'
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Enter a valid email address, such as name@example.com.'
  } else if (
    form.emailPass &&
    canEmailPass.value &&
    form.email.trim().toLowerCase() !== currentUser.value.email.toLowerCase()
  ) {
    errors.email = 'Use your verified account email to receive the attached pass.'
  }

  const postcodePattern = /^\d{4}$/

  if (!postcodePattern.test(form.postcode.trim())) {
    errors.postcode = 'Enter a four-digit Australian postcode.'
  }

  if (!form.activityId) {
    errors.activityId = 'Select an activity you are interested in.'
  } else {
    const selectedActivity = props.activities.find(
      (activity) => String(activity.id) === form.activityId,
    )
    const registrations = registrationsForCurrentUser()
    const conflict = registrations.find((registration) => {
      const bookedActivity = props.activities.find(
        (activity) => String(activity.id) === String(registration.activityId),
      )
      return bookedActivity?.date === selectedActivity?.date
    })

    if (conflict) {
      const bookedActivity = props.activities.find(
        (activity) => String(activity.id) === String(conflict.activityId),
      )
      errors.activityId = `Schedule conflict: ${bookedActivity.name} is already saved for ${bookedActivity.dateLabel}. Remove it from your schedule or choose another date.`
    }
  }

  if (form.message.length > 300) {
    errors.message = 'Keep your message to 300 characters or fewer.'
  }

  if (!form.consent) {
    errors.consent = 'You must agree before submitting this form.'
  }

  return !Object.values(errors).some(Boolean)
}

function saveRegistration() {
  if (!registrationStorageKey.value) return false

  const existingRegistrations = JSON.parse(
    localStorage.getItem(registrationStorageKey.value) || '[]',
  )

  existingRegistrations.push({
    id: Date.now(),
    ...form,
    submittedAt: new Date().toISOString(),
  })

  localStorage.setItem(registrationStorageKey.value, JSON.stringify(existingRegistrations))
  window.dispatchEvent(new Event('playpath-registration-change'))
  return true
}

function resetForm() {
  Object.assign(form, {
    fullName: currentUser.value?.name || '',
    email: currentUser.value?.email || '',
    postcode: '',
    activityId: '',
    message: '',
    consent: false,
    emailPass: true,
  })
}

function focusFirstError() {
  requestAnimationFrame(() => {
    document.querySelector('[aria-invalid="true"]')?.focus()
  })
}

async function submitForm() {
  successMessage.value = ''
  submitError.value = ''

  if (!validateForm()) {
    focusFirstError()
    return
  }

  const activity = props.activities.find((item) => String(item.id) === form.activityId)
  const registration = { ...form }

  isSubmitting.value = true

  try {
    if (!navigator.onLine) {
      const saved = saveRegistration()
      successMessage.value = saved
        ? 'Your pass was saved securely on this device while offline. Email delivery can be requested when you reconnect.'
        : 'Sign in to save this pass to your personal schedule.'
      resetForm()
      clearErrors()
      return
    }

    const saved = saveRegistration()

    if (form.emailPass && canEmailPass.value) {
      try {
        await emailCommunityPass({ ...registration, activity })
        successMessage.value = saved
          ? 'Your pass was saved and emailed with a calendar attachment to your verified address.'
          : 'The pass was emailed. Sign in to save it to your personal schedule.'
      } catch (error) {
        successMessage.value = saved
          ? 'Your pass was saved to your personal schedule, but email delivery failed. You can try emailing it again shortly.'
          : ''
        submitError.value = error.message
      }
    } else {
      successMessage.value = saved
        ? 'Your community pass has been saved successfully.'
        : 'Sign in to save this pass to your personal schedule.'
    }

    resetForm()
    clearErrors()
  } catch (error) {
    submitError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section id="get-involved" class="form-section" aria-labelledby="form-title">
    <div class="site-container section">
      <div class="form-section__heading">
        <p class="eyebrow eyebrow--light">Get involved</p>

        <h2 id="form-title">Your next route starts here.</h2>

        <p>Choose an activity and create a local PlayPath Community Pass.</p>
      </div>

      <div class="community-pass">
        <div class="community-pass__sidebar">
          <span class="community-pass__vertical-text"> PLAYPATH · MELBOURNE · 2026 </span>

          <div class="community-pass__route" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <form class="interest-form" novalidate @submit.prevent="submitForm">
          <div class="interest-form__header">
            <div>
              <p class="interest-form__code">PPM / COMMUNITY / 001</p>

              <h3>Community activity pass</h3>
            </div>

            <span class="interest-form__badge"> Expression of interest </span>
          </div>

          <div v-if="successMessage" class="success-message" role="status">
            <strong>Pass created</strong>
            <span>{{ successMessage }}</span>
          </div>

          <p v-if="submitError" class="delivery-error" role="alert">
            {{ submitError }}
          </p>

          <div class="form-grid">
            <div class="field-group">
              <label for="full-name">
                Full name
                <span aria-hidden="true">*</span>
              </label>

              <input
                id="full-name"
                v-model.trim="form.fullName"
                type="text"
                autocomplete="name"
                :aria-invalid="Boolean(errors.fullName)"
                :aria-describedby="errors.fullName ? 'full-name-error' : undefined"
              />

              <p v-if="errors.fullName" id="full-name-error" class="error-message">
                <span aria-hidden="true">!</span>
                {{ errors.fullName }}
              </p>
            </div>

            <div class="field-group">
              <label for="email">
                Email address
                <span aria-hidden="true">*</span>
              </label>

              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                :aria-invalid="Boolean(errors.email)"
                :aria-describedby="errors.email ? 'email-error' : undefined"
              />

              <p v-if="errors.email" id="email-error" class="error-message">
                <span aria-hidden="true">!</span>
                {{ errors.email }}
              </p>
            </div>

            <div class="field-group">
              <label for="postcode">
                Postcode
                <span aria-hidden="true">*</span>
              </label>

              <input
                id="postcode"
                v-model.trim="form.postcode"
                type="text"
                inputmode="numeric"
                maxlength="4"
                autocomplete="postal-code"
                :aria-invalid="Boolean(errors.postcode)"
                :aria-describedby="errors.postcode ? 'postcode-error' : undefined"
              />

              <p v-if="errors.postcode" id="postcode-error" class="error-message">
                <span aria-hidden="true">!</span>
                {{ errors.postcode }}
              </p>
            </div>

            <div class="field-group">
              <label for="preferred-activity">
                Preferred activity
                <span aria-hidden="true">*</span>
              </label>

              <select
                id="preferred-activity"
                v-model="form.activityId"
                :aria-invalid="Boolean(errors.activityId)"
                :aria-describedby="errors.activityId ? 'activity-error' : undefined"
              >
                <option value="" disabled>Select an activity</option>

                <option
                  v-for="activity in activities"
                  :key="activity.id"
                  :value="String(activity.id)"
                >
                  {{ activity.name }} —
                  {{ activity.suburb }}
                </option>
              </select>

              <p v-if="errors.activityId" id="activity-error" class="error-message">
                <span aria-hidden="true">!</span>
                {{ errors.activityId }}
              </p>

              <p v-if="selectedActivityFeeNote" class="fee-note" role="status">
                {{ selectedActivityFeeNote }}
              </p>
            </div>
          </div>

          <div class="field-group">
            <label for="message">
              Message
              <span class="optional">Optional</span>
            </label>

            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              maxlength="300"
              :aria-invalid="Boolean(errors.message)"
              :aria-describedby="errors.message ? 'message-error' : 'message-help'"
            ></textarea>

            <div class="field-help">
              <span id="message-help"> Tell us about your interests or accessibility needs. </span>

              <span> {{ form.message.length }}/300 </span>
            </div>

            <p v-if="errors.message" id="message-error" class="error-message">
              <span aria-hidden="true">!</span>
              {{ errors.message }}
            </p>
          </div>

          <div class="checkbox-group">
            <input
              id="consent"
              v-model="form.consent"
              type="checkbox"
              :aria-invalid="Boolean(errors.consent)"
              :aria-describedby="errors.consent ? 'consent-error' : undefined"
            />

            <label for="consent">
              I agree that PlayPath Melbourne may store this expression of interest on this device.
              <span aria-hidden="true">*</span>
            </label>
          </div>

          <p v-if="errors.consent" id="consent-error" class="error-message">
            <span aria-hidden="true">!</span>
            {{ errors.consent }}
          </p>

          <div class="email-pass-option">
            <div class="checkbox-group">
              <input
                id="email-pass"
                v-model="form.emailPass"
                type="checkbox"
                :disabled="!canEmailPass"
              />

              <label for="email-pass">
                Email this pass to my verified account with an activity calendar attachment.
              </label>
            </div>

            <p v-if="!isAuthenticated" class="email-pass-option__help">
              Sign in to securely send the pass by email.
            </p>

            <p v-else-if="!currentUser.emailVerified" class="email-pass-option__help">
              Verify your account email before using email delivery.
            </p>

            <p v-else class="email-pass-option__help">
              Delivery address: {{ currentUser.email }} · Attachment: activity-pass.ics
            </p>
          </div>

          <div class="interest-form__footer">
            <p>
              <span aria-hidden="true">*</span>
              Required field
            </p>

            <button class="button button--coral" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Creating and sending…' : 'Create community pass' }}
            </button>
          </div>
        </form>
      </div>

      <ActivitySchedule :activities="activities" />
    </div>
  </section>
</template>
