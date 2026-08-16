'use client';

import { useRouter } from 'next/navigation';

/** Goes to the in-site previous screen, with a safe home fallback for direct links. */
export function useBackNavigation(fallback = '/') {
  const router = useRouter();

  return () => {
    const referrer = document.referrer;
    try {
      if (referrer && new URL(referrer).origin === window.location.origin) {
        router.back();
        return;
      }
    } catch {
      // A malformed or external referrer should simply use the fallback.
    }
    router.push(fallback);
  };
}
