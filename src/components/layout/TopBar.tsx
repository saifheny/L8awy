'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IoWallet, IoLanguage, IoPerson, IoSettings } from 'react-icons/io5';
import GlassButton from '@/components/ui/GlassButton';

interface TopBarProps {
  onLanguageClick?: () => void;
  onWalletClick?: () => void;
  onSubscribeClick?: () => void;
}

export default function TopBar({ onLanguageClick, onWalletClick, onSubscribeClick }: TopBarProps) {
  const { user, loading } = useAuth();

  return (
    <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none" dir="rtl">
      <div className="px-4 py-2 flex items-center justify-between">
        
        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button
            id="tour-wallet"
            onClick={user ? onWalletClick : onSubscribeClick}
            className="px-4 h-12 rounded-xl flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-gray-800 transition-colors pointer-events-auto shadow-sm"
            title={user ? "المحفظة" : "الاشتراك"}
          >
            <IoWallet size={24} className="text-blue-600" />
            <span className="font-bold font-cairo text-sm md:text-base">محفظتي</span>
          </button>
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
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/80 hover:bg-white text-gray-700 transition-colors shadow-sm"
              title="تغيير اللغة"
            >
              <IoLanguage size={24} className="text-gray-600" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
