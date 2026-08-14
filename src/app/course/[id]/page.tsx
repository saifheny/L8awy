'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import VideoSection from '@/components/course/VideoSection';
import ExamSection from '@/components/course/ExamSection';
import CommentsSection from '@/components/course/CommentsSection';
import PurchaseModal from '@/components/home/PurchaseModal';
import { courses } from '@/data/courses';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLockClosed, IoArrowBack, IoPlayCircle, IoPeople, IoSchool, IoDocumentText, IoChatbubbles, IoCheckmarkCircle, IoTime, IoStar } from 'react-icons/io5';

const langImages: Record<string, string> = {
  en: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=1200&q=80',
  de: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=1200&q=80',
  tr: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
};

const tabs = [
  { id: 'videos', label: 'الفيديوهات', icon: IoPlayCircle },
  { id: 'exams', label: 'الامتحانات', icon: IoDocumentText },
] as const;

export default function CourseDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading, isSubscribedToCourse, subscribeToCourse } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'videos' | 'exams'>('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const course = courses.find(c => c.id === id);

  useEffect(() => {
    const checkSub = async () => {
      if (authLoading) return;
      if (!user) { setChecking(false); return; }
      const sub = await isSubscribedToCourse(id);
      setIsSubscribed(sub);
      setChecking(false);
    };
    checkSub();
  }, [user, authLoading, id, isSubscribedToCourse]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen dir-rtl pt-4 pb-24">
        <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
          <div className="w-full h-64 skeleton-shimmer rounded-2xl" />
          <div className="h-5 skeleton-shimmer rounded w-48" />
          <div className="h-8 skeleton-shimmer rounded w-3/4" />
          <div className="h-4 skeleton-shimmer rounded w-full" />
          <div className="h-4 skeleton-shimmer rounded w-5/6" />
        </div>
      </div>
    );
  }

  // While checking subscription, show skeleton without spinner
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 font-cairo text-xl font-bold">لم يتم العثور على الكورس</p>
      </div>
    );
  }

  const coverImage = langImages[course.language] || langImages.en;

  const handleSubscribeClick = () => {
    if (!user) { router.push('/register'); return; }
    setPurchaseModalOpen(true);
  };

  const colorMap: Record<string, { accent: string; glow: string; shadow: string }> = {
    en: { accent: '#3b82f6', glow: 'rgba(59,130,246,0.3)', shadow: '#1d4ed8' },
    de: { accent: '#eab308', glow: 'rgba(234,179,8,0.3)', shadow: '#ca8a04' },
    tr: { accent: '#ef4444', glow: 'rgba(239,68,68,0.3)', shadow: '#b91c1c' },
  };
  const colors = colorMap[course.language] || colorMap.en;

  return (
    <main className="min-h-screen dir-rtl pt-4 pb-24" style={{ background: 'transparent' }}>

      {/* ======================== HERO HEADER ======================== */}
      <div className="relative w-full" style={{ height: '480px' }}>
        {/* Background Image - blurred by default, clear only when subscribed */}
        <img
          src={coverImage}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: isSubscribed ? 'brightness(0.55)' : 'blur(40px) brightness(0.25) saturate(0.6)', transform: !isSubscribed ? 'scale(1.15)' : 'none' }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Back Button - left side in RTL layout */}
        <Link href="/" className="absolute top-6 left-6 z-[100]">
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-xl">
            <IoArrowBack className="text-white text-2xl" />
          </button>
        </Link>

        {/* Course Info at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-4xl mx-auto">
            {/* Level Badge */}
            <span
              className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold font-cairo mb-4 shadow-lg"
              style={{ background: colors.accent }}
            >
              {course.level}
            </span>

            <h1 className="text-3xl md:text-5xl font-aref font-bold text-white mb-3 leading-tight drop-shadow-xl">
              {course.title}
            </h1>

            {isSubscribed ? (
              <p className="text-white/80 text-base md:text-lg font-cairo max-w-2xl leading-relaxed">
                {course.description}
              </p>
            ) : (
              <p className="text-white/70 text-base font-cairo blur-sm select-none pointer-events-none">
                ●●●●●●●●● ●●●●●●●●●●●●● ●●●●●●●●●●●● ●●●●●●●●●
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-5">
              <div className="flex items-center gap-2 text-white/90 font-cairo text-sm">
                <IoStar className="text-yellow-400" />
                <span className="font-bold">4.9</span> (320 تقييم)
              </div>
              <div className="flex items-center gap-2 text-white/90 font-cairo text-sm">
                <IoPeople style={{ color: colors.accent }} />
                <span>{course.teacherCount} مدرس</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 font-cairo text-sm">
                <IoDocumentText className="text-green-400" />
                <span>{course.examCount} امتحان</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 font-cairo text-sm">
                <IoTime className="text-purple-300" />
                <span>{course.durationMonths} أشهر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribe Lock Overlay */}
        {!isSubscribed && !checking && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: 'rgba(0,0,0,0.5)', border: `2px solid ${colors.accent}` }}
              >
                <IoLockClosed className="text-white text-2xl" />
              </div>
              <button
                onClick={handleSubscribeClick}
                className="px-7 py-2.5 font-bold font-cairo text-base text-white rounded-xl transition-all active:scale-95 shadow-lg"
                style={{
                  background: colors.accent,
                  boxShadow: `0 4px 0 0 ${colors.shadow}, 0 0 24px ${colors.glow}`,
                }}
              >
                {course.price === 0 ? (
                  'انضم مجاناً'
                ) : (
                  `اشترك الآن — ${course.price} ج.م`
                )}
              </button>
              <p className="text-white/70 font-cairo text-xs">
                {course.price === 0 ? 'متاح مجاناً لمشتركي الكورس الشامل' : 'ادفع مرة واحدة، تعلم إلى الأبد'}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* ======================== CONTENT ======================== */}
      <div className="max-w-4xl mx-auto px-4 mt-8">

        {/* If subscribed: show tabs + tab content */}
        {isSubscribed && (
          <>
            {/* Features strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: IoCheckmarkCircle, color: 'text-green-500', label: 'شهادة إتمام' },
                { icon: IoPlayCircle, color: 'text-blue-500', label: 'فيديوهات HD' },
                { icon: IoPeople, color: 'text-purple-500', label: 'دعم مباشر' },
                { icon: IoSchool, color: 'text-orange-500', label: 'اختبارات' },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
                  <f.icon className={`text-2xl ${f.color} flex-shrink-0`} />
                  <span className="font-cairo font-bold text-gray-700 text-sm">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-cairo whitespace-nowrap transition-all text-sm flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={activeTab === tab.id ? { background: colors.accent } : {}}
                >
                  <tab.icon className="text-base" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'videos' && <VideoSection playlistId={course.playlistId} />}
              {activeTab === 'exams' && <ExamSection courseId={course.id} courseName={course.title} />}
            </div>
          </>
        )}

        {/* Not subscribed: show blurred preview info */}
        {!isSubscribed && !checking && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: IoCheckmarkCircle, label: 'شهادة معتمدة', desc: 'بعد إتمام الكورس', color: '#10b981' },
              { icon: IoPlayCircle, label: 'فيديوهات عالية الجودة', desc: `${course.examCount * 5}+ درس فيديو`, color: colors.accent },
              { icon: IoPeople, label: 'مدرسون متخصصون', desc: `${course.teacherCount} مدرسين متاحين`, color: '#8b5cf6' },
            ].map((f, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: f.color + '20' }}>
                  <f.icon className="text-xl" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="font-bold font-cairo text-gray-900 text-sm">{f.label}</p>
                  <p className="text-gray-500 font-cairo text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================== COMMENTS ======================== */}
        <div className="mt-10 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background: colors.accent }} />
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Aref Ruqaa, serif' }}>التعليقات والأسئلة</h3>
            <span className="text-xs text-gray-400 mr-auto">يرد المدرسون عادةً خلال ساعات</span>
          </div>
          <CommentsSection courseId={course.id} isSubscribed={isSubscribed} />
        </div>
      </div>

      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        course={course}
        balance={user?.walletBalance || 0}
        onPurchase={async (id) => {
          const success = await subscribeToCourse(id);
          if (success) {
            setPurchaseModalOpen(false);
            setIsSubscribed(true);
          }
        }}
      />
    </main>
  );
}
