// Game service — orchestrates backend writes with the pure rules in
// gamification.js. All daily caps are computed against the user's LOCAL
// calendar date.

import { backend } from './backend/index.js';
import { XP, advanceStreak, earnedBadges } from './gamification.js';
import { localDateString, todayLocal, monthStartLocal } from './dates.js';

function xpSummary(xpLog) {
  const today = todayLocal();
  const monthStart = monthStartLocal();
  let total = 0;
  let month = 0;
  const todayByAction = {};
  for (const row of xpLog) {
    total += row.points;
    const localDay = localDateString(new Date(row.created_at));
    if (localDay >= monthStart) month += row.points;
    if (localDay === today) {
      todayByAction[row.action_type] = (todayByAction[row.action_type] || 0) + 1;
    }
  }
  return { total, month, todayByAction };
}

async function awardXpIfUnderCap(userId, actionType, refId, todayByAction) {
  const rule = XP[actionType];
  const usedToday = todayByAction[actionType] || 0;
  if (usedToday >= rule.dailyCap) return 0;
  await backend.logXp(userId, actionType, rule.points, refId);
  return rule.points;
}

function quizCorrectRun(attempts) {
  // attempts are newest-first
  let run = 0;
  for (const a of attempts) {
    if (a.is_correct) run += 1;
    else break;
  }
  return run;
}

export async function loadState(userId) {
  const [profile, entries, streak, xpLog, progress, userBadges, attempts, highlights] =
    await Promise.all([
      backend.getProfile(userId),
      backend.getEntries(userId),
      backend.getStreak(userId),
      backend.getXpLog(userId),
      backend.getReadingProgress(userId),
      backend.getUserBadges(userId),
      backend.getQuizAttempts(userId),
      backend.getHighlights(userId),
    ]);
  // Keyed 'CODE/chapter/verse' -> color for O(1) lookup in the reader.
  const highlightMap = {};
  for (const h of highlights) highlightMap[`${h.book_code}/${h.chapter}/${h.verse}`] = h.color;
  return {
    profile,
    entries,
    streak,
    xp: xpSummary(xpLog),
    progress,
    badges: userBadges.map((b) => b.badge_code),
    quizRun: quizCorrectRun(attempts),
    highlights: highlightMap,
  };
}

async function checkBadges(userId, state) {
  const stats = {
    soakCount: state.entries.length,
    currentStreak: state.streak?.current_streak ?? 0,
    johnChaptersRead: new Set(
      state.progress.filter((p) => p.book_code === 'JHN').map((p) => p.chapter)
    ).size,
    quizCorrectRun: state.quizRun,
    earlySoakCount: state.entries.filter((e) => {
      const h = new Date(e.created_at).getHours();
      return h < 7;
    }).length,
  };
  const newBadges = earnedBadges(stats, state.badges);
  if (newBadges.length) await backend.awardBadges(userId, newBadges);
  return newBadges;
}

// ------------------------------------------------------------- Daily SOAK
export async function completeSoak(userId, fields) {
  const entryDate = todayLocal();
  const { created } = await backend.upsertEntry({
    user_id: userId,
    entry_date: entryDate,
    ...fields,
  });

  const result = { xpEarned: 0, newBadges: [], usedFreezes: 0, created };

  // Streak + XP advance only on the day's FIRST completion; edits are free.
  const prevStreak = await backend.getStreak(userId);
  const { streak, changed, usedFreezes } = advanceStreak(prevStreak, entryDate);
  if (changed) {
    await backend.upsertStreak(userId, streak);
    result.usedFreezes = usedFreezes;
  }

  const state = await loadState(userId);
  if (created) {
    result.xpEarned = await awardXpIfUnderCap(
      userId, 'soak_completed', entryDate, state.xp.todayByAction
    );
  }
  result.newBadges = await checkBadges(userId, { ...state, streak });
  return result;
}

// --------------------------------------------------------- Chapter reading
export async function markChapterRead(userId, version, bookCode, chapter) {
  // XP once per chapter EVER (reading_progress PK), plus a 5-chapter daily cap
  // so consistency beats cramming.
  const { inserted } = await backend.addReadingProgress(userId, version, bookCode, chapter);
  const result = { xpEarned: 0, newBadges: [], firstTime: inserted };
  if (!inserted) return result;

  const state = await loadState(userId);
  result.xpEarned = await awardXpIfUnderCap(
    userId, 'chapter_read', `${bookCode} ${chapter}`, state.xp.todayByAction
  );
  result.newBadges = await checkBadges(userId, state);
  return result;
}

// --------------------------------------------------------- Verse highlights
export async function toggleHighlight(userId, bookCode, chapter, verse, color) {
  // color === null removes the highlight; otherwise set/replace it.
  if (color === null) {
    await backend.removeHighlight(userId, bookCode, chapter, verse);
  } else {
    await backend.setHighlight(userId, bookCode, chapter, verse, color);
  }
}

// ----------------------------------------------------------- Daily devotion
export async function markDevotionRead(userId, dateStr) {
  const state = await loadState(userId);
  const xpEarned = await awardXpIfUnderCap(
    userId, 'devotion_read', dateStr, state.xp.todayByAction
  );
  return { xpEarned };
}

// ------------------------------------------------------------------ Quizzes
export async function answerQuiz(userId, quiz, chosenIndex) {
  const isCorrect = chosenIndex === quiz.correct_index;
  await backend.recordQuizAttempt(userId, String(quiz.id), chosenIndex, isCorrect);
  const result = { isCorrect, xpEarned: 0, newBadges: [] };
  if (isCorrect) {
    const state = await loadState(userId);
    result.xpEarned = await awardXpIfUnderCap(
      userId, 'quiz_correct', String(quiz.id), state.xp.todayByAction
    );
    result.newBadges = await checkBadges(userId, state);
  }
  return result;
}
