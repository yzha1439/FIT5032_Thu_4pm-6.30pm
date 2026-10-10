import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { Resend } from 'resend'

initializeApp()

const db = getFirestore()
const resendApiKey = defineSecret('RESEND_API_KEY')

const permittedActivities = new Set(Array.from({ length: 12 }, (_, index) => index + 1))

function cleanText(value, maximum) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeIcs(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll(/\r?\n/g, '\\n')
}

function compactDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new HttpsError('invalid-argument', 'The activity date is invalid.')
  return `${match[1]}${match[2]}${match[3]}`
}

function nextDate(value) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    throw new HttpsError('invalid-argument', 'The activity date is invalid.')
  }
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

function createCalendarAttachment(activity, attendeeName) {
  const startDate = compactDate(activity.date)
  const endDate = nextDate(activity.date)
  const issuedAt = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  const uid = `activity-${activity.id}-${Date.now()}@playpath-melbourne.web.app`
  const description = `${activity.description || activity.type} Organised by ${activity.club}.`

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlayPath Melbourne//Community Pass//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${issuedAt}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcs(activity.name)}`,
    `LOCATION:${escapeIcs(`${activity.suburb}, Melbourne`)}`,
    `DESCRIPTION:${escapeIcs(`${description} Community pass holder: ${attendeeName}.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return Buffer.from(calendar, 'utf8').toString('base64')
}

async function enforceRateLimit(uid) {
  const reference = db.collection('emailRateLimits').doc(uid)
  const now = Date.now()

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference)
    const previous = snapshot.data()?.lastSentAt?.toMillis?.() || 0

    if (now - previous < 60_000) {
      throw new HttpsError('resource-exhausted', 'Wait one minute before sending again.')
    }

    transaction.set(reference, { lastSentAt: FieldValue.serverTimestamp() }, { merge: true })
  })
}

export const sendCommunityPassEmail = onCall(
  {
    region: 'australia-southeast2',
    secrets: [resendApiKey],
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before sending email.')
    if (!request.auth.token.email_verified) {
      throw new HttpsError('failed-precondition', 'Verify your email before sending email.')
    }

    const accountEmail = String(request.auth.token.email || '')
      .trim()
      .toLowerCase()
    const requestedEmail = String(request.data?.email || '')
      .trim()
      .toLowerCase()

    if (!accountEmail || requestedEmail !== accountEmail) {
      throw new HttpsError('permission-denied', 'Recipient must match the verified account email.')
    }

    const fullName = cleanText(request.data?.fullName, 60)
    const postcode = cleanText(request.data?.postcode, 4)
    const message = cleanText(request.data?.message, 300)
    const activityInput = request.data?.activity || {}
    const activity = {
      id: Number(activityInput.id),
      name: cleanText(activityInput.name, 100),
      club: cleanText(activityInput.club, 100),
      date: cleanText(activityInput.date, 10),
      suburb: cleanText(activityInput.suburb, 60),
      type: cleanText(activityInput.type, 60),
      accessibility: cleanText(activityInput.accessibility, 30),
      description: cleanText(activityInput.description, 300),
    }

    if (
      fullName.length < 2 ||
      !/^\d{4}$/.test(postcode) ||
      !permittedActivities.has(activity.id) ||
      !activity.name ||
      !activity.club ||
      !activity.suburb
    ) {
      throw new HttpsError('invalid-argument', 'The community pass details are invalid.')
    }

    await enforceRateLimit(request.auth.uid)

    const resend = new Resend(resendApiKey.value())

    const safeName = escapeHtml(fullName)
    const safeActivity = escapeHtml(activity.name)
    const safeMessage = message ? escapeHtml(message) : 'No additional message was supplied.'

    try {
      const { error } = await resend.emails.send({
        to: accountEmail,
        from: 'PlayPath Melbourne <onboarding@resend.dev>',
        subject: `Your PlayPath pass: ${activity.name}`,
        text: [
          `Hello ${fullName},`,
          '',
          `Your expression of interest for ${activity.name} has been received.`,
          `Organiser: ${activity.club}`,
          `Date: ${activity.date}`,
          `Location: ${activity.suburb}, Melbourne`,
          `Postcode: ${postcode}`,
          `Your message: ${message || 'No additional message was supplied.'}`,
          '',
          'Your activity calendar file is attached.',
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#26213f">
            <h1 style="color:#5947dc">Your PlayPath community pass</h1>
            <p>Hello ${safeName},</p>
            <p>Your expression of interest for <strong>${safeActivity}</strong> has been received.</p>
            <table role="presentation" style="border-collapse:collapse">
              <tr><th align="left" style="padding:6px 18px 6px 0">Organiser</th><td>${escapeHtml(activity.club)}</td></tr>
              <tr><th align="left" style="padding:6px 18px 6px 0">Date</th><td>${escapeHtml(activity.date)}</td></tr>
              <tr><th align="left" style="padding:6px 18px 6px 0">Location</th><td>${escapeHtml(activity.suburb)}, Melbourne</td></tr>
              <tr><th align="left" style="padding:6px 18px 6px 0">Accessibility</th><td>${escapeHtml(activity.accessibility)}</td></tr>
            </table>
            <p><strong>Your message:</strong> ${safeMessage}</p>
            <p>The attached calendar file can be opened in Apple Calendar, Google Calendar or Outlook.</p>
          </div>
        `,
        attachments: [
          {
            content: createCalendarAttachment(activity, fullName),
            filename: `playpath-${activity.id}-activity-pass.ics`,
          },
        ],
      })

      if (error) {
        console.error('Resend delivery failed.', error)
        throw new HttpsError('internal', 'The email provider rejected the message.')
      }
    } catch (error) {
      if (error instanceof HttpsError) throw error
      console.error('Resend delivery failed.', error)
      throw new HttpsError('internal', 'The email provider rejected the message.')
    }

    return { delivered: true, recipient: accountEmail, attachmentCount: 1 }
  },
)
