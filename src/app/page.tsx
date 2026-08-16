'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGiftOutline, IoArrowForward, IoClose } from 'react-icons/io5';
import TopBar from '@/components/layout/TopBar';
import BottomBar from '@/components/layout/BottomBar';
import CourseGrid from '@/components/home/CourseGrid';
import LanguageModal from '@/components/home/LanguageModal';
import SubscribeModal from '@/components/home/SubscribeModal';
import WalletModal from '@/components/home/WalletModal';
import PurchaseModal from '@/components/home/PurchaseModal';
import { useRouter } from 'next/navigation';
import type { Course } from '@/lib/types';
import { usePlatformCourses, usePromotionSettings } from '@/hooks/usePlatformContent';
import RegistrationNudge from '@/components/home/RegistrationNudge';

export default function Home() {
  const { user, loading: authLoading, subscribeToCourse, chargeWallet, isSubscribedToCourse } = useAuth();
  const router = useRouter();

  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subscribedCourseIds, setSubscribedCourseIds] = useState<string[]>([]);
  const [checkingSubscriptions, setCheckingSubscriptions] = useState(true);
  const [filterLang, setFilterLang] = useState<string>('en');
  const [showReferralBanner, setShowReferralBanner] = useState(true);
  const { courses, loading: coursesLoading } = usePlatformCourses();
  const promotion = usePromotionSettings();

  // Language mapping
  const langMap: Record<string, string> = {
    'الإنجليزية': 'en',
    'الألمانية': 'de',
    'التركية': 'tr',
  };

  useEffect(() => {
    if (user && user.selectedLanguage) {
      setFilterLang(langMap[user.selectedLanguage] || 'en');
    }
  }, [user]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscribedCourseIds([]);
      setCheckingSubscriptions(false);
      return;
    }
    const ids: string[] = [];
    for (const course of courses) {
      const isSub = await isSubscribedToCourse(course.id);
      if (isSub) ids.push(course.id);
    }
    setSubscribedCourseIds(ids);
    setCheckingSubscriptions(false);
  }, [user, isSubscribedToCourse]);

  useEffect(() => {
    if (!authLoading) {
      fetchSubscriptions();
    }
  }, [authLoading, user, fetchSubscriptions]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/course?courseId=${encodeURIComponent(courseId)}`);
  };

  const handleCourseCardClick = (courseId?: string) => {
    if (!user) {
      if (courseId) router.push(`/course?courseId=${encodeURIComponent(courseId)}`);
      else setSubscribeModalOpen(true);
      return;
    }
    if (courseId) {
      router.push(`/course?courseId=${encodeURIComponent(courseId)}`);
    } else {
      router.push(`/course/${filterLang}-comprehensive`);
    }
  };

  const filteredCourses = courses.filter(c => c.language === filterLang && c.isOpen !== false);

  const languages = [
    { id: 'en', label: 'الإنجليزية' },
    { id: 'de', label: 'الألمانية' },
    { id: 'tr', label: 'التركية' }
  ];

  return (
    <main className="pt-24 pb-32 min-h-screen px-4 md:px-8 relative">
      <TopBar
        onWalletClick={() => user ? router.push('/wallet') : setSubscribeModalOpen(true)}
        onSubscribeClick={() => setSubscribeModalOpen(true)}
        onLanguageClick={() => !user && setLanguageModalOpen(true)}
      />

      {authLoading || checkingSubscriptions || coursesLoading ? (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="h-6 skeleton-shimmer rounded w-32 mb-6 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="w-full h-36 skeleton-shimmer" />
                <div className="p-4 bg-white/60 flex flex-col gap-2">
                  <div className="h-4 skeleton-shimmer rounded w-[70%]" />
                  <div className="h-3 skeleton-shimmer rounded w-[50%]" />
                  <div className="h-3 skeleton-shimmer rounded w-[40%]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <div className="mb-10 flex flex-col items-center">
            <motion.img
              id="tour-logo"
              src="/L8awy/brand/platform-mark.png"
              alt="منصتنا التعليمية"
              className="h-36 md:h-48 w-auto object-contain mb-4 select-none"
              draggable={false}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            {/* Second decorative image below logo */}
            <motion.img
              src="https://i.postimg.cc/T2FXDXf0/image.webp"
              alt=""
              className="w-64 md:w-80 object-contain select-none mb-2"
              draggable={false}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            {!user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs md:text-sm text-gray-500 font-bold font-cairo"
              >
                اختر لغتك من الأيقونة أعلى الشاشة 🌐 وابدأ التعلم الآن
              </motion.p>
            )}
            
            {/* Referral Banner */}
            <AnimatePresence>
              {user && showReferralBanner && promotion.enabled && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 w-full max-w-md shadow-lg relative cursor-pointer hover:shadow-xl transition-shadow border border-green-400/30"
                  onClick={() => router.push('/wallet')}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowReferralBanner(false); }}
                    className="absolute top-2 left-2 text-white/80 hover:text-white bg-black/10 rounded-full p-1"
                  >
                    <IoClose size={16} />
                  </button>
                  <div className="flex items-center gap-4 text-white">
                    <div className="bg-white/20 p-3 rounded-full">
                      <IoGiftOutline size={28} />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold font-cairo text-lg leading-tight">{promotion.title}</h3>
                      <p className="text-sm font-cairo text-white/90">{promotion.description}</p>
                    </div>
                    <IoArrowForward size={20} className="rotate-180" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CourseGrid
            courses={filteredCourses}
            isLoggedIn={!!user}
            subscribedCourseIds={subscribedCourseIds}
            onCourseClick={handleCourseClick}
            onLockedClick={handleCourseCardClick}
          />
        </div>
      )}

      {user && <BottomBar />}
      <RegistrationNudge enabled={!user && !authLoading} />

      <LanguageModal 
        isOpen={languageModalOpen} 
        onClose={() => setLanguageModalOpen(false)} 
        onSelect={(langId) => setFilterLang(langId)}
      />
      <SubscribeModal isOpen={subscribeModalOpen} onClose={() => setSubscribeModalOpen(false)} />

      {selectedCourse && (
        <PurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          course={selectedCourse}
          balance={user?.walletBalance || 0}
          onPurchase={async (id) => {
            const success = await subscribeToCourse(id);
            if (success) {
              setPurchaseModalOpen(false);
              await fetchSubscriptions();
            }
          }}
        />
      )}
    </main>
  );
}
