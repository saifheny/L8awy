'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoSearch, IoVolumeHigh, IoClose, IoLanguage, IoNewspaper, IoImages, IoBookOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Definition { definition: string; example?: string; synonyms?: string[]; }
interface Meaning { partOfSpeech: string; definitions: Definition[]; }
interface WordResult { word: string; phonetic?: string; phonetics?: { audio?: string }[]; meanings: Meaning[]; }
interface WikiResult { title: string; extract: string; type?: string; thumbnail?: { source: string }; }
interface NewsItem { title: string; url: string; source: { name: string }; publishedAt: string; image?: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeHostname = (url: string) => { try { return new URL(url).hostname; } catch { return ''; } };

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
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(word)}`);
    const d = await r.json();
    const txt = d?.[0]?.[0]?.[0];
    return txt && txt !== word ? txt : null;
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
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(word)}&tags=story&hitsPerPage=12`);
    const d = await r.json();
    return (d?.hits ?? [])
      .filter((h: any) => h.title && h.url && typeof h.url === 'string' && h.url.startsWith('http'))
      .slice(0, 8)
      .map((h: any) => ({
        title: h.title,
        url: h.url,
        source: { name: safeHostname(h.url) || h.author || 'HN' },
        publishedAt: h.created_at,
      }));
  } catch { return []; }
}

async function fetchGlobalNews(): Promise<NewsItem[]> {
  try {
    // Top world news in Arabic from reliable RSS
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar&api_key=`);
    const d = await r.json();
    return (d?.items ?? []).map((h: any) => ({
      title: h.title,
      url: h.link,
      source: { name: h.source || 'أخبار العالم' },
      publishedAt: h.pubDate,
      image: h.thumbnail || h.enclosure?.link,
    }));
  } catch { return []; }
}

async function fetchSuggestions(q: string): Promise<string[]> {
  if (q.length < 2) return [];
  try {
    const r = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&origin=*`);
    const d = await r.json();
    return d[1] || [];
  } catch { return []; }
}

// ─── Image grid via Pollinations AI ──────────────────────────────────────────
function WordImages({ word }: { word: string }) {
  const variants = [word, `${word} photography`, `${word} art`, `${word} concept`];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {variants.map((v, i) => (
        <a key={i} href={`https://image.pollinations.ai/prompt/${encodeURIComponent(v)}`} target="_blank" rel="noopener noreferrer"
          className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 block">
          <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(v)}?width=400&height=400&nologo=true`} alt={word}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
        </a>
      ))}
    </div>
  );
}

// ─── News divider ─────────────────────────────────────────────────────────────
function NewsDivider() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 opacity-60">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <img src="https://i.postimg.cc/15BZXVCN/d42a254cb5f9f120bc8582cad00ac03d.png" alt="Loghawy" className="h-6 w-auto grayscale opacity-50" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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
  const [globalNews, setGlobalNews] = useState<NewsItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'translate'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchGlobalNews().then(setGlobalNews);
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!query.trim() || searched) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(query));
    }, 150);
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
    setQuery(''); setSearched(false);
    setDictResult(null); setTranslation(null);
    setWiki(null); setNews([]);
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const audioUrl = dictResult?.phonetics?.find(p => p.audio)?.audio;

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-32" dir="rtl">

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8faff] via-white to-[#f0f4ff]" />
        {[
          { color: 'rgba(66,133,244,0.12)',  dur: 12, x: 40,  y: -30, cls: 'top-[-10%] right-[-5%] w-[600px] h-[600px]' },
          { color: 'rgba(52,168,83,0.10)',   dur: 16, x: -50, y: 40,  cls: 'bottom-[-15%] left-[-10%] w-[700px] h-[700px]' },
          { color: 'rgba(251,188,5,0.08)',   dur: 10, x: 30,  y: 20,  cls: 'top-[30%] left-[20%] w-[500px] h-[500px]' },
          { color: 'rgba(234,67,53,0.07)',   dur: 14, x: -20, y: -25, cls: 'top-[10%] left-[50%] w-[400px] h-[400px]' },
        ].map((o, i) => (
          <motion.div key={i}
            animate={{ x: [0, o.x, 0], y: [0, o.y, 0] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
            className={`absolute rounded-full ${o.cls}`}
            style={{ background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)` }}
          />
        ))}
      </div>

      {/* ── BACK BUTTON ── */}
      <div className="fixed top-4 left-4 z-30">
        <Link href="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/80 transition-colors backdrop-blur-sm">
            <IoArrowBack size={20} className="text-gray-600" />
          </button>
        </Link>
      </div>

      {/* ── HERO ── */}
      <motion.div
        layout
        animate={searched ? { paddingTop: 16 } : { paddingTop: '12vh' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="flex flex-col items-center px-4 relative z-20"
      >
        <AnimatePresence>
          {!searched && (
            <motion.div exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
              className="mb-8 text-center select-none flex flex-col items-center gap-1">

              {/* Colorful letters - moved up */}
              <div className="flex items-center justify-center gap-1 text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
                <span style={{ color: '#4285F4' }}>ل</span>
                <span style={{ color: '#EA4335' }}>ُ</span>
                <span style={{ color: '#FBBC05' }}>غَ</span>
                <span style={{ color: '#4285F4' }}>و</span>
                <span style={{ color: '#34A853' }}>ي</span>
              </div>

              {/* Subtitle with separator */}
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  {['#4285F4','#EA4335','#FBBC05','#34A853'].map((c,i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-gray-500 text-sm font-cairo font-bold tracking-wide">القاموس الذكي المتكامل</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEARCH BAR ── */}
        <div className="w-full max-w-[600px] relative z-30">
          <div className="animated-border">
            <div className={`flex items-center bg-white rounded-full px-5 py-3.5 gap-3 transition-shadow duration-200 ${
              focused ? 'shadow-[0_4px_24px_rgba(66,133,244,0.20)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
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
                  <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    onClick={clear} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 flex-shrink-0">
                    <IoClose size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
              <button onClick={() => doSearch()} title="بحث">
                <IoSearch size={20} className="text-[#4285F4] hover:text-[#1a73e8] transition-colors" />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {focused && suggestions.length > 0 && !searched && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden z-50 border border-gray-100">
                {suggestions.map((s, i) => (
                  <button key={i} onMouseDown={() => { setQuery(s); doSearch(s); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f8f9fa] text-left transition-colors border-b border-gray-50 last:border-0">
                    <IoSearch size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm" dir="ltr">{s}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Google-style buttons */}
        <AnimatePresence>
          {!searched && (
            <motion.div exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex justify-center gap-3 mt-6 flex-wrap">
              <button onClick={() => doSearch()}
                className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200">
                بحث في القاموس
              </button>
              <button onClick={() => {
                const words = ['serendipity','ephemeral','eloquent','resilience','wisdom','melancholy','luminous','perseverance'];
                const w = words[Math.floor(Math.random() * words.length)];
                setQuery(w); doSearch(w);
              }} className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200">
                ضربة حظ 🎲
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── DEFAULT GLOBAL NEWS ── */}
      {!searched && globalNews.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="max-w-[800px] mx-auto px-4 mt-16"
        >
          <div className="flex items-center gap-2 mb-6 px-2">
            <IoNewspaper className="text-[#4285F4] text-xl" />
            <h2 className="text-lg font-bold font-cairo text-gray-800">أهم الأخبار العالمية اليوم</h2>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">مباشر</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {globalNews.map((item, i) => (
              <React.Fragment key={i}>
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white/60 backdrop-blur-sm hover:bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/50 flex flex-col overflow-hidden group">
                  {item.image && (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 font-cairo mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      {item.source.name}
                    </p>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1a73e8] transition-colors leading-relaxed mb-3 flex-1" dir="rtl">
                      {item.title}
                    </h3>
                  </div>
                </a>
                {/* Insert Logo divider every 4 items (every 2 rows) */}
                {i > 0 && (i + 1) % 4 === 0 && i !== globalNews.length - 1 && (
                  <div className="col-span-full">
                    <NewsDivider />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TABS (After Search) ── */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 mt-2">
            <div className="max-w-[600px] mx-auto px-4 flex gap-1 overflow-x-auto">
              {[
                { key: 'all',       label: 'الكل',    icon: '🔍' },
                { key: 'images',    label: 'صور',     icon: '🖼️' },
                { key: 'news',      label: 'أخبار',   icon: '📰' },
                { key: 'translate', label: 'ترجمة',   icon: '🌐' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-cairo font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#1a73e8] text-[#1a73e8]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH RESULTS ── */}
      <div className="max-w-[600px] mx-auto px-4 mt-4">
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="mb-4 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="h-3 bg-gray-100 rounded-full w-1/4 mb-4 animate-pulse" />
                  <div className="h-6 bg-gray-100 rounded-full w-2/3 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-full mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-4/5 animate-pulse" />
                </div>
              ))}
            </motion.div>
          )}

          {!loading && searched && (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

              {/* TRANSLATE */}
              {(activeTab === 'all' || activeTab === 'translate') && translation && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoLanguage className="text-[#4285F4]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">الترجمة إلى العربية</span>
                  </div>
                  <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100" dir="ltr">
                    <div className="p-5 bg-gray-50/50">
                      <p className="text-xs text-gray-400 mb-1.5 font-cairo">English</p>
                      <p className="text-2xl font-black text-gray-900">{query}</p>
                    </div>
                    <div className="p-5 bg-blue-50/30">
                      <p className="text-xs text-[#4285F4] mb-1.5 font-cairo">العربية</p>
                      <p className="text-2xl font-black text-gray-900" dir="rtl">{translation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DICTIONARY */}
              {(activeTab === 'all') && dictResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-gray-50" dir="ltr">
                    <div>
                      <p className="text-xs text-[#4285F4] font-cairo mb-1 flex items-center gap-1">
                        <IoBookOutline size={12} /> التعريف اللغوي
                      </p>
                      <h2 className="text-3xl font-black text-[#202124]">{dictResult.word}</h2>
                      {dictResult.phonetic && (
                        <p className="text-gray-400 text-sm font-mono mt-1">{dictResult.phonetic}</p>
                      )}
                    </div>
                    {audioUrl && (
                      <button onClick={() => new Audio(audioUrl).play()}
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[#4285F4] bg-blue-50 hover:bg-blue-100 transition-colors">
                        <IoVolumeHigh size={22} />
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50 dir-ltr">
                    {dictResult.meanings?.map((m, mi) => (
                      <motion.div key={mi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: mi * 0.05 }}
                        className="px-5 py-4">
                        <p className="text-xs italic text-gray-400 mb-3">{m.partOfSpeech}</p>
                        <ol className="space-y-2 list-decimal list-inside">
                          {m.definitions.slice(0, 3).map((d, di) => (
                            <li key={di} className="text-[#202124] text-sm leading-relaxed">
                              {d.definition}
                              {d.example && <p className="text-gray-400 text-xs italic mt-0.5 ml-3">"{d.example}"</p>}
                              {d.synonyms && d.synonyms.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5 ml-3">
                                  {d.synonyms.slice(0, 4).map((s, si) => (
                                    <button key={si} onClick={() => { setQuery(s); doSearch(s); }}
                                      className="text-xs text-[#4285F4] hover:underline">
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* WIKIPEDIA */}
              {(activeTab === 'all') && wiki && wiki.type !== 'disambiguation' && wiki.extract && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex gap-4 p-5">
                    {wiki.thumbnail?.source && (
                      <img src={wiki.thumbnail.source} alt={wiki.title}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-sm" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-[#4285F4] font-cairo mb-1">ويكيبيديا</p>
                      <h3 className="font-bold text-gray-900 mb-2 dir-ltr" dir="ltr">{wiki.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 dir-ltr" dir="ltr">{wiki.extract}</p>
                      <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#1a73e8] text-xs font-cairo mt-2 inline-block hover:underline">
                        اقرأ المزيد على ويكيبيديا ←
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGES */}
              {(activeTab === 'all' || activeTab === 'images') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoImages className="text-[#34A853]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">صور (AI Generated)</span>
                  </div>
                  <div className="p-4">
                    <WordImages word={query} />
                  </div>
                </div>
              )}

              {/* NEWS */}
              {(activeTab === 'all' || activeTab === 'news') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoNewspaper className="text-[#EA4335]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">
                      أخبار ذات صلة
                      {news.length > 0 && <span className="text-gray-400 font-normal mr-1">({news.length})</span>}
                    </span>
                  </div>

                  {news.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-gray-400 text-sm font-cairo">لا توجد أخبار متاحة حالياً لهذه الكلمة</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {(activeTab === 'all' ? news.slice(0, 4) : news).map((item, i) => (
                        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                          className="flex gap-3 p-4 hover:bg-[#f8f9fa] transition-colors group">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {safeHostname(item.url) && (
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${safeHostname(item.url)}&sz=32`}
                                alt=""
                                className="w-6 h-6 object-contain"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400 font-cairo mb-0.5">{item.source.name}</p>
                            <p className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] line-clamp-2 dir-ltr transition-colors" dir="ltr">
                              {item.title}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No results */}
              {!loading && !dictResult && !translation && !wiki && news.length === 0 && (
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
