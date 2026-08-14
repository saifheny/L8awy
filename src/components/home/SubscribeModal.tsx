'use client';

import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import GlassButton from '@/components/ui/GlassButton';
import { IoLockClosed } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 dir-rtl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20"
        >
          <IoLockClosed className="text-5xl text-white drop-shadow-lg" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-aref font-bold text-white">اشترك أو سجل أولاً</h2>
          <p className="text-white/80 font-cairo text-lg max-w-sm mx-auto">
            عشان تقدر تشوف الكورسات وتستفيد من المنصة، لازم تسجل الأول.
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full pt-4">
          <GlassButton
            onClick={() => {
              onClose();
              router.push('/register');
            }}
            className="w-full py-3 text-xl font-cairo font-bold bg-white/20 hover:bg-white/30 text-white border border-white/40"
          >
            سجل دلوقتي
          </GlassButton>
        </motion.div>
      </div>
    </Modal>
  );
}
