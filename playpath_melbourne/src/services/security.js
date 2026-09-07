const encoder = new TextEncoder()

const PASSWORD_ITERATIONS = 120000
const PASSWORD_KEY_LENGTH = 256

export function normaliseEmail(value) {
  return String(value).trim().toLowerCase()
}

export function cleanText(value, maxLength) {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength)
}

export function isValidEmail(value) {
  const email = normaliseEmail(value)

  if (email.length < 5 || email.length > 120) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isStrongPassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 64) {
    return false
  }

  const hasLowercase = /[a-z]/.test(value)
  const hasUppercase = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)

  return hasLowercase && hasUppercase && hasNumber
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex) {
  if (typeof hex !== 'string' || !/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error('Invalid password salt.')
  }

  const bytes = new Uint8Array(hex.length / 2)

  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16)
  }

  return bytes
}

export function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  return bytesToHex(bytes)
}

export async function hashPassword(password, salt) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    {
      name: 'PBKDF2',
    },
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: hexToBytes(salt),
      iterations: PASSWORD_ITERATIONS,
    },
    passwordKey,
    PASSWORD_KEY_LENGTH,
  )

  return bytesToHex(new Uint8Array(derivedBits))
}

export function safeJsonRead(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key)

    if (storedValue === null) {
      return fallback
    }

    const parsedValue = JSON.parse(storedValue)

    return parsedValue ?? fallback
  } catch {
    /*
     * Invalid or deliberately corrupted local data is
     * discarded instead of crashing the application.
     */
    localStorage.removeItem(key)
    return fallback
  }
}

export function safeJsonWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))

    return true
  } catch {
    return false
  }
}

export function isValidRole(role) {
  return role === 'member' || role === 'admin'
}

export function isValidRating(score) {
  const numericScore = Number(score)

  return Number.isInteger(numericScore) && numericScore >= 1 && numericScore <= 5
}

export function isValidActivityId(activityId, activities) {
  const numericId = Number(activityId)

  return Number.isInteger(numericId) && activities.some((activity) => activity.id === numericId)
}

export function createSafeId() {
  return crypto.randomUUID()
}
