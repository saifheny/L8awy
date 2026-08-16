'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ManagedExam } from '@/lib/types';
import { IoArrowBack, IoArrowForward, IoCheckmarkCircle, IoLockClosed, IoTrophyOutline } from 'react-icons/io5';

type Result = { score: number; passed: boolean; completedAt: number };

export default function ExamPortal({ courseId, exams }: { courseId: string; exams: ManagedExam[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const active = activeIndex === null ? null : exams[activeIndex];

  useEffect(() => {
    const saved = localStorage.getItem(`exam-results-${courseId}`);
    if (saved) { try { setResults(JSON.parse(saved)); } catch {} }
  }, [courseId]);

  const isOpen = (index: number) => index === 0 || !!results[exams[index - 1]?.id]?.passed;
  const currentQuestion = active?.questions[questionIndex];
  const completed = active ? results[active.id] : undefined;
  const answered = active ? Object.keys(answers).length : 0;

  const openExam = (index: number) => { if (!isOpen(index)) return; setActiveIndex(index); setQuestionIndex(0); setAnswers({}); };
  const finish = () => {
    if (!active) return;
    const correct = active.questions.filter((question) => answers[question.id] === question.correctAnswer).length;
    const score = Math.round((correct / active.questions.length) * 100);
    const result = { score, passed: score >= active.passingScore, completedAt: Date.now() };
    const next = { ...results, [active.id]: result };
    setResults(next); localStorage.setItem(`exam-results-${courseId}`, JSON.stringify(next));
  };

  if (!active) return <div className="space-y-4">{exams.map((exam, index) => {
    const result = results[exam.id]; const locked = !isOpen(index);
    return <button key={exam.id} onClick={() => openExam(index)} disabled={locked} className={`w-full text-right rounded-2xl border p-5 transition-all flex items-center gap-4 ${locked ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white hover:border-blue-300 hover:shadow-md border-gray-100 text-gray-900'}`}><div className={`w-12 h-12 rounded-xl grid place-items-center ${locked ? 'bg-gray-200' : result?.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{locked ? <IoLockClosed /> : result?.passed ? <IoCheckmarkCircle size={24} /> : <IoTrophyOutline size={24} />}</div><div className="flex-1"><h2 className="font-cairo font-bold">{exam.title}</h2><p className="font-cairo text-sm text-gray-500 mt-1">{exam.questions.length} أسئلة · النجاح من {exam.passingScore}% · {exam.displayMode === 'one-by-one' ? 'سؤال وراء سؤال' : 'كل الأسئلة معًا'}</p>{result && <p className={`font-cairo text-xs mt-2 ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>نتيجتك: {result.score}% {result.passed ? '— ناجح' : '— أعد المحاولة'}</p>}</div>{locked && <span className="font-cairo text-xs">يتفتح بعد النجاح</span>}</button>;
  })}</div>;

  if (completed) return <div className={`rounded-3xl border p-8 text-center ${completed.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}><IoTrophyOutline className={`mx-auto text-6xl ${completed.passed ? 'text-emerald-600' : 'text-red-600'}`} /><h2 className="font-aref font-bold text-3xl mt-4">{completed.passed ? 'أحسنت، اجتزت الامتحان!' : 'يمكنك المحاولة مرة أخرى'}</h2><p className="font-cairo text-5xl font-black mt-4">{completed.score}%</p><p className="font-cairo text-gray-600 mt-3">الحد المطلوب للنجاح: {active.passingScore}%</p><div className="flex justify-center gap-3 mt-7"><button onClick={() => setResults((items) => { const next = { ...items }; delete next[active.id]; localStorage.setItem(`exam-results-${courseId}`, JSON.stringify(next)); return next; })} className="px-5 py-3 bg-white border rounded-xl font-cairo font-bold">إعادة الامتحان</button><button onClick={() => setActiveIndex(null)} className="px-5 py-3 bg-slate-900 text-white rounded-xl font-cairo font-bold">كل الامتحانات</button></div></div>;

  const questions = active.displayMode === 'one-by-one' ? [currentQuestion!] : active.questions;
  return <div><div className="flex items-center justify-between mb-5"><button onClick={() => setActiveIndex(null)} className="font-cairo text-sm text-gray-600 flex gap-1 items-center"><IoArrowBack />العودة للامتحانات</button><span className="font-cairo text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{active.displayMode === 'one-by-one' ? `${questionIndex + 1} / ${active.questions.length}` : `${answered} / ${active.questions.length} إجابة`}</span></div><div className="space-y-5">{questions.map((question, shownIndex) => <section key={question.id} className="rounded-2xl bg-white border border-gray-100 p-5"><h2 className="font-cairo font-bold text-lg leading-8">{active.displayMode === 'one-by-one' ? questionIndex + 1 : shownIndex + 1}. {question.text}</h2><div className="grid gap-3 mt-5">{question.options.map((option, index) => <button key={index} onClick={() => setAnswers((items) => ({ ...items, [question.id]: index }))} className={`text-right rounded-xl border p-4 font-cairo transition-colors ${answers[question.id] === index ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white hover:border-blue-200 border-gray-200 text-gray-700'}`}>{option}</button>)}</div></section>)}</div><div className="flex justify-between mt-6">{active.displayMode === 'one-by-one' && questionIndex > 0 ? <button onClick={() => setQuestionIndex((item) => item - 1)} className="px-4 py-3 rounded-xl bg-gray-100 font-cairo"><IoArrowForward className="inline ml-1" />السابق</button> : <span />}{active.displayMode === 'one-by-one' && questionIndex < active.questions.length - 1 ? <button onClick={() => setQuestionIndex((item) => item + 1)} disabled={answers[currentQuestion!.id] === undefined} className="px-5 py-3 rounded-xl bg-blue-600 disabled:bg-gray-300 text-white font-cairo font-bold">التالي <IoArrowBack className="inline mr-1" /></button> : <button onClick={finish} disabled={answered !== active.questions.length} className="px-5 py-3 rounded-xl bg-emerald-600 disabled:bg-gray-300 text-white font-cairo font-bold">تسليم الامتحان</button>}</div></div>;
}
