import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { backend } from '../lib/backend/index.js';

export default function AuthPage() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [churches, setChurches] = useState([]);
  const [churchId, setChurchId] = useState('');
  const [churchSearch, setChurchSearch] = useState('');
  const [notListed, setNotListed] = useState(false);
  const [newChurchName, setNewChurchName] = useState('');
  const [newChurchRegion, setNewChurchRegion] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    backend.listChurches().then(setChurches).catch(() => {});
  }, []);

  const filtered = churchSearch
    ? churches.filter((c) =>
        `${c.name} ${c.region || ''}`.toLowerCase().includes(churchSearch.toLowerCase())
      )
    : churches;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn({ email, password });
      } else {
        let cid = churchId;
        if (notListed) {
          if (!newChurchName.trim()) throw new Error('Please enter your church name.');
          // Creates an unapproved row for admin review — keeps the church list
          // canonical so the leaderboard never fragments on name variants.
          const church = await backend.submitChurch(newChurchName.trim(), newChurchRegion.trim());
          cid = church.id;
        }
        if (!cid) throw new Error('Please select your church.');
        if (!name.trim()) throw new Error('Please enter your name.');
        await signUp({ email, password, name: name.trim(), churchId: cid });
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl">📖</div>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900">RTCM Bible</h1>
        <p className="mt-2 text-sm text-stone-500">
          Daily Scripture · Observation · Application · Kneel
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex rounded-lg bg-stone-100 p-1 text-sm font-medium">
          <button
            className={`flex-1 rounded-md py-1.5 ${mode === 'signin' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            className={`flex-1 rounded-md py-1.5 ${mode === 'signup' ? 'bg-white shadow-sm' : 'text-stone-500'}`}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Name</span>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan dela Cruz"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {mode === 'signup' && !notListed && (
            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">Church</span>
              <input
                className="mb-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Search churches…"
                value={churchSearch}
                onChange={(e) => setChurchSearch(e.target.value)}
              />
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={churchId}
                onChange={(e) => setChurchId(e.target.value)}
                size={Math.min(5, Math.max(2, filtered.length))}
              >
                {filtered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.region ? ` — ${c.region}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="mt-2 text-xs text-indigo-600 underline"
                onClick={() => setNotListed(true)}
              >
                My church isn't listed
              </button>
            </div>
          )}

          {mode === 'signup' && notListed && (
            <div className="space-y-2 rounded-lg bg-stone-50 p-3">
              <span className="block text-sm font-medium text-stone-700">
                Add your church <span className="font-normal text-stone-400">(for admin review)</span>
              </span>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Church name"
                value={newChurchName}
                onChange={(e) => setNewChurchName(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Region (e.g. NCR)"
                value={newChurchRegion}
                onChange={(e) => setNewChurchRegion(e.target.value)}
              />
              <button
                type="button"
                className="text-xs text-indigo-600 underline"
                onClick={() => setNotListed(false)}
              >
                Back to church list
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      {backend.mode === 'local' && (
        <p className="mt-4 text-center text-xs text-stone-400">
          Running in local demo mode — accounts and entries stay in this browser.
          Configure Supabase in <code>.env</code> for the real backend.
        </p>
      )}
    </div>
  );
}
