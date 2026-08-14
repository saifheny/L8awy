'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoSearch, IoVolumeHigh, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface WordResult {
  word: string;
  phonetic?: string;
  phonetics?: { audio?: string; text?: string }[];
  meanings: Meaning[];
  source?: string;
}

async function fetchFromFreeDict(word: string): Promise<WordResult | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    return { ...data[0], source: 'Free Dictionary' };
  } catch {
    return null;
  }
}

async function fetchFromDatamuse(word: string): Promise<WordResult | null> {
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${word.trim()}&md=d&max=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]?.defs?.length) return null;
    const defs = data[0].defs as string[];
    const grouped: Record<string, Definition[]> = {};
    defs.forEach((d) => {
      const [pos, ...rest] = d.split('\t');
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push({ definition: rest.join(' ') });
    });
    return {
      word: data[0].word,
      meanings: Object.entries(grouped).map(([pos, defs]) => ({
        partOfSpeech: pos,
        definitions: defs,
      })),
      source: 'Datamuse',
    };
  } catch {
    return null;
  }
}

export default function AIToolsPage() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (query?: string) => {
    const q = (query ?? word).trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);

    // Try multiple sources
    let found = await fetchFromFreeDict(q);
    if (!found) found = await fetchFromDatamuse(q);

    if (!found) {
      setError(`لم يُعثر على كلمة "${q}" في أي مصدر متاح. تأكد من الكتابة الصحيحة.`);
    } else {
      setResult(found);
    }
    setLoading(false);
  };

  const playAudio = (url: string) => {
    if (url) new Audio(url).play();
  };

  const audioUrl = result?.phonetics?.find((p) => p.audio)?.audio;

  const clear = () => {
    setWord('');
    setResult(null);
    setError('');
    setSearched(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dir-rtl relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-4 right-4 z-20">
        <Link href="/">
          <button className="w-11 h-11 rounded-full flex items-center justify-center bg-white/80 hover:bg-white transition-colors shadow-sm border border-gray-100">
            <IoArrowBack size={20} className="text-gray-600" />
          </button>
        </Link>
      </div>

      {/* Main container */}
      <div className="flex flex-col items-center min-h-screen">
        
        {/* Header / Search hero — animates up when searched */}
        <motion.div
          layout
          animate={searched ? { paddingTop: 80 } : { paddingTop: '30vh' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="w-full flex flex-col items-center px-5"
        >
          {/* Title — hides after search */}
          <AnimatePresence>
            {!searched && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-10 text-center"
              >
                <p className="text-gray-400 text-sm font-cairo mb-3 tracking-widest uppercase">القاموس اللغوي الذكي</p>
                <h1 className="text-4xl md:text-5xl font-aref font-bold text-gray-900 leading-tight">
                  ابحث عن أي كلمة
                </h1>
                <p className="text-gray-400 font-cairo mt-3 text-sm">
                  يبحث في أكثر من مصدر • نطق صوتي • أمثلة حية
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            {/* Glowing border effect */}
            <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 opacity-0 blur transition-opacity duration-300 ${word ? 'opacity-30' : ''}`} />

            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden">
              <div className="pl-5 text-gray-300 flex-shrink-0">
                <IoSearch size={22} />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="اكتب أي كلمة إنجليزية..."
                dir="ltr"
                autoFocus
                className="flex-1 py-5 px-4 text-lg font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-300 placeholder:font-normal"
              />

              {/* Clear button */}
              <AnimatePresence>
                {word && !loading && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={clear}
                    className="mr-2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <IoClose size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <AnimatePresence>
                {(word || loading) && (
                  <motion.button
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => search()}
                    disabled={loading}
                    className="flex-shrink-0 m-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-cairo rounded-xl text-sm disabled:opacity-70 transition-opacity shadow-md overflow-hidden whitespace-nowrap"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'بحث'}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="w-full max-w-2xl px-5 pb-32 mt-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500 font-cairo font-bold">{error}</p>
                <p className="text-gray-400 text-sm font-cairo mt-2">جرب كلمة أخرى أو تأكد من الإملاء</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key={result.word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {/* Word header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="dir-ltr text-left">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight">{result.word}</h2>
                    {result.phonetic && (
                      <p className="text-gray-400 mt-1 text-lg font-mono tracking-wide">{result.phonetic}</p>
                    )}
                    {result.source && (
                      <span className="text-xs text-purple-400 font-cairo mt-1 block">المصدر: {result.source}</span>
                    )}
                  </div>
                  {audioUrl && (
                    <button
                      onClick={() => playAudio(audioUrl)}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm flex-shrink-0 ml-4"
                    >
                      <IoVolumeHigh size={26} />
                    </button>
                  )}
                </div>

                {/* Meanings */}
                <div className="space-y-8">
                  {result.meanings?.map((meaning, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      {/* Part of speech badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                          {meaning.partOfSpeech}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {/* Definitions */}
                      <div className="space-y-4 dir-ltr">
                        {meaning.definitions?.slice(0, 3).map((def, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-purple-300 font-black text-lg mt-0.5 flex-shrink-0 select-none">
                              {i + 1}.
                            </span>
                            <div>
                              <p className="text-gray-800 text-base leading-relaxed">{def.definition}</p>
                              {def.example && (
                                <p className="mt-2 text-gray-400 text-sm italic leading-relaxed">
                                  "{def.example}"
                                </p>
                              )}
                              {def.synonyms && def.synonyms.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {def.synonyms.slice(0, 4).map((s, si) => (
                                    <button
                                      key={si}
                                      onClick={() => { setWord(s); search(s); }}
                                      className="text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
