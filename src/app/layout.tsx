import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import Footer from '@/components/layout/Footer';
import TourGuide from '@/components/ui/TourGuide';
import ReferralTracker from '@/components/layout/ReferralTracker';
import { Suspense } from 'react';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'منصة تعليمية | تعلم اللغات',
  description: 'منصتنا التعليمية لتعلم لغات جديدة بأسلوب ممتع وتفاعلي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className={`${cairo.variable} font-cairo text-gray-900 relative min-h-screen flex flex-col overflow-x-hidden w-full max-w-[100vw]`}>

        
        <AuthProvider>
          <Suspense fallback={null}>
            <ReferralTracker />
            <TourGuide />
          </Suspense>
          <div className="flex-1 flex flex-col relative z-0">
            {children}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
