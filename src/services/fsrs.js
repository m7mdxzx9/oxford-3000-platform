/**
 * ============================================================================
 * File: src/services/fsrs.js
 * Purpose: Modern Free Spaced Repetition Scheduler (FSRS v4/v5) Mathematical Engine
 * Connected To: db.js, Flashcards.jsx, AppContext.jsx
 * Description:
 *   Production-grade implementation of the FSRS algorithm for intelligent spaced
 *   repetition scheduling. Calculates memory stability (S), item difficulty (D),
 *   retrievability (R), and optimal review intervals based on user feedback ratings:
 *     - AGAIN (1): Total recall failure (reset interval/relearn)
 *     - HARD (2): Significant recall effort (short interval, stability damping)
 *     - GOOD (3): Standard successful recall (exponential interval expansion)
 *     - EASY (4): Flawless instantaneous recall (maximum stability boost)
 * ============================================================================
 */

// 1. Rating Constants
export const FSRS_RATING = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
};

// 2. State Constants
export const FSRS_STATE = {
  NEW: 0,
  LEARNING: 1,
  REVIEW: 2,
  RELEARNING: 3,
};

// 3. FSRS v4.5 Default Parameter Weights Vector (w)
export const DEFAULT_FSRS_WEIGHTS = [
  0.40255, 1.18385, 3.173, 15.69105, // Initial Stability for [Again, Hard, Good, Easy]
  7.1949, 0.5345, // Initial Difficulty parameters
  1.4604, 0.0046, // Difficulty update parameters
  1.54575, 0.1192, 1.01925, // Stability increase parameters
  1.9395, 0.11, 0.29605, // Stability decay / stability after failure parameters
  2.2698, 0.2315, // Hard & Easy stability modifiers
  2.9898, // Retrievability power coefficient
];

const DECAY_FACTOR = -0.5;
const FACTOR = 19 / 81; // ~0.23456

/**
 * Calculate Retrievability (Probability of Recall R) given stability and elapsed days
 * Formula: R(t, S) = (1 + FACTOR * (t / S)) ^ DECAY_FACTOR
 * @param {number} stability - Memory stability (in days)
 * @param {number} elapsedDays - Time elapsed since last review (in days)
 * @returns {number} Retrievability value between 0.0 and 1.0
 */
export function fsrsCalculateRetrievability(stability, elapsedDays) {
  if (!stability || stability <= 0) return 0.0;
  if (elapsedDays <= 0) return 1.0;
  const r = Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY_FACTOR);
  return Math.min(Math.max(r, 0.0), 1.0);
}

/**
 * Calculate next review interval in days to maintain desired retention (default 90%)
 * @param {number} stability
 * @param {number} requestRetention (e.g. 0.9 for 90%)
 * @returns {number} Interval in days (clamped to at least 1 day for Review state)
 */
export function fsrsCalculateInterval(stability, requestRetention = 0.9) {
  if (!stability || stability <= 0) return 1;
  const interval = (stability / FACTOR) * (Math.pow(requestRetention, 1 / DECAY_FACTOR) - 1);
  return Math.max(1, Math.round(interval));
}

/**
 * Calculate Initial Difficulty D0(G) where G is rating (1..4)
 */
function initDifficulty(rating, w = DEFAULT_FSRS_WEIGHTS) {
  const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
  return Math.min(Math.max(d, 1.0), 10.0);
}

/**
 * Calculate Initial Stability S0(G) where G is rating (1..4)
 */
function initStability(rating, w = DEFAULT_FSRS_WEIGHTS) {
  return Math.max(w[rating - 1] || 0.4, 0.1);
}

/**
 * Update difficulty based on current difficulty and rating
 */
function nextDifficulty(d, rating, w = DEFAULT_FSRS_WEIGHTS) {
  const delta = -w[6] * (rating - 3);
  const nextD = d + delta * ((10 - d) / 9);
  // Mean reversion to D0(3)
  const meanReversion = w[7] * initDifficulty(3, w) + (1 - w[7]) * nextD;
  return Math.min(Math.max(meanReversion, 1.0), 10.0);
}

/**
 * Calculate stability after successful recall (Good / Hard / Easy)
 */
function nextStabilityRecall(d, s, r, rating, w = DEFAULT_FSRS_WEIGHTS) {
  const hardPenalty = rating === FSRS_RATING.HARD ? w[15] : 1.0;
  const easyBonus = rating === FSRS_RATING.EASY ? w[16] : 1.0;
  const modifier = Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp((1 - r) * w[10]) - 1) *
    hardPenalty *
    easyBonus;
  return Math.max(s * (1 + modifier), 0.1);
}

/**
 * Calculate stability after recall failure (Again)
 */
function nextStabilityForget(d, s, r, w = DEFAULT_FSRS_WEIGHTS) {
  const nextS = w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp((1 - r) * w[14]);
  return Math.max(Math.min(nextS, s), 0.1);
}

/**
 * Core FSRS Scheduler: Computes new item state, stability, difficulty, interval and next review timestamp
 * @param {Object} currentProgress - Existing record from progress table (or empty object for new word)
 * @param {number} rating - FSRS_RATING (1: Again, 2: Hard, 3: Good, 4: Easy)
 * @param {number} reviewTime - Current timestamp in milliseconds (defaults to Date.now())
 * @param {number} desiredRetention - Target retention probability (defaults to 0.90)
 * @returns {Object} Updated progress object ready for IndexedDB saving
 */
export function fsrsGetNextReview(
  currentProgress = {},
  rating = FSRS_RATING.GOOD,
  reviewTime = Date.now(),
  desiredRetention = 0.90
) {
  const lastReview = currentProgress.lastReview || reviewTime;
  const elapsedDays = Math.max(0, (reviewTime - lastReview) / 86400000);
  const state = currentProgress.state ?? FSRS_STATE.NEW;
  const currentStability = currentProgress.stability || 0;
  const currentDifficulty = currentProgress.difficulty || 5.0;

  let newStability = currentStability;
  let newDifficulty = currentDifficulty;
  let newState = state;
  let newIntervalDays = 1;

  if (state === FSRS_STATE.NEW) {
    // Brand new item being introduced
    newDifficulty = initDifficulty(rating);
    newStability = initStability(rating);

    if (rating === FSRS_RATING.AGAIN) {
      newState = FSRS_STATE.LEARNING;
      newIntervalDays = 0.007; // ~10 minutes
    } else if (rating === FSRS_RATING.HARD) {
      newState = FSRS_STATE.LEARNING;
      newIntervalDays = 0.04; // ~1 hour
    } else {
      newState = FSRS_STATE.REVIEW;
      newIntervalDays = fsrsCalculateInterval(newStability, desiredRetention);
    }
  } else {
    // Review or Learning item
    const retrievability = fsrsCalculateRetrievability(currentStability, elapsedDays);
    newDifficulty = nextDifficulty(currentDifficulty, rating);

    if (rating === FSRS_RATING.AGAIN) {
      newState = FSRS_STATE.RELEARNING;
      newStability = nextStabilityForget(newDifficulty, currentStability, retrievability);
      newIntervalDays = 0.007; // ~10 minutes
    } else {
      newState = FSRS_STATE.REVIEW;
      newStability = nextStabilityRecall(newDifficulty, currentStability, retrievability, rating);
      newIntervalDays = fsrsCalculateInterval(newStability, desiredRetention);
    }
  }

  const nextReviewTimestamp = reviewTime + Math.round(newIntervalDays * 86400000);
  const calculatedRetrievability = fsrsCalculateRetrievability(newStability, newIntervalDays);

  return {
    wordId: currentProgress.wordId,
    lastReview: reviewTime,
    nextReview: nextReviewTimestamp,
    interval: newIntervalDays,
    stability: Number(newStability.toFixed(4)),
    difficulty: Number(newDifficulty.toFixed(4)),
    retrievability: Number(calculatedRetrievability.toFixed(4)),
    repetitions: (currentProgress.repetitions || 0) + 1,
    state: newState,
    easeFactor: currentProgress.easeFactor || 2.5,
    isFavorite: currentProgress.isFavorite || false,
    isMastered: currentProgress.isMastered || false,
  };
}

/**
 * Format interval into human-readable shorthand (e.g. "< 10m", "1d", "4d", "2w", "3m")
 * @param {number} days
 * @returns {string}
 */
export function formatIntervalHuman(days) {
  if (days < 0.02) return '< 10m';
  if (days < 0.1) return '~ 1h';
  if (days < 1) return '< 1d';
  if (days === 1) return '1d';
  if (days < 14) return `${Math.round(days)}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}
