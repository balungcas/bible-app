// Supabase data layer — mirrors the web app's src/lib/backend/supabase.js so
// both clients share the same accounts, progress, and leaderboard.
// All per-user tables are protected by RLS (see supabase/migrations/).

import 'package:supabase_flutter/supabase_flutter.dart';

import '../config.dart' as config;

class Backend {
  final SupabaseClient _c;
  Backend(this._c);

  String? get currentUserId => _c.auth.currentUser?.id;

  // Name-only login. The account is derived from the name itself (synthetic
  // email + deterministic password), so typing the same name always resumes
  // the same profile — on any device — instead of minting a new one.
  Future<String> signIn({required String name}) async {
    final slug = name
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    if (slug.isEmpty) throw Exception('Please enter a valid name.');
    final email = '$slug@members.rtcm-tunasan.app';
    final password = 'rtcm-tunasan::$slug::soak-v1';

    // Existing account for this name? Resume it.
    try {
      final res = await _c.auth.signInWithPassword(email: email, password: password);
      return res.user!.id;
    } on AuthException {
      // No account yet — fall through and create one.
    }

    final res = await _c.auth.signUp(
      email: email,
      password: password,
      data: {'name': name, 'church_id': config.churchId},
    );
    if (res.session == null || res.user == null) {
      throw Exception(
        'Could not start a session. In Supabase, turn OFF "Confirm email" under Authentication → Sign In / Providers → Email.',
      );
    }
    try {
      await _c.from('profiles').insert({
        'id': res.user!.id,
        'name': name,
        'church_id': config.churchId,
      });
    } on PostgrestException catch (e) {
      if (e.code != '23505') rethrow; // duplicate profile is fine
    }
    return res.user!.id;
  }

  Future<void> signOut() => _c.auth.signOut();

  Future<Map<String, dynamic>?> getProfile(String userId) async {
    final data = await _c
        .from('profiles')
        .select('id, name, church_id, churches ( id, name, region )')
        .eq('id', userId)
        .maybeSingle();
    if (data != null) return data;
    // First session after signup on another device — create from auth metadata.
    final meta = _c.auth.currentUser?.userMetadata;
    if (_c.auth.currentUser?.id != userId || meta?['name'] == null) return null;
    await _c.from('profiles').insert({
      'id': userId,
      'name': meta!['name'],
      'church_id': meta['church_id'],
    });
    return getProfile(userId);
  }

  Future<List<Map<String, dynamic>>> getEntries(String userId) async {
    final data = await _c
        .from('soak_entries')
        .select()
        .eq('user_id', userId)
        .order('entry_date', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  /// Returns (entry, created) — created is false when today's entry was edited.
  Future<(Map<String, dynamic>, bool)> upsertEntry(Map<String, dynamic> entry) async {
    final existing = await _c
        .from('soak_entries')
        .select('id')
        .eq('user_id', entry['user_id'])
        .eq('entry_date', entry['entry_date'])
        .maybeSingle();
    final data = await _c
        .from('soak_entries')
        .upsert(
          {...entry, 'updated_at': DateTime.now().toUtc().toIso8601String()},
          onConflict: 'user_id,entry_date',
        )
        .select()
        .single();
    return (data, existing == null);
  }

  Future<Map<String, dynamic>?> getStreak(String userId) =>
      _c.from('streaks').select().eq('user_id', userId).maybeSingle();

  Future<void> upsertStreak(String userId, Map<String, dynamic> streak) =>
      _c.from('streaks').upsert({'user_id': userId, ...streak});

  Future<void> logXp(String userId, String actionType, int points, String? refId) =>
      _c.from('xp_log').insert({
        'user_id': userId,
        'action_type': actionType,
        'points': points,
        'ref_id': refId,
      });

  Future<List<Map<String, dynamic>>> getXpLog(String userId) async {
    final data = await _c
        .from('xp_log')
        .select('action_type, points, created_at')
        .eq('user_id', userId);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<List<Map<String, dynamic>>> getReadingProgress(String userId) async {
    final data = await _c
        .from('reading_progress')
        .select('version, book_code, chapter, read_at')
        .eq('user_id', userId);
    return List<Map<String, dynamic>>.from(data);
  }

  /// Primary key (user_id, book_code, chapter) enforces once-per-chapter-ever.
  Future<bool> addReadingProgress(
      String userId, String version, String bookCode, int chapter) async {
    try {
      await _c.from('reading_progress').insert({
        'user_id': userId,
        'version': version,
        'book_code': bookCode,
        'chapter': chapter,
      });
      return true;
    } on PostgrestException catch (e) {
      if (e.code == '23505') return false; // duplicate — already read
      rethrow;
    }
  }

  Future<List<String>> getUserBadges(String userId) async {
    final data =
        await _c.from('user_badges').select('badge_code').eq('user_id', userId);
    return [for (final row in data) row['badge_code'] as String];
  }

  Future<void> awardBadges(String userId, List<String> codes) async {
    if (codes.isEmpty) return;
    await _c.from('user_badges').upsert(
        [for (final code in codes) {'user_id': userId, 'badge_code': code}]);
  }

  Future<List<Map<String, dynamic>>> getQuizAttempts(String userId,
      {int limit = 50}) async {
    final data = await _c
        .from('quiz_attempts')
        .select('quiz_id, is_correct, created_at')
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .limit(limit);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> recordQuizAttempt(
          String userId, String quizId, int chosenIndex, bool isCorrect) =>
      _c.from('quiz_attempts').insert({
        'user_id': userId,
        'quiz_id': quizId,
        'chosen_index': chosenIndex,
        'is_correct': isCorrect,
      });

  Future<Map<String, dynamic>?> getDevotion(String dateStr) => _c
      .from('devotions')
      .select()
      .eq('publish_date', dateStr)
      .maybeSingle();

  /// Rotates 3 questions per day through the whole quiz pool.
  Future<List<Map<String, dynamic>>> getDailyQuizzes(String dateStr) async {
    final data = List<Map<String, dynamic>>.from(await _c.from('quizzes').select());
    if (data.isEmpty) return [];
    final p = dateStr.split('-').map(int.parse).toList();
    final dayIndex =
        DateTime.utc(p[0], p[1], p[2]).millisecondsSinceEpoch ~/ 86400000;
    return [for (var i = 0; i < 3; i++) data[(dayIndex * 3 + i) % data.length]];
  }

  Future<List<Map<String, dynamic>>> getLeaderboard(String churchId) async {
    final data = await _c
        .rpc('church_leaderboard_for', params: {'target_church': churchId});
    return List<Map<String, dynamic>>.from(data);
  }

  Future<List<Map<String, dynamic>>> getHighlights(String userId) async {
    final data = await _c
        .from('verse_highlights')
        .select('book_code, chapter, verse, color')
        .eq('user_id', userId);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> setHighlight(
          String userId, String bookCode, int chapter, int verse, String color) =>
      _c.from('verse_highlights').upsert({
        'user_id': userId,
        'book_code': bookCode,
        'chapter': chapter,
        'verse': verse,
        'color': color,
      });

  Future<void> removeHighlight(
          String userId, String bookCode, int chapter, int verse) =>
      _c
          .from('verse_highlights')
          .delete()
          .eq('user_id', userId)
          .eq('book_code', bookCode)
          .eq('chapter', chapter)
          .eq('verse', verse);

  /// Verse text straight from Supabase (populated by `npm run import:bible`).
  Future<List<Map<String, dynamic>>> getChapter(
      String version, String bookCode, int chapter) async {
    final data = await _c
        .from('verses')
        .select('verse, text')
        .eq('version', version)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .order('verse');
    return List<Map<String, dynamic>>.from(data);
  }
}
