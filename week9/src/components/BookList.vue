<template>
  <section class="book-list">
    <div class="list-heading">
      <div>
        <h2>Books with ISBN &gt; 1000</h2>
        <p>Ordered by ISBN ascending · Limited to 5 results</p>
      </div>

      <button
        class="refresh-button"
        type="button"
        @click="loadBooks"
      >
        Refresh
      </button>
    </div>

    <p v-if="loading">Loading books...</p>
    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <p
      v-if="!loading && books.length === 0"
      class="empty"
    >
      No matching books found.
    </p>

    <article
      v-for="book in books"
      :key="book.id"
      class="book-item"
    >
      <div v-if="editingId !== book.id">
        <h3>{{ book.name }}</h3>
        <p>ISBN: {{ book.isbn }}</p>
        <p class="document-id">
          Document ID: {{ book.id }}
        </p>
      </div>

      <div v-else class="edit-fields">
        <label :for="`edit-name-${book.id}`">
          Book Name
        </label>

        <input
          :id="`edit-name-${book.id}`"
          v-model.trim="editingName"
          type="text"
          required
        />
      </div>

      <div class="actions">
        <button
          v-if="editingId !== book.id"
          class="edit-button"
          type="button"
          @click="startEditing(book)"
        >
          Edit
        </button>

        <button
          v-else
          class="save-button"
          type="button"
          @click="saveBook(book.id)"
        >
          Save
        </button>

        <button
          v-if="editingId === book.id"
          class="cancel-button"
          type="button"
          @click="cancelEditing"
        >
          Cancel
        </button>

        <button
          class="delete-button"
          type="button"
          @click="removeBook(book.id, book.name)"
        >
          Delete
        </button>
      </div>
    </article>

    <p v-if="statusMessage" class="success">
      {{ statusMessage }}
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

const books = ref([])
const loading = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const editingId = ref(null)
const editingName = ref('')

const loadBooks = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const booksQuery = query(
      collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(5),
    )

    const querySnapshot = await getDocs(booksQuery)

    books.value = querySnapshot.docs.map((bookDocument) => ({
      id: bookDocument.id,
      ...bookDocument.data(),
    }))

    console.log('Query result:', books.value)
  } catch (error) {
    console.error('Error loading books:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const startEditing = (book) => {
  editingId.value = book.id
  editingName.value = book.name
  statusMessage.value = ''
}

const cancelEditing = () => {
  editingId.value = null
  editingName.value = ''
}

const saveBook = async (bookId) => {
  if (!editingName.value) {
    errorMessage.value = 'Book name is required.'
    return
  }

  try {
    await updateDoc(doc(db, 'books', bookId), {
      name: editingName.value,
    })

    statusMessage.value = 'Book updated successfully'
    cancelEditing()
    await loadBooks()
  } catch (error) {
    console.error('Error updating book:', error)
    errorMessage.value = error.message
  }
}

const removeBook = async (bookId, bookName) => {
  const confirmed = window.confirm(
    `Delete "${bookName}" from Firestore?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await deleteDoc(doc(db, 'books', bookId))

    statusMessage.value = `Book "${bookName}" deleted successfully`
    await loadBooks()
  } catch (error) {
    console.error('Error deleting book:', error)
    errorMessage.value = error.message
  }
}

onMounted(loadBooks)
</script>

<style scoped>
.book-list {
  width: min(900px, 100%);
  padding: 28px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 32px rgb(15 23 42 / 10%);
}

.list-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

h2,
h3 {
  margin-top: 0;
  color: #1f2937;
}

.list-heading p {
  margin-bottom: 0;
  color: #64748b;
}

.book-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid #e2e8f0;
}

.book-item p {
  margin: 4px 0;
}

.document-id {
  color: #64748b;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.edit-fields {
  flex: 1;
  display: grid;
  gap: 8px;
}

.edit-fields input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  padding: 9px 14px;
  border: 0;
  border-radius: 8px;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.refresh-button,
.edit-button {
  background: #2563eb;
}

.save-button {
  background: #15803d;
}

.cancel-button {
  background: #64748b;
}

.delete-button {
  background: #dc2626;
}

.success {
  color: #15803d;
}

.error {
  color: #dc2626;
}

.empty {
  color: #64748b;
}
</style>