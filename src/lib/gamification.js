// Gamification rules — pure functions shared by every backend.
// Design guardrail: gamify consistency, not volume. Every cap here exists so
// showing up daily beats cramming.

import { daysBetween } from './dates.js';

// ---------------------------------------------------------------- XP values
export const XP = {
  soak_completed: { points: 50, dailyCap: 1 },   // 1/day
  chapter_read:   { points: 10, dailyCap: 5 },   // daily cap: 5 chapters (50 XP); once per chapter, ever
  devotion_read:  { points: 15, dailyCap: 1 },   // 1/day
  quiz_correct:   { points: 5,  dailyCap: 3 },   // 3 quizzes/day
};

// ------------------------------------------------------------------ Levels
export const LEVELS = [
  { level: 1, name: 'Seeker',   minXp: 0 },
  { level: 2, name: 'Learner',  minXp: 500 },
  { level: 3, name: 'Disciple', minXp: 1500 },
  { level: 4, name: 'Steward',  minXp: 3500 },
  { level: 5, name: 'Servant',  minXp: 7000 },
  { level: 6, name: 'Elder',    minXp: 12000 },
];

export function levelForXp(totalXp) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (totalXp >= l.minXp) current = l;
  const next = LEVELS.find((l) => l.minXp > totalXp) || null;
  const progress = next
    ? (totalXp - current.minXp) / (next.minXp - current.minXp)
    : 1;
  return { ...current, next, progress };
}

// ------------------------------------------------------------------ Streaks
export const MAX_FREEZES = 2;
export const FREEZE_REGEN_DAYS = 14; // +1 freeze per 14 consecutive days

// The streak increments ONLY when the daily SOAK is completed. Missing a day
// consumes a freeze if available; otherwise the streak resets.
export function advanceStreak(streak, entryDate) {
  const s = {
    current_streak: streak?.current_streak ?? 0,
    longest_streak: streak?.longest_streak ?? 0,
    last_completed_date: streak?.last_completed_date ?? null,
    freezes_available: streak?.freezes_available ?? MAX_FREEZES,
  };
  if (s.last_completed_date === entryDate) return { streak: s, changed: false, usedFreezes: 0, broke: false };

  let usedFreezes = 0;
  let broke = false;

  if (!s.last_completed_date) {
    s.current_streak = 1;
  } else {
    const gap = daysBetween(s.last_completed_date, entryDate);
    if (gap <= 0) return { streak: s, changed: false, usedFreezes: 0, broke: false };
    const missed = gap - 1;
    if (missed === 0) {
      s.current_streak += 1;
    } else if (missed <= s.freezes_available) {
      usedFreezes = missed;
      s.freezes_available -= missed;
      s.current_streak += 1;
    } else {
      broke = true;
      s.current_streak = 1;
    }
  }

  // Freezes regenerate slowly: +1 per 14 consecutive days, capped.
  if (s.current_streak > 0 && s.current_streak % FREEZE_REGEN_DAYS === 0) {
    s.freezes_available = Math.min(MAX_FREEZES, s.freezes_available + 1);
  }

  s.longest_streak = Math.max(s.longest_streak, s.current_streak);
  s.last_completed_date = entryDate;
  return { streak: s, changed: true, usedFreezes, broke };
}

// What the streak looks like *right now* (before today's SOAK): if the last
// completion is older than yesterday and the gap can't be covered by freezes,
// display it as at-risk/reset rather than the stale number.
export function effectiveStreak(streak, today) {
  if (!streak?.last_completed_date) return { current: 0, atRisk: false };
  const gap = daysBetween(streak.last_completed_date, today);
  if (gap <= 1) return { current: streak.current_streak, atRisk: gap === 1 };
  const missed = gap - 1;
  if (missed <= (streak.freezes_available ?? 0)) {
    return { current: streak.current_streak, atRisk: true };
  }
  return { current: 0, atRisk: false };
}

// ------------------------------------------------------------------ Badges
export const BADGES = [
  { code: 'FIRST_SOAK', name: 'First SOAK', description: 'Completed your very first SOAK entry', icon: '🌱' },
  { code: 'SOAK_30', name: 'Faithful 30', description: 'Completed 30 SOAK entries', icon: '📖' },
  { code: 'STREAK_7', name: 'One Week', description: 'Kept a 7-day SOAK streak', icon: '🔥' },
  { code: 'STREAK_30', name: 'One Month', description: 'Kept a 30-day SOAK streak', icon: '⚡' },
  { code: 'STREAK_100', name: 'Century', description: 'Kept a 100-day SOAK streak', icon: '🏆' },
  { code: 'BOOK_JOHN', name: 'Beloved Disciple', description: 'Read every chapter of the Gospel of John', icon: '✝️' },
  { code: 'QUIZ_ACE', name: 'Quiz Ace', description: 'Answered 10 quiz questions correctly in a row', icon: '🎯' },
  { code: 'EARLY_BIRD', name: 'Early Bird', description: 'Completed your SOAK before 7am, ten times', icon: '🌅' },
];

export const BADGE_BY_CODE = Object.fromEntries(BADGES.map((b) => [b.code, b]));

// Evaluates which badges are newly earned from a snapshot of the user's stats.
export function earnedBadges(stats, alreadyEarned) {
  const have = new Set(alreadyEarned);
  const earned = [];
  const check = (code, cond) => {
    if (cond && !have.has(code)) earned.push(code);
  };
  check('FIRST_SOAK', stats.soakCount >= 1);
  check('SOAK_30', stats.soakCount >= 30);
  check('STREAK_7', stats.currentStreak >= 7);
  check('STREAK_30', stats.currentStreak >= 30);
  check('STREAK_100', stats.currentStreak >= 100);
  check('BOOK_JOHN', stats.johnChaptersRead >= 21);
  check('QUIZ_ACE', stats.quizCorrectRun >= 10);
  check('EARLY_BIRD', stats.earlySoakCount >= 10);
  return earned;
}
