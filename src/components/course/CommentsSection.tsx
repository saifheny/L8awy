'use client';

import { useEffect, useState } from 'react';
import { addDoc, arrayUnion, collection, deleteDoc, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { IoPerson, IoSend } from 'react-icons/io5';
import type { CourseComment, Reply } from '@/lib/types';
import { courseComments } from '@/data/comments';

const reactionTypes = ['👍', '🎉', '❤️', '💡', '😢'] as const;

function sampleReactionCounts(id: string): Record<string, number> {
  const seed = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return { '👍': 8 + (seed % 17), '🎉': 2 + (seed % 9), '❤️': 1 + (seed % 7), '💡': seed % 5, '😢': seed % 3 };
}

function playReactionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(650, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(920, context.currentTime + 0.09);
    gain.gain.setValueAtTime(0.07, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.16);
  } catch { /* Audio is an optional interaction enhancement. */ }
}

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
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sampleReactionByUser, setSampleReactionByUser] = useState<Record<string, string>>({});
  const [visibleComments, setVisibleComments] = useState(5);

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

  useEffect(() => setVisibleComments(5), [courseId]);

  useEffect(() => {
    if (!user?.uid) return setSampleReactionByUser({});
    try {
      const saved = localStorage.getItem(`loghawy-sample-reactions-${user.uid}`);
      setSampleReactionByUser(saved ? JSON.parse(saved) : {});
    } catch {
      setSampleReactionByUser({});
    }
  }, [user?.uid]);

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
        reactions: {},
        reactionByUser: {},
      });
      setText('');
    } catch {
      setMessage('تعذر إرسال التعليق الآن.');
    } finally {
      setSending(false);
    }
  };

  const isSample = (comment: CourseComment) => comment.id.startsWith('sample-');

  const editComment = async (comment: CourseComment) => {
    if (!user || comment.userId !== user.uid || !editingText.trim() || isSample(comment)) return;
    await updateDoc(doc(db, 'courseComments', comment.id), { text: editingText.trim(), editedAt: serverTimestamp() });
    setEditingComment(null);
  };

  const removeComment = async (comment: CourseComment) => {
    if (!user || comment.userId !== user.uid || isSample(comment)) return;
    await deleteDoc(doc(db, 'courseComments', comment.id));
  };

  const reactToComment = async (comment: CourseComment, reaction: string) => {
    if (!user) return setMessage('سجّل الدخول أولًا لإضافة تفاعل.');
    if (isSample(comment)) {
      const next = { ...sampleReactionByUser };
      if (next[comment.id] === reaction) delete next[comment.id];
      else next[comment.id] = reaction;
      setSampleReactionByUser(next);
      localStorage.setItem(`loghawy-sample-reactions-${user.uid}`, JSON.stringify(next));
      playReactionSound();
      return;
    }
    const reference = doc(db, 'courseComments', comment.id);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists()) return;
      const data = snapshot.data() as CourseComment;
      const reactions = { ...(data.reactions || {}) };
      const reactionByUser = { ...(data.reactionByUser || {}) };
      const previous = reactionByUser[user.uid];
      if (previous === reaction) {
        reactions[reaction] = Math.max(0, (reactions[reaction] || 1) - 1);
        delete reactionByUser[user.uid];
      } else {
        if (previous) reactions[previous] = Math.max(0, (reactions[previous] || 1) - 1);
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        reactionByUser[user.uid] = reaction;
      }
      transaction.update(reference, { reactions, reactionByUser });
    });
    playReactionSound();
  };

  const sendFollowUp = async (comment: CourseComment, parentReplyId?: string) => {
    if (!user || !isSubscribed || !replyText.trim() || isSample(comment)) return;
    await updateDoc(doc(db, 'courseComments', comment.id), { replies: arrayUnion({ id: `student-reply-${Date.now()}`, userName: user.displayName || 'طالب', userId: user.uid, role: 'student', text: replyText.trim(), timestamp: Date.now(), parentReplyId }) });
    setReplyText('');
    setReplyingTo(null);
  };

  return (
    <section className="dir-rtl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-blue-600 rounded-full" />
        <h2 className="font-aref font-bold text-2xl text-gray-900">التعليقات والأسئلة</h2>
      </div>
      <div className="flex gap-3 items-start mb-6">
        <img src="/L8awy/brand/student-comment-avatar.png" alt="صورة الطالب" className="w-10 h-10 shrink-0 object-contain" />
        <div className="flex-1">
          <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={!isSubscribed || user?.commentsDisabled} placeholder={isSubscribed ? 'أضف تعليقًا أو سؤالًا...' : 'اشترك أولًا لكتابة تعليق'} className="w-full min-h-24 p-3 rounded-xl border border-gray-200 bg-white font-cairo text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-red-500 font-cairo">{message}</span>
            <button onClick={submit} disabled={sending || !text.trim() || !isSubscribed || user?.commentsDisabled} className="bg-blue-600 disabled:bg-gray-300 text-white rounded-xl px-4 py-2 font-cairo font-bold text-sm flex items-center gap-2"><IoSend />{sending ? 'جارٍ الإرسال...' : 'إرسال'}</button>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {comments.length === 0 ? <p className="p-7 text-center text-gray-400 font-cairo text-sm">لا توجد تعليقات حتى الآن.</p> : comments.slice(0, visibleComments).map((comment) => {
          const mine = user?.uid === comment.userId;
          const selectedReaction = isSample(comment) ? sampleReactionByUser[comment.id] : comment.reactionByUser?.[user?.uid || ''];
          const sampleReactions = sampleReactionCounts(comment.id);
          const reactions = isSample(comment) ? (selectedReaction ? { ...sampleReactions, [selectedReaction]: (sampleReactions[selectedReaction] || 0) + 1 } : sampleReactions) : (comment.reactions || {});
          const replies = (comment.replies || []).filter((reply) => !reply.isPrivate || reply.userId === user?.uid || comment.userId === user?.uid);
          const activeReplyTarget = replyingTo?.startsWith(`${comment.id}:`) ? replyingTo.split(':')[1] : undefined;
          const activeParentId = activeReplyTarget && activeReplyTarget !== 'root' ? activeReplyTarget : undefined;
          return <article key={comment.id} className="p-4">
            <div className="flex gap-3">
              <img src="/L8awy/brand/student-comment-avatar.png" alt={`صورة ${comment.userName}`} className="w-10 h-10 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 items-center"><strong className="font-cairo text-sm">{comment.userName}</strong><span className="text-xs text-gray-400">{dateLabel(comment.createdAt)}</span>{comment.editedAt && <span className="text-[10px] text-gray-400">تم التعديل</span>}</div>
                {editingComment === comment.id ? <div className="mt-2"><textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} className="w-full min-h-20 rounded-xl border border-blue-200 bg-white p-3 font-cairo text-sm focus:outline-none" /><div className="mt-2 flex gap-2"><button onClick={() => editComment(comment)} className="rounded-lg bg-blue-600 px-3 py-1.5 font-cairo text-xs font-bold text-white">حفظ</button><button onClick={() => setEditingComment(null)} className="rounded-lg bg-gray-200 px-3 py-1.5 font-cairo text-xs font-bold text-gray-600">إلغاء</button></div></div> : <p className="mt-1 bg-white rounded-2xl rounded-tr-none px-3 py-2 inline-block text-sm text-gray-700">{comment.text}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {reactionTypes.map((reaction) => <button key={reaction} onClick={() => reactToComment(comment, reaction)} className={`rounded-full border px-2 py-1 text-xs transition-transform hover:scale-110 ${selectedReaction === reaction ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>{reaction}{reactions[reaction] ? <span className="mr-1 font-cairo text-[10px] text-gray-500">{reactions[reaction]}</span> : null}</button>)}
                  {mine && !isSample(comment) && editingComment !== comment.id && <><button onClick={() => { setEditingComment(comment.id); setEditingText(comment.text); }} className="mr-2 text-xs font-cairo text-blue-600">تعديل</button><button onClick={() => removeComment(comment)} className="text-xs font-cairo text-red-600">حذف</button></>}
                </div>
              </div>
            </div>
            {replies.map((reply: Reply) => (
              <div key={reply.id} className={`mr-6 mt-3 flex gap-2 sm:mr-10 ${reply.role === 'student' ? 'opacity-95' : ''}`}>
                {reply.role === 'support' ? <img src="/L8awy/brand/support-avatar.png" alt="الدعم الفني" className="h-10 w-10 shrink-0 object-contain" /> : reply.role === 'student' ? <img src="/L8awy/brand/student-comment-avatar.png" alt="صورة الطالب" className="h-9 w-9 shrink-0 object-contain" /> : <Avatar name={reply.userName} color="#2563eb" />}
                <div className="min-w-0"><div className="flex gap-2 items-center"><strong className="text-xs">{reply.userName}</strong><span className={`text-[10px] rounded px-1.5 ${reply.role === 'support' ? 'text-sky-700 bg-sky-50' : reply.role === 'student' ? 'text-slate-600 bg-slate-100' : 'text-blue-600 bg-blue-50'}`}>{reply.role === 'support' ? 'دعم فني' : reply.role === 'student' ? 'طالب' : 'مدرس'}{reply.isPrivate ? ' · خاص' : ''}</span></div><p className={`mt-1 border rounded-2xl rounded-tr-none px-3 py-2 text-sm text-gray-700 ${reply.role === 'support' ? 'bg-sky-50 border-sky-100' : reply.role === 'student' ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>{reply.text}</p><button onClick={() => { setReplyingTo(`${comment.id}:${reply.id}`); setReplyText(''); }} className="mt-1 text-[11px] font-cairo text-blue-600">رد</button></div>
              </div>
            ))}
            {user && isSubscribed && !isSample(comment) && (activeReplyTarget ? <div className="mr-6 mt-3 sm:mr-10"><div className="flex gap-2"><input autoFocus value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={activeParentId ? 'اكتب ردك داخل المحادثة...' : 'أضف ردًا على هذا التعليق...'} className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-cairo text-xs focus:outline-none focus:border-blue-400" /><button onClick={() => sendFollowUp(comment, activeParentId)} className="rounded-xl bg-slate-800 px-3 font-cairo text-xs font-bold text-white">إرسال</button></div></div> : <button onClick={() => { setReplyingTo(`${comment.id}:root`); setReplyText(''); }} className="mr-6 mt-3 text-xs font-cairo font-bold text-slate-600 sm:mr-10">رد على التعليق</button>)}
          </article>;
        })}
        {comments.length > visibleComments && <div className="p-4 text-center"><button onClick={() => setVisibleComments((count) => count + 5)} className="rounded-full border border-slate-200 bg-white/70 px-5 py-2 font-cairo text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">المزيد من التعليقات ({Math.min(5, comments.length - visibleComments)})</button></div>}
      </div>
    </section>
  );
}
