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
            <Link href="/register">
              <button className="px-8 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-400 transition-colors shadow-sm">
                سجّل
              </button>
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
              className="w-12 h-12 flex items-center justify-center bg-transparent hover:opacity-85 transition-opacity"
              title="تغيير اللغة"
            >
              <img src="/L8awy/brand/platform-mark.png" alt="لغوي" className="w-12 h-12 object-contain" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
