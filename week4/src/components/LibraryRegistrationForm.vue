<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center mb-4">
          User Information Form
        </h1>

        <form @submit.prevent="submitForm">
          <!-- Username and Password -->
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
                v-model="formData.username"  />
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
            </div>

            <div class="col-sm-6 col-md-6">
              <label for="password" class="form-label">
                Password
              </label>

              <input type="password" class="form-control" id="password" 
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password" />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>
          </div>

          <!-- Australian Resident and Gender -->
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
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

            <div class="col-md-6 col-sm-6">
              <label for="gender" class="form-label">
                Gender
              </label>

              <select
                id="gender"
                v-model="formData.gender"
                class="form-select"
              >
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
        <!-- Submitted users DataTable -->
        <div
          v-if="submittedCards.length"
          class="mt-5"
        >
          <h2 class="text-center mb-3">
            Submitted User Information
          </h2>

          <DataTable
            :value="submittedCards"
            stripedRows
            showGridlines
            tableStyle="min-width: 50rem"
          >
            <Column
              field="username"
              header="Username"
            />

            <Column
              field="password"
              header="Password"
            />

            <Column header="Australian Resident">
              <template #body="{ data }">
                {{ data.isAustralian ? 'Yes' : 'No' }}
              </template>
            </Column>

            <Column
              field="gender"
              header="Gender"
            />

            <Column
              field="reason"
              header="Reason"
            />
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const formData = ref({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
});

const submittedCards = ref([])

const submitForm = () => {
  validateName(true);
  validatePassword(true)
  if (!errors.value.username && !errors.value.password) {
    submittedCards.value.push({ ...formData.value });
    clearForm();
  }
};

const clearForm = () => {
  formData.value = {
    username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
  }
}

const errors = ref({
  username: null,
  password: null,
  resident: null,
  gender: null,
  reason: null,
});

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = "Name must be at least 3 characters";
  } else {
    errors.value.username = null;
  }
};

const validatePassword = (blur) => {
  const password = formData.value.password;
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`;
  } else if (!hasUppercase) {
    if (blur) errors.value.password = "Password must contain at least one uppercase letter.";
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least one number.";
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least one special character.";
  } else {
    errors.value.password = null;
  }
};
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