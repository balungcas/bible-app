// Builds the static Bible data served by the app:
//   public/bible/books.json                  — book registry
//   public/bible/{VERSION}/{BOOK_CODE}.json  — { code, chapters: { "1": [ "...", ... ] } }
//
// Verses are stored locally and served as static JSON — no external Bible API
// is called at read time (fast + offline-friendly, per spec).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../src/lib/books.js';
import { SOURCES, loadNormalized, validate } from './normalize.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'bible');

const stampFile = path.join(OUT, '.stamp.json');
const sourceMtimes = SOURCES.map((s) => fs.statSync(s.file).mtimeMs);
if (fs.existsSync(stampFile)) {
  const stamp = JSON.parse(fs.readFileSync(stampFile, 'utf8'));
  if (JSON.stringify(stamp.mtimes) === JSON.stringify(sourceMtimes)) {
    console.log('bible data up to date, skipping build');
    process.exit(0);
  }
}

console.log('Building static bible data…');
const rowsByVersion = {};
for (const source of SOURCES) {
  rowsByVersion[source.version] = loadNormalized(source);
  console.log(`  ${source.version}: ${rowsByVersion[source.version].length} verses`);
}

const { problems, counts } = validate(rowsByVersion);
if (problems.length) {
  console.error('Validation failed:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const [version, rows] of Object.entries(rowsByVersion)) {
  const byBook = {};
  for (const r of rows) {
    const book = (byBook[r.book_code] ??= { code: r.book_code, chapters: {} });
    const ch = (book.chapters[r.chapter] ??= []);
    ch[r.verse - 1] = r.text;
  }
  for (const book of Object.values(byBook)) {
    const dir = path.join(OUT, version);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${book.code}.json`), JSON.stringify(book));
  }
}

fs.writeFileSync(
  path.join(OUT, 'books.json'),
  JSON.stringify(BOOKS.map(({ source, ...b }) => b))
);
fs.writeFileSync(stampFile, JSON.stringify({ mtimes: sourceMtimes, counts }));
console.log('Done →', OUT);
