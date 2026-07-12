import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { backend } from '../lib/backend/index.js';
import { loadState } from '../lib/game.js';
import { BADGE_BY_CODE } from '../lib/gamification.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [state, setState] = useState(null); // { profile, entries, streak, xp, progress, badges, quizRun }
  const [booting, setBooting] = useState(true);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, ...toast }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const celebrate = useCallback(
    ({ xpEarned = 0, newBadges = [], usedFreezes = 0 } = {}) => {
      if (xpEarned > 0) pushToast({ kind: 'xp', text: `+${xpEarned} XP` });
      for (const code of newBadges) {
        const b = BADGE_BY_CODE[code];
        if (b) pushToast({ kind: 'badge', text: `${b.icon} Badge earned: ${b.name}` });
      }
      if (usedFreezes > 0) {
        pushToast({ kind: 'freeze', text: `❄️ A streak freeze kept your streak safe` });
      }
    },
    [pushToast]
  );

  const refresh = useCallback(async (u = user) => {
    if (!u) return;
    setState(await loadState(u.id));
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const session = await backend.getSession();
        if (session) {
          setUser(session);
          setState(await loadState(session.id));
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const signUp = useCallback(async (fields) => {
    const u = await backend.signUp(fields);
    setUser(u);
    setState(await loadState(u.id));
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await backend.signOut();
    setUser(null);
    setState(null);
  }, []);

  const value = {
    backend,
    user,
    state,
    booting,
    refresh,
    signUp,
    signOut,
    toasts,
    celebrate,
    pushToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
