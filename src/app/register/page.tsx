'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoPerson, IoCall, IoLanguage, IoMaleFemale, IoCamera, IoArrowBack } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, login, user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginCodeInput, setLoginCodeInput] = useState('');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [language, setLanguage] = useState('الإنجليزية');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const langParam = searchParams?.get('lang');
    if (langParam === 'en') setLanguage('الإنجليزية');
    if (langParam === 'de') setLanguage('الألمانية');
    if (langParam === 'tr') setLanguage('التركية');
  }, [searchParams]);

  useEffect(() => {
    const reveal = window.setTimeout(() => setShowQuickGuide(true), 250);
    const dismiss = window.setTimeout(() => setShowQuickGuide(false), 7000);
    return () => { window.clearTimeout(reveal); window.clearTimeout(dismiss); };
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin) return;
    const savedCode = localStorage.getItem('loghawy_saved_login_code');
    if (savedCode) { setLoginCodeInput(savedCode); setRememberMe(true); }
  }, [isLogin]);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(loginCodeInput);
        if (rememberMe) localStorage.setItem('loghawy_saved_login_code', loginCodeInput.trim());
        else localStorage.removeItem('loghawy_saved_login_code');
        router.push('/');
      } else {
        // Validate Egyptian Phone Number
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
          setError('يجب إدخال رقم هاتف مصري صحيح مكون من 11 رقم.');
          setIsLoading(false);
          return;
        }

        // Validate Triple Name
        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length < 3) {
          setError('يرجى إدخال الاسم الثلاثي كاملاً.');
          setIsLoading(false);
          return;
        }

        const code = await register(name, phone, gender, language);
        setGeneratedCode(code);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء العملية. تأكد من صحة البيانات وحاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dir-rtl">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-blue-600 to-purple-600 -z-0" />

          <div className="relative z-10">
            <img src="/L8awy/brand/auth-mark.png" alt="تسجيل آمن" className="w-20 h-20 mx-auto mb-5 mt-4 object-contain drop-shadow-lg" />

            <h2 className="text-2xl font-bold font-cairo text-gray-900 mb-2">تم إنشاء حسابك بنجاح!</h2>
            <p className="text-red-600 font-bold mb-6 flex items-center justify-center gap-2 font-cairo text-sm">
              <IoCamera className="text-xl" />
              احتفظ بهذا الكود للدخول لاحقاً
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl mb-6 border-2 border-dashed border-gray-300">
              <span className="text-sm text-gray-500 block mb-2 font-bold font-cairo">كود الدخول الخاص بك</span>
              <span className="text-4xl font-black text-blue-600 tracking-widest block" dir="ltr">{generatedCode}</span>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold font-cairo text-lg shadow-[0_5px_0_0_#1d4ed8] hover:bg-blue-500 active:translate-y-1 active:shadow-none transition-all"
            >
              أخذت لقطة الشاشة، لنبدأ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 dir-rtl relative bg-transparent">
      {/* Back button top-left */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-gray-200/50 hover:bg-gray-200 border border-gray-300/50 flex items-center justify-center transition-all"
      >
        <IoArrowBack className="text-gray-700 text-2xl" />
      </button>

      <div className="w-full max-w-md mt-16 md:mt-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <img src="/L8awy/brand/auth-mark.png" alt="تسجيل الدخول أو إنشاء حساب" className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-lg" />
          <h1 className="text-2xl font-bold font-cairo text-gray-900 mb-1">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-gray-500 font-cairo text-sm">
            {isLogin
              ? 'أدخل كود الطالب الخاص بك للمتابعة'
              : 'أدخل بياناتك للحصول على كود الدخول'}
          </p>
        </div>

        <AnimatePresence>
          {showQuickGuide && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-4 font-cairo shadow-sm">
            <p className="font-bold text-slate-900">إرشادات سريعة</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">{isLogin ? 'اكتب كود الطالب الذي حفظته عند إنشاء الحساب، ثم اضغط تسجيل الدخول.' : 'اكتب اسمك الثلاثي، رقم موبايلك، ثم اختر اللغة التي تريد أن تبدأ بها.'}</p>
            <button onClick={() => setShowQuickGuide(false)} className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-blue-700 shadow-sm">تخطي الإرشادات</button>
          </motion.div>}
        </AnimatePresence>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-5 font-bold font-cairo border border-red-100 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait"><motion.form key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <IoPerson className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={loginCodeInput}
                onChange={e => setLoginCodeInput(e.target.value)}
                placeholder="كود الطالب (مثال: STU-123456)"
                className="w-full bg-gray-50 border-2 border-gray-200 py-4 pl-4 pr-11 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-900 font-bold font-cairo transition-all text-left shadow-sm"
                dir="ltr"
              />
              <label className="mt-3 flex cursor-pointer items-center gap-2 font-cairo text-xs text-gray-600"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-blue-600" />تذكّرني على هذا الجهاز</label>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <IoPerson className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="الاسم الثلاثي"
                  className="w-full bg-gray-50 border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-900 font-bold font-cairo transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <IoCall className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                  className="w-full bg-gray-50 border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-900 font-bold font-cairo transition-all text-right"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <IoMaleFemale className="text-gray-400" />
                  </div>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'ذكر' | 'أنثى')}
                    className="w-full bg-gray-50 border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-900 font-bold font-cairo transition-all appearance-none cursor-pointer"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <IoLanguage className="text-gray-400" />
                  </div>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 p-4 pr-12 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-900 font-bold font-cairo transition-all appearance-none cursor-pointer"
                  >
                    <option value="الإنجليزية">الإنجليزية</option>
                    <option value="الألمانية">الألمانية</option>
                    <option value="التركية">التركية</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold font-cairo text-base mt-4 transition-all disabled:opacity-50 shadow-[0_4px_0_0_#1d4ed8] hover:bg-blue-500 active:translate-y-1 active:shadow-none"
          >
            {isLoading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
          </button>
        </motion.form></AnimatePresence>

        <div className="mt-6 text-center border-t border-gray-100 pt-5">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 hover:text-blue-800 transition-colors font-bold font-cairo text-sm"
          >
            {isLogin ? 'ليس لديك كود؟ أنشئ حسابك الآن' : 'لديك كود بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
