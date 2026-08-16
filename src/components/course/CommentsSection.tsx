'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { IoPerson, IoSend } from 'react-icons/io5';
import type { CourseComment, Reply } from '@/lib/types';
import { courseComments } from '@/data/comments';

function dateLabel(value: CourseComment['createdAt']) {
  const date = typeof value === 'object' && value && 'toDate' in value
    ? value.toDate()
    : new Date(value || Date.now());
  const difference = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (difference <= 0) return 'اليوم';
  if (difference === 1) return 'أمس';
  return `منذ ${difference} أيام`;
}

function timestampValue(value: CourseComment['createdAt']) {
  if (typeof value === 'object' && value && 'toDate' in value) return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  return typeof value === 'number' ? value : 0;
}

export default function CommentsSection({ courseId, isSubscribed = false }: { courseId: string; isSubscribed?: boolean }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const commentsQuery = query(collection(db, 'courseComments'), where('courseId', '==', courseId));
    const builtIn = () => (courseComments[courseId] || []).map((comment) => ({
      id: `sample-${comment.id}`,
      courseId,
      userId: 'sample',
      userName: comment.userName,
      text: comment.text,
      createdAt: comment.timestamp,
      replies: comment.replies,
    } as CourseComment));
    return onSnapshot(commentsQuery, (snapshot) => {
      const saved = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CourseComment));
      const data = [...saved, ...builtIn()];
      data.sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt));
      setComments(data);
    }, () => setComments(builtIn()));
  }, [courseId]);

  const submit = async () => {
    if (!isSubscribed) return setMessage('يجب الاشتراك في الكورس قبل كتابة تعليق.');
    if (!user) return setMessage('سجّل الدخول أولًا لكتابة تعليق.');
    if (user.commentsDisabled) return setMessage('تم إيقاف التعليقات لهذا الحساب.');
    if (!text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'courseComments'), {
        courseId,
        userId: user.uid,
        userName: user.displayName || 'طالب',
        text: text.trim(),
        createdAt: serverTimestamp(),
        replies: [],
      });
      setText('');
    } catch {
      setMessage('تعذر إرسال التعليق الآن.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="dir-rtl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-blue-600 rounded-full" />
        <h2 className="font-aref font-bold text-2xl text-gray-900">التعليقات والأسئلة</h2>
      </div>
      <div className="flex gap-3 items-start mb-6">
        <div className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center shrink-0"><IoPerson className="text-gray-400" /></div>
        <div className="flex-1">
          <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={!isSubscribed || user?.commentsDisabled} placeholder={isSubscribed ? 'أضف تعليقًا أو سؤالًا...' : 'اشترك أولًا لكتابة تعليق'} className="w-full min-h-24 p-3 rounded-xl border border-gray-200 bg-white font-cairo text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-red-500 font-cairo">{message}</span>
            <button onClick={submit} disabled={sending || !text.trim() || !isSubscribed || user?.commentsDisabled} className="bg-blue-600 disabled:bg-gray-300 text-white rounded-xl px-4 py-2 font-cairo font-bold text-sm flex items-center gap-2"><IoSend />{sending ? 'جارٍ الإرسال...' : 'إرسال'}</button>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {comments.length === 0 ? <p className="p-7 text-center text-gray-400 font-cairo text-sm">لا توجد تعليقات حتى الآن.</p> : comments.map((comment) => (
          <article key={comment.id} className="p-4">
            <div className="flex gap-3">
              <Avatar name={comment.userName} color="#64748b" />
              <div className="flex-1"><div className="flex gap-2 items-center"><strong className="font-cairo text-sm">{comment.userName}</strong><span className="text-xs text-gray-400">{dateLabel(comment.createdAt)}</span></div><p className="mt-1 bg-white rounded-2xl rounded-tr-none px-3 py-2 inline-block text-sm text-gray-700">{comment.text}</p></div>
            </div>
            {(comment.replies || []).map((reply: Reply) => (
              <div key={reply.id} className="mr-10 mt-3 flex gap-2">
                {reply.role === 'support' ? (
                  <img src="/L8awy/brand/support-avatar.png" alt="الدعم الفني" className="h-10 w-10 shrink-0 object-contain" />
                ) : (
                  <Avatar name={reply.userName} color="#2563eb" />
                )}
                <div>
                  <div className="flex gap-2 items-center">
                    <strong className="text-xs">{reply.userName}</strong>
                    <span className={`text-[10px] rounded px-1.5 ${reply.role === 'support' ? 'text-sky-700 bg-sky-50' : 'text-blue-600 bg-blue-50'}`}>{reply.role === 'support' ? 'دعم فني' : 'مدرس'}</span>
                  </div>
                  <p className={`mt-1 border rounded-2xl rounded-tr-none px-3 py-2 text-sm text-gray-700 ${reply.role === 'support' ? 'bg-sky-50 border-sky-100' : 'bg-blue-50 border-blue-100'}`}>{reply.text}</p>
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
