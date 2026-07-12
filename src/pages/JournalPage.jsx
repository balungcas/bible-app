import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatDateLong, todayLocal } from '../lib/dates.js';
import { BADGES } from '../lib/gamification.js';
import { normalizeStyle, paperStyle } from '../lib/journalStyle.js';

export default function JournalPage({ goToToday }) {
  const { state } = useApp();
  const [selected, setSelected] = useState(null);

  const earned = new Set(state.badges);

  if (selected) {
    const style = normalizeStyle(selected.style);
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-3 text-sm text-indigo-600 dark:text-indigo-400"
        >
          ← All entries
        </button>
        <article className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {formatDateLong(selected.entry_date)}
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
            {selected.scripture_ref}
          </h2>
          {selected.scripture_text && (
            <blockquote className="mt-3 whitespace-pre-line rounded-lg bg-indigo-50 p-3 font-serif text-[15px] leading-relaxed text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-100">
              {selected.scripture_text}
            </blockquote>
          )}
          {/* Paper + stickers, rendered read-only exactly as decorated. */}
          <div
            className="relative mt-4 overflow-hidden rounded-xl border border-stone-200 p-3 dark:border-stone-800"
            style={paperStyle(style.paper)}
          >
            <Section title="Observation" text={selected.observation} />
            <Section title="Application" text={selected.application} />
            <Section title="Kneel" text={selected.kneel} />
            <div className="pointer-events-none absolute inset-0">
              {style.stickers.map((s, i) => (
                <span
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
                  style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
                >
                  {s.e}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Badges */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Badges
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((b) => (
            <div
              key={b.code}
              title={`${b.name} — ${b.description}`}
              className={`flex flex-col items-center rounded-xl border p-2 text-center ${
                earned.has(b.code)
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
                  : 'border-stone-200 bg-white opacity-40 grayscale dark:border-stone-800 dark:bg-stone-900'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="mt-1 text-[10px] font-medium leading-tight text-stone-600 dark:text-stone-300">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Entries */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          SOAK Journal · {state.entries.length}{' '}
          {state.entries.length === 1 ? 'entry' : 'entries'}
        </h2>
        {state.entries.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-900">
            <p className="text-stone-500 dark:text-stone-400">No entries yet.</p>
            <button
              onClick={goToToday}
              className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-[0.99]"
            >
              Write your first SOAK
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {state.entries.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSelected(e)}
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-left transition hover:border-indigo-300 active:scale-[0.99] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-indigo-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800 dark:text-stone-100">
                      {e.scripture_ref}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {e.entry_date === todayLocal() ? 'Today' : e.entry_date}
                    </span>
                  </div>
                  {e.observation && (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                      {e.observation}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-stone-400 dark:text-stone-500">
        🔒 Your journal is visible only to you — never to leaders, admins, or the leaderboard.
      </p>
    </div>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <div className="mt-4 first:mt-0">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
        {title}
      </h3>
      <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
        {text}
      </p>
    </div>
  );
}
