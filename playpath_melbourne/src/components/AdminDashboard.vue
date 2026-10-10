<script setup>
import { computed, ref, watch } from 'vue'
import { getPublicUsers, useAuth } from '../services/auth.js'
import { activities } from '../data/activities.js'
import ExportActions from './ExportActions.vue'

const { currentUser, isAdmin } = useAuth()

const users = ref([])
const loadingUsers = ref(false)
const userError = ref('')
const nameSearch = ref('')
const emailSearch = ref('')
const roleFilter = ref('All')
const sortKey = ref('name')
const sortDirection = ref('asc')
const currentPage = ref(1)
const rowsPerPage = 10
const collator = new Intl.Collator('en-AU', { numeric: true, sensitivity: 'base' })
const exportColumns = [
  { key: 'name', label: 'Name', width: 1.5 },
  { key: 'email', label: 'Email', width: 2.8 },
  { key: 'role', label: 'Role', width: 1 },
]

watch(
  isAdmin,
  async (admin) => {
    users.value = []
    userError.value = ''
    if (!admin) return
    loadingUsers.value = true
    try {
      users.value = await getPublicUsers()
    } catch {
      userError.value = 'User accounts could not be loaded from Firestore.'
    } finally {
      loadingUsers.value = false
    }
  },
  { immediate: true },
)

const memberCount = computed(() => users.value.filter((user) => user.role === 'member').length)

const adminCount = computed(() => users.value.filter((user) => user.role === 'admin').length)

const filteredUsers = computed(() => {
  const nameTerm = nameSearch.value.trim().toLowerCase()
  const emailTerm = emailSearch.value.trim().toLowerCase()

  return users.value.filter(
    (user) =>
      (!nameTerm || user.name.toLowerCase().includes(nameTerm)) &&
      (!emailTerm || user.email.toLowerCase().includes(emailTerm)) &&
      (roleFilter.value === 'All' || user.role === roleFilter.value),
  )
})

const sortedUsers = computed(() =>
  [...filteredUsers.value].sort((first, second) => {
    const comparison = collator.compare(String(first[sortKey.value]), String(second[sortKey.value]))
    return sortDirection.value === 'asc' ? comparison : -comparison
  }),
)

const pageCount = computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / rowsPerPage)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return sortedUsers.value.slice(start, start + rowsPerPage)
})

const exportRows = computed(() =>
  sortedUsers.value.map((user) => ({
    name: user.name,
    email: user.email,
    role: user.role,
  })),
)

const resultRange = computed(() => {
  if (!sortedUsers.value.length) return '0 users'
  const start = (currentPage.value - 1) * rowsPerPage + 1
  const end = Math.min(start + rowsPerPage - 1, sortedUsers.value.length)
  return `${start}-${end} of ${sortedUsers.value.length}`
})

watch([nameSearch, emailSearch, roleFilter], () => {
  currentPage.value = 1
})

watch(pageCount, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

function sortBy(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

function sortIndicator(key) {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function clearUserFilters() {
  nameSearch.value = ''
  emailSearch.value = ''
  roleFilter.value = 'All'
}
</script>

<template>
  <section id="admin" class="admin-section" aria-labelledby="admin-title">
    <div class="site-container admin-container">
      <p class="eyebrow">Role-protected page</p>

      <h2 id="admin-title">Administration dashboard</h2>

      <div v-if="isAdmin" class="admin-content">
        <div class="admin-welcome">
          <div>
            <span class="admin-role"> Administrator </span>

            <h3>Welcome, {{ currentUser.name }}</h3>

            <p>This information is only available to users with the administrator role.</p>
          </div>
        </div>

        <div class="admin-statistics">
          <article>
            <strong>{{ users.length }}</strong>
            <span>Registered users</span>
          </article>

          <article>
            <strong>{{ memberCount }}</strong>
            <span>Members</span>
          </article>

          <article>
            <strong>{{ adminCount }}</strong>
            <span>Administrators</span>
          </article>

          <article>
            <strong>{{ activities.length }}</strong>
            <span>Published activities</span>
          </article>
        </div>

        <div class="user-list">
          <h3>User accounts</h3>

          <p v-if="loadingUsers" role="status">Loading user accounts...</p>
          <p v-else-if="userError" class="user-error" role="alert">{{ userError }}</p>

          <template v-else>
            <div class="user-table-filters" aria-label="Filter user account columns">
              <div>
                <label for="user-name-search">Name</label>
                <input
                  id="user-name-search"
                  v-model="nameSearch"
                  type="search"
                  placeholder="Search names"
                />
              </div>
              <div>
                <label for="user-email-search">Email</label>
                <input
                  id="user-email-search"
                  v-model="emailSearch"
                  type="search"
                  placeholder="Search emails"
                />
              </div>
              <div>
                <label for="user-role-filter">Role</label>
                <select id="user-role-filter" v-model="roleFilter">
                  <option value="All">All roles</option>
                  <option value="member">Members</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
              <button type="button" @click="clearUserFilters">Clear filters</button>
            </div>

            <p class="user-result-count" aria-live="polite">
              {{ filteredUsers.length }}
              {{ filteredUsers.length === 1 ? 'user found' : 'users found' }}
            </p>

            <ExportActions
              title="PlayPath Melbourne user accounts"
              filename="playpath-user-accounts"
              :columns="exportColumns"
              :rows="exportRows"
            />

            <div v-if="filteredUsers.length" class="user-table-wrapper">
              <table class="user-table">
                <caption class="sr-only">
                  Registered PlayPath user accounts
                </caption>

                <thead>
                  <tr>
                    <th scope="col" :aria-sort="ariaSort('name')">
                      <button class="user-sort-button" type="button" @click="sortBy('name')">
                        Name <span aria-hidden="true">{{ sortIndicator('name') }}</span>
                      </button>
                    </th>
                    <th scope="col" :aria-sort="ariaSort('email')">
                      <button class="user-sort-button" type="button" @click="sortBy('email')">
                        Email <span aria-hidden="true">{{ sortIndicator('email') }}</span>
                      </button>
                    </th>
                    <th scope="col" :aria-sort="ariaSort('role')">
                      <button class="user-sort-button" type="button" @click="sortBy('role')">
                        Role <span aria-hidden="true">{{ sortIndicator('role') }}</span>
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>

                    <td>
                      <span
                        class="user-role"
                        :class="{
                          'user-role--admin': user.role === 'admin',
                        }"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-else class="user-empty-state">No user accounts match these column filters.</p>

            <nav
              v-if="filteredUsers.length"
              class="user-pagination"
              aria-label="User account pages"
            >
              <p aria-live="polite">Showing {{ resultRange }}</p>
              <div>
                <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">
                  Previous
                </button>
                <span>Page {{ currentPage }} of {{ pageCount }}</span>
                <button
                  type="button"
                  :disabled="currentPage === pageCount"
                  @click="currentPage += 1"
                >
                  Next
                </button>
              </div>
            </nav>
          </template>
        </div>
      </div>

      <div v-else class="access-denied" role="status">
        <span class="access-denied__symbol" aria-hidden="true"> ! </span>

        <div>
          <h3>Administrator access required</h3>

          <p v-if="currentUser">
            Your account has the
            <strong>{{ currentUser.role }}</strong>
            role. This page requires the
            <strong>admin</strong> role.
          </p>

          <p v-else>Sign in with an administrator account to access this page.</p>

          <a class="button button--primary" href="#account"> Go to account </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-section {
  background: var(--sky);
}

.admin-container {
  padding-block: clamp(4.5rem, 9vw, 8rem);
}

.admin-content {
  display: grid;
  gap: 2rem;
}

.admin-welcome,
.user-list,
.access-denied {
  padding: clamp(1.25rem, 4vw, 2rem);

  background: white;
  border: 2px solid var(--ink);
  border-radius: 6px 26px 6px 26px;
  box-shadow: 8px 8px 0 var(--lavender);
}

.admin-role {
  display: inline-block;
  padding: 0.3rem 0.7rem;

  color: white;
  background: var(--primary);
  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-welcome h3 {
  margin-top: 0.8rem;
}

.admin-welcome p {
  margin-bottom: 0;
  color: var(--ink-soft);
}

.admin-statistics {
  display: grid;
  gap: 1rem;
}

.admin-statistics article {
  display: grid;
  padding: 1.4rem;

  background: var(--lavender);
  border: 2px solid var(--ink);
  border-radius: 6px 20px 6px 20px;
}

.admin-statistics strong {
  color: var(--primary);
  font-size: 2.5rem;
  line-height: 1;
}

.admin-statistics span {
  margin-top: 0.5rem;
  font-weight: 800;
}

.user-table-wrapper {
  overflow-x: auto;
}

.user-table-filters {
  display: grid;
  gap: 0.8rem;
  margin-block: 1rem;
}

.user-table-filters > div {
  display: grid;
  gap: 0.35rem;
}

.user-table-filters label {
  font-weight: 800;
}

.user-table-filters input,
.user-table-filters select {
  width: 100%;
  padding: 0.7rem;
  border: 2px solid var(--ink);
  border-radius: 6px;
}

.user-table-filters > button,
.user-pagination button {
  padding: 0.65rem 0.85rem;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
}

.user-result-count,
.user-empty-state {
  color: var(--ink-soft);
}

.user-error {
  color: var(--error);
  font-weight: 800;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 0.85rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.user-table th {
  color: white;
  background: var(--ink);
}

.user-sort-button {
  width: 100%;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.user-table td {
  overflow-wrap: anywhere;
}

.user-role {
  display: inline-block;
  padding: 0.2rem 0.55rem;

  color: var(--primary-dark);
  background: var(--lavender);
  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.user-role--admin {
  color: white;
  background: var(--primary);
}

.user-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.user-pagination p {
  margin: 0;
  color: var(--ink-soft);
}

.user-pagination div {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.access-denied {
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  max-width: 760px;
}

.access-denied__symbol {
  min-width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  color: white;
  background: var(--error);
  border: 2px solid var(--ink);
  border-radius: 50%;

  font-size: 1.5rem;
  font-weight: 900;
}

@media (min-width: 576px) {
  .admin-statistics {
    grid-template-columns: repeat(2, 1fr);
  }

  .user-table-filters {
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    align-items: end;
  }
}

@media (min-width: 992px) {
  .admin-statistics {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
