'use client';

import Modal from '@/components/ui/Modal';
import GlassButton from '@/components/ui/GlassButton';
import { Course } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  balance: number;
  onPurchase: (courseId: string) => void;
}

export default function PurchaseModal({ isOpen, onClose, course, balance, onPurchase }: PurchaseModalProps) {
  const router = useRouter();
  if (!course) return null;

  const price = course.price;
  const canAfford = balance >= price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تأكيد الاشتراك">
      <div className="space-y-6 dir-rtl">
        <div className="bg-white/10 p-5 rounded-xl border border-white/20">
          <h3 className="text-xl font-cairo font-bold text-white text-right mb-2">{course.title}</h3>
          <div className="flex justify-between items-center text-white/80 font-cairo">
            <span>لمدة شهرين</span>
            <span className="text-xl font-bold text-white">{price} جنيه</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-100 font-cairo text-right">
          <p className="text-sm">⚠️ الكورس هيكون متاح لمدة شهرين من تاريخ الاشتراك</p>
        </div>

        <div className="flex justify-between items-center px-2 font-cairo">
          <span className="text-white/80 text-lg">رصيدك الحالي:</span>
          <span className={`text-lg font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            {balance} جنيه
          </span>
        </div>

        <div className="pt-4">
          {canAfford ? (
            <GlassButton
              onClick={() => {
                onPurchase(course.id);
                onClose();
              }}
              className="w-full py-3 bg-green-500/30 hover:bg-green-500/50 border-green-500/50 text-white font-bold font-cairo text-lg"
            >
              اشترك دلوقتي
            </GlassButton>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-red-400 font-bold font-cairo">اشحن محفظتك الإلكترونية أولًا</p>
              <button
                onClick={() => {
                  onClose();
                  router.push('/wallet');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold font-cairo text-lg rounded-xl shadow-[0_4px_0_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all"
              >
                الذهاب للمحفظة
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
