import { useState } from 'react';
import { useApp } from './context/AppContext.jsx';
import { levelForXp, effectiveStreak } from './lib/gamification.js';
import { todayLocal } from './lib/dates.js';
import AuthPage from './pages/AuthPage.jsx';
import ReadPage from './pages/ReadPage.jsx';
import TodayPage from './pages/TodayPage.jsx';
import JournalPage from './pages/JournalPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';

const TABS = [
  { id: 'read', label: 'Read', icon: '📖' },
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'journal', label: 'Journal', icon: '✍️' },
  { id: 'community', label: 'Community', icon: '⛪' },
];

export default function App() {
  const { user, state, booting, toasts, signOut, backend } = useApp();
  const [tab, setTab] = useState('today');

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-stone-400">Loading…</div>
      </div>
    );
  }

  if (!user || !state?.profile) {
    return <AuthPage />;
  }

  const level = levelForXp(state.xp.total);
  const streakNow = effectiveStreak(state.streak, todayLocal());

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-indigo-900">RTCM Bible</h1>
            <p className="text-xs text-stone-500">Scripture · Observation · Application · Kneel</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
                streakNow.current > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-stone-100 text-stone-500'
              }`}
              title={`Freezes available: ${state.streak?.freezes_available ?? 2}`}
            >
              🔥 {streakNow.current}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-indigo-800">{level.name}</div>
              <div className="text-xs text-stone-500">{state.xp.total.toLocaleString()} XP</div>
            </div>
            <button
              onClick={signOut}
              className="rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
        {/* Level progress */}
        <div className="h-1 w-full bg-stone-200">
          <div
            className="h-1 bg-indigo-600 transition-all"
            style={{ width: `${Math.round(level.progress * 100)}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {tab === 'read' && <ReadPage />}
        {tab === 'today' && <TodayPage goToJournal={() => setTab('journal')} />}
        {tab === 'journal' && <JournalPage goToToday={() => setTab('today')} />}
        {tab === 'community' && <CommunityPage />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                tab === t.id ? 'text-indigo-700' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
              t.kind === 'badge'
                ? 'bg-amber-500'
                : t.kind === 'freeze'
                  ? 'bg-sky-500'
                  : 'bg-indigo-600'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {backend.mode === 'local' && (
        <div className="fixed bottom-14 left-2 z-10 rounded bg-stone-800/80 px-2 py-0.5 text-[10px] text-white">
          demo mode — data stays in this browser
        </div>
      )}
    </div>
  );
}
