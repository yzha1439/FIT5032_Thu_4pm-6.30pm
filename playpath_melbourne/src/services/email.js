import { httpsCallable } from 'firebase/functions'

import { functions, isFirebaseConfigured } from './firebase.js'
import { cleanText, isValidEmail } from './security.js'

const sendCommunityPassEmail = functions ? httpsCallable(functions, 'sendCommunityPassEmail') : null

export async function emailCommunityPass({ fullName, email, postcode, message, activity }) {
  if (!isFirebaseConfigured || !sendCommunityPassEmail) {
    throw new Error('Firebase is not configured. Check the VITE_FIREBASE values in .env.')
  }

  const safeEmail = String(email || '')
    .trim()
    .toLowerCase()

  if (!isValidEmail(safeEmail)) throw new Error('Enter a valid email address.')
  if (!activity?.id) throw new Error('Select an activity before sending the pass.')

  try {
    const response = await sendCommunityPassEmail({
      fullName: cleanText(fullName, 60),
      email: safeEmail,
      postcode: cleanText(postcode, 4),
      message: cleanText(message, 300),
      activity: {
        id: Number(activity.id),
        name: cleanText(activity.name, 100),
        club: cleanText(activity.club, 100),
        date: cleanText(activity.date, 10),
        suburb: cleanText(activity.suburb, 60),
        type: cleanText(activity.type, 60),
        accessibility: cleanText(activity.accessibility, 30),
        description: cleanText(activity.description, 300),
      },
    })

    return response.data
  } catch (error) {
    const messages = {
      unauthenticated: 'Sign in before emailing your community pass.',
      'failed-precondition': 'Verify your email address before sending a community pass.',
      'permission-denied': 'The pass can only be sent to your verified account email.',
      'resource-exhausted': 'Please wait one minute before sending another community pass.',
      'invalid-argument': 'Check the form details and try again.',
      internal: 'The email service could not send your pass. Please try again shortly.',
    }
    const code = String(error?.code || '').replace('functions/', '')
    throw new Error(messages[code] || 'The email could not be sent. Please try again.')
  }
}
