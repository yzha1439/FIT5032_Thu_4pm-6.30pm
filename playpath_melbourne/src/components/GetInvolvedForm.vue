<script setup>
import { reactive, ref, watch } from 'vue'

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
  (activityId) => {
    if (activityId) {
      form.activityId = activityId
    }
  },
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
  }

  const postcodePattern = /^\d{4}$/

  if (!postcodePattern.test(form.postcode.trim())) {
    errors.postcode = 'Enter a four-digit Australian postcode.'
  }

  if (!form.activityId) {
    errors.activityId = 'Select an activity you are interested in.'
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
  const existingRegistrations = JSON.parse(
    localStorage.getItem('playpathExpressionsOfInterest') || '[]',
  )

  existingRegistrations.push({
    id: Date.now(),
    ...form,
    submittedAt: new Date().toISOString(),
  })

  localStorage.setItem('playpathExpressionsOfInterest', JSON.stringify(existingRegistrations))
}

function resetForm() {
  Object.assign(form, {
    fullName: '',
    email: '',
    postcode: '',
    activityId: '',
    message: '',
    consent: false,
  })
}

function focusFirstError() {
  requestAnimationFrame(() => {
    document.querySelector('[aria-invalid="true"]')?.focus()
  })
}

function submitForm() {
  successMessage.value = ''

  if (!validateForm()) {
    focusFirstError()
    return
  }

  saveRegistration()

  successMessage.value = 'Your community pass has been saved successfully.'

  resetForm()
  clearErrors()
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

          <div class="interest-form__footer">
            <p>
              <span aria-hidden="true">*</span>
              Required field
            </p>

            <button class="button button--coral" type="submit">Create community pass</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
