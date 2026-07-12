// Local demo backend — runs the whole app out of localStorage so it can be
// tried without a Supabase project. Same interface as backend/supabase.js.

import { devotionForDate, quizzesForDate, SAMPLE_CHURCHES } from '../../data/content.js';

const KEY = 'rtcm-bible.local.v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function db() {
  const d = load();
  d.users ??= {};        // id -> { id, name, church_id }
  d.churches ??= [...SAMPLE_CHURCHES];
  d.entries ??= [];      // soak entries
  d.xp ??= [];           // xp log rows
  d.streaks ??= {};      // user_id -> streak row
  d.progress ??= [];     // reading progress rows
  d.badges ??= [];       // { user_id, badge_code, earned_at }
  d.attempts ??= [];     // quiz attempts
  d.session ??= null;    // user_id
  return d;
}

const uid = () => crypto.randomUUID();

export function createLocalBackend() {
  return {
    mode: 'local',

    async getSession() {
      const d = db();
      if (!d.session) return null;
      const user = d.users[d.session];
      return user ? { id: user.id, email: null } : null;
    },

    // Name + church only — mirrors the anonymous-auth flow of the Supabase
    // backend. The session persists in this browser's localStorage.
    async signUp({ name, churchId }) {
      const d = db();
      const user = { id: uid(), name, church_id: churchId };
      d.users[user.id] = user;
      d.session = user.id;
      save(d);
      return { id: user.id, email: null };
    },

    async signOut() {
      const d = db();
      d.session = null;
      save(d);
    },

    async listChurches() {
      return db().churches.filter((c) => c.approved).sort((a, b) => a.name.localeCompare(b.name));
    },

    async submitChurch(name, region) {
      const d = db();
      const church = { id: uid(), name, region: region || null, approved: false };
      d.churches.push(church);
      save(d);
      return church;
    },

    async getProfile(userId) {
      const d = db();
      const user = Object.values(d.users).find((u) => u.id === userId);
      if (!user) return null;
      const church = d.churches.find((c) => c.id === user.church_id) || null;
      return { id: user.id, name: user.name, church_id: user.church_id, church };
    },

    async getEntries(userId) {
      return db()
        .entries.filter((e) => e.user_id === userId)
        .sort((a, b) => b.entry_date.localeCompare(a.entry_date));
    },

    async upsertEntry(entry) {
      const d = db();
      const i = d.entries.findIndex(
        (e) => e.user_id === entry.user_id && e.entry_date === entry.entry_date
      );
      const now = new Date().toISOString();
      if (i >= 0) {
        d.entries[i] = { ...d.entries[i], ...entry, updated_at: now };
        save(d);
        return { entry: d.entries[i], created: false };
      }
      const row = { id: uid(), created_at: now, updated_at: now, ...entry };
      d.entries.push(row);
      save(d);
      return { entry: row, created: true };
    },

    async getStreak(userId) {
      return db().streaks[userId] || null;
    },

    async upsertStreak(userId, streak) {
      const d = db();
      d.streaks[userId] = { user_id: userId, ...streak };
      save(d);
    },

    async logXp(userId, actionType, points, refId) {
      const d = db();
      d.xp.push({
        id: uid(),
        user_id: userId,
        action_type: actionType,
        points,
        ref_id: refId || null,
        created_at: new Date().toISOString(),
      });
      save(d);
    },

    async getXpLog(userId) {
      return db().xp.filter((x) => x.user_id === userId);
    },

    async getReadingProgress(userId) {
      return db().progress.filter((p) => p.user_id === userId);
    },

    async addReadingProgress(userId, version, bookCode, chapter) {
      const d = db();
      const exists = d.progress.some(
        (p) => p.user_id === userId && p.book_code === bookCode && p.chapter === chapter
      );
      if (exists) return { inserted: false };
      d.progress.push({
        user_id: userId,
        version,
        book_code: bookCode,
        chapter,
        read_at: new Date().toISOString(),
      });
      save(d);
      return { inserted: true };
    },

    async getUserBadges(userId) {
      return db().badges.filter((b) => b.user_id === userId);
    },

    async awardBadges(userId, codes) {
      const d = db();
      const now = new Date().toISOString();
      for (const code of codes) {
        if (!d.badges.some((b) => b.user_id === userId && b.badge_code === code)) {
          d.badges.push({ user_id: userId, badge_code: code, earned_at: now });
        }
      }
      save(d);
    },

    async getQuizAttempts(userId, limit = 50) {
      return db()
        .attempts.filter((a) => a.user_id === userId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit);
    },

    async recordQuizAttempt(userId, quizId, chosenIndex, isCorrect) {
      const d = db();
      d.attempts.push({
        id: uid(),
        user_id: userId,
        quiz_id: quizId,
        chosen_index: chosenIndex,
        is_correct: isCorrect,
        created_at: new Date().toISOString(),
      });
      save(d);
    },

    async getDevotion(dateStr) {
      return devotionForDate(dateStr);
    },

    async getDailyQuizzes(dateStr) {
      return quizzesForDate(dateStr);
    },

    // Local mode has a single user, so the "leaderboard" is just you — enough
    // to exercise the UI.
    async getLeaderboard(churchId) {
      const d = db();
      const members = Object.values(d.users).filter((u) => u.church_id === churchId);
      return members.map((u) => {
        const xp = d.xp.filter((x) => x.user_id === u.id);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return {
          id: u.id,
          name: u.name,
          current_streak: d.streaks[u.id]?.current_streak ?? 0,
          total_xp: xp.reduce((s, x) => s + x.points, 0),
          month_xp: xp
            .filter((x) => new Date(x.created_at) >= monthStart)
            .reduce((s, x) => s + x.points, 0),
        };
      });
    },
  };
}
