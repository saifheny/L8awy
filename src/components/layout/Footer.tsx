'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoHome, IoPeople, IoWallet, IoPerson } from 'react-icons/io5';

export default function Footer() {
  const pathname = usePathname();
  // Show brand only on home and course pages
  const showBrand = pathname === '/' || pathname.startsWith('/course/');

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white/70 backdrop-blur-2xl pb-28 md:pb-12 pt-12 relative overflow-hidden">
      {/* Decorative blurry blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand */}
        {showBrand ? (
          <div className="flex flex-col items-center md:items-start gap-3">
             <img src="https://i.postimg.cc/15BZXVCN/d42a254cb5f9f120bc8582cad00ac03d.png" alt="Loghawy" className="h-10 w-auto opacity-80 grayscale hover:grayscale-0 transition-all duration-500" />
             <p className="text-gray-400 font-cairo text-xs max-w-xs text-center md:text-right leading-relaxed">
               منصتك المتكاملة لتعلم اللغات بأسلوب تفاعلي وحديث. صُممت لعام 2026.
             </p>
          </div>
        ) : (
          <div className="hidden md:block"></div>
        )}

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <Link href="/" className="group flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
              <IoHome className="text-xl" />
            </div>
            <span className="text-xs font-bold font-cairo text-gray-500 group-hover:text-gray-900 transition-colors">الرئيسية</span>
          </Link>
          <Link href="/teachers" className="group flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 group-hover:border-purple-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
              <IoPeople className="text-xl" />
            </div>
            <span className="text-xs font-bold font-cairo text-gray-500 group-hover:text-gray-900 transition-colors">المدرسين</span>
          </Link>
          <Link href="/wallet" className="group flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-500 group-hover:border-green-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
              <IoWallet className="text-xl" />
            </div>
            <span className="text-xs font-bold font-cairo text-gray-500 group-hover:text-gray-900 transition-colors">المحفظة</span>
          </Link>
          <Link href="/profile" className="group flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
              <IoPerson className="text-xl" />
            </div>
            <span className="text-xs font-bold font-cairo text-gray-500 group-hover:text-gray-900 transition-colors">حسابي</span>
          </Link>
        </div>

      </div>

      <div className="mt-12 pt-8 pb-4 border-t border-gray-100/50 text-center relative z-10 flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-5xl font-aref font-bold mb-4 pb-2" style={{
          background: 'linear-gradient(to right, #3b82f6, #ec4899, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0px 4px 20px rgba(236, 72, 153, 0.2)'
        }}>
          لغوي
        </h2>
        <p className="text-gray-400 text-xs md:text-sm font-cairo tracking-widest uppercase flex items-center gap-2">
          <span>© 2026 LOGHAWY PLATFORM.</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>BUILT FOR THE FUTURE.</span>
        </p>
      </div>
    </footer>
  );
}
