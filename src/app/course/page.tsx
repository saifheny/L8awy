'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courses as builtInCourses } from '@/data/courses';
import type { Course } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import VideoSection from '@/components/course/VideoSection';
import CommentsSection from '@/components/course/CommentsSection';
import PurchaseModal from '@/components/home/PurchaseModal';
import { IoArrowBack, IoChatbubbles, IoDocumentText, IoLockClosed, IoPeople, IoPlayCircle, IoSchool, IoStar, IoTime } from 'react-icons/io5';
import { useBackNavigation } from '@/hooks/useBackNavigation';

export default function ManagedCoursePage() {
  return <Suspense fallback={<div className="min-h-screen p-10 text-center font-cairo text-gray-500">جارٍ تحميل الكورس...</div>}><ManagedCourseContent /></Suspense>;
}

function ManagedCourseContent() {
  const courseId = useSearchParams().get('courseId') || '';
  const router = useRouter();
  const goBack = useBackNavigation();
  const { user, loading: authLoading, isSubscribedToCourse, subscribeToCourse } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [checking, setChecking] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!courseId) { setChecking(false); return; }
      const managed = await getDoc(doc(db, 'courses', courseId));
      setCourse(managed.exists()
        ? ({ id: managed.id, ...managed.data() } as Course)
        : builtInCourses.find((item) => item.id === courseId) || null);
      setChecking(false);
    };
    load().catch(() => setChecking(false));
  }, [courseId]);

  useEffect(() => {
    if (authLoading || !courseId) return;
    isSubscribedToCourse(courseId).then(setIsSubscribed);
  }, [authLoading, user, courseId, isSubscribedToCourse]);

  if (checking || authLoading) return <div className="min-h-screen p-10 text-center font-cairo text-gray-500">جارٍ تحميل الكورس...</div>;
  if (!course) return <div className="min-h-screen p-10 text-center font-cairo text-gray-500">لم يتم العثور على الكورس.</div>;

  const blocked = course.isOpen === false;
  const cover = course.coverImage || course.image;
  const openPurchase = () => user ? setPurchaseOpen(true) : router.push('/register');

  return (
    <main className="min-h-screen pb-24 dir-rtl">
      <section className="relative mx-3 min-h-[340px] overflow-hidden rounded-b-[2rem] bg-gray-900 flex items-end sm:mx-6 sm:min-h-[360px] sm:rounded-b-[3rem]">
        {cover && <img src={cover} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-transparent" />
        <button onClick={goBack} className="absolute top-6 left-6 z-10 w-11 h-11 rounded-full bg-white/15 border border-white/30 text-white grid place-items-center"><IoArrowBack size={22} /></button>
        <div className="relative z-10 max-w-5xl mx-auto w-full px-5 py-10 text-white">
          <span className="inline-flex rounded-full bg-white/15 border border-white/20 px-3 py-1 text-sm font-bold">{course.level}</span>
          <h1 className="font-aref text-4xl md:text-5xl font-bold mt-4">{course.title}</h1>
          <p className="font-cairo max-w-3xl mt-3 text-white/85 leading-7">{course.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-6 font-cairo text-xs sm:flex sm:flex-wrap sm:gap-4 sm:text-sm">
            <span className="flex gap-1 items-center rounded-xl bg-blue-400/15 border border-blue-200/20 px-2.5 py-2"><IoPeople /> {course.teacherCount} مدرس</span>
            <span className="flex gap-1 items-center rounded-xl bg-amber-300/15 border border-amber-200/20 px-2.5 py-2"><IoDocumentText /> {course.examCount} امتحان</span>
            <span className="flex gap-1 items-center rounded-xl bg-violet-300/15 border border-violet-200/20 px-2.5 py-2"><IoTime /> {course.durationMonths} أشهر</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {blocked ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center font-cairo text-red-700">هذا الكورس مغلق مؤقتًا من الإدارة.</div>
        ) : !isSubscribed ? (
          <>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 text-white shadow-xl p-6 md:p-9">
              <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-white/10" />
              <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
                <div>
                  <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-cairo"><IoStar className="text-yellow-300" /> تجربة تعلّم متكاملة</span>
                  <h2 className="font-aref text-3xl md:text-4xl font-bold mt-4">كل أدوات الكورس جاهزة لك</h2>
                  <p className="font-cairo text-white/85 leading-7 mt-3 max-w-2xl">اشترك مرة واحدة وافتح الفيديوهات والامتحانات وتواصل مع المدرسين واكتب أسئلتك داخل الكورس.</p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5 text-center min-w-44 backdrop-blur-sm"><p className="text-xs font-cairo text-white/70">سعر الاشتراك</p><p className="text-3xl font-black mt-1">{course.price === 0 ? 'مجاني' : `${course.price} ج.م`}</p><button onClick={openPurchase} className="mt-4 w-full bg-white text-blue-700 hover:bg-blue-50 rounded-xl py-3 font-cairo font-bold">{course.price === 0 ? 'انضم الآن' : 'اشترك الآن'}</button></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6 lg:grid-cols-4 lg:gap-4">
              {[
                { icon: IoPlayCircle, title: 'دروس فيديو', text: 'محتوى مرتب داخل الكورس', color: 'text-blue-600 bg-blue-50' },
                { icon: IoDocumentText, title: `${course.examCount} امتحان`, text: 'اختبر مستواك وتابع تقدمك', color: 'text-emerald-600 bg-emerald-50' },
                { icon: IoSchool, title: `${course.teacherCount} مدرس`, text: 'دعم وإجابات على الأسئلة', color: 'text-violet-600 bg-violet-50' },
                { icon: IoChatbubbles, title: 'مجتمع الكورس', text: 'تعليقات وأسئلة الطلاب', color: 'text-orange-600 bg-orange-50' },
              ].map((item) => <div key={item.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm p-3.5 sm:p-5"><div className={`w-10 h-10 rounded-xl grid place-items-center ${item.color}`}><item.icon size={22} /></div><h3 className="font-cairo font-bold text-sm text-gray-900 mt-3 sm:mt-4 sm:text-base">{item.title}</h3><p className="font-cairo text-[11px] text-gray-500 mt-1 leading-5 sm:text-xs">{item.text}</p></div>)}
            </div>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 flex gap-3 items-start"><IoLockClosed className="text-blue-600 mt-0.5 shrink-0" /><p className="font-cairo text-sm text-blue-900 leading-6">المعاينة والتعليقات متاحة لك الآن، أما الفيديوهات والامتحانات وكتابة التعليقات فتُفتح بعد الاشتراك.</p></div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-6"><div><p className="font-cairo text-sm text-gray-500">محتوى الكورس</p><h2 className="font-aref font-bold text-2xl text-gray-900">ابدأ التعلّم الآن</h2></div><button onClick={() => router.push(`/exams?courseId=${encodeURIComponent(course.id)}`)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 font-cairo font-bold flex items-center gap-2"><IoDocumentText />الامتحانات</button></div>
            {course.weeks?.length ? <div className="grid md:grid-cols-2 gap-5">{course.weeks.map((week, index) => <button key={week.id} onClick={() => router.push(`/lesson?courseId=${encodeURIComponent(course.id)}&weekId=${encodeURIComponent(week.id)}`)} className="group overflow-hidden text-right rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-lg transition-all"><div className="h-36 bg-slate-100 relative">{(week.image || course.image) && <img src={week.image || course.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}<span className="absolute top-3 right-3 bg-slate-950/75 text-white rounded-full px-3 py-1 font-cairo text-xs">الأسبوع {index + 1}</span></div><div className="p-5"><h3 className="font-cairo font-bold text-lg">{week.title}</h3><p className="font-cairo text-sm text-gray-500 mt-2 line-clamp-2">{week.description || 'دروس هذا الأسبوع مرتبة لك في صفحة واحدة.'}</p><p className="font-cairo text-blue-600 text-sm font-bold mt-4">{week.videos.length} فيديوهات — افتح الأسبوع</p></div></button>)}</div> : <VideoSection playlistId={course.playlistId} />}
          </>
        )}
        <div className="mt-12"><CommentsSection courseId={course.id} isSubscribed={isSubscribed} /></div>
      </section>
      <PurchaseModal isOpen={purchaseOpen} onClose={() => setPurchaseOpen(false)} course={course} balance={user?.walletBalance || 0} onPurchase={async (id) => { if (await subscribeToCourse(id)) { setPurchaseOpen(false); setIsSubscribed(true); } }} />
    </main>
  );
}
