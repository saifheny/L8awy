'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoArrowBack, IoLogOutOutline, IoCopyOutline, IoCheckmarkCircle, IoPersonOutline, IoWalletOutline, IoPerson } from 'react-icons/io5';
import { courses } from '@/data/courses';
import CourseCard from '@/components/home/CourseCard';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isSubscribedToCourse } = useAuth();
  const [copied, setCopied] = useState(false);
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/register');
      return;
    }

    async function loadSubs() {
      const subs = [];
      for (const c of courses) {
        if (await isSubscribedToCourse(c.id)) {
          subs.push(c);
        }
      }
      setSubscribedCourses(subs);
    }
    loadSubs();
  }, [user, router, isSubscribedToCourse]);

  if (!user) return null;

  const copyCode = () => {
    if (user.loginCode) {
      navigator.clipboard.writeText(user.loginCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-transparent dir-rtl pb-20 pt-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between mb-8">
        <h1 className="text-2xl font-aref font-bold text-gray-900 flex items-center gap-2">
          <IoPersonOutline className="text-blue-600" />
          الملف الشخصي
        </h1>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors shadow-sm"
        >
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Profile Info Card (No container background now) */}
        <div className="p-4 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-300 via-green-400 to-blue-500 shadow-lg border-4 border-white flex-shrink-0 flex items-center justify-center">
            <IoPerson className="text-white text-7xl" />
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl font-aref font-bold text-gray-900 mb-2">{user.displayName}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-cairo font-bold text-gray-600 mb-6 mt-4">
              {user.phone && <span className="bg-gray-100 px-4 py-2 rounded-xl text-lg">{user.phone}</span>}
              <button 
                onClick={() => router.push('/wallet')}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-lg hover:bg-green-200 transition-colors shadow-sm cursor-pointer border border-green-200"
              >
                الرصيد: {user.walletBalance} ج.م
              </button>
            </div>
            
            {user.loginCode && (
              <div className="flex items-center justify-center md:justify-start gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 inline-flex">
                <span className="text-gray-500 text-sm">كود الدخول:</span>
                <span className="font-black text-gray-900 tracking-widest dir-ltr">{user.loginCode}</span>
                <button 
                  onClick={copyCode}
                  className="ml-2 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-blue-600 transition-colors"
                >
                  {copied ? <IoCheckmarkCircle size={20} className="text-green-500" /> : <IoCopyOutline size={20} />}
                </button>
              </div>
            )}
          </div>

          {/* Decorative floating image below profile info */}
          <div className="flex justify-center mt-2 mb-2">
            <img
              src="https://i.postimg.cc/KcwyMyx5/image-(1).webp"
              alt=""
              className="w-48 md:w-56 object-contain select-none drop-shadow-lg"
              draggable={false}
            />
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
          >
            <IoLogOutOutline size={24} />
            تسجيل الخروج
          </button>
        </div>

        {/* Subscribed Courses */}
        <div>
          <h3 className="text-2xl font-aref font-bold text-gray-900 mb-6 border-r-4 border-purple-500 pr-3 mt-12">
            كورساتي المشترك بها
          </h3>
          
          {subscribedCourses.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-gray-100">
              <p className="text-gray-500 font-bold font-cairo text-lg">لم تشترك في أي كورس بعد.</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                تصفح الكورسات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {subscribedCourses.map(c => (
                <CourseCard 
                  key={c.id} 
                  course={c} 
                  isLocked={false} 
                  onClick={() => router.push(`/course/${c.id}`)} 
                />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
