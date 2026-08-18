<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2">
        <h1 class="text-center mb-4">
          User Information Form
        </h1>

        <form @submit.prevent="submitForm">
          <!-- Username and Password -->
          <div class="row mb-3">
            <div class="col-12 col-md-6 mb-3 mb-md-0">
              <label for="username" class="form-label">
                Username
              </label>

              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-control"
              >
            </div>

            <div class="col-12 col-md-6">
              <label for="password" class="form-label">
                Password
              </label>

              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-control"
              >
            </div>
          </div>

          <!-- Australian Resident and Gender -->
          <div class="row mb-3">
            <div class="col-12 col-md-6 mb-3 mb-md-0">
              <div class="form-check">
                <input
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  type="checkbox"
                  class="form-check-input"
                >

                <label
                  class="form-check-label"
                  for="isAustralian"
                >
                  Australian Resident?
                </label>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label for="gender" class="form-label">
                Gender
              </label>

              <select
                id="gender"
                v-model="formData.gender"
                class="form-select"
              >
                <option disabled value="">
                  Please select
                </option>
                <option value="male">
                  Male
                </option>
                <option value="female">
                  Female
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          <!-- Reason for joining -->
          <div class="mb-3">
            <label for="reason" class="form-label">
              Reason for joining
            </label>

            <textarea
              id="reason"
              v-model="formData.reason"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="text-center">
            <button
              type="submit"
              class="btn btn-primary me-2"
            >
              Submit
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="clearForm"
            >
              Clear
            </button>
          </div>
        </form>

        <!-- Submitted cards -->
        <div
          v-if="submittedCards.length"
          class="row mt-5"
        >
          <div class="d-flex flex-wrap justify-content-start">
            <div
              v-for="(card, index) in submittedCards"
              :key="index"
              class="card m-2"
            >
              <div class="card-header">
                User Information
              </div>

              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                  Username: {{ card.username }}
                </li>

                <li class="list-group-item">
                  Password: {{ card.password }}
                </li>

                <li class="list-group-item">
                  Australian Resident:
                  {{ card.isAustralian ? 'Yes' : 'No' }}
                </li>

                <li class="list-group-item">
                  Gender: {{ card.gender }}
                </li>

                <li class="list-group-item">
                  Reason: {{ card.reason }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const createEmptyForm = () => ({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

const formData = ref(createEmptyForm())
const submittedCards = ref([])

const submitForm = () => {
  submittedCards.value.push({
    ...formData.value
  })
}

const clearForm = () => {
  formData.value = createEmptyForm()
}
</script>

<style scoped>
.card {
  width: 18rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.card-header {
  padding: 10px;
  color: white;
  background-color: #275fda;
  border-radius: 10px 10px 0 0;
}

.list-group-item {
  padding: 10px;
}
</style>