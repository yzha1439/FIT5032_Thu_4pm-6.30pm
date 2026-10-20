<template>
  <main class="api-page">
    <section class="api-card">
      <h1>Book Count API</h1>

      <p v-if="loading">
        Loading...
      </p>

      <p v-else-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <pre v-else>{{ formattedJson }}</pre>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

const jsondata = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const functionUrl = import.meta.env.VITE_COUNT_BOOKS_URL

const formattedJson = computed(() => {
  return JSON.stringify(jsondata.value, null, 2)
})

const getBookCountAPI = async () => {
  errorMessage.value = ''

  if (!functionUrl) {
    errorMessage.value =
      'The Cloud Function URL has not been configured.'
    return
  }

  loading.value = true

  try {
    const response = await axios.get(functionUrl)
    jsondata.value = response.data
  } catch (error) {
    console.error('Unable to retrieve API data:', error)
    errorMessage.value = 'Unable to retrieve the book count.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getBookCountAPI()
})
</script>

<style scoped>
.api-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: #f3f6fb;
}

.api-card {
  width: min(600px, 100%);
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 32px rgb(15 23 42 / 12%);
}

h1 {
  margin: 0 0 24px;
  color: #1f2937;
}

pre {
  padding: 20px;
  overflow-x: auto;
  border-radius: 8px;
  color: #dcfce7;
  background: #111827;
  font-size: 18px;
}

.error {
  color: #dc2626;
}
</style>