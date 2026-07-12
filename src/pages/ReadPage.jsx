import { useEffect, useMemo, useState } from 'react';
import { BOOKS, VERSIONS, bookName } from '../lib/books.js';
import { loadChapter } from '../lib/bible.js';
import { markChapterRead, toggleHighlight } from '../lib/game.js';
import { useApp } from '../context/AppContext.jsx';
import { HIGHLIGHT_COLORS, HIGHLIGHT_BG, HIGHLIGHT_SWATCH } from '../lib/highlights.js';

export default function ReadPage() {
  const { user, state, refresh, celebrate } = useApp();
  const [version, setVersion] = useState('KJV');
  const [parallel, setParallel] = useState(false);
  const [book, setBook] = useState(null); // book object
  const [chapter, setChapter] = useState(null);
  const [verses, setVerses] = useState(null);
  const [parallelVerses, setParallelVerses] = useState(null);
  const [marking, setMarking] = useState(false);
  const [openVerse, setOpenVerse] = useState(null); // verse number whose picker is open

  const otherVersion = version === 'KJV' ? 'TAGALOG' : 'KJV';

  const readSet = useMemo(
    () => new Set(state.progress.map((p) => `${p.book_code}/${p.chapter}`)),
    [state.progress]
  );

  useEffect(() => {
    if (!book || !chapter) return;
    setVerses(null);
    setParallelVerses(null);
    setOpenVerse(null);
    loadChapter(version, book.code, chapter).then(setVerses).catch(console.error);
    if (parallel) {
      loadChapter(otherVersion, book.code, chapter).then(setParallelVerses).catch(console.error);
    }
  }, [book, chapter, version, parallel]);

  async function handleMarkRead() {
    setMarking(true);
    try {
      const result = await markChapterRead(user.id, version, book.code, chapter);
      celebrate(result);
      await refresh();
    } finally {
      setMarking(false);
    }
  }

  async function handleHighlight(verseNum, color) {
    setOpenVerse(null);
    await toggleHighlight(user.id, book.code, chapter, verseNum, color);
    await refresh();
  }

  const chaptersReadToday = state.xp.todayByAction.chapter_read || 0;

  // ---------- Book list ----------
  if (!book) {
    return (
      <div>
        <VersionBar
          version={version}
          setVersion={setVersion}
          parallel={parallel}
          setParallel={setParallel}
        />
        {['OT', 'NT'].map((t) => (
          <section key={t} className="mb-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              {t === 'OT' ? 'Old Testament' : 'New Testament'}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BOOKS.filter((b) => b.testament === t).map((b) => {
                const readCount = state.progress.filter((p) => p.book_code === b.code).length;
                return (
                  <button
                    key={b.code}
                    onClick={() => setBook(b)}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm transition hover:border-indigo-300 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-indigo-500"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-100">
                      {bookName(b, version)}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone-400 dark:text-stone-500">
                      {readCount > 0 ? `${readCount}/${b.chapters} read` : `${b.chapters} chapters`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // ---------- Chapter grid ----------
  if (!chapter) {
    return (
      <div>
        <VersionBar
          version={version}
          setVersion={setVersion}
          parallel={parallel}
          setParallel={setParallel}
        />
        <button
          onClick={() => setBook(null)}
          className="mb-3 text-sm text-indigo-600 dark:text-indigo-400"
        >
          ← All books
        </button>
        <h2 className="mb-3 text-xl font-bold text-stone-900 dark:text-stone-100">
          {bookName(book, version)}
        </h2>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
            const read = readSet.has(`${book.code}/${c}`);
            return (
              <button
                key={c}
                onClick={() => setChapter(c)}
                className={`rounded-lg py-2 text-sm font-medium transition active:scale-95 ${
                  read
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border border-stone-200 bg-white hover:border-indigo-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-indigo-500'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- Reader ----------
  const alreadyRead = readSet.has(`${book.code}/${chapter}`);
  return (
    <div>
      <VersionBar
        version={version}
        setVersion={setVersion}
        parallel={parallel}
        setParallel={setParallel}
      />
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setChapter(null)}
          className="text-sm text-indigo-600 dark:text-indigo-400"
        >
          ← {bookName(book, version)}
        </button>
        <div className="flex items-center gap-2">
          <button
            disabled={chapter <= 1}
            onClick={() => setChapter(chapter - 1)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm disabled:opacity-30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            {bookName(book, version)} {chapter}
          </span>
          <button
            disabled={chapter >= book.chapters}
            onClick={() => setChapter(chapter + 1)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm disabled:opacity-30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            ›
          </button>
        </div>
      </div>

      {!verses ? (
        <p className="py-10 text-center text-stone-400 dark:text-stone-500">Loading…</p>
      ) : parallel ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          {verses.map((text, i) => (
            <div
              key={i}
              className="mb-4 grid grid-cols-2 gap-3 border-b border-stone-100 pb-3 dark:border-stone-800"
            >
              <Verse
                num={i + 1}
                text={text}
                color={state.highlights[`${book.code}/${chapter}/${i + 1}`]}
                open={openVerse === i + 1}
                onOpen={() => setOpenVerse(openVerse === i + 1 ? null : i + 1)}
                onPick={(c) => handleHighlight(i + 1, c)}
                size="text-[15px]"
              />
              <p className="font-serif text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                {parallelVerses ? parallelVerses[i] : '…'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          {verses.map((text, i) => (
            <Verse
              key={i}
              num={i + 1}
              text={text}
              color={state.highlights[`${book.code}/${chapter}/${i + 1}`]}
              open={openVerse === i + 1}
              onOpen={() => setOpenVerse(openVerse === i + 1 ? null : i + 1)}
              onPick={(c) => handleHighlight(i + 1, c)}
              size="text-[17px]"
              block
            />
          ))}
        </div>
      )}

      {verses && (
        <div className="mt-4 pb-4">
          {alreadyRead ? (
            <p className="text-center text-sm text-stone-400 dark:text-stone-500">
              ✓ Chapter already marked as read
            </p>
          ) : (
            <>
              <button
                onClick={handleMarkRead}
                disabled={marking}
                className="w-full rounded-xl bg-indigo-700 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-[0.99] disabled:opacity-50"
              >
                {marking ? 'Saving…' : 'Mark chapter as read'}
              </button>
              <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
                {chaptersReadToday >= 5
                  ? 'Daily reading XP cap reached (5 chapters) — keep reading freely!'
                  : `+10 XP · ${5 - chaptersReadToday} of 5 daily reading rewards left`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// A single verse. Tapping it opens an inline color picker; picking a swatch
// highlights the verse, the ✕ clears it. Highlights sync via Supabase.
function Verse({ num, text, color, open, onOpen, onPick, size, block }) {
  return (
    <p className={`relative ${block ? 'mb-3' : ''} font-serif ${size} leading-relaxed`}>
      <sup className="mr-1.5 text-xs font-bold text-indigo-400 dark:text-indigo-500">{num}</sup>
      <span
        onClick={onOpen}
        className={`cursor-pointer rounded px-0.5 text-stone-900 transition dark:text-stone-100 ${
          color ? HIGHLIGHT_BG[color] : 'hover:bg-stone-100 dark:hover:bg-stone-800'
        }`}
      >
        {text}
      </span>
      {open && (
        <span className="absolute left-0 top-full z-10 mt-1 flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2 py-1.5 shadow-lg dark:border-stone-700 dark:bg-stone-800">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className={`h-5 w-5 rounded-full ring-offset-1 transition hover:scale-110 ${HIGHLIGHT_SWATCH[c]} ${
                color === c ? 'ring-2 ring-stone-400 dark:ring-stone-300' : ''
              }`}
              aria-label={`Highlight ${c}`}
            />
          ))}
          {color && (
            <button
              onClick={() => onPick(null)}
              className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-xs text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300"
              aria-label="Remove highlight"
            >
              ✕
            </button>
          )}
        </span>
      )}
    </p>
  );
}

function VersionBar({ version, setVersion, parallel, setParallel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex rounded-lg bg-stone-200 p-1 text-sm font-medium dark:bg-stone-800">
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVersion(v.id)}
            className={`rounded-md px-3 py-1 transition ${
              version === v.id
                ? 'bg-white shadow-sm dark:bg-stone-700 dark:text-stone-100'
                : 'text-stone-500 dark:text-stone-400'
            }`}
            title={v.name}
          >
            {v.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={parallel}
          onChange={(e) => setParallel(e.target.checked)}
          className="accent-indigo-600"
        />
        Parallel
      </label>
    </div>
  );
}
