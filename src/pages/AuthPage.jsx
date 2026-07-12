import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

// Name only, hardcoded church (RTCM-Tunasan). Anonymous Supabase auth that
// persists in this browser.
export default function AuthPage() {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const RTCM_TUNASAN_ID = 'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!name.trim()) throw new Error('Please enter your name.');
      await signUp({ name: name.trim(), churchId: RTCM_TUNASAN_ID });
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
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-200">
          RTCM Bible
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Daily Scripture · Observation · Application · Kneel
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Your name
            </span>
            <input
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan dela Cruz"
            />
          </label>

          <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              <span className="font-medium">Church:</span> RTCM-Tunasan
            </p>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-[0.99] disabled:opacity-50"
          >
            {busy ? 'Please wait…' : 'Start'}
          </button>

          <p className="text-center text-xs text-stone-400 dark:text-stone-500">
            Enter the same name each time to continue your progress.
          </p>
        </form>
      </div>
    </div>
  );
}
