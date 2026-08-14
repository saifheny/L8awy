'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack, IoSearch, IoVolumeHigh, IoLanguage, IoBook } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function AIToolsPage() {
  const router = useRouter();
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWord = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
      if (!res.ok) {
        throw new Error('الكلمة غير موجودة، تأكد من الكتابة الصحيحة (اللغة الإنجليزية فقط).');
      }
      const data = await res.json();
      setResult(data[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-transparent dir-rtl pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between mb-8">
        <h1 className="text-2xl font-aref font-bold text-gray-900 flex items-center gap-2">
          <IoLanguage className="text-purple-600 text-3xl" />
          المساعد اللغوي الذكي (قاموس ناطق)
        </h1>
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors shadow-sm"
        >
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <p className="text-gray-600 font-cairo mb-6 text-sm md:text-base">
            ابحث عن أي كلمة باللغة الإنجليزية لمعرفة نطقها الصحيح، معانيها المختلفة، وأمثلة على استخدامها. (مجاني بالكامل)
          </p>
          
          <div className="flex gap-3 relative">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchWord()}
              placeholder="اكتب كلمة إنجليزية هنا (مثال: hello)"
              className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold focus:outline-none focus:border-purple-500 text-left font-cairo dir-ltr text-lg"
              dir="ltr"
            />
            <button
              onClick={searchWord}
              disabled={loading || !word.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-md active:scale-95"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSearch size={24} />
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-cairo font-bold text-sm border border-red-100">
              {error}
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-purple-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-4xl font-black text-gray-900 dir-ltr text-left mb-2">{result.word}</h2>
                <p className="text-gray-500 dir-ltr text-left text-lg font-mono tracking-wider">{result.phonetic}</p>
              </div>
              
              {result.phonetics?.find((p: any) => p.audio) && (
                <button
                  onClick={() => playAudio(result.phonetics.find((p: any) => p.audio).audio)}
                  className="w-16 h-16 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                  title="استمع للنطق"
                >
                  <IoVolumeHigh size={32} />
                </button>
              )}
            </div>

            <div className="space-y-8 dir-ltr text-left">
              {result.meanings?.map((meaning: any, idx: number) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-bold text-sm uppercase tracking-wider">
                      {meaning.partOfSpeech}
                    </span>
                  </div>
                  
                  <ul className="space-y-4 pl-4 border-l-2 border-purple-100">
                    {meaning.definitions?.slice(0, 3).map((def: any, i: number) => (
                      <li key={i} className="pl-4">
                        <p className="text-gray-800 font-medium text-lg leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <div className="mt-2 text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100 text-base">
                            "{def.example}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
