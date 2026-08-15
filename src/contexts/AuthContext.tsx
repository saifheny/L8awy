'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User, Subscription } from '@/lib/types';
import { courses } from '@/data/courses';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, phone: string, gender: string, language: string) => Promise<string>;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateWalletBalance: (amount: number) => Promise<void>;
  chargeWallet: (amount: number, vodafoneNumber: string) => Promise<void>;
  subscribeToCourse: (courseId: string) => Promise<boolean>;
  isSubscribedToCourse: (courseId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedCode = localStorage.getItem('userCode');
        if (storedCode) {
          const q = query(collection(db, 'users'), where('loginCode', '==', storedCode));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUser({ uid: userDoc.id, ...userDoc.data() } as User);
          } else {
            localStorage.removeItem('userCode');
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const generateLoginCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `STU-${randomNum}`;
  };

  const generateReferralCode = (_name: string, phone: string) => {
    // Last 4 digits of phone
    const phoneDigits = phone.replace(/\D/g, '').slice(-4);
    // Random 6 digits
    const rand = Math.floor(100000 + Math.random() * 900000).toString();
    return `${phoneDigits}${rand}`;
  };

  const register = async (name: string, phone: string, gender: string, language: string) => {
    try {
      const userRef = doc(db, 'users', phone);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        throw new Error('رقم الهاتف مسجل بالفعل');
      }

      // Ensure uniqueness of loginCode (simple while loop just in case, though rare collision)
      let loginCode = generateLoginCode();
      let codeExists = true;
      while (codeExists) {
        const q = query(collection(db, 'users'), where('loginCode', '==', loginCode));
        const qs = await getDocs(q);
        if (qs.empty) {
          codeExists = false;
        } else {
          loginCode = generateLoginCode();
        }
      }

      // Generate unique referral code
      let referralCode = generateReferralCode(name, phone);
      let refCodeExists = true;
      while (refCodeExists) {
        const q = query(collection(db, 'users'), where('referralCode', '==', referralCode));
        const qs = await getDocs(q);
        if (qs.empty) {
          refCodeExists = false;
        } else {
          referralCode = generateReferralCode(name, phone);
        }
      }

      const referredBy = localStorage.getItem('referredBy');
      const visitorId = localStorage.getItem('visitorId');

      const userData: any = {
        displayName: name,
        phone: phone,
        loginCode: loginCode,
        referralCode: referralCode,
        gender: gender,
        selectedLanguage: language,
        walletBalance: 0,
        createdAt: serverTimestamp(),
        role: 'student'
      };

      if (referredBy) {
        userData.referredBy = referredBy;
        userData.hasClaimedReferralReward = false;
      }

      await setDoc(userRef, userData);
      localStorage.setItem('userCode', loginCode);
      setUser({ uid: phone, ...userData } as unknown as User);
      
      // Update the referral document if visitorId exists
      if (referredBy && visitorId) {
        try {
          await updateDoc(doc(db, 'referrals', visitorId), {
            status: 'registered',
            visitorName: name,
            registeredUid: phone,
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Failed to update referral record:", e);
        }
      }
      
      // We will return the code so the UI can display it
      return loginCode;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (code: string) => {
    try {
      const q = query(collection(db, 'users'), where('loginCode', '==', code.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('كود الطالب غير صحيح أو غير مسجل');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      localStorage.setItem('userCode', userData.loginCode);
      setUser({ uid: userDoc.id, ...userData } as User);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('userCode');
    setUser(null);
  };

  const updateWalletBalance = async (amount: number) => {
    if (!user) return;
    const newBalance = (user.walletBalance || 0) + amount;
    await updateDoc(doc(db, 'users', user.uid), { walletBalance: newBalance });
    setUser({ ...user, walletBalance: newBalance });
  };

  const chargeWallet = async (amount: number, receiptImage: string) => {
    if (!user) return;
    await addDoc(collection(db, 'transactions'), {
      userId: user.uid,
      userName: user.displayName,
      amount,
      type: 'charge',
      description: 'طلب شحن محفظة برفع صورة إيصال',
      receiptImage: receiptImage,
      timestamp: serverTimestamp(),
      status: 'pending' // Admin needs to approve this
    });
    // Removed auto-approve for production workflow
  };

  const subscribeToCourse = async (courseId: string) => {
    if (!user) return false;
    
    // Check if already subscribed
    const isSubscribed = await isSubscribedToCourse(courseId);
    if (isSubscribed) return true;

    const managedCourse = await getDoc(doc(db, 'courses', courseId));
    const courseObj = managedCourse.exists()
      ? ({ id: managedCourse.id, ...managedCourse.data() } as typeof courses[number])
      : courses.find(c => c.id === courseId);
    if (!courseObj) return false;

    const price = courseObj.price;
    if (user.walletBalance < price) {
      throw new Error('رصيد المحفظة غير كافٍ. يرجى شحن المحفظة أولاً.');
      return false;
    }

    try {
      // Deduct from wallet
      await updateWalletBalance(-price);

      // Create subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (courseObj.durationMonths || 2));

      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        courseId,
        startDate: serverTimestamp(),
        endDate: Timestamp.fromDate(endDate),
        active: true
      });

      // Add referral reward logic
      if ((user as any).referredBy && !(user as any).hasClaimedReferralReward) {
        try {
          const refCodeUsed = (user as any).referredBy;
          // Look up referrer by their referralCode
          const referrerQ = query(collection(db, 'users'), where('referralCode', '==', refCodeUsed));
          const referrerQs = await getDocs(referrerQ);
          
          if (!referrerQs.empty) {
            const referrerDocSnap = referrerQs.docs[0];
            const referrerId = referrerDocSnap.id;
            const referrerRef = doc(db, 'users', referrerId);
            const currentBal = referrerDocSnap.data().walletBalance || 0;
            const promotion = await getDoc(doc(db, 'platformSettings', 'home'));
            const referralReward = Number(promotion.data()?.referralReward ?? 25);
            await updateDoc(referrerRef, { walletBalance: currentBal + referralReward });
            
            await addDoc(collection(db, 'transactions'), {
              userId: referrerId,
              amount: referralReward,
              type: 'referral_reward',
              status: 'approved',
              timestamp: serverTimestamp(),
              title: `مكافأة دعوة: ${user.displayName}`
            });

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { hasClaimedReferralReward: true });
            setUser({ ...user, hasClaimedReferralReward: true } as any);

            // Update referral record
            const refQ = query(collection(db, 'referrals'), where('registeredUid', '==', user.uid));
            const refQs = await getDocs(refQ);
            if (!refQs.empty) {
              const refDocId = refQs.docs[0].id;
              await updateDoc(doc(db, 'referrals', refDocId), {
                status: 'subscribed',
                updatedAt: serverTimestamp()
              });
            }
          }
        } catch (e) {
          console.error("Error rewarding referrer:", e);
        }
      }

      return true;
    } catch (error) {
      console.error("Subscription error:", error);
      // Rollback would be handled by cloud functions or batched writes in production
      return false;
    }
  };

  const isSubscribedToCourse = async (courseId: string) => {
    if (!user) return false;
    try {
      // First, get all active subscriptions for the user
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.uid),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      let isSubbed = false;
      
      // Determine language and comprehensive ID if applicable
      let comprehensiveId = '';
      if (courseId.startsWith('english-')) comprehensiveId = 'english-comprehensive';
      if (courseId.startsWith('german-')) comprehensiveId = 'german-comprehensive';
      if (courseId.startsWith('turkish-')) comprehensiveId = 'turkish-comprehensive';

      querySnapshot.forEach((doc) => {
        const sub = doc.data();
        if (sub.endDate && sub.endDate.toDate() > now) {
          if (sub.courseId === courseId || sub.courseId === comprehensiveId) {
            isSubbed = true;
          }
        }
      });
      return isSubbed;
    } catch (error) {
      console.error("Check subscription error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      updateWalletBalance,
      chargeWallet,
      subscribeToCourse,
      isSubscribedToCourse
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
