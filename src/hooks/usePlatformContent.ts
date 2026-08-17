'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courses as builtInCourses } from '@/data/courses';
import type { Course, PromotionSettings } from '@/lib/types';

export const defaultPromotion: PromotionSettings = {
  enabled: true,
  title: 'اكسب 25 ج.م الآن!',
  description: 'ادعُ أصدقاءك للاشتراك واحصل على مكافأة فورية',
  referralReward: 25,
};

/** Combines the original catalogue with courses created or edited from the panel. */
export function usePlatformCourses() {
  const [courses, setCourses] = useState<Course[]>(builtInCourses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoading(false), 900);
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const managed = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Course));
      const managedIds = new Set(managed.map((course) => course.id));
      setCourses([
        ...managed,
        ...builtInCourses.filter((course) => !managedIds.has(course.id)),
      ]);
      setLoading(false);
    }, () => setLoading(false));
    return () => { window.clearTimeout(fallback); unsubscribe(); };
  }, []);

  return { courses, loading };
}

export function usePromotionSettings() {
  const [promotion, setPromotion] = useState<PromotionSettings>(defaultPromotion);

  useEffect(() => {
    return onSnapshot(doc(db, 'platformSettings', 'home'), (snapshot) => {
      if (snapshot.exists()) {
        setPromotion({ ...defaultPromotion, ...snapshot.data() } as PromotionSettings);
      }
    });
  }, []);

  return promotion;
}
