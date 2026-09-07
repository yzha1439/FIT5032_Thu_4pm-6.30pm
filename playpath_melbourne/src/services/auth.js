import { computed, readonly, ref } from 'vue'
import {
  cleanText,
  hashPassword,
  isStrongPassword,
  isValidEmail,
  normaliseEmail,
  randomSalt,
  safeJsonRead,
} from './security.js'

const USERS_KEY = 'playpathUsersV2'
const SESSION_KEY = 'playpathSessionV2'

const currentUser = ref(null)

function getUsers() {
  const value = safeJsonRead(USERS_KEY, [])

  return Array.isArray(value) ? value : []
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function publicUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

async function createUser({ name, email, password, role = 'member' }) {
  const salt = randomSalt()

  return {
    id: crypto.randomUUID(),
    name: cleanText(name, 60),
    email: normaliseEmail(email),
    role,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  }
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      userId: user.id,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    }),
  )

  currentUser.value = publicUser(user)
}

export async function initialiseAuth() {
  if (!localStorage.getItem(USERS_KEY)) {
    const member = await createUser({
      name: 'Demo Member',
      email: 'member@playpath.test',
      password: 'Member123!',
      role: 'member',
    })

    const admin = await createUser({
      name: 'PlayPath Admin',
      email: 'admin@playpath.test',
      password: 'Admin123!',
      role: 'admin',
    })

    saveUsers([member, admin])
  }

  const session = safeJsonRead(SESSION_KEY, null)

  const sessionIsValid = session?.expiresAt > Date.now()

  const user = sessionIsValid ? getUsers().find((item) => item.id === session.userId) : null

  if (!user) {
    localStorage.removeItem(SESSION_KEY)
  }

  currentUser.value = publicUser(user)
}

export async function register({ name, email, password }) {
  const safeName = cleanText(name, 60)
  const safeEmail = normaliseEmail(email)

  if (safeName.length < 2) {
    throw new Error('Name must contain at least 2 characters.')
  }

  if (!isValidEmail(safeEmail)) {
    throw new Error('Enter a valid email address.')
  }

  if (!isStrongPassword(password)) {
    throw new Error('Use 8-64 characters with upper-case, lower-case and a number.')
  }

  const users = getUsers()

  if (users.some((user) => user.email === safeEmail)) {
    throw new Error('An account already uses this email.')
  }

  /*
   * Public registration always creates a member.
   * A user cannot choose the admin role.
   */
  const newUser = await createUser({
    name: safeName,
    email: safeEmail,
    password,
    role: 'member',
  })

  saveUsers([...users, newUser])
  setSession(newUser)

  return publicUser(newUser)
}

export async function login({ email, password }) {
  const safeEmail = normaliseEmail(email)

  const user = getUsers().find((item) => item.email === safeEmail)

  if (!user) {
    throw new Error('Email or password is incorrect.')
  }

  const suppliedPasswordHash = await hashPassword(password, user.salt)

  if (suppliedPasswordHash !== user.passwordHash) {
    throw new Error('Email or password is incorrect.')
  }

  setSession(user)

  return publicUser(user)
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  currentUser.value = null
}

export function useAuth() {
  return {
    currentUser: readonly(currentUser),

    isAuthenticated: computed(() => Boolean(currentUser.value)),

    isAdmin: computed(() => currentUser.value?.role === 'admin'),
  }
}

/*
 * This function returns only public user fields.
 * Password hashes and salts are not exposed to components.
 */
export function getPublicUsers() {
  return getUsers().map(publicUser)
}
