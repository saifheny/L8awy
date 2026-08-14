'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoSearch, IoVolumeHigh, IoClose, IoMic } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

interface Definition { definition: string; example?: string; synonyms?: string[]; }
interface Meaning { partOfSpeech: string; definitions: Definition[]; }
interface WordResult { word: string; phonetic?: string; phonetics?: { audio?: string }[]; meanings: Meaning[]; source?: string; }

async function fetchFromFreeDict(word: string): Promise<WordResult | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] ? { ...data[0], source: 'Free Dictionary' } : null;
  } catch { return null; }
}

async function fetchFromDatamuse(word: string): Promise<WordResult | null> {
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${word.trim()}&md=d&max=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]?.defs?.length) return null;
    const grouped: Record<string, Definition[]> = {};
    (data[0].defs as string[]).forEach((d: string) => {
      const [pos, ...rest] = d.split('\t');
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push({ definition: rest.join(' ') });
    });
    return { word: data[0].word, meanings: Object.entries(grouped).map(([pos, defs]) => ({ partOfSpeech: pos, definitions: defs })), source: 'Datamuse' };
  } catch { return null; }
}

async function fetchSuggestions(q: string): Promise<string[]> {
  if (q.length < 2) return [];
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${q}*&max=7`);
    const data = await res.json();
    return data.map((d: { word: string }) => d.word);
  } catch { return []; }
}

export default function ToolsPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!query || searched) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      const s = await fetchSuggestions(query);
      setSuggestions(s);
    }, 250);
  }, [query, searched]);

  const doSearch = async (word?: string) => {
    const q = (word ?? query).trim();
    if (!q) return;
    setSuggestions([]);
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);
    setQuery(q);

    let found = await fetchFromFreeDict(q);
    if (!found) found = await fetchFromDatamuse(q);
    if (!found) setError(q);
    else setResult(found);
    setLoading(false);
  };

  const clear = () => {
    setQuery('');
    setResult(null);
    setError('');
    setSearched(false);
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const audioUrl = result?.phonetics?.find(p => p.audio)?.audio;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">

      {/* Back button */}
      <div className="absolute top-4 right-4 z-30">
        <Link href="/">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <IoArrowBack size={20} className="text-gray-500" />
          </button>
        </Link>
      </div>

      {/* Search hero section */}
      <motion.div
        layout
        animate={searched ? { paddingTop: 16 } : { paddingTop: '22vh' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="flex flex-col items-center px-4 relative z-20"
      >
        {/* Logo */}
        <AnimatePresence>
          {!searched && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
              className="mb-8 text-center select-none"
            >
              <h1 className="font-aref text-5xl md:text-7xl font-bold tracking-tight" style={{
                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 35%, #FBBC05 65%, #EA4335 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                لُغَوي
              </h1>
              <p className="text-gray-400 text-sm font-cairo mt-2">القاموس اللغوي الذكي</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google-style Search Bar */}
        <div className="w-full max-w-[584px] relative">
          <div
            className={`flex items-center bg-white border transition-all duration-200 ${
              focused
                ? 'border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                : 'border-gray-200 hover:shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:border-transparent'
            } rounded-full px-5 py-3.5`}
          >
            {/* Search icon */}
            <IoSearch size={20} className="text-gray-400 flex-shrink-0 ml-3" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              autoFocus
              dir="ltr"
              onChange={e => { setQuery(e.target.value); setSearched(false); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') clear(); }}
              placeholder="ابحث عن أي كلمة..."
              className="flex-1 bg-transparent outline-none text-gray-900 text-base placeholder:text-gray-400 font-cairo"
            />

            {/* Clear + Mic */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={clear}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <IoClose size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Divider */}
              {query && <span className="w-px h-6 bg-gray-200 mx-1" />}

              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <IoSearch size={18} className="text-[#4285F4]" onClick={() => doSearch()} />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {focused && suggestions.length > 0 && !searched && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden mt-1 z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => { setQuery(s); doSearch(s); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <IoSearch size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-cairo text-sm" dir="ltr">{s}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google-style buttons (only before search) */}
          <AnimatePresence>
            {!searched && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex justify-center gap-3 mt-6"
              >
                <button
                  onClick={() => doSearch()}
                  className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200"
                >
                  بحث في القاموس
                </button>
                <button
                  onClick={() => {
                    const sample = ['hello', 'beautiful', 'language', 'knowledge', 'wisdom'];
                    const w = sample[Math.floor(Math.random() * sample.length)];
                    setQuery(w);
                    doSearch(w);
                  }}
                  className="px-5 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:shadow-sm text-gray-700 text-sm font-cairo rounded font-medium transition-all border border-transparent hover:border-gray-200"
                >
                  كلمة عشوائية 🎲
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results */}
      <div className="flex-1 max-w-[584px] w-full mx-auto px-4 pb-32 mt-3">
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
              {/* Google-style skeleton bars */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-full mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse" />
                </div>
              ))}
            </motion.div>
          )}

          {!loading && error && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-8">
              <p className="text-gray-500 font-cairo text-sm">
                لا توجد نتائج مطابقة لـ <span className="text-[#202124] font-bold" dir="ltr">"{error}"</span>
              </p>
              <p className="text-gray-400 text-xs font-cairo mt-1">تأكد من الكتابة الصحيحة، أو جرب كلمة مختلفة.</p>
            </motion.div>
          )}

          {!loading && result && (
            <motion.div key={result.word} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Word header — Google Knowledge Panel style */}
              <div className="pt-5 pb-4 border-b border-gray-200 flex items-start justify-between gap-4 dir-ltr">
                <div>
                  <div className="text-xs text-[#4285F4] font-cairo mb-1 font-medium">
                    {result.source} · الإنجليزية
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#202124] tracking-tight">{result.word}</h2>
                  {result.phonetic && (
                    <p className="text-gray-500 mt-1 text-sm font-mono">{result.phonetic}</p>
                  )}
                </div>
                {audioUrl && (
                  <button
                    onClick={() => audioUrl && new Audio(audioUrl).play()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#4285F4] hover:bg-blue-50 transition-colors flex-shrink-0 mt-1"
                    title="استمع للنطق"
                  >
                    <IoVolumeHigh size={22} />
                  </button>
                )}
              </div>

              {/* Meanings */}
              <div className="divide-y divide-gray-100 dir-ltr">
                {result.meanings?.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.06 }}
                    className="py-4"
                  >
                    <p className="text-xs text-gray-400 italic mb-3">{m.partOfSpeech}</p>
                    <ol className="space-y-3 list-decimal list-inside">
                      {m.definitions?.slice(0, 4).map((def, i) => (
                        <li key={i} className="text-[#202124] text-sm leading-relaxed">
                          {def.definition}
                          {def.example && (
                            <p className="text-gray-400 text-xs italic mt-1 ml-4">"{def.example}"</p>
                          )}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5 ml-4">
                              <span className="text-xs text-gray-400">Synonyms:</span>
                              {def.synonyms.slice(0, 5).map((s, si) => (
                                <button
                                  key={si}
                                  onClick={() => { setQuery(s); doSearch(s); }}
                                  className="text-xs text-[#4285F4] hover:underline"
                                >
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
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
