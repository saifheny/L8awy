'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { onValue, push, ref, serverTimestamp } from 'firebase/database';
import { IoArrowBack, IoPeopleOutline, IoSend } from 'react-icons/io5';
import { db, rtdb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useBackNavigation } from '@/hooks/useBackNavigation';

export default function ManagedTeacherChatPage() {
  return <Suspense fallback={null}><ManagedTeacherChat /></Suspense>;
}

function ManagedTeacherChat() {
  const teacherId = useSearchParams().get('teacherId') || '';
  const { user } = useAuth();
  const router = useRouter();
  const goBack = useBackNavigation();
  const [teacher, setTeacher] = useState<{ name: string; role?: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const chatId = user && teacherId ? `${user.uid}_${teacherId}` : '';

  useEffect(() => {
    if (!user) router.replace('/register');
  }, [router, user]);

  useEffect(() => {
    if (!teacherId) return;
    getDoc(doc(db, 'adminStaff', teacherId)).then((snapshot) => {
      if (snapshot.exists()) setTeacher(snapshot.data() as { name: string; role?: string });
    });
  }, [teacherId]);

  useEffect(() => {
    if (!chatId) return;
    return onValue(ref(rtdb, `chats/${chatId}/messages`), (snapshot) => {
      const value = snapshot.val() || {};
      setMessages(Object.entries(value).map(([id, message]) => ({ id, ...(message as object) })));
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }));
    });
  }, [chatId]);

  const send = async () => {
    if (!user || !teacher || !text.trim()) return;
    await push(ref(rtdb, `chats/${chatId}/messages`), {
      studentId: user.uid,
      studentName: user.displayName,
      teacherId,
      teacherName: teacher.name,
      sender: 'student',
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  if (!user) return null;
  return <main className="min-h-screen bg-slate-50 dir-rtl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur"><button onClick={goBack} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"><IoArrowBack /></button><div className="flex items-center gap-2"><div><h1 className="font-cairo text-sm font-black text-slate-900">{teacher?.name || 'جارٍ فتح الدردشة...'}</h1><p className="font-cairo text-[11px] text-slate-500">مدرس على منصة لغوي</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600"><IoPeopleOutline /></div></div></header><section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-3xl flex-col p-4"><div className="flex-1 space-y-3">{messages.map((message) => <div key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 font-cairo text-sm ${message.sender === 'student' ? 'mr-auto rounded-tl-none bg-blue-600 text-white' : 'rounded-tr-none border border-slate-100 bg-white text-slate-700'}`}>{message.text}</div>)}<div ref={endRef} /></div><div className="sticky bottom-3 mt-4 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="اكتب رسالتك للمدرس..." className="min-w-0 flex-1 bg-transparent px-3 font-cairo text-sm outline-none"/><button onClick={send} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><IoSend /></button></div></section></main>;
}
