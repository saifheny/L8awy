'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoPeopleOutline, IoHeadsetOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on specific pages like register
  if (pathname === '/register' || pathname === '/login' || pathname.startsWith('/chat')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link 
          href="/teachers"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 py-3 shadow-[0_4px_0_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all"
        >
          <IoPeopleOutline className="text-xl" />
          <span className="font-cairo font-bold text-sm">المدرسين</span>
        </Link>
      </motion.div>
    </div>
  );
}
