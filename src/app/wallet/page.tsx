'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { IoArrowBack, IoWalletOutline, IoCheckmarkCircle, IoTimeOutline, IoCloseCircleOutline, IoCopyOutline, IoShareSocialOutline, IoPersonAddOutline, IoGiftOutline } from 'react-icons/io5';
import type { WalletTransaction } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromotionSettings } from '@/hooks/usePlatformContent';

export default function WalletPage() {
  const router = useRouter();
  const { user, chargeWallet, loading: authLoading } = useAuth();
  
  const [amount, setAmount] = useState<number | ''>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [activeWalletTab, setActiveWalletTab] = useState<'charge' | 'referral'>('charge');
  const promotion = usePromotionSettings();

  const VODAFONE_NUMBER = '01044824232';

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    if (!user) {
      router.push('/register');
      return;
    }
    fetchTransactions();
  }, [user, router]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const qs = await getDocs(q);
      const data: WalletTransaction[] = [];
      qs.forEach((d) => {
        data.push({ id: d.id, ...d.data() } as WalletTransaction);
      });
      data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  // Listen to referrals in real-time
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'referrals'), where('referrerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((d) => {
        data.push({ id: d.id, ...d.data() });
      });
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setReferrals(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCharge = async () => {
    if (amount && receiptImage) {
      setIsLoading(true);
      try {
        await chargeWallet(Number(amount), receiptImage);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setAmount('');
          setReceiptImage('');
          fetchTransactions();
        }, 3000);
      } catch (err) {
        console.error("Charge failed", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(VODAFONE_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = typeof window !== 'undefined' && user ? `${window.location.origin}?ref=${(user as any).referralCode}` : '';
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'visited': return { text: 'زار المنصة', color: 'bg-yellow-100 text-yellow-700', icon: '👀' };
      case 'registered': return { text: 'سجل حساب', color: 'bg-blue-100 text-blue-700', icon: '✏️' };
      case 'subscribed': return { text: `اشترك! (+${promotion.referralReward} ج.م)`, color: 'bg-green-100 text-green-700', icon: '🎉' };
      default: return { text: 'غير معروف', color: 'bg-gray-100 text-gray-700', icon: '❓' };
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent dir-rtl pb-20">
      {/* Header (No borders) */}
      <div className="bg-transparent sticky top-0 z-30 pt-4">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-cairo font-bold text-gray-900 flex items-center gap-2">
            <IoWalletOutline className="text-blue-600 text-2xl" />
            محفظتي
          </h1>
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors shadow-sm"
          >
            <IoArrowBack size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          <p className="text-lg font-cairo text-white/90 font-bold relative z-10">الرصيد المتاح</p>
          <h2 className="text-5xl font-black font-cairo text-white mt-2 relative z-10 drop-shadow-md">
            {user.walletBalance || 0} <span className="text-2xl font-bold">ج.م</span>
          </h2>
        </div>

        {/* Wallet Tabs */}
        <div className="flex gap-3 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveWalletTab('charge')}
            className={`flex-1 py-3 rounded-xl font-bold font-cairo text-sm transition-all flex items-center justify-center gap-2 ${activeWalletTab === 'charge' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <IoWalletOutline size={18} />
            شحن المحفظة
          </button>
          <button
            onClick={() => setActiveWalletTab('referral')}
            className={`flex-1 py-3 rounded-xl font-bold font-cairo text-sm transition-all flex items-center justify-center gap-2 ${activeWalletTab === 'referral' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <IoPersonAddOutline size={18} />
            ادعُ أصدقاءك
            {referrals.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{referrals.length}</span>
            )}
          </button>
        </div>

        {activeWalletTab === 'charge' ? (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Charge Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative">
            <h3 className="text-2xl font-aref font-bold text-gray-900 mb-6 border-r-4 border-blue-500 pr-3">
              إضافة رصيد للمحفظة
            </h3>
            
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <IoCheckmarkCircle className="text-7xl text-green-500 mb-4" />
                <p className="text-xl font-bold text-gray-900">تم إرسال طلب الشحن بنجاح!</p>
                <p className="text-gray-500 mt-2">جاري مراجعة الطلب من الإدارة لإضافة الرصيد.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-800 mb-2">رقم فودافون كاش لتحويل المبلغ:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white p-3 rounded-lg text-center font-black text-2xl tracking-wider text-gray-900 dir-ltr border border-blue-200">
                      {VODAFONE_NUMBER}
                    </div>
                    <button 
                      onClick={copyNumber}
                      className="h-full px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors"
                      title="نسخ الرقم"
                    >
                      {copied ? <IoCheckmarkCircle size={24} /> : <IoCopyOutline size={24} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-700">اكتب المبلغ الذي قمت بتحويله:</p>
                    <div className="flex gap-2">
                      <button onClick={() => setAmount(100)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors">100 ج.م</button>
                      <button onClick={() => setAmount(200)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors">200 ج.م</button>
                      <button onClick={() => setAmount(500)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors">500 ج.م</button>
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="مبلغ التحويل (مثال: 150)"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || '')}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-bold focus:outline-none focus:border-blue-500 text-right font-cairo dir-rtl"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">أرفق لقطة الشاشة (Screenshot) للتحويل:</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      {receiptImage ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                          <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                            تغيير الصورة
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <IoCheckmarkCircle className="text-3xl" />
                          </div>
                          <span className="text-blue-600 font-bold">اضغط هنا لرفع الصورة</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCharge}
                  disabled={!amount || !receiptImage || isLoading}
                  className="w-full py-4 font-bold font-cairo text-xl bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all"
                >
                  {isLoading ? 'جاري الإرسال...' : 'تأكيد إرسال الطلب'}
                </button>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-aref font-bold text-gray-900 mb-6 border-r-4 border-purple-500 pr-3">
              سجل التحويلات
            </h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold bg-gray-50 rounded-xl border border-gray-100">
                لا توجد تحويلات سابقة
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm
                        ${tx.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          tx.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}
                      `}>
                        {tx.status === 'approved' && <IoCheckmarkCircle size={24} />}
                        {tx.status === 'rejected' && <IoCloseCircleOutline size={24} />}
                        {tx.status === 'pending' && <IoTimeOutline size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{tx.amount} ج.م</p>
                        <p className="text-sm font-bold text-gray-500">
                          {(tx as any).type === 'referral_reward' ? `مكافأة دعوة: ${(tx as any).title?.replace('مكافأة دعوة: ', '')}` :
                           tx.status === 'approved' ? 'تمت الإضافة' : 
                           tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        ) : (
          /* ═══════════ REFERRAL TAB ═══════════ */
          <div className="space-y-6">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-lg"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
              <div className="relative z-10">
                <IoGiftOutline className="text-6xl mx-auto mb-4 drop-shadow-md" />
                <h2 className="text-2xl font-black font-cairo mb-2">ادعُ أصدقاءك واربح!</h2>
                <p className="text-white/90 font-cairo text-lg mb-1">لكل صديق يشترك عن طريق رابطك</p>
                <p className="text-4xl font-black mt-2 mb-4">{promotion.referralReward} <span className="text-xl">جنيه مصري</span></p>
                <p className="text-sm text-white/80 font-cairo">المبلغ يُضاف تلقائياً لمحفظتك فور اشتراك صديقك</p>
              </div>
            </motion.div>

            {/* Referral Link Box */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold font-cairo text-gray-900 mb-4 flex items-center gap-2">
                <IoShareSocialOutline className="text-blue-600" />
                رابط الدعوة الخاص بك
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 p-3.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 truncate dir-ltr text-left">
                  {referralLink}
                </div>
                <button 
                  onClick={copyReferralLink}
                  className={`px-5 py-3.5 rounded-xl font-bold font-cairo text-sm transition-all flex items-center gap-2 shrink-0 ${
                    referralCopied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {referralCopied ? (
                    <><IoCheckmarkCircle size={18} /> تم النسخ!</>
                  ) : (
                    <><IoCopyOutline size={18} /> نسخ الرابط</>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 font-cairo mt-3 text-center">
                شارك هذا الرابط مع أصدقائك عبر واتساب أو أي وسيلة تواصل
              </p>
            </div>

            {/* Referral Tracking */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold font-cairo text-gray-900 mb-4 flex items-center gap-2">
                <IoPersonAddOutline className="text-purple-600" />
                متابعة دعواتك
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-bold mr-auto">
                  {referrals.length} دعوة
                </span>
              </h3>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                  <p className="text-2xl font-black text-yellow-600">{referrals.filter(r => r.status === 'visited').length}</p>
                  <p className="text-xs font-bold text-yellow-700 font-cairo">زاروا المنصة</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <p className="text-2xl font-black text-blue-600">{referrals.filter(r => r.status === 'registered').length}</p>
                  <p className="text-xs font-bold text-blue-700 font-cairo">سجلوا حساب</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <p className="text-2xl font-black text-green-600">{referrals.filter(r => r.status === 'subscribed').length}</p>
                  <p className="text-xs font-bold text-green-700 font-cairo">اشتركوا</p>
                </div>
              </div>

              {referrals.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-bold bg-gray-50 rounded-xl border border-gray-100 font-cairo">
                  <IoPersonAddOutline className="text-4xl mx-auto mb-3 text-gray-300" />
                  لم تقم بدعوة أحد بعد.
                  <br />
                  <span className="text-sm text-gray-400">شارك رابطك مع أصدقائك لتبدأ الربح!</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {referrals.map((ref, idx) => {
                      const statusInfo = getStatusInfo(ref.status);
                      return (
                        <motion.div
                          key={ref.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{statusInfo.icon}</span>
                            <div>
                              <p className="font-bold text-gray-900 font-cairo text-sm">{ref.visitorName}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>
                          {ref.status === 'subscribed' && (
                            <span className="text-green-600 font-black text-sm">+25 ج.م ✓</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
