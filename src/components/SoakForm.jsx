import { useEffect, useMemo, useRef, useState } from 'react';
import { BOOKS, BOOK_BY_CODE, bookName } from '../lib/books.js';
import { loadBook, loadPassage, formatRef } from '../lib/bible.js';
import { completeSoak } from '../lib/game.js';
import { useApp } from '../context/AppContext.jsx';
import {
  PAPERS,
  STICKERS,
  normalizeStyle,
  paperStyle,
} from '../lib/journalStyle.js';

// The daily SOAK entry form: S (scripture, via verse picker) / O / A / K,
// on a customizable paper background you can decorate with emoji stickers.
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

  // Journal styling
  const initialStyle = normalizeStyle(existing?.style);
  const [paper, setPaper] = useState(initialStyle.paper);
  const [stickers, setStickers] = useState(() =>
    initialStyle.stickers.map((s, i) => ({ id: `${i}-${s.e}`, ...s }))
  );
  const [selectedSticker, setSelectedSticker] = useState(null);

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

  function addSticker(e) {
    // Drop near the top so it's visible, nudged by count to avoid exact stacking.
    const n = stickers.length;
    setStickers((s) => [
      ...s,
      { id: `${Date.now()}-${e}`, e, x: 0.2 + ((n * 0.13) % 0.6), y: 0.12 },
    ]);
  }

  function removeSticker(id) {
    setStickers((s) => s.filter((x) => x.id !== id));
    setSelectedSticker(null);
  }

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
        style: {
          paper,
          stickers: stickers.map(({ e, x, y }) => ({ e, x, y })),
        },
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
    'rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100';
  const areaCls =
    'w-full rounded-lg border border-stone-300 bg-white/70 px-3 py-2 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-100';

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
          <span className="text-sm text-stone-400 dark:text-stone-500">vv.</span>
          <select value={from} onChange={(e) => { const v = Number(e.target.value); setFrom(v); if (to < v) setTo(v); }} className={selectCls}>
            {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span className="text-sm text-stone-400 dark:text-stone-500">–</span>
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
            className="ml-auto rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            {version === 'KJV' ? 'KJV ⇄ Tagalog' : 'Tagalog ⇄ KJV'}
          </button>
        </div>
        <blockquote className="rounded-lg bg-indigo-50 p-3 font-serif text-[15px] leading-relaxed text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-100">
          <p className="mb-1 text-xs font-sans font-semibold text-indigo-500 dark:text-indigo-400">
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

      {/* Journal styling: paper + stickers */}
      <section>
        <SectionLabel letter="🎨" title="Style your page" hint="Paper & stickers" />
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {PAPERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPaper(p.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                paper === p.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'border-stone-300 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {STICKERS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => addSticker(e)}
              className="rounded-md px-1.5 py-1 text-xl transition hover:scale-110 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label={`Add ${e} sticker`}
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          Tap an emoji to add it, then drag to place. Tap a placed sticker to remove.
        </p>
      </section>

      {/* Paper canvas holding O/A/K, with draggable sticker overlay */}
      <PaperCanvas
        paper={paper}
        stickers={stickers}
        setStickers={setStickers}
        selectedSticker={selectedSticker}
        setSelectedSticker={setSelectedSticker}
        onRemove={removeSticker}
      >
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
        <section className="mt-4">
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
        <section className="mt-4">
          <SectionLabel letter="K" title="Kneel" hint="Turn it into prayer" />
          <textarea
            rows={3}
            className={areaCls}
            value={kneel}
            onChange={(e) => setKneel(e.target.value)}
            placeholder="Lord, today I ask…"
          />
        </section>
      </PaperCanvas>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-indigo-700 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-[0.99] disabled:opacity-50"
      >
        {saving ? 'Saving…' : existing ? 'Update today’s SOAK' : 'Complete today’s SOAK · +50 XP'}
      </button>
      <p className="text-center text-xs text-stone-400 dark:text-stone-500">
        Your journal is private. No one else — including church leaders — can ever read it.
      </p>
    </div>
  );
}

// Paper-backgrounded container with an absolutely-positioned, draggable sticker
// layer over the top. The layer is pointer-events-none so taps between stickers
// still reach the textareas; individual stickers re-enable pointer events.
function PaperCanvas({ paper, stickers, setStickers, selectedSticker, setSelectedSticker, onRemove, children }) {
  const ref = useRef(null);
  const drag = useRef(null); // { id, moved }

  function onPointerDown(e, sticker) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: sticker.id, moved: false };
  }

  function onPointerMove(e) {
    if (!drag.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    drag.current.moved = true;
    setStickers((list) =>
      list.map((s) => (s.id === drag.current.id ? { ...s, x, y } : s))
    );
  }

  function onPointerUp(sticker) {
    const wasDrag = drag.current?.moved;
    drag.current = null;
    // A tap (no drag) toggles selection so the remove button shows.
    if (!wasDrag) setSelectedSticker((cur) => (cur === sticker.id ? null : sticker.id));
  }

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
      style={paperStyle(paper)}
    >
      {children}
      <div className="pointer-events-none absolute inset-0">
        {stickers.map((s) => (
          <div
            key={s.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-move touch-none select-none text-3xl"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
            onPointerDown={(e) => onPointerDown(e, s)}
            onPointerMove={onPointerMove}
            onPointerUp={() => onPointerUp(s)}
          >
            {s.e}
            {selectedSticker === s.id && (
              <button
                type="button"
                onClick={() => onRemove(s.id)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                aria-label="Remove sticker"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ letter, title, hint }) {
  return (
    <div className="mb-1.5 flex items-baseline gap-2">
      <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-indigo-700 px-1 text-xs font-bold text-white">
        {letter}
      </span>
      <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{title}</span>
      <span className="text-xs text-stone-400 dark:text-stone-500">{hint}</span>
    </div>
  );
}
