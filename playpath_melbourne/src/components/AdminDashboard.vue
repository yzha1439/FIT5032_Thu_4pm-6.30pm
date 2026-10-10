<script setup>
import { computed, ref, watch } from 'vue'
import { getPublicUsers, useAuth } from '../services/auth.js'
import { activities } from '../data/activities.js'

const { currentUser, isAdmin } = useAuth()

const users = ref([])
const loadingUsers = ref(false)
const userError = ref('')

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

          <div v-else class="user-table-wrapper">
            <table class="user-table">
              <caption class="sr-only">
                Registered PlayPath user accounts
              </caption>

              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="user in users" :key="user.id">
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
}

@media (min-width: 992px) {
  .admin-statistics {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
