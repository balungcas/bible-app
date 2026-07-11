import { useEffect, useMemo, useState } from 'react';
import { BOOKS, VERSIONS, bookName } from '../lib/books.js';
import { loadChapter } from '../lib/bible.js';
import { markChapterRead } from '../lib/game.js';
import { useApp } from '../context/AppContext.jsx';

export default function ReadPage() {
  const { user, state, refresh, celebrate } = useApp();
  const [version, setVersion] = useState('KJV');
  const [parallel, setParallel] = useState(false);
  const [book, setBook] = useState(null); // book object
  const [chapter, setChapter] = useState(null);
  const [verses, setVerses] = useState(null);
  const [parallelVerses, setParallelVerses] = useState(null);
  const [marking, setMarking] = useState(false);

  const otherVersion = version === 'KJV' ? 'TAGALOG' : 'KJV';

  const readSet = useMemo(
    () => new Set(state.progress.map((p) => `${p.book_code}/${p.chapter}`)),
    [state.progress]
  );

  useEffect(() => {
    if (!book || !chapter) return;
    setVerses(null);
    setParallelVerses(null);
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
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-400">
              {t === 'OT' ? 'Old Testament' : 'New Testament'}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BOOKS.filter((b) => b.testament === t).map((b) => {
                const readCount = state.progress.filter((p) => p.book_code === b.code).length;
                return (
                  <button
                    key={b.code}
                    onClick={() => setBook(b)}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm hover:border-indigo-300"
                  >
                    <span className="font-medium">{bookName(b, version)}</span>
                    <span className="mt-0.5 block text-xs text-stone-400">
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
        <button onClick={() => setBook(null)} className="mb-3 text-sm text-indigo-600">
          ← All books
        </button>
        <h2 className="mb-3 text-xl font-bold">{bookName(book, version)}</h2>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
            const read = readSet.has(`${book.code}/${c}`);
            return (
              <button
                key={c}
                onClick={() => setChapter(c)}
                className={`rounded-lg py-2 text-sm font-medium ${
                  read
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'border border-stone-200 bg-white hover:border-indigo-300'
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
        <button onClick={() => setChapter(null)} className="text-sm text-indigo-600">
          ← {bookName(book, version)}
        </button>
        <div className="flex items-center gap-2">
          <button
            disabled={chapter <= 1}
            onClick={() => setChapter(chapter - 1)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-sm font-semibold">
            {bookName(book, version)} {chapter}
          </span>
          <button
            disabled={chapter >= book.chapters}
            onClick={() => setChapter(chapter + 1)}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      {!verses ? (
        <p className="py-10 text-center text-stone-400">Loading…</p>
      ) : parallel ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          {verses.map((text, i) => (
            <div key={i} className="mb-4 grid grid-cols-2 gap-3 border-b border-stone-100 pb-3">
              <p className="font-serif text-[15px] leading-relaxed">
                <sup className="mr-1 text-xs font-bold text-indigo-400">{i + 1}</sup>
                {text}
              </p>
              <p className="font-serif text-[15px] leading-relaxed text-stone-700">
                {parallelVerses ? parallelVerses[i] : '…'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          {verses.map((text, i) => (
            <p key={i} className="mb-3 font-serif text-[17px] leading-relaxed">
              <sup className="mr-1.5 text-xs font-bold text-indigo-400">{i + 1}</sup>
              {text}
            </p>
          ))}
        </div>
      )}

      {verses && (
        <div className="mt-4 pb-4">
          {alreadyRead ? (
            <p className="text-center text-sm text-stone-400">✓ Chapter already marked as read</p>
          ) : (
            <>
              <button
                onClick={handleMarkRead}
                disabled={marking}
                className="w-full rounded-xl bg-indigo-700 py-3 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
              >
                {marking ? 'Saving…' : 'Mark chapter as read'}
              </button>
              <p className="mt-2 text-center text-xs text-stone-400">
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

function VersionBar({ version, setVersion, parallel, setParallel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex rounded-lg bg-stone-200 p-1 text-sm font-medium">
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVersion(v.id)}
            className={`rounded-md px-3 py-1 ${
              version === v.id ? 'bg-white shadow-sm' : 'text-stone-500'
            }`}
            title={v.name}
          >
            {v.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600">
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
