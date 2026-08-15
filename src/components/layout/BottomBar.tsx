'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoBookOutline, IoWalletOutline, IoPeopleOutline, IoCloseOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { useAuth } from '@/contexts/AuthContext';
import { teachersData } from '@/data/teachers';

interface BottomBarProps {
  isSubscribed?: boolean;
}

export default function BottomBar({ isSubscribed }: BottomBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [teachersOpen, setTeachersOpen] = useState(false);

  if (!user) return null;

  const langMap: Record<string, string> = {
    'الإنجليزية': 'en', 'الألمانية': 'de', 'التركية': 'tr',
    'اللغة الإنجليزية': 'en', 'اللغة الألمانية': 'de', 'اللغة التركية': 'tr',
  };
  const langCode = user.selectedLanguage ? (langMap[user.selectedLanguage] || 'en') : 'en';
  const myTeachers = teachersData.filter(t => t.lang === langCode);

  return (
    <>
      {/* ══════════ TEACHERS DRAWER ══════════ */}
      <AnimatePresence>
        {teachersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              onClick={() => setTeachersOpen(false)}
            />

            {/* Drawer connected to bottom */}
            <motion.div
              key="drawer"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 right-0 z-[110] bg-white flex flex-col overflow-hidden shadow-2xl"
              style={{
                bottom: '0',
                borderRadius: '24px 24px 0 0',
                maxHeight: '70vh',
              }}
              dir="rtl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <IoPeopleOutline className="text-blue-600 text-xl" />
                  <h3 className="text-base font-bold font-cairo text-gray-900">المدرسون المتاحون</h3>
                </div>
                <button
                  onClick={() => setTeachersOpen(false)}
                  className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <IoCloseOutline size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {myTeachers.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 font-cairo text-sm">لا يوجد مدرسون متاحون حالياً</p>
                ) : (
                  myTeachers.map(teacher => (
                    <div
                      key={teacher.id}
                      onClick={() => { setTeachersOpen(false); router.push(`/chat/${teacher.id}`); }}
                      className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer transition-all bg-white"
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <IoPeopleOutline size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 font-cairo text-sm truncate">{teacher.name}</h4>
                        <p className="text-xs text-gray-500 font-cairo truncate">{teacher.bio}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                        <IoChatbubbleEllipsesOutline size={14} />
                        <span>تحدث</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════ BOTTOM NAV BAR — clean pill shape ══════════ */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: teachersOpen ? 150 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="fixed bottom-0 left-4 right-4 z-40 mb-3"
        dir="rtl"
      >
        <div
          className="bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-2xl px-4 py-2 max-w-md mx-auto"
          style={{ borderRadius: '999px' }}
        >
          <div className="flex justify-around items-center">
            {/* Courses */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 flex-1 group rounded-2xl transition-colors hover:bg-blue-50"
            >
              <IoBookOutline size={22} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-bold font-cairo text-gray-600 group-hover:text-blue-600 transition-colors">الكورسات</span>
            </Link>

            {/* Teachers */}
            <button
              onClick={() => setTeachersOpen(prev => !prev)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-1.5 flex-1 group rounded-2xl transition-colors ${teachersOpen ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
            >
              <IoPeopleOutline size={22} className={`transition-colors ${teachersOpen ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} />
              <span className={`text-xs font-bold font-cairo transition-colors ${teachersOpen ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`}>المدرسون</span>
            </button>

            {/* Wallet */}
            <Link
              href="/wallet"
              className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 flex-1 group rounded-2xl transition-colors hover:bg-blue-50"
            >
              <IoWalletOutline size={22} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-bold font-cairo text-gray-600 group-hover:text-blue-600 transition-colors">المحفظة</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
