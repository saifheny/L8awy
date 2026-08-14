'use client';

import type { Course } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

const getGradient = (lang: string) => {
  switch (lang) {
    case 'en': return 'from-blue-600 via-blue-800 to-purple-900';
    case 'de': return 'from-yellow-600 via-green-800 to-green-900';
    case 'tr': return 'from-red-600 via-red-800 to-red-900';
    default: return 'from-blue-900 to-purple-900';
  }
};

export default function CourseHeader({ course }: { course: Course }) {
  return (
    <div className="relative w-full h-80 overflow-hidden flex items-end">
      <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(course.language)} opacity-80`} />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 glass opacity-30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <span className="inline-block px-4 py-1 glass rounded-full text-sm mb-4">
            المستوى: {course.level || 'مبتدئ'}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {course.title}
          </h1>
          <div className="flex gap-4 text-gray-200">
            <span className="glass px-4 py-2 rounded-lg">السعر: {course.price} جنيه</span>
            <span className="glass px-4 py-2 rounded-lg">المدة: {course.durationMonths} شهور</span>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col items-center min-w-[200px]">
          <div className="text-sm text-gray-300 mb-3">المعلمون</div>
          <div className="flex -space-x-4 space-x-reverse mb-3">
            <Avatar name="أحمد" color="#3b82f6" />
            <Avatar name="خالد" color="#8b5cf6" />
            <Avatar name="محمد" color="#ec4899" />
          </div>
          <div className="w-full flex justify-between text-xs text-gray-400 mt-2 border-t border-white/10 pt-2">
            <span>عدد الامتحانات: {course.examCount}</span>
            <span>عدد المعلمين: {course.teacherCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
