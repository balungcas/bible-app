// Theme preference — device-local (localStorage), applied by toggling the
// `.dark` class on <html>. 'system' follows the OS via matchMedia. The initial
// application happens in index.html before React mounts (no-flash); this module
// keeps it in sync afterwards.

const KEY = 'rtcm-bible.theme';
export const THEMES = ['light', 'dark', 'system'];

export function getTheme() {
  const v = localStorage.getItem(KEY);
  return THEMES.includes(v) ? v : 'system';
}

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

// Keep 'system' live if the OS theme changes while the app is open.
export function watchSystemTheme(getCurrent) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getCurrent() === 'system') applyTheme('system');
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
