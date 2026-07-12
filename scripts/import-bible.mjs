// One-time bulk import of normalized Bible text into Supabase Postgres.
// Run with:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import:bible
//
// Requires the schema from supabase/migrations/ to be applied first.
import { createClient } from '@supabase/supabase-js';
import { BOOKS } from '../src/lib/books.js';
import { SOURCES, loadNormalized, validate } from './normalize.mjs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role — server-side only).');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const BATCH = 1000;

async function main() {
  const rowsByVersion = {};
  for (const source of SOURCES) {
    rowsByVersion[source.version] = loadNormalized(source);
  }
  const { problems, counts } = validate(rowsByVersion);
  if (problems.length) {
    console.error('Validation failed:');
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }
  console.log('Validated:', counts);

  console.log('Upserting books…');
  const bookRows = BOOKS.map((b, i) => ({
    code: b.code,
    testament: b.testament,
    sort_order: i + 1,
    name_en: b.en,
    name_tl: b.tl,
    chapter_count: b.chapters,
  }));
  const { error: bookErr } = await supabase.from('books').upsert(bookRows);
  if (bookErr) throw bookErr;

  for (const [version, rows] of Object.entries(rowsByVersion)) {
    console.log(`Importing ${version} (${rows.length} verses)…`);
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { error } = await supabase
        .from('verses')
        .upsert(batch, { onConflict: 'version,book_code,chapter,verse' });
      if (error) throw error;
      process.stdout.write(`\r  ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
    process.stdout.write('\n');
  }
  console.log('Import complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
