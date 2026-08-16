'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courses as builtInCourses } from '@/data/courses';
import type { Course } from '@/lib/types';
import ExamPortal from '@/components/course/ExamPortal';
import ExamSection from '@/components/course/ExamSection';
import { IoArrowBack, IoDocumentText } from 'react-icons/io5';

export default function ExamsPage() { return <Suspense fallback={<div className="min-h-screen p-8 text-center font-cairo">جارٍ تحميل الامتحانات...</div>}><ExamsContent /></Suspense>; }

function ExamsContent() {
  const courseId = useSearchParams().get('courseId') || '';
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => { if (!courseId) return; getDoc(doc(db, 'courses', courseId)).then((item) => setCourse(item.exists() ? ({ id: item.id, ...item.data() } as Course) : builtInCourses.find((builtIn) => builtIn.id === courseId) || null)); }, [courseId]);
  if (!course) return <div className="min-h-screen p-8 text-center font-cairo text-gray-500">جارٍ تحميل الامتحانات...</div>;
  return <main className="min-h-screen dir-rtl bg-slate-50 pb-20"><header className="bg-slate-950 text-white"><div className="max-w-4xl mx-auto p-5 md:p-8"><Link href={`/course?courseId=${encodeURIComponent(course.id)}`} className="w-10 h-10 rounded-full bg-white/10 grid place-items-center"><IoArrowBack /></Link><div className="mt-6 flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-blue-500/20 grid place-items-center"><IoDocumentText size={26} className="text-blue-200" /></span><div><p className="font-cairo text-sm text-blue-200">اختبر تقدمك</p><h1 className="font-aref text-3xl font-bold">امتحانات {course.title}</h1></div></div></div></header><section className="max-w-4xl mx-auto p-4 md:p-8">{course.exams?.length ? <ExamPortal courseId={course.id} exams={course.exams} /> : <ExamSection courseId={course.id} courseName={course.title} />}</section></main>;
}
