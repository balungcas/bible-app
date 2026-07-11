// All date math runs in the USER'S LOCAL timezone. entry_date is a calendar
// date string ('YYYY-MM-DD'), never a timestamp — deriving the day server-side
// is the #1 source of streak bugs around midnight.

export function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayLocal() {
  return localDateString(new Date());
}

// Days between two 'YYYY-MM-DD' local dates (b - a). DST-safe: compares at noon.
export function daysBetween(a, b) {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = new Date(pa[0], pa[1] - 1, pa[2], 12);
  const db = new Date(pb[0], pb[1] - 1, pb[2], 12);
  return Math.round((db - da) / 86400000);
}

export function monthStartLocal(d = new Date()) {
  return localDateString(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function formatDateLong(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
