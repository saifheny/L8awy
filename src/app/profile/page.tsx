'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoArrowBack, IoLogOutOutline, IoCopyOutline, IoCheckmarkCircle, IoPersonOutline, IoWalletOutline, IoPerson, IoBookOutline, IoTrophyOutline } from 'react-icons/io5';
import CourseCard from '@/components/home/CourseCard';
import { usePlatformCourses } from '@/hooks/usePlatformContent';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBackNavigation } from '@/hooks/useBackNavigation';

export default function ProfilePage() {
  const router = useRouter();
  const goBack = useBackNavigation();
  const { user, logout, isSubscribedToCourse } = useAuth();
  const [copied, setCopied] = useState(false);
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nextName, setNextName] = useState('');
  const [nameNotice, setNameNotice] = useState('');
  const { courses } = usePlatformCourses();

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
  }, [user, router, isSubscribedToCourse, courses]);

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

  const saveName = async () => {
    const name = nextName.trim();
    if (!name) return setNameNotice('اكتب الاسم أولًا.');
    const stored = (user as any).lastDisplayNameChange;
    const lastChange = stored?.toMillis ? stored.toMillis() : Number(stored || 0);
    const wait = 7 * 24 * 60 * 60 * 1000;
    if (lastChange && Date.now() - lastChange < wait) return setNameNotice('يمكن تغيير الاسم مرة واحدة كل 7 أيام.');
    await updateDoc(doc(db, 'users', user.uid), { displayName: name, lastDisplayNameChange: Date.now() });
    setNameNotice('تم حفظ الاسم. حدّث الصفحة ليظهر في كل أجزاء الحساب.');
    setEditingName(false);
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
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors shadow-sm"
        >
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white p-6 md:p-8 shadow-xl">
          <div className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-blue-400/20" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-300 to-violet-500 shadow-2xl border-4 border-white/20 flex shrink-0 items-center justify-center"><IoPerson className="text-white text-6xl" /></div>
            <div className="flex-1 text-center md:text-right"><p className="font-cairo text-blue-200 text-sm">مرحبًا بك في لغوي</p><h2 className="text-3xl font-aref font-bold mt-1">{user.displayName}</h2><p dir="ltr" className="font-cairo text-sm text-white/70 mt-2">{user.phone}</p><button onClick={() => { setEditingName((value) => !value); setNextName(user.displayName); setNameNotice(''); }} className="mt-3 text-xs font-cairo font-bold text-blue-100 underline underline-offset-4">تعديل الاسم</button>{editingName && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={nextName} onChange={(event) => setNextName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-cairo text-sm text-white outline-none placeholder:text-white/50" placeholder="الاسم الجديد" /><button onClick={saveName} className="rounded-xl bg-white px-4 py-2 font-cairo text-sm font-bold text-slate-900">حفظ</button></div>}{nameNotice && <p className="mt-2 font-cairo text-xs text-amber-200">{nameNotice}</p>}<div className="flex flex-wrap gap-2 justify-center md:justify-start mt-5"><button onClick={() => router.push('/wallet')} className="bg-white text-slate-900 rounded-xl px-4 py-2 font-cairo font-bold text-sm flex items-center gap-2"><IoWalletOutline className="text-emerald-600" />{user.walletBalance || 0} ج.م</button><span className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 font-cairo text-sm flex items-center gap-2"><IoBookOutline />{subscribedCourses.length} كورساتي</span><span className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 font-cairo text-sm flex items-center gap-2"><IoTrophyOutline />ابدأ إنجازًا جديدًا</span></div></div>
            <button onClick={handleLogout} className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-red-500 border border-white/15 text-white font-cairo text-sm rounded-xl transition-colors"><IoLogOutOutline size={20} />تسجيل الخروج</button>
          </div>
          {user.loginCode && <div className="relative mt-7 rounded-2xl bg-black/20 border border-white/10 p-3 flex flex-wrap items-center gap-3"><span className="font-cairo text-sm text-white/70">كود دخولك:</span><strong className="font-mono tracking-widest text-white" dir="ltr">{user.loginCode}</strong><button onClick={copyCode} className="mr-auto bg-white/10 hover:bg-white/20 rounded-lg p-2">{copied ? <IoCheckmarkCircle className="text-emerald-300" /> : <IoCopyOutline />}</button></div>}
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <button onClick={() => router.push('/wallet')} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 text-right transition-transform active:scale-[.98]">
            <IoWalletOutline className="text-2xl text-emerald-600" /><p className="mt-3 font-cairo text-xl font-black text-slate-900">{user.walletBalance || 0} ج.م</p><p className="text-xs font-cairo text-slate-500">رصيد المحفظة</p>
          </button>
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4">
            <IoBookOutline className="text-2xl text-violet-600" /><p className="mt-3 font-cairo text-xl font-black text-slate-900">{subscribedCourses.length}</p><p className="text-xs font-cairo text-slate-500">كورساتي النشطة</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 md:col-span-1">
            <IoTrophyOutline className="text-2xl text-amber-600" /><p className="mt-3 font-cairo text-sm font-black text-slate-900">رحلتك التعليمية</p><p className="text-xs font-cairo text-slate-500">ابدأ درسًا جديدًا اليوم</p>
          </div>
        </section>

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
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
