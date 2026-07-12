import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { backend } from '../lib/backend/index.js';
import { todayLocal, formatDateLong } from '../lib/dates.js';
import { markDevotionRead, answerQuiz } from '../lib/game.js';
import { effectiveStreak } from '../lib/gamification.js';
import SoakForm from '../components/SoakForm.jsx';

export default function TodayPage({ goToJournal }) {
  const { user, state, refresh, celebrate } = useApp();
  const [devotion, setDevotion] = useState(null);
  const [devotionOpen, setDevotionOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const today = todayLocal();
  const todayEntry = state.entries.find((e) => e.entry_date === today);
  const streakNow = effectiveStreak(state.streak, today);
  const devotionReadToday = (state.xp.todayByAction.devotion_read || 0) > 0;

  useEffect(() => {
    backend.getDevotion(today).then(setDevotion).catch(console.error);
    backend.getDailyQuizzes(today).then(setQuizzes).catch(console.error);
  }, [today]);

  async function handleDevotionRead() {
    setDevotionOpen(true);
    if (!devotionReadToday) {
      const result = await markDevotionRead(user.id, today);
      celebrate(result);
      await refresh();
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">{formatDateLong(today)}</p>

      {/* SOAK status — persistent card, soft gate (never a hard lock) */}
      {todayEntry && !showForm ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                Today's SOAK is done
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {todayEntry.scripture_ref} · streak {streakNow.current} 🔥
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300"
            >
              Edit entry
            </button>
            <button
              onClick={goToJournal}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300"
            >
              View journal
            </button>
          </div>
        </div>
      ) : !showForm ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Your SOAK for today isn't done yet.
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            {streakNow.current > 0
              ? `Keep your ${streakNow.current}-day streak going — it only advances when today's SOAK is complete.`
              : 'Start your streak today. A few quiet minutes in the Word is all it takes.'}
          </p>
          {state.streak?.freezes_available > 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              ❄️ {state.streak.freezes_available} streak freeze
              {state.streak.freezes_available > 1 ? 's' : ''} available if you ever miss a day.
            </p>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 w-full rounded-xl bg-indigo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-[0.99]"
          >
            Start today's SOAK
          </button>
        </div>
      ) : null}

      {showForm && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-stone-800 dark:text-stone-100">
              {todayEntry ? "Edit today's SOAK" : "Today's SOAK"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-stone-400 dark:text-stone-500"
            >
              Close
            </button>
          </div>
          <SoakForm
            existing={todayEntry}
            initialRef={devotion?.ref}
            onSaved={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Daily devotion */}
      {devotion && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Daily Devotion
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">
            {devotion.title}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">{devotion.scripture_ref}</p>
          {devotionOpen ? (
            <>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                {devotion.body.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {devotion.author && (
                <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">— {devotion.author}</p>
              )}
            </>
          ) : (
            <button
              onClick={handleDevotionRead}
              className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              Read devotion {devotionReadToday ? '' : '· +15 XP'}
            </button>
          )}
        </div>
      )}

      {/* Daily quizzes */}
      {quizzes.length > 0 && <DailyQuizzes quizzes={quizzes} />}
    </div>
  );
}

// Deterministic per-quiz shuffle so the correct answer isn't always in the
// same slot, but everyone sees the same order on the same day.
function shuffledOrder(n, seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function DailyQuizzes({ quizzes }) {
  const { user, refresh, celebrate, state } = useApp();
  const storageKey = `rtcm-bible.quiz.${user.id}.${todayLocal()}`;
  const [answers, setAnswers] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  });

  const quizXpLeft = Math.max(0, 3 - (state.xp.todayByAction.quiz_correct || 0));

  async function choose(quiz, index) {
    if (answers[quiz.id] !== undefined) return;
    const next = { ...answers, [quiz.id]: index };
    setAnswers(next);
    sessionStorage.setItem(storageKey, JSON.stringify(next));
    const result = await answerQuiz(user.id, quiz, index);
    celebrate(result);
    await refresh();
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          Daily Quiz
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {quizXpLeft > 0 ? `+5 XP each · ${quizXpLeft} left today` : 'Daily quiz XP earned ✓'}
        </p>
      </div>
      <div className="mt-3 space-y-4">
        {quizzes.map((q, qi) => {
          const chosen = answers[q.id];
          const answered = chosen !== undefined;
          const choices = Array.isArray(q.choices) ? q.choices : JSON.parse(q.choices);
          const order = shuffledOrder(choices.length, `${q.id}.${todayLocal()}`);
          return (
            <div key={q.id}>
              <p className="mb-2 text-sm font-medium text-stone-800 dark:text-stone-200">
                {qi + 1}. {q.question}
              </p>
              <div className="grid gap-1.5">
                {order.map((i) => {
                  let cls =
                    'border-stone-200 bg-white hover:border-indigo-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-indigo-500';
                  if (answered && i === q.correct_index)
                    cls =
                      'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200';
                  else if (answered && i === chosen)
                    cls =
                      'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/50 dark:text-red-200';
                  else if (answered)
                    cls =
                      'border-stone-100 bg-stone-50 text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600';
                  return (
                    <button
                      key={i}
                      disabled={answered}
                      onClick={() => choose(q, i)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
                    >
                      {choices[i]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
