<template>
  <main class="counter-page">
    <section class="counter-card">
      <h1>Book Counter</h1>

      <p class="subtitle">
        Count the books stored in Cloud Firestore
      </p>

      <button
        type="button"
        :disabled="loading"
        @click="getBookCount"
      >
        {{ loading ? 'Loading...' : 'Get Book Count' }}
      </button>

      <p v-if="count !== null" class="result">
        Total number of books: {{ count }}
      </p>

      <p v-else-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const count = ref(null)
const errorMessage = ref('')
const loading = ref(false)

const functionUrl = import.meta.env.VITE_COUNT_BOOKS_URL

const getBookCount = async () => {
  count.value = null
  errorMessage.value = ''

  if (!functionUrl) {
    errorMessage.value =
      'The Cloud Function URL has not been configured yet.'
    return
  }

  loading.value = true

  try {
    const response = await axios.get(functionUrl)
    count.value = response.data.count
  } catch (error) {
    console.error('Unable to get book count:', error)
    errorMessage.value = 'Unable to get the book count.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.counter-page {
  min-height: calc(100vh - 59px);
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: #f3f6fb;
}

.counter-card {
  width: min(480px, 100%);
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

button {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #2563eb;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.result {
  margin-top: 20px;
  color: #15803d;
  font-weight: 700;
}

.error {
  margin-top: 20px;
  color: #dc2626;
}
</style>