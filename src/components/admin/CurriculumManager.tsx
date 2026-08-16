'use client';

import { useMemo, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, CourseVideo, CourseWeek, ManagedExam, ManagedQuestion } from '@/lib/types';
import { IoAdd, IoBookOutline, IoDocumentText, IoImages, IoPlayCircle } from 'react-icons/io5';

const emptyQuestion = (): ManagedQuestion => ({ id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0 });

export default function CurriculumManager({ courses, notify }: { courses: Course[]; notify: (message: string) => void }) {
  const [courseId, setCourseId] = useState('');
  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);
  const [weekTitle, setWeekTitle] = useState('');
  const [weekDescription, setWeekDescription] = useState('');
  const [weekImage, setWeekImage] = useState('');
  const [videoWeekId, setVideoWeekId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoImage, setVideoImage] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [passingScore, setPassingScore] = useState(60);
  const [displayMode, setDisplayMode] = useState<ManagedExam['displayMode']>('one-by-one');
  const [questions, setQuestions] = useState<ManagedQuestion[]>([emptyQuestion()]);

  const save = async (changes: Partial<Course>) => {
    if (!course) return notify('اختر الكورس أولًا.');
    await setDoc(doc(db, 'courses', course.id), { ...course, ...changes, updatedAt: serverTimestamp() }, { merge: true });
  };

  const readImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWeekImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };
  const readVideoImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVideoImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const addWeek = async () => {
    if (!weekTitle.trim()) return notify('اكتب عنوان الأسبوع.');
    const week: CourseWeek = { id: `week-${Date.now()}`, title: weekTitle.trim(), description: weekDescription.trim(), image: weekImage, videos: [] };
    await save({ weeks: [...(course?.weeks || []), week] });
    setWeekTitle(''); setWeekDescription(''); setWeekImage(''); setVideoWeekId(week.id); notify('تمت إضافة الأسبوع.');
  };

  const addVideo = async () => {
    if (!course || !videoWeekId || !videoTitle.trim() || !videoUrl.trim()) return notify('اختر أسبوعًا وأدخل عنوان ورابط الفيديو.');
    const video: CourseVideo = { id: `video-${Date.now()}`, title: videoTitle.trim(), videoId: '', videoUrl: videoUrl.trim(), thumbnail: videoImage || course.image, description: '', weekId: videoWeekId };
    const weeks = (course.weeks || []).map((week) => week.id === videoWeekId ? { ...week, videos: [...week.videos, video] } : week);
    await save({ weeks });
    setVideoTitle(''); setVideoUrl(''); setVideoImage(''); notify('تمت إضافة الفيديو إلى الأسبوع.');
  };

  const updateQuestion = (id: string, changes: Partial<ManagedQuestion>) => setQuestions((items) => items.map((question) => question.id === id ? { ...question, ...changes } : question));
  const addExam = async () => {
    if (!examTitle.trim() || questions.some((question) => !question.text.trim() || question.options.some((option) => !option.trim()))) return notify('أكمل عنوان الامتحان وكل الأسئلة والاختيارات.');
    const exam: ManagedExam = { id: `exam-${Date.now()}`, title: examTitle.trim(), passingScore, displayMode, questions };
    await save({ exams: [...(course?.exams || []), exam], examCount: (course?.exams || []).length + 1 });
    setExamTitle(''); setQuestions([emptyQuestion()]); notify('تم حفظ الامتحان وإتاحته للطلاب المشتركين.');
  };

  return <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7 dir-rtl">
    <div className="flex items-center gap-2"><IoBookOutline className="text-blue-600" /><h2 className="font-cairo font-bold text-xl">محتوى الكورس والامتحانات</h2></div>
    <p className="font-cairo text-sm text-gray-500 mt-2">للكورسات الجديدة: أنشئ الأسابيع وارفع صورها وفيديوهاتها، ثم أنشئ امتحاناتها وشكلها ونسبة النجاح.</p>
    <select value={courseId} onChange={(event) => { setCourseId(event.target.value); setVideoWeekId(''); }} className="input mt-5"><option value="">اختر الكورس</option>{courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
    {course && <div className="grid xl:grid-cols-2 gap-7 mt-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"><h3 className="font-cairo font-bold flex gap-2 items-center"><IoPlayCircle className="text-blue-600" />الأسابيع والفيديوهات</h3><div className="space-y-3 mt-4"><input value={weekTitle} onChange={(event) => setWeekTitle(event.target.value)} className="input" placeholder="مثال: الأسبوع الأول — الأساسيات" /><textarea value={weekDescription} onChange={(event) => setWeekDescription(event.target.value)} className="input min-h-20" placeholder="وصف الأسبوع" /><label className="input flex gap-2 items-center cursor-pointer"><IoImages />رفع صورة الأسبوع<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0])} className="hidden" /></label>{weekImage && <img src={weekImage} alt="معاينة الأسبوع" className="h-24 w-full object-cover rounded-xl" />}<button onClick={addWeek} className="w-full py-3 rounded-xl bg-blue-600 text-white font-cairo font-bold flex items-center justify-center gap-2"><IoAdd />إضافة أسبوع</button></div>
        {(course.weeks || []).length > 0 && <div className="mt-6 pt-5 border-t border-blue-100"><h4 className="font-cairo font-bold text-sm mb-3">أضف فيديو داخل أسبوع</h4><select value={videoWeekId} onChange={(event) => setVideoWeekId(event.target.value)} className="input"><option value="">اختر الأسبوع</option>{course.weeks?.map((week) => <option key={week.id} value={week.id}>{week.title}</option>)}</select><div className="space-y-3 mt-3"><input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} className="input" placeholder="عنوان الفيديو" /><input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="input" placeholder="رابط فيديو YouTube" /><label className="input flex gap-2 items-center cursor-pointer"><IoImages />رفع صورة الفيديو<input type="file" accept="image/*" onChange={(event) => readVideoImage(event.target.files?.[0])} className="hidden" /></label>{videoImage && <img src={videoImage} alt="معاينة الفيديو" className="h-24 w-full object-cover rounded-xl" />}<button onClick={addVideo} className="w-full py-3 rounded-xl bg-slate-900 text-white font-cairo font-bold">إضافة الفيديو</button></div></div>}
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"><h3 className="font-cairo font-bold flex gap-2 items-center"><IoDocumentText className="text-emerald-600" />إنشاء امتحان</h3><div className="grid sm:grid-cols-2 gap-3 mt-4"><input value={examTitle} onChange={(event) => setExamTitle(event.target.value)} className="input sm:col-span-2" placeholder="اسم الامتحان" /><input type="number" min="1" max="100" value={passingScore} onChange={(event) => setPassingScore(Number(event.target.value))} className="input" placeholder="نسبة النجاح" /><select value={displayMode} onChange={(event) => setDisplayMode(event.target.value as ManagedExam['displayMode'])} className="input"><option value="one-by-one">سؤال وراء سؤال</option><option value="all-at-once">كل الأسئلة معًا</option></select></div><div className="space-y-4 mt-5">{questions.map((question, index) => <div key={question.id} className="rounded-xl bg-white border border-emerald-100 p-3"><p className="font-cairo text-xs text-emerald-700 mb-2">السؤال {index + 1}</p><input value={question.text} onChange={(event) => updateQuestion(question.id, { text: event.target.value })} className="input" placeholder="نص السؤال" /><div className="grid sm:grid-cols-2 gap-2 mt-2">{question.options.map((option, optionIndex) => <input key={optionIndex} value={option} onChange={(event) => updateQuestion(question.id, { options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item) })} className="input" placeholder={`الاختيار ${optionIndex + 1}`} />)}</div><select value={question.correctAnswer} onChange={(event) => updateQuestion(question.id, { correctAnswer: Number(event.target.value) })} className="input mt-2"><option value="0">الإجابة الصحيحة: الاختيار 1</option><option value="1">الإجابة الصحيحة: الاختيار 2</option><option value="2">الإجابة الصحيحة: الاختيار 3</option><option value="3">الإجابة الصحيحة: الاختيار 4</option></select></div>)}</div><button onClick={() => setQuestions((items) => [...items, emptyQuestion()])} className="mt-4 text-emerald-700 font-cairo font-bold text-sm">+ أضف سؤالًا</button><button onClick={addExam} className="mt-4 w-full py-3 rounded-xl bg-emerald-600 text-white font-cairo font-bold">حفظ الامتحان</button></div>
    </div>}
  </section>;
}
