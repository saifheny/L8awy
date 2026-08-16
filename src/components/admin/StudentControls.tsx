'use client';

import { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { IoBan, IoCheckmarkCircle, IoKeyOutline, IoPencil, IoWallet } from 'react-icons/io5';

type ManagedUser = User & { id: string };

export default function StudentControls({ users, notify }: { users: ManagedUser[]; notify: (message: string) => void }) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  const changeName = async (student: ManagedUser) => {
    const displayName = names[student.id]?.trim();
    if (!displayName) return;
    setWorking(student.id);
    try {
      await updateDoc(doc(db, 'users', student.id), { displayName });
      notify('تم تغيير اسم الطالب.');
    } finally { setWorking(null); }
  };

  const resetLoginCode = async (student: ManagedUser) => {
    const loginCode = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
    setWorking(student.id);
    try {
      await updateDoc(doc(db, 'users', student.id), { loginCode });
      notify(`كود دخول ${student.displayName || 'الطالب'} الجديد: ${loginCode}`);
    } finally { setWorking(null); }
  };

  const adjustBalance = async (student: ManagedUser) => {
    const amount = Number(amounts[student.id]);
    if (!Number.isFinite(amount) || amount === 0) return;
    setWorking(student.id);
    try {
      const walletBalance = Math.max(0, Number(student.walletBalance || 0) + amount);
      await updateDoc(doc(db, 'users', student.id), { walletBalance });
      await addDoc(collection(db, 'transactions'), { userId: student.id, userName: student.displayName || 'طالب', amount, type: 'wallet_adjustment', description: 'تعديل من لوحة الإدارة', status: 'approved', timestamp: serverTimestamp() });
      setAmounts((items) => ({ ...items, [student.id]: '' }));
      notify('تم تعديل الرصيد وتسجيل العملية.');
    } finally { setWorking(null); }
  };

  const updateAccount = async (student: ManagedUser, changes: Partial<User>, message: string) => {
    setWorking(student.id);
    try { await updateDoc(doc(db, 'users', student.id), changes); notify(message); } finally { setWorking(null); }
  };

  return <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
    <div className="flex items-center gap-2 mb-2"><IoPencil className="text-blue-600" /><h2 className="font-cairo font-bold text-xl">إدارة حسابات الطلاب</h2></div>
    <p className="font-cairo text-sm text-gray-500 mb-5">غيّر الاسم وكود الدخول، أوقف الحساب أو فعّله، وتحكم في الرصيد والتعليقات.</p>
    <div className="space-y-4">
      {users.map((student) => <article key={student.id} className={`rounded-2xl border p-4 ${student.isSuspended ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'}`}>
        <div className="flex flex-wrap items-center gap-3"><div className="flex-1 min-w-44"><p className="font-cairo font-bold text-gray-900">{student.displayName || 'بدون اسم'} {student.isSuspended && <span className="text-xs text-red-600 mr-2">موقوف</span>}</p><p dir="ltr" className="text-xs text-gray-500 mt-1">{student.phone || student.id} · {student.loginCode || 'بدون كود'}</p></div><span className="font-cairo font-bold text-emerald-600">{student.walletBalance || 0} ج.م</span></div>
        <div className="grid md:grid-cols-2 gap-3 mt-4"><div className="flex gap-2"><input value={names[student.id] ?? student.displayName ?? ''} onChange={(event) => setNames((items) => ({ ...items, [student.id]: event.target.value }))} className="input" aria-label="اسم الطالب" /><button onClick={() => changeName(student)} disabled={working === student.id} className="rounded-xl px-3 bg-blue-600 text-white" title="حفظ الاسم"><IoCheckmarkCircle /></button></div><div className="flex gap-2"><input type="number" value={amounts[student.id] || ''} onChange={(event) => setAmounts((items) => ({ ...items, [student.id]: event.target.value }))} placeholder="مبلغ موجب أو سالب" className="input" /><button onClick={() => adjustBalance(student)} disabled={working === student.id} className="rounded-xl px-3 bg-emerald-600 text-white" title="تعديل الرصيد"><IoWallet /></button></div></div>
        <div className="flex flex-wrap gap-2 mt-3"><button onClick={() => resetLoginCode(student)} disabled={working === student.id} className="px-3 py-2 rounded-xl bg-violet-50 text-violet-700 font-cairo text-xs flex items-center gap-1"><IoKeyOutline />كود دخول جديد</button><button onClick={() => updateAccount(student, { commentsDisabled: !student.commentsDisabled }, student.commentsDisabled ? 'تم السماح بالتعليقات.' : 'تم إيقاف التعليقات.')} disabled={working === student.id} className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 font-cairo text-xs">{student.commentsDisabled ? 'السماح بالتعليقات' : 'إيقاف التعليقات'}</button><button onClick={() => updateAccount(student, { isSuspended: !student.isSuspended }, student.isSuspended ? 'تم إعادة تفعيل الحساب.' : 'تم إيقاف الحساب ومنع دخوله.')} disabled={working === student.id} className={`px-3 py-2 rounded-xl font-cairo text-xs flex items-center gap-1 ${student.isSuspended ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}><IoBan />{student.isSuspended ? 'إعادة تفعيل الحساب' : 'إيقاف وطرد الحساب'}</button></div>
      </article>)}
    </div>
  </section>;
}
