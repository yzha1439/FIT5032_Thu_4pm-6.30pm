<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>Sign In</h1>
      <p class="subtitle">Sign in with your Firebase account</p>

      <form @submit.prevent="signIn">
        <label for="signin-email">Email</label>
        <input
          id="signin-email"
          v-model.trim="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label for="signin-password">Password</label>
        <input
          id="signin-password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button
          class="signin-button"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <section
        v-if="role"
        class="role-panel"
        :class="{ admin: role === 'Admin' }"
      >
        <p class="role-label">Authenticated role</p>
        <h2>{{ role }}</h2>

        <p v-if="role === 'Admin'">
          You have access to the Admin Dashboard and user-management features.
        </p>

        <p v-else>
          You have access to the standard User Dashboard.
        </p>
      </section>

      <button
        v-if="currentUser"
        class="logout-button"
        type="button"
        @click="logOut"
      >
        Log Out
      </button>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)
const currentUser = ref(null)
const role = ref('')

const getRole = (userEmail) => {
  return userEmail === 'week7admin@test.com'
    ? 'Admin'
    : 'User'
}

const signIn = async () => {
  message.value = ''
  errorMessage.value = ''
  role.value = ''
  loading.value = true

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value,
    )

    currentUser.value = userCredential.user
    role.value = getRole(userCredential.user.email)

    console.log('Current Firebase user:', userCredential.user)
    console.log('Current user email:', userCredential.user.email)
    console.log('Current user role:', role.value)

    message.value = `Signed in as ${userCredential.user.email}`
    password.value = ''
  } catch (error) {
    console.error('Sign-in error:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const logOut = async () => {
  try {
    await signOut(auth)

    currentUser.value = null
    role.value = ''
    message.value = 'Signed out successfully'
    errorMessage.value = ''

    console.log(
      'Current Firebase user after logout:',
      auth.currentUser,
    )
  } catch (error) {
    console.error('Logout error:', error)
    errorMessage.value = error.message
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 59px);
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f3f6fb;
}

.auth-card {
  width: min(460px, 100%);
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
  padding: 12px;
  border: 0;
  border-radius: 8px;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.signin-button {
  margin-top: 8px;
  background: #2563eb;
}

.logout-button {
  width: 100%;
  margin-top: 16px;
  background: #dc2626;
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

.role-panel {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #93c5fd;
  border-radius: 10px;
  color: #1e3a8a;
  background: #eff6ff;
}

.role-panel.admin {
  border-color: #f59e0b;
  color: #78350f;
  background: #fffbeb;
}

.role-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-panel h2 {
  margin: 4px 0 8px;
}

.role-panel p:last-child {
  margin-bottom: 0;
}
</style>