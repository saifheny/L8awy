'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courses as builtInCourses } from '@/data/courses';
import type { Course } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import VideoSection from '@/components/course/VideoSection';
import ExamSection from '@/components/course/ExamSection';
import CommentsSection from '@/components/course/CommentsSection';
import PurchaseModal from '@/components/home/PurchaseModal';
import { IoArrowBack, IoDocumentText, IoLockClosed, IoPeople, IoPlayCircle, IoTime } from 'react-icons/io5';

export default function ManagedCoursePage() {
  return <Suspense fallback={<div className="min-h-screen p-10 text-center font-cairo text-gray-500">جارٍ تحميل الكورس...</div>}><ManagedCourseContent /></Suspense>;
}

function ManagedCourseContent() {
  const courseId = useSearchParams().get('courseId') || '';
  const router = useRouter();
  const { user, loading: authLoading, isSubscribedToCourse, subscribeToCourse } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [checking, setChecking] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'exams'>('videos');

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
      <section className="relative min-h-[360px] overflow-hidden bg-gray-900 flex items-end">
        {cover && <img src={cover} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-transparent" />
        <Link href="/" className="absolute top-6 left-6 z-10 w-11 h-11 rounded-full bg-white/15 border border-white/30 text-white grid place-items-center"><IoArrowBack size={22} /></Link>
        <div className="relative z-10 max-w-5xl mx-auto w-full px-5 py-10 text-white">
          <span className="inline-flex rounded-full bg-white/15 border border-white/20 px-3 py-1 text-sm font-bold">{course.level}</span>
          <h1 className="font-aref text-4xl md:text-5xl font-bold mt-4">{course.title}</h1>
          <p className="font-cairo max-w-3xl mt-3 text-white/85 leading-7">{course.description}</p>
          <div className="flex flex-wrap gap-4 mt-6 font-cairo text-sm">
            <span className="flex gap-1 items-center"><IoPeople /> {course.teacherCount} مدرس</span>
            <span className="flex gap-1 items-center"><IoDocumentText /> {course.examCount} امتحان</span>
            <span className="flex gap-1 items-center"><IoTime /> {course.durationMonths} أشهر</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {blocked ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center font-cairo text-red-700">هذا الكورس مغلق مؤقتًا من الإدارة.</div>
        ) : !isSubscribed ? (
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center">
            <IoLockClosed className="mx-auto text-4xl text-blue-600 mb-3" />
            <h2 className="font-cairo font-bold text-xl text-gray-900">اشترك لفتح محتوى الكورس</h2>
            <p className="font-cairo text-gray-500 mt-2">السعر: {course.price === 0 ? 'مجاني' : `${course.price} ج.م`}</p>
            <button onClick={openPurchase} className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-cairo font-bold px-7 py-3 rounded-xl">{course.price === 0 ? 'انضم الآن' : 'اشترك الآن'}</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setActiveTab('videos')} className={`font-cairo font-bold px-5 py-3 rounded-xl ${activeTab === 'videos' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}><IoPlayCircle className="inline ml-2" />الفيديوهات</button>
              <button onClick={() => setActiveTab('exams')} className={`font-cairo font-bold px-5 py-3 rounded-xl ${activeTab === 'exams' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}><IoDocumentText className="inline ml-2" />الامتحانات</button>
            </div>
            {activeTab === 'videos' ? <VideoSection playlistId={course.playlistId} /> : <ExamSection courseId={course.id} courseName={course.title} />}
          </>
        )}
        <div className="mt-12"><CommentsSection courseId={course.id} isSubscribed={isSubscribed} /></div>
      </section>
      <PurchaseModal isOpen={purchaseOpen} onClose={() => setPurchaseOpen(false)} course={course} balance={user?.walletBalance || 0} onPurchase={async (id) => { if (await subscribeToCourse(id)) { setPurchaseOpen(false); setIsSubscribed(true); } }} />
    </main>
  );
}
