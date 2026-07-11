import { useEffect, useMemo, useState } from 'react';
import { BOOKS, BOOK_BY_CODE, bookName } from '../lib/books.js';
import { loadBook, loadPassage, formatRef } from '../lib/bible.js';
import { completeSoak } from '../lib/game.js';
import { useApp } from '../context/AppContext.jsx';

// The daily SOAK entry form: S (scripture, via verse picker) / O / A / K.
export default function SoakForm({ existing, initialRef, onSaved }) {
  const { user, refresh, celebrate } = useApp();
  const [version, setVersion] = useState('KJV');
  const [bookCode, setBookCode] = useState(initialRef?.book || 'JHN');
  const [chapter, setChapter] = useState(initialRef?.chapter || 3);
  const [from, setFrom] = useState(initialRef?.from || 16);
  const [to, setTo] = useState(initialRef?.to || initialRef?.from || 16);
  const [verseCount, setVerseCount] = useState(36);
  const [passage, setPassage] = useState([]);
  const [observation, setObservation] = useState(existing?.observation || '');
  const [application, setApplication] = useState(existing?.application || '');
  const [kneel, setKneel] = useState(existing?.kneel || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const book = BOOK_BY_CODE[bookCode];
  const chapters = useMemo(() => Array.from({ length: book.chapters }, (_, i) => i + 1), [book]);

  useEffect(() => {
    let alive = true;
    loadBook(version, bookCode).then((b) => {
      if (!alive) return;
      const n = (b.chapters[String(chapter)] || []).length;
      setVerseCount(n);
      if (from > n) setFrom(1);
      if (to > n) setTo(n);
    });
    return () => {
      alive = false;
    };
  }, [version, bookCode, chapter]);

  useEffect(() => {
    let alive = true;
    const ref = { book: bookCode, chapter, from, to: Math.max(from, to) };
    loadPassage(version, ref).then((vs) => alive && setPassage(vs));
    return () => {
      alive = false;
    };
  }, [version, bookCode, chapter, from, to]);

  const ref = { book: bookCode, chapter, from, to: Math.max(from, to) };

  async function handleSave() {
    setError('');
    if (!observation.trim() && !application.trim() && !kneel.trim()) {
      setError('Write at least one section before saving.');
      return;
    }
    setSaving(true);
    try {
      const result = await completeSoak(user.id, {
        scripture_ref: formatRef(ref, version),
        scripture_text: passage.map((v) => `${v.verse} ${v.text}`).join('\n'),
        observation: observation.trim(),
        application: application.trim(),
        kneel: kneel.trim(),
      });
      celebrate(result);
      await refresh();
      onSaved?.();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  const selectCls =
    'rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none';
  const areaCls =
    'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none';

  return (
    <div className="space-y-4">
      {/* S — Scripture */}
      <section>
        <SectionLabel letter="S" title="Scripture" hint="Pick today's passage" />
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <select value={bookCode} onChange={(e) => { setBookCode(e.target.value); setChapter(1); setFrom(1); setTo(1); }} className={selectCls}>
            {BOOKS.map((b) => (
              <option key={b.code} value={b.code}>
                {bookName(b, version)}
              </option>
            ))}
          </select>
          <select value={chapter} onChange={(e) => { setChapter(Number(e.target.value)); setFrom(1); setTo(1); }} className={selectCls}>
            {chapters.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-sm text-stone-400">vv.</span>
          <select value={from} onChange={(e) => { const v = Number(e.target.value); setFrom(v); if (to < v) setTo(v); }} className={selectCls}>
            {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span className="text-sm text-stone-400">–</span>
          <select value={Math.max(from, to)} onChange={(e) => setTo(Number(e.target.value))} className={selectCls}>
            {Array.from({ length: verseCount }, (_, i) => i + 1)
              .filter((v) => v >= from)
              .map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
          </select>
          <button
            type="button"
            onClick={() => setVersion(version === 'KJV' ? 'TAGALOG' : 'KJV')}
            className="ml-auto rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-medium text-stone-600"
          >
            {version === 'KJV' ? 'KJV ⇄ Tagalog' : 'Tagalog ⇄ KJV'}
          </button>
        </div>
        <blockquote className="rounded-lg bg-indigo-50 p-3 font-serif text-[15px] leading-relaxed text-indigo-950">
          <p className="mb-1 text-xs font-sans font-semibold text-indigo-500">
            {formatRef(ref, version)}
          </p>
          {passage.map((v) => (
            <span key={v.verse}>
              <sup className="mr-0.5 text-[10px] font-bold text-indigo-400">{v.verse}</sup>
              {v.text}{' '}
            </span>
          ))}
        </blockquote>
      </section>

      {/* O — Observation */}
      <section>
        <SectionLabel letter="O" title="Observation" hint="What does this passage say?" />
        <textarea
          rows={3}
          className={areaCls}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="What stands out? What is God saying here?"
        />
      </section>

      {/* A — Application */}
      <section>
        <SectionLabel letter="A" title="Application" hint="What will you do about it?" />
        <textarea
          rows={3}
          className={areaCls}
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          placeholder="One concrete, doable act of obedience for today…"
        />
      </section>

      {/* K — Kneel */}
      <section>
        <SectionLabel letter="K" title="Kneel" hint="Turn it into prayer" />
        <textarea
          rows={3}
          className={areaCls}
          value={kneel}
          onChange={(e) => setKneel(e.target.value)}
          placeholder="Lord, today I ask…"
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-indigo-700 py-3 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
      >
        {saving ? 'Saving…' : existing ? 'Update today’s SOAK' : 'Complete today’s SOAK · +50 XP'}
      </button>
      <p className="text-center text-xs text-stone-400">
        Your journal is private. No one else — including church leaders — can ever read it.
      </p>
    </div>
  );
}

function SectionLabel({ letter, title, hint }) {
  return (
    <div className="mb-1.5 flex items-baseline gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-700 text-xs font-bold text-white">
        {letter}
      </span>
      <span className="text-sm font-semibold text-stone-800">{title}</span>
      <span className="text-xs text-stone-400">{hint}</span>
    </div>
  );
}
