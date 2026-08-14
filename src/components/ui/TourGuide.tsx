'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';

export default function TourGuide() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Only run on homepage
    if (pathname !== '/') return;

    // Check if we already showed the tour
    const hasSeenTour = localStorage.getItem('loghawy_tour_seen');
    if (hasSeenTour) return;

    // Give the page a moment to load and render IDs
    const timer = setTimeout(() => {
      // Check if elements exist
      const logoExists = document.getElementById('tour-logo');
      if (!logoExists) return;

      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        doneBtnText: 'ابدأ التعلم',
        nextBtnText: 'التالي ➔',
        prevBtnText: '⬅ السابق',
        progressText: '{{current}} من {{total}}',
        steps: [
          {
            element: '#tour-logo',
            popover: {
              title: 'أهلاً بك في لغوي! 🚀',
              description: 'منصتك الأذكى لتعلم اللغات في 2026. جاهز نبدأ جولة سريعة؟',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-lang-selector',
            popover: {
              title: 'اختر لغتك 🌐',
              description: 'تقدر تغير اللغة اللي بتتعلمها في أي وقت (إنجليزي، ألماني، تركي) والمحتوى هيتحدث تلقائياً.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#tour-wallet',
            popover: {
              title: 'محفظتك الذكية 💳',
              description: 'اشحن رصيدك بسهولة واشترك بضغطة زر في أي كورس بدون تعقيد.',
              side: 'bottom',
              align: 'end'
            }
          },
          {
            element: '#tour-comprehensive',
            popover: {
              title: 'الكورس الشامل 👑',
              description: 'الخيار الأفضل! بيفتحلك كل مستويات اللغة وتوفير كبير بدل ما تشتري كل مستوى لوحده.',
              side: 'top',
              align: 'center'
            }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem('loghawy_tour_seen', 'true');
          driverObj.destroy();
        }
      });
      
      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, isClient]);

  return null;
}
