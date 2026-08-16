'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IoPerson } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onLanguageClick?: () => void;
  onWalletClick?: () => void;
  onSubscribeClick?: () => void;
}

export default function TopBar({ onLanguageClick, onWalletClick, onSubscribeClick }: TopBarProps) {
  const { user, loading } = useAuth();
  const previousBalance = useRef<number | null>(null);
  const [walletNotice, setWalletNotice] = useState(false);
  const [showFreeRegister, setShowFreeRegister] = useState(false);

  useEffect(() => {
    if (!user) return;
    const balance = Number(user.walletBalance || 0);
    if (previousBalance.current !== null && balance > previousBalance.current) {
      setWalletNotice(true);
      const timer = window.setTimeout(() => setWalletNotice(false), 5500);
      previousBalance.current = balance;
      return () => window.clearTimeout(timer);
    }
    previousBalance.current = balance;
  }, [user?.walletBalance, user]);

  useEffect(() => {
    if (user) return;
    const timer = window.setInterval(() => setShowFreeRegister((value) => !value), 5000);
    return () => window.clearInterval(timer);
  }, [user]);

  return (
    <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none" dir="rtl">
      <div className="px-4 py-2 flex items-center justify-between">
        
        {/* Right Side */}
        <div className="flex items-center gap-3">
          <motion.button
            id="tour-wallet"
            onClick={user ? onWalletClick : onSubscribeClick}
            className="fixed top-3 right-3 z-50 h-12 flex items-center justify-center gap-2 bg-transparent hover:opacity-90 text-gray-800 transition-opacity pointer-events-auto overflow-visible md:top-4 md:right-4"
            title={user ? "المحفظة" : "الاشتراك"}
          >
            <motion.img animate={walletNotice ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.5 }} src="/L8awy/brand/wallet-mark.png" alt="محفظتي" className="h-11 w-11 object-contain" />
            <span className="wallet-brand-name" aria-label="محفظتي"><span>م</span><span>ح</span><span>ف</span><span>ظ</span><span>ت</span><span>ي</span></span>
            <AnimatePresence>{walletNotice && <motion.span initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full right-0 mt-2 rounded-xl bg-emerald-600 text-white px-3 py-2 whitespace-nowrap text-xs font-cairo font-bold shadow-lg">تمت إضافة رصيد لمحفظتك ✨</motion.span>}</AnimatePresence>
          </motion.button>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center items-center pointer-events-auto">
          {!user && !loading && (
            <Link href="/register" className="fixed top-2 left-1/2 z-50 -translate-x-1/2">
              <motion.div whileTap={{ scale: 0.96 }} className="flex min-w-24 flex-col items-center text-center">
                <img src="/L8awy/brand/register-mark.png" alt="سجل الآن" className="h-16 w-16 object-contain drop-shadow-lg md:h-[4.25rem] md:w-[4.25rem]" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={showFreeRegister ? 'free' : 'now'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.28 }} className="mt-0.5 whitespace-nowrap font-cairo text-xs font-black text-emerald-700 drop-shadow-sm md:text-sm">
                    {showFreeRegister ? 'سجّل مجانًا' : 'سجّل الآن'}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </Link>
          )}
        </div>

        {/* Left Side */}
        <div className="flex items-center justify-end min-w-[3rem] pointer-events-auto">
          {user ? (
            <Link href="/profile">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-1.5 rounded-xl transition-colors">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-gray-900 leading-none">
                    {user.phone || (user.displayName ? user.displayName.split(' ')[0] : 'طالب')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-300 via-green-400 to-blue-500 shadow-sm border-2 border-white flex items-center justify-center">
                  <IoPerson className="text-white text-2xl" />
                </div>
              </div>
            </Link>
          ) : (
            <button
              id="tour-lang-selector"
              onClick={onLanguageClick}
              className="fixed top-3 left-3 z-50 rounded-full p-[2px] shadow-[0_8px_22px_rgba(66,133,244,0.22)] transition-transform hover:scale-[1.02] md:top-4 md:left-4"
              style={{ background: 'linear-gradient(90deg, #4285f4 0%, #34a853 34%, #fbbc05 67%, #ea4335 100%)' }}
              title="تغيير اللغة"
            >
              <span className="flex h-11 items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-3 font-cairo text-xs font-black text-slate-700 md:h-12 md:gap-2 md:pr-4 md:text-sm">
                <span>اختيار اللغة</span>
                <img src="/L8awy/brand/language-mark.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain md:h-9 md:w-9" />
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
