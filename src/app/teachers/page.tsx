'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoArrowBack, IoPeopleOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

// Dummy teachers data (real-like names, age, language)
export const teachersData = [
  { id: 't1', name: 'أحمد محمود سليمان', age: 29, lang: 'en', bio: 'خبير تدريس تفاعلي بخبرة 5 سنوات' },
  { id: 't2', name: 'سارة مصطفى أحمد', age: 26, lang: 'en', bio: 'متخصصة في تأسيس المبتدئين والمحادثة' },
  { id: 't3', name: 'محمد عبد الرحمن', age: 32, lang: 'de', bio: 'مدرس معتمد وممتحن دولي لمعهد جوته' },
  { id: 't4', name: 'ياسمين طارق خليل', age: 28, lang: 'tr', bio: 'خبيرة في المحادثة والتخاطب بالتركية' },
  { id: 't5', name: 'خالد إبراهيم يوسف', age: 30, lang: 'en', bio: 'متخصص في الإعداد لاختبارات الآيلتس' },
];

export default function TeachersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState(teachersData);

  useEffect(() => {
    if (!user) {
      router.push('/register');
      return;
    }
    // Filter teachers based on user's selected language
    if (user.selectedLanguage) {
      const map: Record<string, string> = { 'اللغة الإنجليزية': 'en', 'اللغة الألمانية': 'de', 'اللغة التركية': 'tr' };
      const langCode = map[user.selectedLanguage] || 'en';
      setTeachers(teachersData.filter(t => t.lang === langCode));
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent dir-rtl pb-20 pt-4">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between mb-8">
        <h1 className="text-2xl font-aref font-bold text-gray-900 flex items-center gap-2">
          <IoPeopleOutline className="text-blue-600" />
          مدرسين {user.selectedLanguage}
        </h1>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors shadow-sm"
        >
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {teachers.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm text-gray-500 font-bold font-cairo">
            جاري تعيين مدرسين لهذه اللغة، شكراً لتفهمك.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teachers.map((teacher, idx) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(`/chat/${teacher.id}`)}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-50 text-blue-600 mb-4 flex items-center justify-center border-2 border-blue-100">
                    <IoPeopleOutline className="text-4xl" />
                  </div>
                  <h3 className="text-lg font-bold font-cairo text-gray-900 text-center mb-1">{teacher.name}</h3>
                  <p className="text-xs text-gray-500 font-cairo text-center mb-2 leading-relaxed px-2 h-8">{teacher.bio}</p>
                  <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold mb-4 font-cairo">
                    السن: {teacher.age} سنة
                  </span>
                  
                  <div className="w-full flex items-center justify-center gap-2 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 py-2.5 rounded-xl font-bold font-cairo transition-colors text-sm">
                    <IoChatbubbleEllipsesOutline size={18} />
                    تحدث الآن
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
