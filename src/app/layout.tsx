import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import Footer from '@/components/layout/Footer';
import TourGuide from '@/components/ui/TourGuide';
import ReferralTracker from '@/components/layout/ReferralTracker';
import FloatingAIAssistant from '@/components/ui/FloatingAIAssistant';
import { Suspense } from 'react';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'لغوي - المنصة الأفضل لتعلم الإنجليزية، الألمانية، التركية',
  description: 'منصة لغوي (Loghawy) هي خيارك الأول لتعلم اللغات من الصفر وحتى الاحتراف. كورسات شاملة في الإنجليزية، الألمانية، والتركية، مع نخبة من أفضل المدرسين.',
  keywords: 'تعلم لغات, كورسات إنجليزي, كورسات ألماني, كورسات تركي, منصة تعليمية, تعليم اونلاين, لغوي, Loghawy, English course, German course, Turkish course',
  authors: [{ name: 'Loghawy Platform' }],
  robots: 'index, follow',
  openGraph: {
    title: 'لغوي - منصة تعلم اللغات الأولى',
    description: 'كورس شامل لتعلم الإنجليزية، الألمانية، والتركية من الصفر بأحدث طرق التعليم التفاعلية.',
    url: 'https://saifheny.github.io/L8awy',
    siteName: 'Loghawy Platform',
    images: [
      {
        url: 'https://i.postimg.cc/15BZXVCN/d42a254cb5f9f120bc8582cad00ac03d.png',
        width: 800,
        height: 600,
        alt: 'Loghawy Platform Logo',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'لغوي - المنصة الأفضل لتعلم اللغات',
    description: 'كورس شامل لتعلم الإنجليزية، الألمانية، والتركية من الصفر.',
    images: ['https://i.postimg.cc/15BZXVCN/d42a254cb5f9f120bc8582cad00ac03d.png'],
  },
  manifest: '/L8awy/manifest.json',
};

import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <head>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/L8awy/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </head>
      <body className={`${cairo.variable} font-cairo text-gray-900 relative min-h-screen flex flex-col overflow-x-hidden w-full max-w-[100vw]`}>

        
        <AuthProvider>
          <TourGuide />
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          <div className="flex-1 flex flex-col relative z-10 w-full">
            {children}
          </div>
          <Footer />
          <FloatingAIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
