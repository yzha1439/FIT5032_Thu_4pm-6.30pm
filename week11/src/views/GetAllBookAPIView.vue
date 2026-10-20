<template>
  <main class="api-page">
    <section class="api-card">
      <h1>Get All Books API</h1>

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

const books = ref([])
const loading = ref(false)
const errorMessage = ref('')

const functionUrl =
  import.meta.env.VITE_GET_ALL_BOOKS_URL

const formattedJson = computed(() => {
  return JSON.stringify(books.value, null, 2)
})

const getAllBooksAPI = async () => {
  errorMessage.value = ''

  if (!functionUrl) {
    errorMessage.value =
      'The Get All Books API URL has not been configured.'
    return
  }

  loading.value = true

  try {
    const response = await axios.get(functionUrl)
    books.value = response.data
  } catch (error) {
    console.error('Unable to retrieve books:', error)
    errorMessage.value = 'Unable to retrieve books.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getAllBooksAPI()
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
  width: min(900px, 100%);
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
  max-height: 650px;
  padding: 20px;
  overflow: auto;
  border-radius: 8px;
  color: #dcfce7;
  background: #111827;
  font-size: 16px;
  white-space: pre-wrap;
}

.error {
  color: #dc2626;
}
</style>