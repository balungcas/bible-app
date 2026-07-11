import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatDateLong, todayLocal } from '../lib/dates.js';
import { BADGES } from '../lib/gamification.js';

export default function JournalPage({ goToToday }) {
  const { state } = useApp();
  const [selected, setSelected] = useState(null);

  const earned = new Set(state.badges);

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-3 text-sm text-indigo-600">
          ← All entries
        </button>
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-400">{formatDateLong(selected.entry_date)}</p>
          <h2 className="mt-1 text-xl font-bold text-stone-900">{selected.scripture_ref}</h2>
          {selected.scripture_text && (
            <blockquote className="mt-3 whitespace-pre-line rounded-lg bg-indigo-50 p-3 font-serif text-[15px] leading-relaxed text-indigo-950">
              {selected.scripture_text}
            </blockquote>
          )}
          <Section title="Observation" text={selected.observation} />
          <Section title="Application" text={selected.application} />
          <Section title="Kneel" text={selected.kneel} />
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Badges */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400">Badges</h2>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((b) => (
            <div
              key={b.code}
              title={`${b.name} — ${b.description}`}
              className={`flex flex-col items-center rounded-xl border p-2 text-center ${
                earned.has(b.code)
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-stone-200 bg-white opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="mt-1 text-[10px] font-medium leading-tight text-stone-600">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Entries */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400">
          SOAK Journal · {state.entries.length}{' '}
          {state.entries.length === 1 ? 'entry' : 'entries'}
        </h2>
        {state.entries.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
            <p className="text-stone-500">No entries yet.</p>
            <button
              onClick={goToToday}
              className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
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
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-left hover:border-indigo-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">{e.scripture_ref}</span>
                    <span className="text-xs text-stone-400">
                      {e.entry_date === todayLocal() ? 'Today' : e.entry_date}
                    </span>
                  </div>
                  {e.observation && (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">{e.observation}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-stone-400">
        🔒 Your journal is visible only to you — never to leaders, admins, or the leaderboard.
      </p>
    </div>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <div className="mt-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">{title}</h3>
      <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-stone-700">{text}</p>
    </div>
  );
}
