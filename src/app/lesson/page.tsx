'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, CourseWeek } from '@/lib/types';
import VideoSection from '@/components/course/VideoSection';
import { IoArrowBack, IoDocumentText, IoPlayCircle } from 'react-icons/io5';

export default function LessonPage() { return <Suspense fallback={<div className="min-h-screen p-8 text-center font-cairo">جارٍ تحميل الأسبوع...</div>}><LessonContent /></Suspense>; }

function LessonContent() {
  const params = useSearchParams(); const courseId = params.get('courseId') || ''; const weekId = params.get('weekId') || '';
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => { if (courseId) getDoc(doc(db, 'courses', courseId)).then((item) => { if (item.exists()) setCourse({ id: item.id, ...item.data() } as Course); }); }, [courseId]);
  const week: CourseWeek | undefined = course?.weeks?.find((item) => item.id === weekId);
  if (!course || !week) return <div className="min-h-screen p-8 text-center font-cairo text-gray-500">جارٍ تحميل الأسبوع...</div>;
  return <main className="min-h-screen pb-20 bg-slate-50 dir-rtl"><header className="relative overflow-hidden bg-slate-950 text-white"><div className="absolute inset-0 opacity-30">{(week.image || course.image) && <img src={week.image || course.image} alt="" className="w-full h-full object-cover" />}</div><div className="relative max-w-5xl mx-auto p-5 md:p-9"><Link href={`/course?courseId=${encodeURIComponent(course.id)}`} className="w-10 h-10 rounded-full bg-white/15 grid place-items-center"><IoArrowBack /></Link><div className="mt-7"><p className="font-cairo text-blue-200 text-sm">{course.title}</p><h1 className="font-aref text-4xl font-bold mt-2">{week.title}</h1><p className="font-cairo text-white/80 mt-3 max-w-2xl">{week.description}</p></div></div></header><section className="max-w-5xl mx-auto p-4 md:p-8"><div className="flex items-center justify-between mb-6"><div className="flex gap-2 items-center"><IoPlayCircle className="text-blue-600" size={25} /><h2 className="font-aref text-2xl font-bold">فيديوهات الأسبوع</h2></div><Link href={`/exams?courseId=${encodeURIComponent(course.id)}`} className="font-cairo bg-emerald-600 text-white rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center"><IoDocumentText />الامتحانات</Link></div><VideoSection customVideos={week.videos} /></section></main>;
}
