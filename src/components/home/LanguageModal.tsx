'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePlatformCourses } from '@/hooks/usePlatformContent';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (langId: string) => void;
}

const languageDetails: Record<string, { name: string; emoji: string; desc: string }> = {
  en: { name: 'الإنجليزية (English)', emoji: '🇬🇧', desc: 'لغة العصر والأعمال' },
  de: { name: 'الألمانية (German)', emoji: '🇩🇪', desc: 'للدراسة والعمل في ألمانيا' },
  tr: { name: 'التركية (Turkish)', emoji: '🇹🇷', desc: 'للدراسة والعمل والسياحة' },
  fr: { name: 'الفرنسية (French)', emoji: '🇫🇷', desc: 'لغة الثقافة والتواصل' },
  es: { name: 'الإسبانية (Spanish)', emoji: '🇪🇸', desc: 'لغة منتشرة حول العالم' },
};

export default function LanguageModal({ isOpen, onClose, onSelect }: LanguageModalProps) {
  const router = useRouter();
  const { courses } = usePlatformCourses();
  const languageIds = Array.from(new Set(courses.map((course) => course.language).filter(Boolean)));
  const languages = languageIds.map((id) => languageDetails[id] || { name: id.toUpperCase(), emoji: '🌐', desc: 'لغة مضافة من المنصة' });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] dir-rtl">
          <motion.button aria-label="إغلاق اختيار اللغة" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-sm" />
          <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-[2rem] border-t border-white/20 bg-white px-5 pb-8 pt-4 shadow-2xl sm:inset-x-auto sm:right-1/2 sm:w-full sm:max-w-md sm:translate-x-1/2 sm:rounded-t-[2rem]">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
            <header className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div><h2 className="font-aref text-3xl font-bold text-slate-900">اختيار اللغة</h2><p className="mt-1 font-cairo text-xs text-slate-500">اختر لغة جديدة أو لغة أضافتها الإدارة</p></div>
              <img src="/L8awy/brand/language-mark.png" alt="اختيار اللغة" className="h-20 w-20 object-contain" />
            </header>
            <div className="mt-5 space-y-3">
              {languages.map((lang, index) => (
                <motion.button key={languageIds[index]} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileTap={{ scale: 0.98 }} onClick={() => { onClose(); onSelect ? onSelect(languageIds[index]) : router.push(`/register?lang=${languageIds[index]}`); }} className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-l from-slate-50 to-white p-4 text-right shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                  <span className="text-4xl">{lang.emoji}</span>
                  <span className="flex-1 pr-4"><strong className="block font-cairo text-base text-slate-900">{lang.name}</strong><small className="mt-1 block font-cairo text-xs text-slate-500">{lang.desc}</small></span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
