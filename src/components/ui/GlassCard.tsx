'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', onClick, hover = false }: GlassCardProps) {
  const baseClasses = `bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
}
