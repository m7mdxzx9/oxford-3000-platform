/**
 * Spaced Repetition System (SRS) - SuperMemo SM-2 Algorithm
 * Feature 31: خوارزمية التكرار المتباعد الفائقة
 */

export const SRS_RATINGS = {
  AGAIN: 1, // Repeat immediately (failed recall)
  HARD: 2,  // Hard recall, shorten interval
  GOOD: 3,  // Standard successful recall
  EASY: 4,  // Effortless instant recall
};

/**
 * Calculates next SRS review state based on SM-2
 * @param {Object} item Current word SRS record { interval: number, repetitions: number, easeFactor: number, nextReview: number }
 * @param {number} rating Rating 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @returns {Object} Updated SRS state
 */
export function calculateNextSRS(item = {}, rating = SRS_RATINGS.GOOD) {
  let interval = item.interval || 0;
  let repetitions = item.repetitions || 0;
  let easeFactor = item.easeFactor || 2.5;

  if (rating === SRS_RATINGS.AGAIN) {
    repetitions = 0;
    interval = 1; // Review tomorrow
  } else {
    // Update Ease Factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    // grade is mapped from 1-4 to 2-5
    const grade = rating + 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = rating === SRS_RATINGS.HARD ? 3 : 6;
    } else {
      const multiplier = rating === SRS_RATINGS.HARD ? 1.2 : rating === SRS_RATINGS.EASY ? easeFactor * 1.3 : easeFactor;
      interval = Math.round(interval * multiplier);
    }
    repetitions += 1;
  }

  // Next review timestamp (milliseconds)
  const oneDayMs = 24 * 60 * 60 * 1000;
  const nextReview = Date.now() + interval * oneDayMs;

  return {
    interval,
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    nextReview,
    lastReviewed: Date.now(),
  };
}

/**
 * Checks if a word is due for SRS review today
 */
export function isWordDueForReview(srsItem) {
  if (!srsItem || !srsItem.nextReview) return true;
  return Date.now() >= srsItem.nextReview;
}

/**
 * Formats interval into human-readable Arabic/English
 */
export function formatSRSInterval(intervalDays, lang = 'ar') {
  if (!intervalDays || intervalDays <= 1) {
    return lang === 'ar' ? 'غداً (1 يوم)' : 'Tomorrow (1d)';
  }
  if (intervalDays < 30) {
    return lang === 'ar' ? `بعد ${intervalDays} أيام` : `In ${intervalDays} days`;
  }
  const months = Math.round(intervalDays / 30);
  return lang === 'ar' ? `بعد ${months} شهر` : `In ${months} mo`;
}
