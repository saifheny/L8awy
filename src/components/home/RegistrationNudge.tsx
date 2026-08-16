'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { IoArrowBack, IoClose, IoSparkles } from 'react-icons/io5';

export default function RegistrationNudge({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || sessionStorage.getItem('registrationNudgeShown')) return;
    let scrolled = false;
    const show = () => {
      if (!scrolled) return;
      sessionStorage.setItem('registrationNudgeShown', 'true');
      setOpen(true);
    };
    const onScroll = () => { if (window.scrollY > 360) scrolled = true; };
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(show, 14000);
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(timer); };
  }, [enabled]);

  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-slate-950/50 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center dir-rtl">
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl p-7">
      <div className="absolute -top-20 -left-14 h-44 w-44 rounded-full bg-blue-100" />
      <button onClick={() => setOpen(false)} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500"><IoClose /></button>
      <div className="relative"><div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-lg"><IoSparkles size={25} /></div><h2 className="font-aref text-3xl font-bold text-slate-900 mt-5">كمّل رحلتك مع لغوي</h2><p className="font-cairo text-sm text-slate-600 leading-7 mt-3">أنشئ حسابك المجاني لتحفظ تقدمك، تشترك في الكورسات، وتسأل المدرسين من مكان واحد.</p><div className="grid grid-cols-3 gap-2 mt-5 text-center text-xs font-cairo text-slate-600"><span className="rounded-xl bg-slate-50 py-2">تقدمك محفوظ</span><span className="rounded-xl bg-slate-50 py-2">محفظتك</span><span className="rounded-xl bg-slate-50 py-2">دعم المدرسين</span></div><Link href="/register" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-cairo font-bold flex items-center justify-center gap-2">أنشئ حسابك الآن <IoArrowBack /></Link><button onClick={() => setOpen(false)} className="w-full mt-3 py-2 text-sm font-cairo text-gray-500">أكمل التصفح</button></div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
