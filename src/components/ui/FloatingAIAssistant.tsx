'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoSettings } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Show only if user is logged in AND we are on the homepage (courses interface)
  const isVisible = user && pathname === '/';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 left-6 z-50"
        >
          <Link href="/tools">
            <button
              className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(124,58,237,0.4)] transition-all transform hover:scale-110 group relative"
              title="المساعد اللغوي الذكي"
            >
              <IoSettings size={28} className="animate-spin-slow group-hover:animate-none" />
              
              {/* Tooltip bubble */}
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-xs font-bold font-cairo px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                المساعد الذكي
                {/* Arrow */}
                <span className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-white"></span>
              </span>
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
