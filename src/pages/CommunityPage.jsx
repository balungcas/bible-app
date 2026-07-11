import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { backend } from '../lib/backend/index.js';
import { levelForXp } from '../lib/gamification.js';

// Church leaderboard — always scoped to the user's own church, never global.
// Exposes only name / level / streak / XP. Never journal content.
export default function CommunityPage() {
  const { user, state } = useApp();
  const [tab, setTab] = useState('consistency');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const church = state.profile?.church;

  useEffect(() => {
    if (!state.profile?.church_id) return;
    backend
      .getLeaderboard(state.profile.church_id)
      .then(setRows)
      .catch((e) => setError(e.message || String(e)));
  }, [state.profile?.church_id]);

  if (!state.profile?.church_id) {
    return (
      <p className="py-10 text-center text-sm text-stone-500">
        Join a church on your profile to see your church's leaderboard.
      </p>
    );
  }

  const sorted = rows
    ? [...rows].sort((a, b) =>
        tab === 'consistency'
          ? b.current_streak - a.current_streak || b.month_xp - a.month_xp
          : b.month_xp - a.month_xp || b.current_streak - a.current_streak
      )
    : null;

  const monthName = new Date().toLocaleDateString(undefined, { month: 'long' });

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900">{church?.name || 'Your church'}</h2>
      {church?.region && <p className="text-sm text-stone-500">{church.region}</p>}

      <div className="mt-4 flex rounded-lg bg-stone-200 p-1 text-sm font-medium">
        <button
          onClick={() => setTab('consistency')}
          className={`flex-1 rounded-md py-1.5 ${tab === 'consistency' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
        >
          🔥 Consistency
        </button>
        <button
          onClick={() => setTab('points')}
          className={`flex-1 rounded-md py-1.5 ${tab === 'points' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
        >
          ⭐ Points · {monthName}
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        {tab === 'consistency'
          ? 'Ranked by current SOAK streak — showing up daily is what counts.'
          : `Ranked by XP earned in ${monthName}. The points board resets monthly so everyone gets a fresh start.`}
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!sorted ? (
        <p className="py-10 text-center text-stone-400">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {sorted.map((row, i) => {
            const level = levelForXp(Number(row.total_xp));
            const me = row.id === user.id;
            return (
              <li
                key={row.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  me ? 'border-indigo-300 bg-indigo-50' : 'border-stone-200 bg-white'
                }`}
              >
                <span className="w-7 text-center text-sm font-bold text-stone-400">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-800">
                    {row.name}
                    {me && <span className="ml-1 text-xs font-normal text-indigo-500">(you)</span>}
                  </p>
                  <p className="text-xs text-stone-400">{level.name}</p>
                </div>
                <div className="text-right text-sm font-semibold text-stone-700">
                  {tab === 'consistency' ? (
                    <>🔥 {row.current_streak}</>
                  ) : (
                    <>{Number(row.month_xp).toLocaleString()} XP</>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
