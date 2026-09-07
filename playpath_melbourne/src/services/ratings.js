import { activities } from '../data/activities.js'
import {
  cleanText,
  createSafeId,
  isValidActivityId,
  isValidRating,
  safeJsonRead,
  safeJsonWrite,
} from './security.js'

const RATINGS_KEY = 'playpathRatingsV2'

export function getRatings() {
  const storedRatings = safeJsonRead(RATINGS_KEY, [])

  if (!Array.isArray(storedRatings)) {
    return []
  }

  /*
   * Ignore malformed or manually modified records.
   */
  return storedRatings.filter(
    (rating) =>
      typeof rating === 'object' &&
      rating !== null &&
      typeof rating.id === 'string' &&
      typeof rating.userId === 'string' &&
      typeof rating.userName === 'string' &&
      isValidActivityId(rating.activityId, activities) &&
      isValidRating(rating.score),
  )
}

function storeRatings(ratings) {
  const saved = safeJsonWrite(RATINGS_KEY, ratings)

  if (!saved) {
    throw new Error('The rating could not be stored on this device.')
  }
}

export function saveRating({ activityId, score, review, user }) {
  if (!user || typeof user.id !== 'string') {
    throw new Error('Sign in before rating an activity.')
  }

  if (!isValidActivityId(activityId, activities)) {
    throw new Error('Select a valid activity.')
  }

  if (!isValidRating(score)) {
    throw new Error('Choose a rating from 1 to 5.')
  }

  const safeActivityId = Number(activityId)

  const safeScore = Number(score)

  const safeReview = cleanText(review, 240)

  const safeUserName = cleanText(user.name, 60)

  const existingRatings = getRatings()

  /*
   * Remove this user's previous rating for the selected
   * activity. This ensures one rating per user per
   * activity.
   */
  const ratingsWithoutPrevious = existingRatings.filter(
    (rating) => !(rating.userId === user.id && rating.activityId === safeActivityId),
  )

  const newRating = {
    id: createSafeId(),
    activityId: safeActivityId,
    score: safeScore,
    review: safeReview,
    userId: user.id,
    userName: safeUserName,
    createdAt: new Date().toISOString(),
  }

  storeRatings([...ratingsWithoutPrevious, newRating])

  return newRating
}

export function getRatingSummary(activityId) {
  if (!isValidActivityId(activityId, activities)) {
    return {
      average: 0,
      count: 0,
      ratings: [],
    }
  }

  const safeActivityId = Number(activityId)

  const matchingRatings = getRatings().filter((rating) => rating.activityId === safeActivityId)

  const totalScore = matchingRatings.reduce((total, rating) => total + rating.score, 0)

  const average = matchingRatings.length > 0 ? totalScore / matchingRatings.length : 0

  return {
    average,
    count: matchingRatings.length,
    ratings: matchingRatings,
  }
}

export function getUserRating(activityId, userId) {
  if (!isValidActivityId(activityId, activities) || typeof userId !== 'string') {
    return null
  }

  return (
    getRatings().find(
      (rating) => rating.activityId === Number(activityId) && rating.userId === userId,
    ) || null
  )
}
