// Game service — orchestrates backend writes with the pure rules in
// core/gamification.dart. Direct port of the web app's src/lib/game.js.
// All daily caps are computed against the user's LOCAL calendar date.

import '../core/dates.dart';
import '../core/gamification.dart';
import 'backend.dart';

class XpSummary {
  final int total;
  final int month;
  final Map<String, int> todayByAction;
  const XpSummary(this.total, this.month, this.todayByAction);
}

class AppState {
  final Map<String, dynamic>? profile;
  final List<Map<String, dynamic>> entries;
  final StreakRow? streak;
  final XpSummary xp;
  final List<Map<String, dynamic>> progress;
  final List<String> badges;
  final int quizRun;
  final Map<String, String> highlights; // 'CODE/chapter/verse' -> color
  const AppState({
    required this.profile,
    required this.entries,
    required this.streak,
    required this.xp,
    required this.progress,
    required this.badges,
    required this.quizRun,
    required this.highlights,
  });
}

class ActionResult {
  final int xpEarned;
  final List<String> newBadges;
  final int usedFreezes;
  final bool firstTime;
  final bool isCorrect;
  const ActionResult({
    this.xpEarned = 0,
    this.newBadges = const [],
    this.usedFreezes = 0,
    this.firstTime = false,
    this.isCorrect = false,
  });
}

class GameService {
  final Backend backend;
  GameService(this.backend);

  XpSummary _xpSummary(List<Map<String, dynamic>> xpLog) {
    final today = todayLocal();
    final monthStart = monthStartLocal();
    var total = 0;
    var month = 0;
    final todayByAction = <String, int>{};
    for (final row in xpLog) {
      final points = row['points'] as int;
      total += points;
      final localDay =
          localDateString(DateTime.parse(row['created_at'] as String).toLocal());
      if (localDay.compareTo(monthStart) >= 0) month += points;
      if (localDay == today) {
        final action = row['action_type'] as String;
        todayByAction[action] = (todayByAction[action] ?? 0) + 1;
      }
    }
    return XpSummary(total, month, todayByAction);
  }

  Future<int> _awardXpIfUnderCap(String userId, String actionType, String? refId,
      Map<String, int> todayByAction) async {
    final rule = xpRules[actionType]!;
    if ((todayByAction[actionType] ?? 0) >= rule.dailyCap) return 0;
    await backend.logXp(userId, actionType, rule.points, refId);
    return rule.points;
  }

  int _quizCorrectRun(List<Map<String, dynamic>> attempts) {
    var run = 0;
    for (final a in attempts) {
      if (a['is_correct'] == true) {
        run += 1;
      } else {
        break;
      }
    }
    return run;
  }

  Future<AppState> loadState(String userId) async {
    final results = await Future.wait([
      backend.getProfile(userId),
      backend.getEntries(userId),
      backend.getStreak(userId),
      backend.getXpLog(userId),
      backend.getReadingProgress(userId),
      backend.getUserBadges(userId),
      backend.getQuizAttempts(userId),
      backend.getHighlights(userId),
    ]);
    final streakMap = results[2] as Map<String, dynamic>?;
    // Keyed 'CODE/chapter/verse' -> color for O(1) reader lookup.
    final highlights = <String, String>{};
    for (final h in results[7] as List<Map<String, dynamic>>) {
      highlights['${h['book_code']}/${h['chapter']}/${h['verse']}'] =
          h['color'] as String;
    }
    return AppState(
      profile: results[0] as Map<String, dynamic>?,
      entries: results[1] as List<Map<String, dynamic>>,
      streak: streakMap == null ? null : StreakRow.fromMap(streakMap),
      xp: _xpSummary(results[3] as List<Map<String, dynamic>>),
      progress: results[4] as List<Map<String, dynamic>>,
      badges: results[5] as List<String>,
      quizRun: _quizCorrectRun(results[6] as List<Map<String, dynamic>>),
      highlights: highlights,
    );
  }

  Future<List<String>> _checkBadges(String userId, AppState state,
      {StreakRow? streakOverride}) async {
    final streak = streakOverride ?? state.streak;
    final stats = BadgeStats(
      soakCount: state.entries.length,
      currentStreak: streak?.currentStreak ?? 0,
      johnChaptersRead: state.progress
          .where((p) => p['book_code'] == 'JHN')
          .map((p) => p['chapter'])
          .toSet()
          .length,
      quizCorrectRun: state.quizRun,
      earlySoakCount: state.entries.where((e) {
        final h = DateTime.parse(e['created_at'] as String).toLocal().hour;
        return h < 7;
      }).length,
    );
    final newBadges = earnedBadges(stats, state.badges);
    if (newBadges.isNotEmpty) await backend.awardBadges(userId, newBadges);
    return newBadges;
  }

  // ------------------------------------------------------------- Daily SOAK
  Future<ActionResult> completeSoak(
      String userId, Map<String, dynamic> fields) async {
    final entryDate = todayLocal();
    final (_, created) = await backend.upsertEntry({
      'user_id': userId,
      'entry_date': entryDate,
      ...fields,
    });

    var usedFreezes = 0;

    // Streak + XP advance only on the day's FIRST completion; edits are free.
    final prevMap = await backend.getStreak(userId);
    final prev = prevMap == null ? null : StreakRow.fromMap(prevMap);
    final adv = advanceStreak(prev, entryDate);
    if (adv.changed) {
      await backend.upsertStreak(userId, adv.streak.toMap());
      usedFreezes = adv.usedFreezes;
    }

    final state = await loadState(userId);
    var xpEarned = 0;
    if (created) {
      xpEarned = await _awardXpIfUnderCap(
          userId, 'soak_completed', entryDate, state.xp.todayByAction);
    }
    final newBadges =
        await _checkBadges(userId, state, streakOverride: adv.streak);
    return ActionResult(
        xpEarned: xpEarned, newBadges: newBadges, usedFreezes: usedFreezes);
  }

  // --------------------------------------------------------- Chapter reading
  Future<ActionResult> markChapterRead(
      String userId, String version, String bookCode, int chapter) async {
    final inserted =
        await backend.addReadingProgress(userId, version, bookCode, chapter);
    if (!inserted) return const ActionResult(firstTime: false);

    final state = await loadState(userId);
    final xpEarned = await _awardXpIfUnderCap(
        userId, 'chapter_read', '$bookCode $chapter', state.xp.todayByAction);
    final newBadges = await _checkBadges(userId, state);
    return ActionResult(xpEarned: xpEarned, newBadges: newBadges, firstTime: true);
  }

  // ----------------------------------------------------------- Daily devotion
  Future<ActionResult> markDevotionRead(String userId, String dateStr) async {
    final state = await loadState(userId);
    final xpEarned = await _awardXpIfUnderCap(
        userId, 'devotion_read', dateStr, state.xp.todayByAction);
    return ActionResult(xpEarned: xpEarned);
  }

  // --------------------------------------------------------- Verse highlights
  /// color == null removes the highlight; otherwise sets/replaces it.
  Future<void> toggleHighlight(
      String userId, String bookCode, int chapter, int verse, String? color) async {
    if (color == null) {
      await backend.removeHighlight(userId, bookCode, chapter, verse);
    } else {
      await backend.setHighlight(userId, bookCode, chapter, verse, color);
    }
  }

  // ------------------------------------------------------------------ Quizzes
  Future<ActionResult> answerQuiz(
      String userId, Map<String, dynamic> quiz, int chosenIndex) async {
    final isCorrect = chosenIndex == quiz['correct_index'];
    await backend.recordQuizAttempt(
        userId, quiz['id'].toString(), chosenIndex, isCorrect);
    if (!isCorrect) return const ActionResult(isCorrect: false);

    final state = await loadState(userId);
    final xpEarned = await _awardXpIfUnderCap(
        userId, 'quiz_correct', quiz['id'].toString(), state.xp.todayByAction);
    final newBadges = await _checkBadges(userId, state);
    return ActionResult(
        isCorrect: true, xpEarned: xpEarned, newBadges: newBadges);
  }
}
