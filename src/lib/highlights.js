// Highlight color palette, shared by the reader UI. Class strings are written
// out in full (not interpolated) so Tailwind's scanner keeps them in the build.

export const HIGHLIGHT_COLORS = ['yellow', 'green', 'blue', 'pink', 'orange'];

// Background applied behind highlighted verse text, light + dark tuned.
export const HIGHLIGHT_BG = {
  yellow: 'bg-yellow-200/70 dark:bg-yellow-400/25',
  green: 'bg-green-200/70 dark:bg-green-400/25',
  blue: 'bg-sky-200/70 dark:bg-sky-400/25',
  pink: 'bg-pink-200/70 dark:bg-pink-400/25',
  orange: 'bg-orange-200/70 dark:bg-orange-400/25',
};

// Solid swatch for the color-picker dots.
export const HIGHLIGHT_SWATCH = {
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-sky-400',
  pink: 'bg-pink-400',
  orange: 'bg-orange-400',
};
