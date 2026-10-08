<template>
  <main class="book-page">
    <section class="book-card">
      <h1>Add a Book</h1>
      <p class="subtitle">
        Save a new book to Cloud Firestore
      </p>

      <form @submit.prevent="addBook">
        <label for="isbn">ISBN</label>
        <input
          id="isbn"
          v-model.number="isbn"
          type="number"
          min="1"
          placeholder="Enter the ISBN number"
          required
        />

        <label for="book-name">Book Name</label>
        <input
          id="book-name"
          v-model.trim="name"
          type="text"
          placeholder="Enter the book name"
          required
        />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Adding book...' : 'Add Book' }}
        </button>
      </form>

      <p v-if="message" class="success">
        {{ message }}
      </p>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </section>

    <BookList :key="listVersion" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import BookList from '../components/BookList.vue'

const isbn = ref(null)
const name = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)
const listVersion = ref(0)

const addBook = async () => {
  message.value = ''
  errorMessage.value = ''
  loading.value = true

  try {
    const documentReference = await addDoc(
      collection(db, 'books'),
      {
        isbn: Number(isbn.value),
        name: name.value,
        createdAt: serverTimestamp(),
      },
    )

    console.log(
      'Book document ID:',
      documentReference.id,
    )

    message.value =
      `Book "${name.value}" added successfully`

    isbn.value = null
    name.value = ''

    listVersion.value += 1
  } catch (error) {
    console.error('Error adding book:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.book-page {
  min-height: calc(100vh - 59px);
  display: grid;
  justify-items: center;
  gap: 28px;
  padding: 40px 24px;
  background: #f3f6fb;
}

.book-card {
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

form {
  display: grid;
  gap: 12px;
}

label {
  font-weight: 700;
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
  background: #7c3aed;
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