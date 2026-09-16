<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>Create Account</h1>
      <p class="subtitle">Register with Firebase Authentication</p>

      <form @submit.prevent="register">
        <label for="email">Email</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="At least 6 characters"
          minlength="6"
          required
        />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

const register = async () => {
  message.value = ''
  errorMessage.value = ''
  loading.value = true

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value,
    )

    message.value = `Account created for ${userCredential.user.email}`
    email.value = ''
    password.value = ''
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f3f6fb;
}

.auth-card {
  width: min(420px, 100%);
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 32px rgb(15 23 42 / 12%);
}

h1 {
  margin: 0;
  color: #1f2937;
}

.subtitle {
  margin: 8px 0 24px;
  color: #64748b;
}

form {
  display: grid;
  gap: 12px;
}

label {
  font-weight: 600;
  color: #334155;
}

input {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

button {
  margin-top: 8px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #f57c00;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.success {
  color: #15803d;
}

.error {
  color: #dc2626;
  overflow-wrap: anywhere;
}
</style>