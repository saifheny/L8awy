'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoSearch, IoVolumeHigh, IoClose, IoLanguage, IoNewspaper, IoImages } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Definition { definition: string; example?: string; synonyms?: string[]; }
interface Meaning { partOfSpeech: string; definitions: Definition[]; }
interface WordResult { word: string; phonetic?: string; phonetics?: { audio?: string }[]; meanings: Meaning[]; }
interface WikiResult { title: string; extract: string; type?: string; thumbnail?: { source: string }; }
interface NewsItem { title: string; url: string; image?: string; source: { name: string }; publishedAt: string; description?: string; }

// ─── API helpers ─────────────────────────────────────────────────────────────
async function fetchDict(word: string): Promise<WordResult | null> {
  try {
    const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.[0] ?? null;
  } catch { return null; }
}

async function fetchTranslation(word: string): Promise<string | null> {
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|ar`);
    const d = await r.json();
    return d?.responseData?.translatedText ?? null;
  } catch { return null; }
}

async function fetchWiki(word: string): Promise<WikiResult | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function fetchNews(word: string): Promise<NewsItem[]> {
  try {
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(word)}&tags=story&hitsPerPage=6`);
    const d = await r.json();
    return (d?.hits ?? []).filter((h: any) => h.title && h.url).map((h: any) => ({
      title: h.title,
      url: h.url,
      source: { name: h.author ?? 'Hacker News' },
      publishedAt: h.created_at,
      description: h.story_text?.slice(0, 120),
    }));
  } catch { return []; }
}

async function fetchSuggestions(q: string): Promise<string[]> {
  if (q.length < 2) return [];
  try {
    const r = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(q)}*&max=8`);
    const d = await r.json();
    return d.map((x: { word: string }) => x.word);
  } catch { return []; }
}

// ─── Images via Unsplash Source ───────────────────────────────────────────────
function WordImages({ word }: { word: string }) {
  const seeds = [word, `${word}1`, `${word}2`, `${word}3`];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {seeds.map((s, i) => (
        <a
          key={i}
          href={`https://unsplash.com/s/photos/${encodeURIComponent(word)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100"
        >
          <img
            src={`https://source.unsplash.com/200x200/?${encodeURIComponent(word)},${i}`}
            alt={word}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </a>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [dictResult, setDictResult] = useState<WordResult | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [wiki, setWiki] = useState<WikiResult | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'translate'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live suggestions
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!query || searched) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(query));
    }, 220);
  }, [query, searched]);

  const doSearch = useCallback(async (word?: string) => {
    const q = (word ?? query).trim();
    if (!q) return;
    setSuggestions([]);
    setLoading(true);
    setSearched(true);
    setQuery(q);
    setDictResult(null);
    setTranslation(null);
    setWiki(null);
    setNews([]);
    setActiveTab('all');

    const [dict, tr, wk, nw] = await Promise.all([
      fetchDict(q),
      fetchTranslation(q),
      fetchWiki(q),
      fetchNews(q),
    ]);

    setDictResult(dict);
    setTranslation(tr);
    setWiki(wk);
    setNews(nw);
    setLoading(false);
  }, [query]);

  const clear = () => {
    setQuery('');
    setSearched(false);
    setDictResult(null);
    setTranslation(null);
    setWiki(null);
    setNews([]);
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const audioUrl = dictResult?.phonetics?.find(p => p.audio)?.audio;
  const hasResults = dictResult || translation || wiki || news.length > 0;

  return (
    <div className="min-h-screen relative overflow-x-hidden" dir="rtl">

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8faff] via-white to-[#f0f4ff]" />
        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(52,168,83,0.10) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,188,5,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute top-[10%] left-[50%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,67,53,0.07) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── BACK BUTTON (left side) ── */}
      <div className="fixed top-4 left-4 z-30">
        <Link href="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm">
            <IoArrowBack size={20} className="text-gray-600" />
          </button>
        </Link>
      </div>

      {/* ── SEARCH HERO ── */}
      <motion.div
        layout
        animate={searched ? { paddingTop: 16 } : { paddingTop: '20vh' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="flex flex-col items-center px-4 relative z-20"
      >
        {/* Google-style Logo (hidden after search) */}
        <AnimatePresence>
          {!searched && (
            <motion.div
              exit={{ opacity: 0, y: -16, transition: { duration: 0.18 } }}
              className="mb-10 text-center select-none"
            >
              <div className="flex items-center justify-center gap-1 text-5xl md:text-7xl font-black tracking-tight mb-2">
                <span style={{ color: '#4285F4' }}>ل</span>
                <span style={{ color: '#EA4335' }}>ُ</span>
                <span style={{ color: '#FBBC05' }}>غَ</span>
                <span style={{ color: '#4285F4' }}>و</span>
                <span style={{ color: '#34A853' }}>ي</span>
              </div>
              <p className="text-gray-400 text-sm font-cairo">القاموس الذكي المتكامل</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google-style Search Bar with gradient border */}
        <div className="w-full max-w-[600px] relative">
          {/* Gradient border wrapper */}
          <div className={`p-[2px] rounded-full transition-all duration-300 ${
            focused
              ? 'bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335]'
              : 'bg-transparent'
          }`}>
            <div className={`flex items-center bg-white rounded-full px-5 py-3.5 gap-3 transition-shadow duration-200 ${
              focused
                ? 'shadow-[0_4px_24px_rgba(66,133,244,0.18)]'
                : 'shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)]'
            }`}>

              <IoSearch size={20} className="text-gray-400 flex-shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                autoFocus
                dir="ltr"
                onChange={e => { setQuery(e.target.value); if (searched) setSearched(false); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 180)}
                onKeyDown={e => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') clear(); }}
                placeholder="ابحث عن أي كلمة أو موضوع..."
                className="flex-1 bg-transparent outline-none text-gray-900 text-base placeholder:text-gray-400 font-cairo min-w-0"
              />

              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={clear}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 flex-shrink-0"
                  >
                    <IoClose size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

              <button
                onClick={() => doSearch()}
                className="flex-shrink-0"
                title="بحث"
              >
                <IoSearch size={20} className="text-[#4285F4] hover:text-[#1a73e8] transition-colors" />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {focused && suggestions.length > 0 && !searched && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden z-50 border border-gray-100"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => { setQuery(s); doSearch(s); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f8f9fa] text-left transition-colors border-b border-gray-50 last:border-0"
                  >
                    <IoSearch size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm" dir="ltr">{s}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Google-style buttons (before search only) */}
        <AnimatePresence>
          {!searched && (
            <motion.div
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex justify-center gap-3 mt-6 flex-wrap"
            >
              <button
                onClick={() => doSearch()}
                className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200"
              >
                بحث في القاموس
              </button>
              <button
                onClick={() => {
                  const words = ['serendipity', 'ephemeral', 'eloquent', 'resilience', 'wisdom', 'melancholy'];
                  const w = words[Math.floor(Math.random() * words.length)];
                  setQuery(w); doSearch(w);
                }}
                className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200"
              >
                كلمة عشوائية 🎲
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── TABS (after search) ── */}
      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 mt-2"
          >
            <div className="max-w-[600px] mx-auto px-4 flex gap-1 overflow-x-auto">
              {[
                { key: 'all', label: 'الكل', icon: '🔍' },
                { key: 'images', label: 'صور', icon: '🖼️' },
                { key: 'news', label: 'أخبار', icon: '📰' },
                { key: 'translate', label: 'ترجمة', icon: '🌐' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-cairo font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#1a73e8] text-[#1a73e8]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULTS ── */}
      <div className="max-w-[600px] mx-auto px-4 pb-20 mt-4">
        <AnimatePresence mode="wait">

          {/* Loading skeleton */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="mb-6 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="h-3 bg-gray-100 rounded-full w-1/4 mb-4 animate-pulse" />
                  <div className="h-6 bg-gray-100 rounded-full w-2/3 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-full mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-4/5 animate-pulse" />
                </div>
              ))}
            </motion.div>
          )}

          {/* Results content */}
          {!loading && searched && (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

              {/* ── TRANSLATE TAB ── */}
              {(activeTab === 'all' || activeTab === 'translate') && translation && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoLanguage className="text-[#4285F4]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">الترجمة إلى العربية</span>
                  </div>
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f8f9fa] rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1 font-cairo">الإنجليزية</p>
                        <p className="text-lg font-bold text-gray-900" dir="ltr">{query}</p>
                      </div>
                      <div className="bg-[#f8f9fa] rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1 font-cairo">العربية</p>
                        <p className="text-lg font-bold text-gray-900">{translation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DICTIONARY ── */}
              {(activeTab === 'all') && dictResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  {/* Word header */}
                  <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-gray-50" dir="ltr">
                    <div>
                      <p className="text-xs text-[#4285F4] font-cairo mb-1">التعريف اللغوي</p>
                      <h2 className="text-3xl font-black text-[#202124]">{dictResult.word}</h2>
                      {dictResult.phonetic && (
                        <p className="text-gray-400 text-sm font-mono mt-1">{dictResult.phonetic}</p>
                      )}
                    </div>
                    {audioUrl && (
                      <button
                        onClick={() => new Audio(audioUrl).play()}
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[#4285F4] hover:bg-blue-50 transition-colors"
                      >
                        <IoVolumeHigh size={22} />
                      </button>
                    )}
                  </div>
                  {/* Meanings */}
                  <div className="divide-y divide-gray-50 dir-ltr">
                    {dictResult.meanings?.map((m, mi) => (
                      <div key={mi} className="px-5 py-4">
                        <p className="text-xs italic text-gray-400 mb-3">{m.partOfSpeech}</p>
                        <ol className="space-y-2 list-decimal list-inside">
                          {m.definitions.slice(0, 3).map((d, di) => (
                            <li key={di} className="text-[#202124] text-sm leading-relaxed">
                              {d.definition}
                              {d.example && <p className="text-gray-400 text-xs italic mt-0.5 ml-3">"{d.example}"</p>}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── WIKIPEDIA ── */}
              {(activeTab === 'all') && wiki && wiki.type !== 'disambiguation' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex gap-4 p-5">
                    {wiki.thumbnail?.source && (
                      <img
                        src={wiki.thumbnail.source}
                        alt={wiki.title}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-[#4285F4] font-cairo mb-1">ويكيبيديا</p>
                      <h3 className="font-bold text-gray-900 mb-2 dir-ltr" dir="ltr">{wiki.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 dir-ltr" dir="ltr">{wiki.extract}</p>
                      <a
                        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a73e8] text-xs font-cairo mt-2 inline-block hover:underline"
                      >
                        اقرأ المزيد على ويكيبيديا ←
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ── IMAGES TAB ── */}
              {(activeTab === 'all' || activeTab === 'images') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoImages className="text-[#34A853]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">صور</span>
                  </div>
                  <div className="p-4">
                    <WordImages word={query} />
                    <a
                      href={`https://unsplash.com/s/photos/${encodeURIComponent(query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a73e8] text-xs font-cairo mt-3 inline-block hover:underline"
                    >
                      عرض المزيد من الصور ←
                    </a>
                  </div>
                </div>
              )}

              {/* ── NEWS TAB ── */}
              {(activeTab === 'all' || activeTab === 'news') && news.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoNewspaper className="text-[#EA4335]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">أخبار ذات صلة</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {(activeTab === 'all' ? news.slice(0, 4) : news).map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-4 hover:bg-[#f8f9fa] transition-colors group"
                      >
                        {/* Favicon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=32`}
                            alt=""
                            className="w-6 h-6"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400 font-cairo mb-1">{item.source.name}</p>
                          <p className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] line-clamp-2 dir-ltr transition-colors" dir="ltr">
                            {item.title}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {!loading && !hasResults && (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-500 font-cairo font-bold">لا توجد نتائج لـ "{query}"</p>
                  <p className="text-gray-400 text-sm font-cairo mt-1">تأكد من الكتابة الصحيحة</p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
