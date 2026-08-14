'use client';

import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import GlassCard from '@/components/ui/GlassCard';
import { useRouter } from 'next/navigation';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (langId: string) => void;
}

export default function LanguageModal({ isOpen, onClose, onSelect }: LanguageModalProps) {
  const router = useRouter();

  const languages = [
    { id: 'en', name: 'الإنجليزية (English)', emoji: '🇬🇧', desc: 'لغة العصر والأعمال' },
    { id: 'de', name: 'الألمانية (German)', emoji: '🇩🇪', desc: 'مستقبلك في ألمانيا' },
    { id: 'tr', name: 'التركية (Turkish)', emoji: '🇹🇷', desc: 'دراسة وعمل وسياحة' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="اختر اللغة اللي عايز تتعلمها">
      <div className="space-y-4 mt-6 dir-rtl">
        {languages.map((lang, idx) => (
          <motion.div
            key={lang.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              if (onSelect) {
                onSelect(lang.id);
              } else {
                router.push(`/register?lang=${lang.id}`);
              }
            }}
          >
            <GlassCard className="p-4 flex items-center justify-between cursor-pointer border border-white/20 hover:border-white/40 transition-all bg-white/5">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{lang.emoji}</span>
                <div className="text-right">
                  <h3 className="text-xl font-bold font-cairo text-gray-900">{lang.name}</h3>
                  <p className="text-sm text-gray-600 font-cairo">{lang.desc}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </Modal>
  );
}
