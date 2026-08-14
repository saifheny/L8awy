'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import GlassButton from '@/components/ui/GlassButton';
import { IoCheckmarkCircle, IoWalletOutline } from 'react-icons/io5';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onCharge: (amount: number, vodafoneNumber: string) => void;
}

export default function WalletModal({ isOpen, onClose, balance, onCharge }: WalletModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app we'd compress it with canvas to stay under Firebase limits, 
        // but for now we take the base64 string directly
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCharge = async () => {
    if (amount && receiptImage) {
      setIsLoading(true);
      try {
        await onCharge(Number(amount), receiptImage);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setAmount('');
          setReceiptImage('');
          onClose();
        }, 3000);
      } catch (err) {
        console.error("Charge failed", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="المحفظة">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center p-8 space-y-4 dir-rtl text-center bg-white rounded-xl"
          >
            <IoCheckmarkCircle className="text-7xl text-green-500 drop-shadow-lg" />
            <p className="text-2xl font-aref text-gray-900 font-bold">تم إرسال طلب الشحن بنجاح!</p>
            <p className="text-gray-500 font-bold">انتظر حتى يتم تفعيل الكورس من قبل المديرين وتحديث رصيدك.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 dir-rtl p-2"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
              <IoWalletOutline className="text-4xl text-white mb-2" />
              <p className="text-lg font-cairo text-white/90 font-bold">رصيدك الحالي</p>
              <h2 className="text-4xl font-bold font-cairo text-white">{balance} <span className="text-xl">ج.م</span></h2>
            </div>

            <div className="space-y-4 bg-white p-4 rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-aref text-gray-900 text-right font-bold">اشحن محفظتك</h3>
              
              <div className="space-y-3">
                
                <div className="flex gap-2 dir-ltr">
                  {[200, 100, 50].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`flex-1 py-2 rounded-xl border-2 font-bold font-cairo transition-all ${amount === preset ? 'bg-blue-600 border-blue-700 text-white shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder="أو اكتب مبلغ تاني"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || '')}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:border-blue-500 text-right font-cairo dir-rtl"
                />

                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    {receiptImage ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                          تم رفع الصورة بنجاح (اضغط للتغيير)
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                          <IoCheckmarkCircle className="text-3xl" />
                        </div>
                        <span className="text-blue-600 font-bold">اضغط هنا لرفع صورة التحويل</span>
                        <span className="text-gray-400 text-sm mt-1 font-bold">سكرين شوت لعملية الدفع</span>
                      </>
                    )}
                  </label>
                </div>

              </div>

              <button
                onClick={handleCharge}
                disabled={!amount || !receiptImage || isLoading}
                className="w-full mt-4 py-4 font-bold font-cairo text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all"
              >
                {isLoading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
