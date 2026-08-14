'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoSearch } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Show only if user is logged in AND on homepage
  const isVisible = user && pathname === '/';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 left-5 z-50"
        >
          <Link href="/tools">
            {/* Pill shape with animated gradient border */}
            <div className="animated-border rounded-2xl shadow-[0_8px_30px_rgba(66,133,244,0.25)] hover:shadow-[0_8px_30px_rgba(66,133,244,0.4)] transition-shadow">
              <div className="bg-white rounded-[14px] px-4 py-2.5 flex items-center gap-2.5 min-w-[130px]">
                <IoSearch size={16} className="text-[#4285F4] flex-shrink-0" />
                {/* Animated text that fades in and out */}
                <div className="relative overflow-hidden h-5 flex-1">
                  <motion.span
                    animate={{ opacity: [1, 1, 0, 0, 1] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
                    className="absolute inset-0 text-xs font-bold font-cairo text-gray-700 whitespace-nowrap flex items-center"
                  >
                    المساعد الذكي
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
                    className="absolute inset-0 text-xs font-bold text-[#4285F4] whitespace-nowrap flex items-center"
                    dir="ltr"
                  >
                    AI Dictionary
                  </motion.span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
