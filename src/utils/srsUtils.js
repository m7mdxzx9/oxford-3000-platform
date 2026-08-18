/**
 * Oxford 3000™ Spaced Repetition System (SRS)
 * Upgraded to FSRS-4.5 (Free Spaced Repetition Scheduler) Engine
 * Models memory stability, item difficulty, and retrievability along the Ebbinghaus forgetting curve.
 */

export const SRS_RATINGS = {
  AGAIN: 1, // Complete failure to recall -> resets stability
  HARD: 2,  // Successful recall with effort -> reduced interval growth
  GOOD: 3,  // Standard confident recall -> optimal interval growth
  EASY: 4,  // Effortless instant recall -> bonus stability growth
};

// FSRS-4.5 Standard Optimized Parameters
const FSRS_PARAMS = {
  w0: 0.4,   // Initial Stability: Again (days)
  w1: 1.2,   // Initial Stability: Hard (days)
  w2: 3.1,   // Initial Stability: Good (days)
  w3: 7.5,   // Initial Stability: Easy (days)
  w4: 5.0,   // Initial Difficulty Anchor
  w5: 0.8,   // Difficulty step factor
  w6: 0.2,   // Difficulty adjustment per grade
  w7: 0.05,  // Mean reversion weight
  w8: 1.6,   // Stability growth multiplier
  w9: 0.15,  // Stability decay exponent
  w10: 1.0,  // Retrievability bonus
  w11: 0.5,  // Forgetting stability factor
  w12: 0.2,  // Forgetting difficulty penalty
  w13: 0.3,  // Stability retention exponent
  w14: 0.8,  // Forgetting retrievability penalty
  decay: 0.5,
  factor: 0.19, // (19/81) scale factor for 90% retention
  requestedRetention: 0.90, // Target 90% recall probability
};

/**
 * Computes retrievability probability R(t, S) given elapsed time and stability
 */
export function getRetrievability(elapsedDays, stability) {
  if (stability <= 0) return 0;
  if (elapsedDays <= 0) return 1.0;
  return Math.pow(1 + (FSRS_PARAMS.factor * elapsedDays) / stability, -FSRS_PARAMS.decay);
}

/**
 * Calculates next review interval (in days) targeting 90% recall retention
 */
export function getNextInterval(stability, requestedRetention = FSRS_PARAMS.requestedRetention) {
  if (stability <= 0) return 1;
  const interval = (stability / FSRS_PARAMS.factor) * (Math.pow(requestedRetention, -1 / FSRS_PARAMS.decay) - 1);
  return Math.max(1, Math.round(interval));
}

/**
 * Calculates next SRS review state based on FSRS-4.5 algorithm with 100% backward compatibility
 * @param {Object} item Current word SRS record
 * @param {number} rating Rating 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @returns {Object} Updated SRS state
 */
export function calculateNextSRS(item = {}, rating = SRS_RATINGS.GOOD) {
  let repetitions = item.repetitions || 0;
  let stability = item.stability || 0;
  let difficulty = item.difficulty || FSRS_PARAMS.w4;
  const lastReviewed = item.lastReviewed || Date.now();

  const now = Date.now();
  const elapsedDays = Math.max(0, (now - lastReviewed) / (24 * 60 * 60 * 1000));
  const currentRetrievability = getRetrievability(elapsedDays, stability);

  // 1. Initial Review (First Time Encountered)
  if (repetitions === 0 || stability <= 0) {
    switch (rating) {
      case SRS_RATINGS.AGAIN:
        stability = FSRS_PARAMS.w0;
        difficulty = 7.5;
        break;
      case SRS_RATINGS.HARD:
        stability = FSRS_PARAMS.w1;
        difficulty = 6.2;
        break;
      case SRS_RATINGS.GOOD:
        stability = FSRS_PARAMS.w2;
        difficulty = 5.0;
        break;
      case SRS_RATINGS.EASY:
        stability = FSRS_PARAMS.w3;
        difficulty = 3.5;
        break;
      default:
        stability = FSRS_PARAMS.w2;
        difficulty = 5.0;
    }
    repetitions = rating === SRS_RATINGS.AGAIN ? 0 : 1;
  } else {
    // 2. Subsequent Reviews (FSRS-4.5 Update Rules)
    const gradeDiff = rating - 3; // -2 for Again, -1 for Hard, 0 for Good, +1 for Easy

    // Update Difficulty with Mean Reversion
    const targetD = difficulty - FSRS_PARAMS.w6 * gradeDiff;
    difficulty = Math.min(10.0, Math.max(1.0, FSRS_PARAMS.w7 * FSRS_PARAMS.w4 + (1 - FSRS_PARAMS.w7) * targetD));

    if (rating === SRS_RATINGS.AGAIN) {
      // Memory Lapse (Forgotten)
      const lapseStability =
        FSRS_PARAMS.w11 *
        Math.pow(difficulty, -FSRS_PARAMS.w12) *
        (Math.pow(stability + 1, FSRS_PARAMS.w13) - 1) *
        Math.exp(FSRS_PARAMS.w14 * (1 - currentRetrievability));

      stability = Math.max(FSRS_PARAMS.w0, lapseStability);
      repetitions = 0; // Reset consecutive streak
    } else {
      // Successful Recall (Memory Reinforced)
      const hardPenalty = rating === SRS_RATINGS.HARD ? 0.8 : 1.0;
      const easyBonus = rating === SRS_RATINGS.EASY ? 1.3 : 1.0;

      const recallMultiplier =
        1 +
        Math.exp(FSRS_PARAMS.w8) *
          (11 - difficulty) *
          Math.pow(stability, -FSRS_PARAMS.w9) *
          (Math.exp(FSRS_PARAMS.w10 * (1 - currentRetrievability)) - 1);

      stability = Math.max(0.5, stability * recallMultiplier * hardPenalty * easyBonus);
      repetitions += 1;
    }
  }

  // Calculate final interval targeting 90% retention
  let interval = getNextInterval(stability);

  if (rating === SRS_RATINGS.AGAIN) {
    interval = 1; // Always review tomorrow on lapse
  }

  // Map difficulty back to classic SM-2 easeFactor for legacy UI/test compatibility
  const easeFactor = parseFloat((3.5 - difficulty * 0.2).toFixed(2));
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    repetitions,
    easeFactor,
    stability: parseFloat(stability.toFixed(2)),
    difficulty: parseFloat(difficulty.toFixed(2)),
    retrievability: parseFloat((getRetrievability(0, stability) * 100).toFixed(1)),
    nextReview,
    lastReviewed: now,
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

export default {
  SRS_RATINGS,
  calculateNextSRS,
  isWordDueForReview,
  formatSRSInterval,
  getRetrievability,
  getNextInterval,
};
