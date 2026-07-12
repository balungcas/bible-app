// Gamification rules — pure functions, a direct port of the web app's
// src/lib/gamification.js so both clients score identically.
// Design guardrail: gamify consistency, not volume.

import 'dates.dart';

// ---------------------------------------------------------------- XP values
class XpRule {
  final int points;
  final int dailyCap;
  const XpRule(this.points, this.dailyCap);
}

const Map<String, XpRule> xpRules = {
  'soak_completed': XpRule(50, 1), // 1/day
  'chapter_read': XpRule(10, 5), // 5 chapters/day; once per chapter, ever
  'devotion_read': XpRule(15, 1), // 1/day
  'quiz_correct': XpRule(5, 3), // 3 quizzes/day
};

// ------------------------------------------------------------------ Levels
class Level {
  final int level;
  final String name;
  final int minXp;
  const Level(this.level, this.name, this.minXp);
}

const levels = [
  Level(1, 'Seeker', 0),
  Level(2, 'Learner', 500),
  Level(3, 'Disciple', 1500),
  Level(4, 'Steward', 3500),
  Level(5, 'Servant', 7000),
  Level(6, 'Elder', 12000),
];

class LevelInfo {
  final Level current;
  final Level? next;
  final double progress;
  const LevelInfo(this.current, this.next, this.progress);
}

LevelInfo levelForXp(int totalXp) {
  var current = levels.first;
  for (final l in levels) {
    if (totalXp >= l.minXp) current = l;
  }
  Level? next;
  for (final l in levels) {
    if (l.minXp > totalXp) {
      next = l;
      break;
    }
  }
  final progress = next == null
      ? 1.0
      : (totalXp - current.minXp) / (next.minXp - current.minXp);
  return LevelInfo(current, next, progress);
}

// ------------------------------------------------------------------ Streaks
const maxFreezes = 2;
const freezeRegenDays = 14; // +1 freeze per 14 consecutive days

class StreakRow {
  int currentStreak;
  int longestStreak;
  String? lastCompletedDate;
  int freezesAvailable;

  StreakRow({
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.lastCompletedDate,
    this.freezesAvailable = maxFreezes,
  });

  factory StreakRow.fromMap(Map<String, dynamic>? m) => StreakRow(
        currentStreak: (m?['current_streak'] as int?) ?? 0,
        longestStreak: (m?['longest_streak'] as int?) ?? 0,
        lastCompletedDate: m?['last_completed_date'] as String?,
        freezesAvailable: (m?['freezes_available'] as int?) ?? maxFreezes,
      );

  Map<String, dynamic> toMap() => {
        'current_streak': currentStreak,
        'longest_streak': longestStreak,
        'last_completed_date': lastCompletedDate,
        'freezes_available': freezesAvailable,
      };
}

class AdvanceResult {
  final StreakRow streak;
  final bool changed;
  final int usedFreezes;
  final bool broke;
  const AdvanceResult(this.streak, this.changed, this.usedFreezes, this.broke);
}

/// The streak increments ONLY when the daily SOAK is completed. Missing a day
/// consumes a freeze if available; otherwise the streak resets.
AdvanceResult advanceStreak(StreakRow? prev, String entryDate) {
  final s = StreakRow(
    currentStreak: prev?.currentStreak ?? 0,
    longestStreak: prev?.longestStreak ?? 0,
    lastCompletedDate: prev?.lastCompletedDate,
    freezesAvailable: prev?.freezesAvailable ?? maxFreezes,
  );
  if (s.lastCompletedDate == entryDate) return AdvanceResult(s, false, 0, false);

  var usedFreezes = 0;
  var broke = false;

  if (s.lastCompletedDate == null) {
    s.currentStreak = 1;
  } else {
    final gap = daysBetween(s.lastCompletedDate!, entryDate);
    if (gap <= 0) return AdvanceResult(s, false, 0, false);
    final missed = gap - 1;
    if (missed == 0) {
      s.currentStreak += 1;
    } else if (missed <= s.freezesAvailable) {
      usedFreezes = missed;
      s.freezesAvailable -= missed;
      s.currentStreak += 1;
    } else {
      broke = true;
      s.currentStreak = 1;
    }
  }

  // Freezes regenerate slowly: +1 per 14 consecutive days, capped.
  if (s.currentStreak > 0 && s.currentStreak % freezeRegenDays == 0) {
    s.freezesAvailable =
        s.freezesAvailable + 1 > maxFreezes ? maxFreezes : s.freezesAvailable + 1;
  }

  if (s.currentStreak > s.longestStreak) s.longestStreak = s.currentStreak;
  s.lastCompletedDate = entryDate;
  return AdvanceResult(s, true, usedFreezes, broke);
}

class EffectiveStreak {
  final int current;
  final bool atRisk;
  const EffectiveStreak(this.current, this.atRisk);
}

/// What the streak looks like *right now* (before today's SOAK).
EffectiveStreak effectiveStreak(StreakRow? streak, String today) {
  if (streak?.lastCompletedDate == null) return const EffectiveStreak(0, false);
  final gap = daysBetween(streak!.lastCompletedDate!, today);
  if (gap <= 1) return EffectiveStreak(streak.currentStreak, gap == 1);
  final missed = gap - 1;
  if (missed <= streak.freezesAvailable) {
    return EffectiveStreak(streak.currentStreak, true);
  }
  return const EffectiveStreak(0, false);
}

// ------------------------------------------------------------------ Badges
class Badge {
  final String code;
  final String name;
  final String description;
  final String icon;
  const Badge(this.code, this.name, this.description, this.icon);
}

const badges = [
  Badge('FIRST_SOAK', 'First SOAK', 'Completed your very first SOAK entry', '🌱'),
  Badge('SOAK_30', 'Faithful 30', 'Completed 30 SOAK entries', '📖'),
  Badge('STREAK_7', 'One Week', 'Kept a 7-day SOAK streak', '🔥'),
  Badge('STREAK_30', 'One Month', 'Kept a 30-day SOAK streak', '⚡'),
  Badge('STREAK_100', 'Century', 'Kept a 100-day SOAK streak', '🏆'),
  Badge('BOOK_JOHN', 'Beloved Disciple', 'Read every chapter of the Gospel of John', '✝️'),
  Badge('QUIZ_ACE', 'Quiz Ace', 'Answered 10 quiz questions correctly in a row', '🎯'),
  Badge('EARLY_BIRD', 'Early Bird', 'Completed your SOAK before 7am, ten times', '🌅'),
];

final badgeByCode = {for (final b in badges) b.code: b};

class BadgeStats {
  final int soakCount;
  final int currentStreak;
  final int johnChaptersRead;
  final int quizCorrectRun;
  final int earlySoakCount;
  const BadgeStats({
    required this.soakCount,
    required this.currentStreak,
    required this.johnChaptersRead,
    required this.quizCorrectRun,
    required this.earlySoakCount,
  });
}

/// Evaluates which badges are newly earned from a snapshot of the user's stats.
List<String> earnedBadges(BadgeStats stats, List<String> alreadyEarned) {
  final have = alreadyEarned.toSet();
  final earned = <String>[];
  void check(String code, bool cond) {
    if (cond && !have.contains(code)) earned.add(code);
  }

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
