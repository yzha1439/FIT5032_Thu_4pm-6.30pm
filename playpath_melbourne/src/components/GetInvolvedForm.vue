<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  activities: { type: Array, required: true },
  selectedActivityId: { type: String, default: '' },
})

const form = reactive({
  fullName: '',
  email: '',
  postcode: '',
  activityId: '',
  message: '',
  consent: false,
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

watch(
  () => props.selectedActivityId,
  (value) => {
    if (value) form.activityId = value
  },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validateForm() {
  clearErrors()
  if (form.fullName.trim().length < 2)
    errors.fullName = 'Enter at least two characters for your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Enter a valid email address, such as name@example.com.'
  if (!/^\d{4}$/.test(form.postcode.trim()))
    errors.postcode = 'Enter a four-digit Australian postcode.'
  if (!form.activityId) errors.activityId = 'Select an activity you are interested in.'
  if (form.message.length > 300) errors.message = 'Keep your message to 300 characters or fewer.'
  if (!form.consent) errors.consent = 'You must agree before submitting this form.'
  return !Object.values(errors).some(Boolean)
}

function submitForm() {
  successMessage.value = ''
  if (!validateForm()) {
    requestAnimationFrame(() =>
      document.querySelector('.error-message')?.previousElementSibling?.focus(),
    )
    return
  }

  const saved = JSON.parse(localStorage.getItem('playpathExpressionsOfInterest') || '[]')
  saved.push({ id: Date.now(), ...form, submittedAt: new Date().toISOString() })
  localStorage.setItem('playpathExpressionsOfInterest', JSON.stringify(saved))
  successMessage.value =
    'Thank you for getting involved. Your expression of interest has been saved.'
  Object.assign(form, {
    fullName: '',
    email: '',
    postcode: '',
    activityId: '',
    message: '',
    consent: false,
  })
  clearErrors()
}
</script>

<template>
  <section id="get-involved" class="form-section" aria-labelledby="form-title">
    <div class="site-container form-section__layout">
      <div class="form-intro">
        <p class="eyebrow eyebrow--light">Get involved</p>
        <h2 id="form-title">Take your next step with PlayPath</h2>
        <p>
          Tell us which activity interests you. Your expression of interest is saved on this device
          so it remains available after the current session.
        </p>
        <ul>
          <li>Affordable local activities</li>
          <li>Beginner-friendly options</li>
          <li>Clear accessibility information</li>
        </ul>
      </div>

      <form class="interest-form" novalidate @submit.prevent="submitForm">
        <div v-if="successMessage" class="success-message" role="status">
          ✓ {{ successMessage }}
        </div>
        <div class="form-grid">
          <div class="field-group">
            <label for="full-name">Full name <span aria-hidden="true">*</span></label>
            <input
              id="full-name"
              v-model.trim="form.fullName"
              type="text"
              autocomplete="name"
              :aria-invalid="Boolean(errors.fullName)"
              :aria-describedby="errors.fullName ? 'full-name-error' : undefined"
            />
            <p v-if="errors.fullName" id="full-name-error" class="error-message">
              ⚠ {{ errors.fullName }}
            </p>
          </div>
          <div class="field-group">
            <label for="email">Email address <span aria-hidden="true">*</span></label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'email-error' : undefined"
            />
            <p v-if="errors.email" id="email-error" class="error-message">⚠ {{ errors.email }}</p>
          </div>
          <div class="field-group">
            <label for="postcode">Postcode <span aria-hidden="true">*</span></label>
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
              ⚠ {{ errors.postcode }}
            </p>
          </div>
          <div class="field-group">
            <label for="preferred-activity"
              >Preferred activity <span aria-hidden="true">*</span></label
            >
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
                {{ activity.name }} — {{ activity.suburb }}
              </option>
            </select>
            <p v-if="errors.activityId" id="activity-error" class="error-message">
              ⚠ {{ errors.activityId }}
            </p>
          </div>
        </div>
        <div class="field-group">
          <label for="message">Message <span class="optional">Optional</span></label>
          <textarea
            id="message"
            v-model="form.message"
            rows="4"
            maxlength="300"
            :aria-invalid="Boolean(errors.message)"
            :aria-describedby="errors.message ? 'message-error' : 'message-help'"
          ></textarea>
          <div class="field-help">
            <span id="message-help"
              >Anything we should know about your interests or accessibility needs?</span
            ><span>{{ form.message.length }}/300</span>
          </div>
          <p v-if="errors.message" id="message-error" class="error-message">
            ⚠ {{ errors.message }}
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
          <label for="consent"
            >I agree that PlayPath Melbourne may store this expression of interest on this device.
            <span aria-hidden="true">*</span></label
          >
        </div>
        <p v-if="errors.consent" id="consent-error" class="error-message">⚠ {{ errors.consent }}</p>
        <button class="button button--primary button--submit" type="submit">
          Submit expression of interest
        </button>
        <p class="required-note"><span aria-hidden="true">*</span> Required field</p>
      </form>
    </div>
  </section>
</template>
