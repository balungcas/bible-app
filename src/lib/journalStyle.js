// Shared SOAK journal styling model — used by the entry form (SoakForm) and the
// read-only viewer (JournalPage). Persisted in soak_entries.style (jsonb):
//   { paper: 'plain'|'lined'|'parchment'|'dotted', stickers: [{ e, x, y }] }
// x/y are 0..1 fractional coordinates so stickers land right at any width.

export const PAPERS = [
  { id: 'plain', label: 'Plain' },
  { id: 'lined', label: 'Lined' },
  { id: 'parchment', label: 'Parchment' },
  { id: 'dotted', label: 'Dotted' },
];

// Curated emoji set for decorating an entry.
export const STICKERS = ['🙏', '✝️', '🕊️', '❤️', '🔥', '⭐', '📖', '🌱', '💡', '🎯', '😊', '🌿'];

export const DEFAULT_STYLE = { paper: 'plain', stickers: [] };

// Normalizes a possibly-missing/old style blob to the current shape.
export function normalizeStyle(style) {
  if (!style || typeof style !== 'object') return { ...DEFAULT_STYLE };
  return {
    paper: PAPERS.some((p) => p.id === style.paper) ? style.paper : 'plain',
    stickers: Array.isArray(style.stickers) ? style.stickers : [],
  };
}

// Inline background styles for each paper (CSS only — no image assets). These
// work in both light and dark mode because they layer over the card surface.
export function paperStyle(paper) {
  switch (paper) {
    case 'lined':
      return {
        backgroundImage:
          'repeating-linear-gradient(transparent, transparent 27px, rgba(99,102,241,0.25) 28px)',
      };
    case 'dotted':
      return {
        backgroundImage: 'radial-gradient(rgba(120,113,108,0.35) 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
      };
    case 'parchment':
      return {
        backgroundImage:
          'linear-gradient(135deg, rgba(214,187,140,0.22), rgba(180,142,92,0.15))',
      };
    default:
      return {};
  }
}
