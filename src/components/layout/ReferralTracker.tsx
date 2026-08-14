'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const trackReferral = async () => {
      const refCode = searchParams?.get('ref');
      
      if (!refCode) return;

      // Prevent self-referral: if the logged-in user's own referralCode matches, ignore
      if (user && (user as any).referralCode === refCode) {
        return;
      }

      // Save the referrer's code
      localStorage.setItem('referredBy', refCode);
      
      // Generate or get visitor ID
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = generateUUID();
        localStorage.setItem('visitorId', visitorId);
        
        try {
          // Look up the referrer by their referralCode
          const q = query(collection(db, 'users'), where('referralCode', '==', refCode));
          const qs = await getDocs(q);
          
          if (!qs.empty) {
            const referrerUid = qs.docs[0].id;
            
            // Log the visit in Firestore
            await setDoc(doc(db, 'referrals', visitorId), {
              referrerId: referrerUid,
              referralCode: refCode,
              visitorId: visitorId,
              status: 'visited',
              visitorName: 'زائر جديد',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error tracking referral visit:', error);
        }
      }
    };

    trackReferral();
  }, [searchParams, user]);

  return null;
}
