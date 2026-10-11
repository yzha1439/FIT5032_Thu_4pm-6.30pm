import { computed, readonly, ref } from 'vue'
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase.js'
import { cleanText, isStrongPassword, isValidEmail, normaliseEmail } from './security.js'

const currentUser = ref(null)
const authReady = ref(false)

function publicUser(user, profile = {}) {
  if (!user) return null
  return {
    id: user.uid,
    name: cleanText(profile.name || user.displayName || 'PlayPath member', 60),
    email: user.email || '',
    role: profile.role === 'admin' ? 'admin' : 'member',
    emailVerified: user.emailVerified,
    provider: user.providerData[0]?.providerId || 'password',
  }
}

async function ensureUserProfile(user, preferredName = '') {
  const reference = doc(db, 'users', user.uid)
  const snapshot = await getDoc(reference)
  if (snapshot.exists()) return snapshot.data()

  const profile = {
    name: cleanText(preferredName || user.displayName || 'PlayPath member', 60),
    email: normaliseEmail(user.email || ''),
    role: 'member',
    createdAt: serverTimestamp(),
  }
  await setDoc(reference, profile)
  return profile
}

function requireFirebase() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Check the VITE_FIREBASE values in .env.')
  }
}

function authError(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already uses this email address.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/account-exists-with-different-credential':
      'This email already has a password account. Sign in with your password or choose another Google account.',
    'auth/credential-already-in-use':
      'This Google account is already linked to another PlayPath account.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled for this Firebase project.',
    'auth/unauthorized-domain': 'This website domain is not authorised for Firebase sign-in.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'The browser blocked the Google sign-in window.',
    'auth/cancelled-popup-request': 'A newer Google sign-in request replaced the previous one.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/requires-recent-login': 'Sign out and sign in again before continuing.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'auth/weak-password': 'Choose a stronger password.',
  }
  if (!messages[error?.code]) {
    console.error('Unhandled Firebase Authentication error:', error)
  }

  return new Error(
    messages[error?.code] ||
      `Authentication failed (${error?.code || 'unknown error'}). Please try again.`,
  )
}

async function syncCurrentUser(user) {
  if (!user) {
    currentUser.value = null
    return
  }
  const profile = await ensureUserProfile(user)
  currentUser.value = publicUser(user, profile)
}

export async function initialiseAuth() {
  if (!isFirebaseConfigured) {
    authReady.value = true
    return
  }
  await setPersistence(auth, browserLocalPersistence)
  await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, async (user) => {
      try {
        await syncCurrentUser(user)
      } catch (error) {
        console.error('The signed-in user profile could not be loaded.', error)
        currentUser.value = null
      } finally {
        authReady.value = true
        stop()
        resolve()
      }
    })
  })
  onAuthStateChanged(auth, (user) => {
    syncCurrentUser(user).catch((error) => {
      console.error('The signed-in user profile could not be refreshed.', error)
    })
  })
}

export async function register({ name, email, password }) {
  requireFirebase()
  const safeName = cleanText(name, 60)
  const safeEmail = normaliseEmail(email)
  if (safeName.length < 2) throw new Error('Name must contain at least 2 characters.')
  if (!isValidEmail(safeEmail)) throw new Error('Enter a valid email address.')
  if (!isStrongPassword(password)) {
    throw new Error('Use 8-64 characters with uppercase, lowercase and a number.')
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, safeEmail, password)
    await updateProfile(credential.user, { displayName: safeName })
    const profile = await ensureUserProfile(credential.user, safeName)
    await setDoc(doc(db, 'users', credential.user.uid), { name: safeName }, { merge: true })
    profile.name = safeName
    await sendEmailVerification(credential.user).catch((error) => {
      console.error('The verification email could not be sent.', error)
    })
    currentUser.value = publicUser(credential.user, profile)
    return currentUser.value
  } catch (error) {
    throw authError(error)
  }
}

export async function login({ email, password }) {
  requireFirebase()
  try {
    const credential = await signInWithEmailAndPassword(auth, normaliseEmail(email), password)
    await syncCurrentUser(credential.user)
    return currentUser.value
  } catch (error) {
    throw authError(error)
  }
}

export async function loginWithGoogle() {
  requireFirebase()
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(auth, provider)
    const profile = await ensureUserProfile(credential.user, credential.user.displayName || '')
    currentUser.value = publicUser(credential.user, profile)
    return currentUser.value
  } catch (error) {
    throw authError(error)
  }
}

export async function requestPasswordReset(email) {
  requireFirebase()
  const safeEmail = normaliseEmail(email)
  if (!isValidEmail(safeEmail)) throw new Error('Enter your email address first.')
  try {
    await sendPasswordResetEmail(auth, safeEmail)
  } catch (error) {
    throw authError(error)
  }
}

export async function resendVerificationEmail() {
  requireFirebase()
  if (!auth.currentUser) throw new Error('Sign in before requesting a verification email.')
  if (auth.currentUser.emailVerified) throw new Error('This email address is already verified.')
  try {
    await sendEmailVerification(auth.currentUser)
  } catch (error) {
    throw authError(error)
  }
}

export async function refreshCurrentUser() {
  requireFirebase()
  if (!auth.currentUser) throw new Error('Sign in before refreshing your account.')
  try {
    await reload(auth.currentUser)
    await syncCurrentUser(auth.currentUser)
    return currentUser.value
  } catch (error) {
    throw authError(error)
  }
}

export async function logout() {
  requireFirebase()
  await signOut(auth)
  currentUser.value = null
}

export function useAuth() {
  return {
    currentUser: readonly(currentUser),
    authReady: readonly(authReady),
    isFirebaseConfigured,
    isAuthenticated: computed(() => Boolean(currentUser.value)),
    isAdmin: computed(() => currentUser.value?.role === 'admin'),
  }
}

export async function getPublicUsers() {
  requireFirebase()
  if (currentUser.value?.role !== 'admin') return []
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((item) => ({
    id: item.id,
    name: cleanText(item.data().name || 'Member', 60),
    email: normaliseEmail(item.data().email || ''),
    role: item.data().role === 'admin' ? 'admin' : 'member',
    createdAt: item.data().createdAt?.toDate?.().toISOString() || null,
  }))
}
