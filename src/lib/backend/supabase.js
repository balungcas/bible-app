// Supabase backend — production data layer. Same interface as backend/local.js.
// All per-user tables are protected by RLS (see supabase/migrations/).

import { createClient } from '@supabase/supabase-js';
import { devotionForDate, quizzesForDate } from '../../data/content.js';

export function createSupabaseBackend(url, anonKey) {
  const supabase = createClient(url, anonKey);

  const throwIf = (error) => {
    if (error) throw new Error(error.message);
  };

  return {
    mode: 'supabase',
    supabase,

    async getSession() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      return user ? { id: user.id, email: user.email } : null;
    },

    // Name-only login. The account is derived from the name itself (synthetic
    // email + deterministic password), so typing the same name always resumes
    // the same profile — on any device — instead of minting a new one.
    async signUp({ name, churchId }) {
      const slug = name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!slug) throw new Error('Please enter a valid name.');
      const email = `${slug}@members.rtcm-tunasan.app`;
      const password = `rtcm-tunasan::${slug}::soak-v1`;

      // Existing account for this name? Resume it.
      const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInErr) return { id: signIn.user.id, email: null };

      // First time this name logs in — create the account.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, church_id: churchId } },
      });
      if (error) throw new Error(error.message);
      if (!data.session) {
        throw new Error(
          'Could not start a session. In Supabase, go to Authentication → Sign In / Providers → Email and turn OFF "Confirm email", then try again.'
        );
      }
      const { error: pErr } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, name, church_id: churchId });
      if (pErr && pErr.code !== '23505') throw new Error(pErr.message);
      return { id: data.user.id, email: null };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async listChurches() {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name, region')
        .eq('approved', true)
        .order('name');
      throwIf(error);
      return data;
    },

    async submitChurch(name, region) {
      const { data, error } = await supabase
        .from('churches')
        .insert({ name, region: region || null, approved: false })
        .select()
        .single();
      throwIf(error);
      return data;
    },

    async getProfile(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, church_id, churches ( id, name, region )')
        .eq('id', userId)
        .maybeSingle();
      throwIf(error);
      if (data) {
        return { id: data.id, name: data.name, church_id: data.church_id, church: data.churches };
      }
      // No profile yet — this is the first authenticated session after an
      // email-confirmation signup. Create it from the auth metadata.
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData?.user?.user_metadata;
      if (userData?.user?.id !== userId || !meta?.name) return null;
      const { error: insErr } = await supabase
        .from('profiles')
        .insert({ id: userId, name: meta.name, church_id: meta.church_id || null });
      throwIf(insErr);
      return this.getProfile(userId);
    },

    async getEntries(userId) {
      const { data, error } = await supabase
        .from('soak_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });
      throwIf(error);
      return data;
    },

    async upsertEntry(entry) {
      const { data: existing, error: qErr } = await supabase
        .from('soak_entries')
        .select('id')
        .eq('user_id', entry.user_id)
        .eq('entry_date', entry.entry_date)
        .maybeSingle();
      throwIf(qErr);
      const { data, error } = await supabase
        .from('soak_entries')
        .upsert(
          { ...entry, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,entry_date' }
        )
        .select()
        .single();
      throwIf(error);
      return { entry: data, created: !existing };
    },

    async getStreak(userId) {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      throwIf(error);
      return data;
    },

    async upsertStreak(userId, streak) {
      const { error } = await supabase
        .from('streaks')
        .upsert({ user_id: userId, ...streak });
      throwIf(error);
    },

    async logXp(userId, actionType, points, refId) {
      const { error } = await supabase
        .from('xp_log')
        .insert({ user_id: userId, action_type: actionType, points, ref_id: refId || null });
      throwIf(error);
    },

    async getXpLog(userId) {
      const { data, error } = await supabase
        .from('xp_log')
        .select('action_type, points, created_at')
        .eq('user_id', userId);
      throwIf(error);
      return data;
    },

    async getReadingProgress(userId) {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('version, book_code, chapter, read_at')
        .eq('user_id', userId);
      throwIf(error);
      return data;
    },

    async addReadingProgress(userId, version, bookCode, chapter) {
      // Primary key (user_id, book_code, chapter) enforces once-per-chapter-ever.
      const { error } = await supabase
        .from('reading_progress')
        .insert({ user_id: userId, version, book_code: bookCode, chapter });
      if (error) {
        if (error.code === '23505') return { inserted: false }; // duplicate — already read
        throw new Error(error.message);
      }
      return { inserted: true };
    },

    async getUserBadges(userId) {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_code, earned_at')
        .eq('user_id', userId);
      throwIf(error);
      return data;
    },

    async awardBadges(userId, codes) {
      if (!codes.length) return;
      const { error } = await supabase
        .from('user_badges')
        .upsert(codes.map((code) => ({ user_id: userId, badge_code: code })));
      throwIf(error);
    },

    async getQuizAttempts(userId, limit = 50) {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, is_correct, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      throwIf(error);
      return data;
    },

    async recordQuizAttempt(userId, quizId, chosenIndex, isCorrect) {
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: userId,
        quiz_id: quizId,
        chosen_index: chosenIndex,
        is_correct: isCorrect,
      });
      throwIf(error);
    },

    async getDevotion(dateStr) {
      const { data, error } = await supabase
        .from('devotions')
        .select('*')
        .eq('publish_date', dateStr)
        .maybeSingle();
      throwIf(error);
      // Fall back to the bundled rotation when no devotion is published for
      // the day, so Today never shows an empty card.
      return data || devotionForDate(dateStr);
    },

    async getDailyQuizzes(dateStr) {
      const { data, error } = await supabase.from('quizzes').select('*');
      throwIf(error);
      if (!data?.length) return quizzesForDate(dateStr);
      const [y, m, d] = dateStr.split('-').map(Number);
      const dayIndex = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
      const out = [];
      for (let i = 0; i < 3; i++) out.push(data[(dayIndex * 3 + i) % data.length]);
      return out;
    },

    async getLeaderboard(churchId) {
      const { data, error } = await supabase.rpc('church_leaderboard_for', {
        target_church: churchId,
      });
      throwIf(error);
      return data;
    },

    async getHighlights(userId) {
      const { data, error } = await supabase
        .from('verse_highlights')
        .select('book_code, chapter, verse, color')
        .eq('user_id', userId);
      throwIf(error);
      return data;
    },

    async setHighlight(userId, bookCode, chapter, verse, color) {
      const { error } = await supabase.from('verse_highlights').upsert({
        user_id: userId,
        book_code: bookCode,
        chapter,
        verse,
        color,
      });
      throwIf(error);
    },

    async removeHighlight(userId, bookCode, chapter, verse) {
      const { error } = await supabase
        .from('verse_highlights')
        .delete()
        .eq('user_id', userId)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .eq('verse', verse);
      throwIf(error);
    },
  };
}
