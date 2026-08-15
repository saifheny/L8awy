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

  const isVisible = user && pathname === '/';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          // z-30 ensures it stays behind the bottom navigation (which is z-40 or z-50)
          className="fixed bottom-24 left-5 z-30"
        >
          <Link href="/tools">
            <motion.div
              initial={{ width: 48, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="animated-border rounded-full shadow-[0_8px_30px_rgba(66,133,244,0.25)] hover:shadow-[0_8px_30px_rgba(66,133,244,0.4)] transition-shadow overflow-hidden"
            >
              <div className="bg-white rounded-full h-[43px] px-[13px] flex items-center justify-start gap-2.5 whitespace-nowrap">
                <IoSearch size={18} className="text-[#4285F4] flex-shrink-0" />
                
                <div className="relative h-5 flex-1 min-w-[100px] overflow-hidden">
                  <span className="absolute inset-0 text-xs font-bold font-cairo text-gray-700 flex items-center">
                    المساعد الذكي
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
