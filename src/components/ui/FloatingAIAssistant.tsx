'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const isVisible = user && pathname === '/';

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(() => setExpanded((value) => !value), 5000);
    return () => window.clearTimeout(timer);
  }, [expanded, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          // The teachers drawer is z-310, so it always covers this assistant.
          className="fixed bottom-24 left-5 z-30"
        >
          <Link href="/tools">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex h-12 items-center gap-2 overflow-visible"
            >
              <motion.img
                src="/L8awy/brand/discover-assistant.png"
                alt="اسأل وترجم واكتشف"
                className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_7px_10px_rgba(234,88,12,0.22)]"
                animate={{ rotate: expanded ? [0, -4, 0] : 0, scale: expanded ? 1.04 : 1 }}
                transition={{ duration: 0.45 }}
              />
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, x: -8 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -8 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="overflow-hidden whitespace-nowrap font-cairo text-xs font-black text-slate-700 drop-shadow-sm"
                  >
                    اسأل · ترجم · اكتشف
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
