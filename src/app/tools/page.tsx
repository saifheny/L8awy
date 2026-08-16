'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
const discoverMark = '/L8awy/brand/discover-assistant.png';

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

const RSS_FEEDS = [
  'https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar', // General Egypt/Arab
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=ar&gl=EG&ceid=EG:ar', // World news
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=ar&gl=EG&ceid=EG:ar', // Tech news
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=ar&gl=EG&ceid=EG:ar', // Sports
  'https://www.skynewsarabia.com/rss.xml', // Sky News Arabia
  'http://feeds.bbci.co.uk/arabic/rss.xml', // BBC Arabic
  'https://arabic.cnn.com/api/v1/rss/world/rss.xml', // CNN Arabic
];

async function fetchGlobalNews(pageIndex: number): Promise<NewsItem[]> {
  if (pageIndex >= RSS_FEEDS.length) return [];
  try {
    const feed = RSS_FEEDS[pageIndex];
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`);
    const d = await r.json();
    return (d?.items ?? []).map((h: any) => ({
      title: h.title,
      url: h.link,
      source: { name: h.source || 'أخبار جوجل' },
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

// ─── Image Component ─────────────────────────────────────────────────────────
function WordImages({ word }: { word: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(word)}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const data = await res.json();
        const pages = data?.query?.pages;
        if (pages && active) {
          const urls = Object.values(pages)
            .map((p: any) => p?.imageinfo?.[0]?.url)
            .filter((url: string) => url && !url.endsWith('.svg') && !url.endsWith('.ogv'));
          setImages(urls.slice(0, 4));
        }
      } catch (err) {}
      if (active) setLoading(false);
    };
    fetchImages();
    return () => { active = false; };
  }, [word]);

  if (loading) return (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (images.length === 0) return (
    <div className="text-center py-6">
      <p className="text-gray-400 text-sm font-cairo">لا توجد صور متعلقة بهذه الكلمة</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 block shadow-sm border border-gray-200">
          <img src={url} alt={word} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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
  const router = useRouter();
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
  const [newsPage, setNewsPage] = useState(0);
  const [loadingMoreNews, setLoadingMoreNews] = useState(false);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'news' | 'translate'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initial news load
  useEffect(() => {
    const cached = localStorage.getItem('loghawy_news_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const now = new Date().getTime();
        // Check if less than 24 hours (24 * 60 * 60 * 1000)
        if (now - parsed.timestamp < 24 * 60 * 60 * 1000 && parsed.news.length > 0) {
          setGlobalNews(parsed.news);
          setNewsPage(parsed.page);
          return;
        }
      } catch (e) {}
    }

    fetchGlobalNews(0).then(items => {
      setGlobalNews(items);
      setNewsPage(1);
      localStorage.setItem('loghawy_news_cache', JSON.stringify({
        timestamp: new Date().getTime(),
        news: items,
        page: 1
      }));
    });
  }, []);

  // Infinite scroll observer for global news
  useEffect(() => {
    if (searched || !hasMoreNews) return;
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMoreNews) {
        setLoadingMoreNews(true);
        fetchGlobalNews(newsPage).then(items => {
          if (items.length === 0) {
            setHasMoreNews(false);
          } else {
            setGlobalNews(prev => {
              // Deduplicate based on title
              const existingTitles = new Set(prev.map(p => p.title));
              const newUnique = items.filter(item => !existingTitles.has(item.title));
              const newNews = [...prev, ...newUnique];
              localStorage.setItem('loghawy_news_cache', JSON.stringify({
                timestamp: new Date().getTime(),
                news: newNews,
                page: newsPage + 1
              }));
              return newNews;
            });
            setNewsPage(p => p + 1);
          }
          setLoadingMoreNews(false);
        });
      }
    }, { rootMargin: '200px' });

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [newsPage, loadingMoreNews, searched, hasMoreNews]);

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

      {/* ── HERO ── */}
      <motion.div
        layout
        animate={searched ? { paddingTop: 16 } : { paddingTop: '10vh' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="flex flex-col items-center px-4 relative z-20"
      >
        <AnimatePresence>
          {!searched && (
            <motion.div exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
              className="mb-8 text-center select-none flex flex-col items-center gap-1">

              <div className="flex items-center justify-center gap-1 text-5xl md:text-7xl font-black tracking-tight leading-none mb-3">
                <span style={{ color: '#4285F4' }}>ل</span>
                <span style={{ color: '#EA4335' }}>ُ</span>
                <span style={{ color: '#FBBC05' }}>غَ</span>
                <span style={{ color: '#4285F4' }}>و</span>
                <span style={{ color: '#34A853' }}>ي</span>
              </div>

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
            <div className={`flex items-center bg-white rounded-full px-2 py-2 gap-2 transition-shadow duration-200 ${
              focused ? 'shadow-[0_4px_24px_rgba(66,133,244,0.20)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
            }`}>
              
              {/* Unified Back Button (Cutout style) */}
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm border border-gray-100 flex-shrink-0"
                title="رجوع للصفحة السابقة"
              >
                <IoArrowBack size={18} className="mr-0.5" />
              </button>

              <IoSearch size={20} className="text-gray-400 flex-shrink-0 ml-1" />

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
                className="flex-1 bg-transparent outline-none text-gray-900 text-base placeholder:text-gray-400 font-cairo min-w-0 py-1.5"
              />

              <AnimatePresence>
                {query && (
                  <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    onClick={clear} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 flex-shrink-0">
                    <IoClose size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="w-px h-6 bg-gray-200 flex-shrink-0 mr-1" />
              <button onClick={() => doSearch()} title="بحث" className="px-3">
                <IoSearch size={22} className="text-[#4285F4] hover:text-[#1a73e8] transition-colors" />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {focused && suggestions.length > 0 && !searched && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden z-50 border border-gray-100">
                {suggestions.map((s, i) => (
                  <button key={i} onMouseDown={() => { setQuery(s); doSearch(s); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f8f9fa] text-left transition-colors border-b border-gray-50 last:border-0">
                    <IoSearch size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium" dir="ltr">{s}</span>
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

      {/* ── DEFAULT GLOBAL NEWS (Infinite Scroll) ── */}
      {!searched && globalNews.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="max-w-[800px] mx-auto px-4 mt-16"
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <IoNewspaper className="text-[#4285F4] text-xl" />
              <h2 className="text-lg font-bold font-cairo text-gray-800">أهم الأخبار العالمية</h2>
            </div>
            <span className="bg-red-50 text-red-600 border border-red-100 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              مباشر
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {globalNews.map((item, i) => (
              <React.Fragment key={i}>
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white/60 backdrop-blur-sm hover:bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/50 flex flex-col overflow-hidden group">
                  {item.image && (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <img src={discoverMark} alt="" aria-hidden="true" className="absolute top-2 right-2 h-10 w-10 object-contain drop-shadow-md" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 font-cairo mb-2 flex items-center gap-1.5">
                      <img src={discoverMark} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
                      {item.source.name}
                    </p>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#1a73e8] transition-colors leading-relaxed mb-3 flex-1" dir="rtl">
                      {item.title}
                    </h3>
                  </div>
                </a>
                
                {/* Logo divider every 6 items */}
                {i > 0 && (i + 1) % 6 === 0 && i !== globalNews.length - 1 && (
                  <div className="col-span-full py-2">
                    <NewsDivider />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Loading Skeleton for infinite scroll */}
          {hasMoreNews && (
            <div ref={loadMoreRef} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/40 rounded-2xl p-4 shadow-sm border border-gray-100/50 animate-pulse">
                <div className="h-32 bg-gray-200/60 rounded-xl mb-4 w-full"></div>
                <div className="h-3 bg-gray-200/60 rounded-full w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200/60 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-200/60 rounded-full w-4/5"></div>
              </div>
              <div className="bg-white/40 rounded-2xl p-4 shadow-sm border border-gray-100/50 animate-pulse hidden sm:block">
                <div className="h-32 bg-gray-200/60 rounded-xl mb-4 w-full"></div>
                <div className="h-3 bg-gray-200/60 rounded-full w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200/60 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-200/60 rounded-full w-4/5"></div>
              </div>
            </div>
          )}

          {!hasMoreNews && (
             <div className="text-center py-8 opacity-50">
               <p className="text-sm font-cairo">لا توجد أخبار أخرى.</p>
             </div>
          )}

        </motion.div>
      )}

      {/* ── TABS (After Search) ── */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 mt-2 shadow-sm">
            <div className="max-w-[600px] mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
              {[
                { key: 'all',       label: 'الكل',    icon: '🔍' },
                { key: 'images',    label: 'صور',     icon: '🖼️' },
                { key: 'news',      label: 'أخبار',   icon: '📰' },
                { key: 'translate', label: 'ترجمة',   icon: '🌐' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-cairo font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#1a73e8] text-[#1a73e8]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH RESULTS ── */}
      <div className="max-w-[600px] mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="mb-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoLanguage className="text-[#4285F4]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">الترجمة</span>
                  </div>
                  <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100" dir="ltr">
                    <div className="p-5 bg-gray-50/50">
                      <p className="text-xs text-gray-400 mb-1.5 font-cairo font-bold">English</p>
                      <p className="text-2xl font-black text-gray-900">{query}</p>
                    </div>
                    <div className="p-5 bg-blue-50/30">
                      <p className="text-xs text-[#4285F4] mb-1.5 font-cairo font-bold">العربية</p>
                      <p className="text-2xl font-black text-[#1a73e8]" dir="rtl">{translation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DICTIONARY */}
              {(activeTab === 'all') && dictResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-gray-50" dir="ltr">
                    <div>
                      <p className="text-xs text-[#4285F4] font-cairo mb-1 flex items-center gap-1 font-bold">
                        <IoBookOutline size={14} /> التعريف اللغوي
                      </p>
                      <h2 className="text-3xl font-black text-[#202124]">{dictResult.word}</h2>
                      {dictResult.phonetic && (
                        <p className="text-gray-400 text-sm font-mono mt-1">{dictResult.phonetic}</p>
                      )}
                    </div>
                    {audioUrl && (
                      <button onClick={() => new Audio(audioUrl).play()}
                        className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-[#4285F4] bg-blue-50 hover:bg-[#4285F4] hover:text-white transition-colors shadow-sm">
                        <IoVolumeHigh size={24} />
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50 dir-ltr">
                    {dictResult.meanings?.map((m, mi) => (
                      <motion.div key={mi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: mi * 0.05 }}
                        className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">{m.partOfSpeech}</p>
                        <ol className="space-y-3 list-decimal list-outside ml-4">
                          {m.definitions.slice(0, 3).map((d, di) => (
                            <li key={di} className="text-[#202124] text-sm leading-relaxed pl-1">
                              {d.definition}
                              {d.example && <p className="text-gray-500 text-xs mt-1 border-l-2 border-gray-200 pl-2">"{d.example}"</p>}
                              {d.synonyms && d.synonyms.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {d.synonyms.slice(0, 4).map((s, si) => (
                                    <button key={si} onClick={() => { setQuery(s); doSearch(s); }}
                                      className="text-xs font-medium text-[#4285F4] bg-blue-50/50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-5">
                    {wiki.thumbnail?.source && (
                      <img src={wiki.thumbnail.source} alt={wiki.title}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-sm border border-gray-100" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-cairo mb-1 font-bold">موسوعة ويكيبيديا</p>
                      <h3 className="font-bold text-gray-900 mb-2 dir-ltr" dir="ltr">{wiki.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 dir-ltr" dir="ltr">{wiki.extract}</p>
                      <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#1a73e8] font-bold text-xs font-cairo mt-2 inline-block hover:underline">
                        اقرأ المزيد على ويكيبيديا ←
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGES */}
              {(activeTab === 'all' || activeTab === 'images') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoImages className="text-[#34A853]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">صور دقيقة من ويكيبيديا</span>
                  </div>
                  <div className="p-4">
                    <WordImages word={query} />
                  </div>
                </div>
              )}

              {/* NEWS */}
              {(activeTab === 'all' || activeTab === 'news') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <IoNewspaper className="text-[#EA4335]" size={18} />
                    <span className="text-sm font-bold font-cairo text-gray-700">
                      أخبار ذات صلة
                      {news.length > 0 && <span className="text-gray-400 font-normal mr-1">({news.length})</span>}
                    </span>
                  </div>

                  {news.length === 0 ? (
                    <div className="px-5 py-8 text-center bg-gray-50/50">
                      <p className="text-gray-500 text-sm font-cairo font-bold">لا توجد أخبار متاحة حالياً لهذه الكلمة</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {(activeTab === 'all' ? news.slice(0, 4) : news).map((item, i) => (
                        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                          className="flex gap-3 p-4 hover:bg-blue-50/30 transition-colors group">
                          <img src={discoverMark} alt="" aria-hidden="true" className="w-10 h-10 object-contain flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400 font-cairo mb-0.5">{item.source.name}</p>
                            <p className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] line-clamp-2 dir-ltr transition-colors leading-relaxed" dir="ltr">
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
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-6xl mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">🔍</p>
                  <p className="text-gray-700 font-cairo font-bold text-lg">لم نعثر على أية نتائج لـ "{query}"</p>
                  <p className="text-gray-400 text-sm font-cairo mt-2">يرجى التأكد من التهجئة أو تجربة كلمة أخرى</p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
