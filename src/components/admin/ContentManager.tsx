'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDoc, arrayUnion, collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { defaultPromotion, usePlatformCourses } from '@/hooks/usePlatformContent';
import { teachersData } from '@/data/teachers';
import type { Course, CourseComment, PromotionSettings, User } from '@/lib/types';
import { IoMegaphone, IoPeople, IoSchool, IoSend, IoWallet } from 'react-icons/io5';
import StudentControls from '@/components/admin/StudentControls';

const blankCourse: Course = { id: '', title: '', description: '', level: 'مبتدئ', playlistId: '', image: '', coverImage: '', teacherCount: 1, examCount: 0, price: 0, durationMonths: 1, language: 'en', color: '#3b82f6', isOpen: true };

function timestampValue(value: CourseComment['createdAt']) {
  if (typeof value === 'object' && value && 'toDate' in value) return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  return typeof value === 'number' ? value : 0;
}

type ManagedUser = User & { id: string };

export default function ContentManager({ users, notify }: { users: ManagedUser[]; notify: (message: string) => void }) {
  const { courses } = usePlatformCourses();
  const [draft, setDraft] = useState<Course>(blankCourse);
  const [saving, setSaving] = useState(false);
  const [promotionDraft, setPromotionDraft] = useState<PromotionSettings>(defaultPromotion);
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [teacherId, setTeacherId] = useState(teachersData[0]?.id || '');
  const [reply, setReply] = useState<Record<string, string>>({});
  const [staffName, setStaffName] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [staffPermission, setStaffPermission] = useState('courses');

  useEffect(() => onSnapshot(doc(db, 'platformSettings', 'home'), (snapshot) => {
    if (snapshot.exists()) setPromotionDraft({ ...defaultPromotion, ...snapshot.data() } as PromotionSettings);
  }), []);
  useEffect(() => onSnapshot(collection(db, 'courseComments'), (snapshot) => {
    const values = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CourseComment));
    values.sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt));
    setComments(values);
  }), []);

  const selectedTeacher = useMemo(() => teachersData.find((teacher) => teacher.id === teacherId) || teachersData[0], [teacherId]);
  const updateDraft = (field: keyof Course, value: string | number | boolean) => setDraft((current) => ({ ...current, [field]: value }));

  const saveCourse = async () => {
    if (!draft.id.trim() || !draft.title.trim()) return notify('اكتب رمز الكورس واسمه أولًا.');
    setSaving(true);
    try {
      await setDoc(doc(db, 'courses', draft.id.trim()), { ...draft, id: draft.id.trim(), updatedAt: serverTimestamp() }, { merge: true });
      notify('تم حفظ الكورس، وسيظهر للطلاب فورًا إذا كان مفتوحًا.');
      setDraft(blankCourse);
    } catch { notify('تعذر حفظ الكورس.'); } finally { setSaving(false); }
  };

  const savePromotion = async () => {
    await setDoc(doc(db, 'platformSettings', 'home'), promotionDraft, { merge: true });
    notify('تم تحديث الإعلان ومكافأة الدعوة.');
  };

  const adjustWallet = async (student: ManagedUser, amount: number) => {
    if (!Number.isFinite(amount) || amount === 0) return;
    const balance = Number(student.walletBalance || 0) + amount;
    await updateDoc(doc(db, 'users', student.id), { walletBalance: balance });
    await addDoc(collection(db, 'transactions'), { userId: student.id, userName: student.displayName || 'طالب', amount, type: 'wallet_adjustment', description: 'تعديل يدوي من لوحة الإدارة', status: 'approved', timestamp: serverTimestamp() });
    notify('تم تعديل رصيد الطالب.');
  };

  const toggleComments = async (student: ManagedUser) => {
    await updateDoc(doc(db, 'users', student.id), { commentsDisabled: !student.commentsDisabled });
    notify(student.commentsDisabled ? 'تم السماح بالتعليقات.' : 'تم منع التعليقات لهذا الطالب.');
  };

  const sendReply = async (comment: CourseComment) => {
    const text = reply[comment.id]?.trim();
    if (!text || !selectedTeacher) return;
    await updateDoc(doc(db, 'courseComments', comment.id), { replies: arrayUnion({ id: `reply-${Date.now()}`, userName: selectedTeacher.name, role: 'teacher', text, timestamp: Date.now(), teacherId: selectedTeacher.id }) });
    setReply((current) => ({ ...current, [comment.id]: '' }));
    notify(`تم الرد باسم ${selectedTeacher.name}.`);
  };

  const addStaffRecord = async () => {
    if (!staffName.trim() || !staffCode.trim()) return notify('اكتب اسم الموظف والرمز.');
    await setDoc(doc(db, 'adminStaff', staffCode.trim()), { name: staffName.trim(), accessCode: staffCode.trim(), permissions: [staffPermission], teacherId: teacherId || null, createdAt: serverTimestamp() });
    setStaffName(''); setStaffCode(''); notify('تم حفظ سجل الموظف وصلاحياته.');
  };

  return <div className="w-full space-y-8 dir-rtl">
    <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
        <div className="flex items-center justify-between gap-3 mb-5"><h2 className="font-cairo font-bold text-xl text-gray-900 flex gap-2 items-center"><IoSchool className="text-blue-600" />إدارة الكورسات</h2><button onClick={() => setDraft(blankCourse)} className="text-sm text-blue-600 font-cairo">كورس جديد</button></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={draft.id} onChange={(e) => updateDraft('id', e.target.value)} placeholder="رمز الكورس بالإنجليزية مثل english-a1" className="input" />
          <input value={draft.title} onChange={(e) => updateDraft('title', e.target.value)} placeholder="اسم الكورس" className="input" />
          <input value={draft.level} onChange={(e) => updateDraft('level', e.target.value)} placeholder="المستوى" className="input" />
          <select value={draft.language} onChange={(e) => updateDraft('language', e.target.value)} className="input"><option value="en">الإنجليزية</option><option value="de">الألمانية</option><option value="tr">التركية</option></select>
          <input type="number" value={draft.price} onChange={(e) => updateDraft('price', Number(e.target.value))} placeholder="السعر" className="input" />
          <input type="number" value={draft.durationMonths} onChange={(e) => updateDraft('durationMonths', Number(e.target.value))} placeholder="مدة الكورس بالشهور" className="input" />
          <input type="number" value={draft.teacherCount} onChange={(e) => updateDraft('teacherCount', Number(e.target.value))} placeholder="عدد المدرسين" className="input" />
          <input type="number" value={draft.examCount} onChange={(e) => updateDraft('examCount', Number(e.target.value))} placeholder="عدد الامتحانات" className="input" />
          <input value={draft.playlistId} onChange={(e) => updateDraft('playlistId', e.target.value)} placeholder="YouTube Playlist ID" className="input sm:col-span-2" />
          <input value={draft.image} onChange={(e) => updateDraft('image', e.target.value)} placeholder="رابط صورة الكورس" className="input sm:col-span-2" />
          <input value={draft.coverImage || ''} onChange={(e) => updateDraft('coverImage', e.target.value)} placeholder="رابط الصورة الداخلية الكبيرة (اختياري)" className="input sm:col-span-2" />
          <textarea value={draft.description} onChange={(e) => updateDraft('description', e.target.value)} placeholder="معلومات ووصف الكورس" className="input min-h-24 sm:col-span-2" />
        </div>
        <label className="mt-4 flex items-center gap-2 font-cairo text-sm"><input type="checkbox" checked={draft.isOpen !== false} onChange={(e) => updateDraft('isOpen', e.target.checked)} /> الكورس مفتوح ويظهر للطلاب</label>
        <button onClick={saveCourse} disabled={saving} className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-cairo font-bold px-6 py-3 rounded-xl">{saving ? 'جارٍ الحفظ...' : 'حفظ الكورس'}</button>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7"><h3 className="font-cairo font-bold text-lg mb-4">كل الكورسات</h3><div className="space-y-2 max-h-[590px] overflow-auto">{courses.map((course) => <button key={course.id} onClick={() => setDraft(course)} className="w-full text-right p-3 rounded-xl hover:bg-blue-50 border border-gray-100"><p className="font-cairo font-bold text-sm text-gray-800">{course.title}</p><p className="font-cairo text-xs text-gray-500 mt-1">{course.id} · {course.isOpen === false ? 'مغلق' : 'مفتوح'} · {course.price} ج.م</p></button>)}</div></div>
    </section>

    <section className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"><h2 className="font-cairo font-bold text-xl flex gap-2 items-center mb-5"><IoMegaphone className="text-green-600" />الإعلان ومكافأة الدعوة</h2><label className="flex items-center gap-2 mb-4 font-cairo"><input type="checkbox" checked={promotionDraft.enabled} onChange={(e) => setPromotionDraft({ ...promotionDraft, enabled: e.target.checked })} /> إظهار الإعلان</label><div className="space-y-3"><input value={promotionDraft.title} onChange={(e) => setPromotionDraft({ ...promotionDraft, title: e.target.value })} placeholder="عنوان الإعلان" className="input" /><textarea value={promotionDraft.description} onChange={(e) => setPromotionDraft({ ...promotionDraft, description: e.target.value })} placeholder="نص الإعلان" className="input min-h-20" /><input type="number" value={promotionDraft.referralReward} onChange={(e) => setPromotionDraft({ ...promotionDraft, referralReward: Number(e.target.value) })} placeholder="قيمة المكافأة بالجنيه" className="input" /></div><button onClick={savePromotion} className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-cairo font-bold">حفظ الإعلان</button></div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"><h2 className="font-cairo font-bold text-xl flex gap-2 items-center mb-5"><IoPeople className="text-purple-600" />سجلات موظفي الإدارة</h2><p className="text-xs font-cairo text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">تُحفظ هذه الصلاحيات كسجلات للنظام الحالي؛ تفعيل دخول مستقل وآمن للموظف يحتاج نظام الدخول الذي ستلغيه لاحقًا.</p><div className="space-y-3"><input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="اسم الموظف" className="input" /><input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="رمز الدخول الخاص به" className="input" /><select value={staffPermission} onChange={(e) => setStaffPermission(e.target.value)} className="input"><option value="courses">إدارة الكورسات</option><option value="wallet">المحفظة</option><option value="comments">التعليقات</option></select><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="input">{teachersData.map((teacher) => <option key={teacher.id} value={teacher.id}>يرد باسم: {teacher.name}</option>)}</select></div><button onClick={addStaffRecord} className="mt-4 bg-purple-600 text-white px-5 py-3 rounded-xl font-cairo font-bold">إضافة سجل الموظف</button></div>
    </section>

    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7"><h2 className="font-cairo font-bold text-xl flex gap-2 items-center mb-5"><IoWallet className="text-emerald-600" />الطلاب: المحفظة والتعليقات</h2><div className="space-y-3">{users.map((student) => <div key={student.id} className="border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-3"><div className="min-w-40 flex-1"><p className="font-cairo font-bold">{student.displayName || 'بدون اسم'}</p><p className="text-xs text-gray-500" dir="ltr">{student.phone || student.id}</p></div><span className="font-bold text-emerald-600">{student.walletBalance || 0} ج.م</span><input id={`amount-${student.id}`} type="number" placeholder="+ / - مبلغ" className="input w-28" /><button onClick={() => adjustWallet(student, Number((document.getElementById(`amount-${student.id}`) as HTMLInputElement)?.value))} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-cairo">تعديل الرصيد</button><button onClick={() => toggleComments(student)} className={`px-3 py-2 rounded-xl text-sm font-cairo ${student.commentsDisabled ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{student.commentsDisabled ? 'السماح بالتعليقات' : 'منع التعليقات'}</button></div>)}</div></section>

    <StudentControls users={users} notify={notify} />

    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7"><h2 className="font-cairo font-bold text-xl mb-5">أسئلة وتعليقات الكورسات</h2><div className="flex gap-3 items-center mb-5"><label className="font-cairo text-sm">الرد باسم:</label><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="input max-w-xs">{teachersData.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></div><div className="space-y-4">{comments.length === 0 ? <p className="text-gray-400 font-cairo">لا توجد تعليقات حتى الآن.</p> : comments.map((comment) => <article key={comment.id} className="border border-gray-100 rounded-2xl p-4"><p className="font-cairo font-bold text-sm">{comment.userName}</p><p className="font-cairo text-gray-700 mt-1">{comment.text}</p><div className="mt-3 flex gap-2"><input value={reply[comment.id] || ''} onChange={(e) => setReply({ ...reply, [comment.id]: e.target.value })} placeholder="اكتب الرد باسم المدرس المختار" className="input flex-1" /><button onClick={() => sendReply(comment)} className="bg-blue-600 text-white rounded-xl px-4"><IoSend /></button></div></article>)}</div></section>
  </div>;
}
