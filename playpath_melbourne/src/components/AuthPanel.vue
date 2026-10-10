<script setup>
import { reactive, ref } from 'vue'
import {
  login,
  loginWithGoogle,
  logout,
  refreshCurrentUser,
  register,
  requestPasswordReset,
  resendVerificationEmail,
  useAuth,
} from '../services/auth.js'

const { currentUser, isFirebaseConfigured } = useAuth()

const mode = ref('login')
const busy = ref(false)
const error = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
})

function changeMode(nextMode) {
  mode.value = nextMode
  error.value = ''
  successMessage.value = ''

  form.name = ''
  form.email = ''
  form.password = ''
}

async function submitForm() {
  error.value = ''
  successMessage.value = ''
  busy.value = true

  try {
    if (mode.value === 'login') {
      await login({
        email: form.email,
        password: form.password,
      })
      successMessage.value = 'Signed in successfully.'
    } else {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      successMessage.value = 'Account created. Check your inbox for the verification email.'
    }

    form.name = ''
    form.email = ''
    form.password = ''
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error ? caughtError.message : 'Something went wrong. Please try again.'
  } finally {
    busy.value = false
  }
}

async function runAction(action, success) {
  error.value = ''
  successMessage.value = ''
  busy.value = true
  try {
    await action()
    successMessage.value = success
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : 'Please try again.'
  } finally {
    busy.value = false
  }
}

function submitGoogleLogin() {
  return runAction(loginWithGoogle, 'Signed in securely with Google.')
}

async function submitLogout() {
  error.value = ''
  try {
    await logout()
  } catch {
    error.value = 'Sign out failed. Please try again.'
  }
}

function submitPasswordReset() {
  return runAction(
    () => requestPasswordReset(form.email),
    'If an account uses this address, Firebase will send password reset instructions.',
  )
}

function submitVerificationEmail() {
  return runAction(
    resendVerificationEmail,
    'Verification email sent. Check your inbox and spam folder.',
  )
}

async function checkVerificationStatus() {
  error.value = ''
  successMessage.value = ''
  busy.value = true
  try {
    const user = await refreshCurrentUser()
    successMessage.value = user.emailVerified
      ? 'Email verification confirmed.'
      : 'Email is not verified yet. Use the link in the verification email.'
  } catch (caughtError) {
    error.value = caughtError instanceof Error ? caughtError.message : 'Account refresh failed.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section id="account" class="account-section" aria-labelledby="account-title">
    <div class="site-container account-container">
      <div class="account-heading">
        <p class="eyebrow">Secure access</p>

        <h2 id="account-title">Your PlayPath account</h2>

        <p>Register or sign in to access personalised PlayPath features.</p>
      </div>

      <div v-if="currentUser" class="account-card">
        <div>
          <span class="role-badge">
            {{ currentUser.role }}
          </span>

          <h3>Welcome, {{ currentUser.name }}</h3>

          <p>{{ currentUser.email }}</p>

          <p class="provider-label">
            Signed in with
            {{ currentUser.provider === 'google.com' ? 'Google' : 'email and password' }}
          </p>

          <p
            v-if="currentUser.provider === 'password'"
            class="verification-status"
            :class="{ 'verification-status--verified': currentUser.emailVerified }"
          >
            {{ currentUser.emailVerified ? '✓ Email verified' : '! Email verification required' }}
          </p>

          <div
            v-if="currentUser.provider === 'password' && !currentUser.emailVerified"
            class="verification-actions"
          >
            <button type="button" :disabled="busy" @click="submitVerificationEmail">
              Resend verification
            </button>
            <button type="button" :disabled="busy" @click="checkVerificationStatus">
              I have verified
            </button>
          </div>

          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
          <p v-if="successMessage" class="auth-success" role="status">{{ successMessage }}</p>
        </div>

        <button class="button button--secondary" type="button" @click="submitLogout">
          Sign out
        </button>
      </div>

      <div v-else class="auth-layout">
        <form class="auth-form" novalidate @submit.prevent="submitForm">
          <p v-if="!isFirebaseConfigured" class="auth-error" role="alert">
            Firebase setup is incomplete. Check the web app values in the .env file.
          </p>
          <div class="auth-tabs" aria-label="Account action">
            <button
              type="button"
              :class="{ active: mode === 'login' }"
              :aria-pressed="mode === 'login'"
              @click="changeMode('login')"
            >
              Sign in
            </button>

            <button
              type="button"
              :class="{ active: mode === 'register' }"
              :aria-pressed="mode === 'register'"
              @click="changeMode('register')"
            >
              Register
            </button>
          </div>

          <div v-if="mode === 'register'" class="auth-field">
            <label for="auth-name"> Full name </label>

            <input
              id="auth-name"
              v-model="form.name"
              type="text"
              maxlength="60"
              autocomplete="name"
              required
            />
          </div>

          <div class="auth-field">
            <label for="auth-email"> Email address </label>

            <input
              id="auth-email"
              v-model="form.email"
              type="email"
              maxlength="120"
              autocomplete="email"
              required
            />
          </div>

          <div class="auth-field">
            <label for="auth-password"> Password </label>

            <input
              id="auth-password"
              v-model="form.password"
              type="password"
              minlength="8"
              maxlength="64"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              required
            />

            <small v-if="mode === 'register'">
              Use at least 8 characters, including an uppercase letter, lowercase letter and number.
            </small>
          </div>

          <p v-if="error" class="auth-error" role="alert">
            {{ error }}
          </p>

          <p v-if="successMessage" class="auth-success" role="status">
            {{ successMessage }}
          </p>

          <button
            v-if="mode === 'login'"
            class="forgot-password"
            type="button"
            :disabled="busy || !isFirebaseConfigured"
            @click="submitPasswordReset"
          >
            Forgot password?
          </button>

          <button
            class="button button--primary"
            type="submit"
            :disabled="busy || !isFirebaseConfigured"
          >
            <template v-if="busy"> Please wait... </template>

            <template v-else-if="mode === 'login'"> Sign in </template>

            <template v-else> Create account </template>
          </button>

          <div class="auth-divider" aria-hidden="true"><span>or</span></div>

          <button
            class="button button--secondary"
            type="button"
            :disabled="busy || !isFirebaseConfigured"
            @click="submitGoogleLogin"
          >
            Continue with Google
          </button>
        </form>

        <aside class="demo-accounts">
          <h3>Firebase security</h3>

          <p>
            Accounts are authenticated by Firebase. Public registration always creates a member
            account, while administrator access is controlled by the user profile in Firestore.
          </p>

          <p class="security-note">
            Passwords are never stored by PlayPath. New email accounts receive a verification
            message, and Google sign-in is handled by Firebase Authentication.
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.account-section {
  background: var(--paper);
}

.account-container {
  padding-block: clamp(4.5rem, 9vw, 8rem);
}

.account-heading {
  max-width: 700px;
  margin-bottom: 2.5rem;
}

.account-heading > p:last-child {
  color: var(--ink-soft);
  font-size: 1.05rem;
}

.auth-layout {
  display: grid;
  gap: 1.5rem;
}

.auth-form,
.demo-accounts,
.account-card {
  padding: clamp(1.25rem, 4vw, 2rem);

  background: white;
  border: 2px solid var(--ink);
  border-radius: 6px 26px 6px 26px;
  box-shadow: 8px 8px 0 var(--lavender);
}

.auth-form {
  display: grid;
  gap: 1.1rem;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.auth-tabs button {
  min-height: 46px;
  padding: 0.65rem 1rem;

  color: var(--ink);
  background: var(--lavender);
  border: 2px solid var(--ink);
  border-radius: 4px 12px 4px 12px;

  font-weight: 900;
  cursor: pointer;
}

.auth-tabs button.active {
  color: white;
  background: var(--primary);
}

.auth-field label {
  display: block;
  margin-bottom: 0.4rem;

  font-weight: 800;
}

.auth-field input {
  width: 100%;
  min-height: 48px;
  padding: 0.72rem 0.8rem;

  color: var(--ink);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 4px 14px 4px 14px;
}

.auth-field input:focus-visible {
  outline: 4px solid var(--lime);
  outline-offset: 4px;
}

.auth-field small {
  display: block;
  margin-top: 0.4rem;

  color: var(--ink-soft);
  font-size: 0.78rem;
}

.auth-error {
  margin: 0;
  padding: 0.75rem;

  color: var(--error);
  background: #fff1f3;
  border-left: 4px solid var(--error);

  font-size: 0.86rem;
  font-weight: 800;
}

.auth-success {
  margin: 0;
  padding: 0.75rem;
  color: var(--success);
  background: #edf9f3;
  border-left: 4px solid var(--success);
  font-size: 0.86rem;
  font-weight: 800;
}

.forgot-password {
  justify-self: start;
  padding: 0;
  color: var(--primary-dark);
  background: transparent;
  border: 0;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ink-soft);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.auth-divider::before,
.auth-divider::after {
  flex: 1;
  height: 1px;
  background: var(--border);
  content: '';
}

.account-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.account-card h3 {
  margin-top: 0.7rem;
  margin-bottom: 0.4rem;
}

.account-card p {
  margin: 0;
  color: var(--ink-soft);
}

.provider-label {
  margin-top: 0.35rem;
  font-size: 0.82rem;
}

.verification-status {
  display: inline-block;
  margin-top: 0.8rem !important;
  padding: 0.3rem 0.65rem;
  color: var(--error) !important;
  background: #fff1f3;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 900;
}

.verification-status--verified {
  color: var(--success) !important;
  background: #edf9f3;
}

.verification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.verification-actions button {
  min-height: 42px;
  padding: 0.5rem 0.75rem;
  color: var(--ink);
  background: white;
  border: 2px solid var(--ink);
  border-radius: 4px 12px 4px 12px;
  font-weight: 800;
  cursor: pointer;
}

.account-card .auth-error,
.account-card .auth-success {
  margin-top: 0.8rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;

  color: white;
  background: var(--primary);
  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-accounts {
  align-self: start;
}

.demo-account {
  display: grid;
  margin-bottom: 1rem;
  padding-bottom: 1rem;

  border-bottom: 1px solid var(--border);
}

.demo-account strong {
  color: var(--primary-dark);
}

.demo-account span {
  overflow-wrap: anywhere;
}

.security-note {
  margin-bottom: 0;

  color: var(--ink-soft);
  font-size: 0.84rem;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (min-width: 768px) {
  .auth-layout {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(280px, 0.7fr);
  }
}
</style>
