'use client';

import { motion } from 'framer-motion';
import { IoLockClosed } from 'react-icons/io5';
import GlassCard from '@/components/ui/GlassCard';
import { Course } from '@/lib/types';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
  isLocked: boolean;
  onClick: () => void;
}

import { useState, useEffect } from 'react';
import { fetchPlaylistVideos } from '@/lib/youtube';

export default function CourseCard({ course, isLocked, onClick }: CourseCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    async function loadThumbnail() {
      const videos = await fetchPlaylistVideos(course.playlistId);
      if (videos.length > 0 && videos[0].thumbnail) {
        setThumbnailUrl(videos[0].thumbnail);
      }
    }
    loadThumbnail();
  }, [course.playlistId]);

  const isComprehensive = course.level === 'شامل';
  
  // Dynamic colors based on language
  const colorMap: Record<string, { base: string, shadow: string, hoverShadow: string, border: string }> = {
    'en': { base: '#3b82f6', shadow: '#93c5fd', hoverShadow: '#60a5fa', border: 'border-blue-400' },
    'de': { base: '#eab308', shadow: '#fde047', hoverShadow: '#facc15', border: 'border-yellow-400' },
    'tr': { base: '#ef4444', shadow: '#fca5a5', hoverShadow: '#f87171', border: 'border-red-400' }
  };
  
  const colors = colorMap[course.language] || colorMap['en'];
  
  const CardContent = () => (
    <div 
      className={`relative overflow-hidden group cursor-pointer h-full flex flex-col justify-between transition-all duration-300 bg-white rounded-2xl active:translate-y-2 active:translate-x-1 active:shadow-none ${isComprehensive ? `border-4 ${colors.border}` : 'border-2 border-gray-200'}`}
      style={{
        boxShadow: isComprehensive 
          ? `8px 8px 0 0 ${colors.shadow}` 
          : `4px 4px 0 0 ${colors.shadow}`
      }}
    >
      <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center overflow-hidden p-3 border-b border-gray-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={course.title} className={`w-full h-full object-cover rounded-2xl shadow-sm transition-all duration-500 ${isLocked ? 'blur-[4px] scale-105' : 'group-hover:scale-105'}`} />
        ) : (
          <div className="skeleton-shimmer w-full h-full rounded-2xl" />
        )}
        
        <div className={`absolute top-5 right-5 backdrop-blur-md px-4 py-1 rounded-full text-white text-sm font-cairo font-black shadow-md ${isComprehensive ? `border` : 'bg-gray-800/80 border border-gray-600'}`}
             style={isComprehensive ? { backgroundColor: colors.base, borderColor: colors.hoverShadow } : {}}>
          {course.level}
        </div>

        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] m-3 rounded-2xl">
            <IoLockClosed className="text-white text-4xl drop-shadow-lg mb-1" />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col bg-white">
        <h3 className={`font-aref font-bold text-gray-900 mb-3 text-right dir-rtl leading-relaxed ${isComprehensive ? 'text-3xl' : 'text-2xl'}`} style={isComprehensive ? { color: colors.base } : {}}>{course.title}</h3>
        <div className="mt-auto flex justify-between items-center text-sm font-cairo text-gray-700 dir-rtl font-bold mb-4">
          <span className="bg-transparent border border-gray-200 px-3 py-1.5 rounded-lg">👨‍🏫 {course.teacherCount} مدرس</span>
          <span className="bg-transparent border border-gray-200 px-3 py-1.5 rounded-lg">📝 {course.examCount} امتحان</span>
        </div>
        <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center dir-rtl">
          {!isLocked ? (
            <span className="text-xl font-black text-white px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors w-full text-center" style={{ backgroundColor: colors.base }}>
              دخول الكورس
            </span>
          ) : (
            <span className={`text-xl font-black ${course.price === 0 ? 'text-green-600 bg-transparent px-3 py-1 border border-green-200 rounded-lg' : 'text-white px-4 py-1 rounded-lg border flex items-center gap-2'}`} style={course.price !== 0 ? { backgroundColor: colors.base, borderColor: colors.hoverShadow } : {}}>
              {course.price === 0 ? (
                'مجانًا (تابع للشامل)'
              ) : (
                <>
                  <span>{course.price} جنيه</span>
                  {course.originalPrice && (
                    <span className="line-through text-white/70 text-sm font-medium">بدلاً من {course.originalPrice}</span>
                  )}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={isLocked ? onClick : undefined}
      className="h-full"
    >
      {isLocked ? (
        <CardContent />
      ) : (
        <Link href={`/course/${course.id}`} className="block h-full">
          <CardContent />
        </Link>
      )}
    </motion.div>
  );
}
