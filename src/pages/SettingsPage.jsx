import { useApp } from '../context/AppContext.jsx';

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'system', label: 'System', icon: '💻' },
];

export default function SettingsPage() {
  const { theme, setTheme, signOut, state } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Settings</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Signed in as {state?.profile?.name}
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Appearance
        </h3>
        <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">
          Choose how RTCM Bible looks on this device.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-medium transition ${
                theme === t.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-indigo-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          About
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-300">RTCM Bible</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">Church: RTCM-Tunasan</p>
        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
          Scripture · Observation · Application · Kneel
        </p>
      </section>

      <button
        onClick={signOut}
        className="w-full rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-red-950/40"
      >
        Sign out
      </button>
    </div>
  );
}
