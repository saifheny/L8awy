'use client';

import { useState } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoPlay, IoLockClosed, IoTrophyOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

type Question = { id: number; text: string; options: string[]; correctAnswer: number };
type Exam = { id: number; title: string; level: string; questionCount: number; questions: Question[] };

// 10 exams with progressive difficulty and question counts: 5,7,8,7,10,10,12,12,14,15
const englishExams: Exam[] = [
  {
    id: 1, title: 'امتحان الأساسيات - الحروف والنطق', level: 'A1', questionCount: 5,
    questions: [
      { id: 1, text: 'ما هو تصريف الفعل (to be) مع الضمير I؟', options: ['is', 'are', 'am', 'be'], correctAnswer: 2 },
      { id: 2, text: 'اختر الصحيح: She ___ a teacher.', options: ['are', 'is', 'am', 'be'], correctAnswer: 1 },
      { id: 3, text: 'ما جمع "child"؟', options: ['childs', 'children', 'childrens', 'childes'], correctAnswer: 1 },
      { id: 4, text: 'ترجمة "كيف حالك؟"', options: ['How are you?', 'Who are you?', 'Where are you?', 'What are you?'], correctAnswer: 0 },
      { id: 5, text: 'متى نستخدم (An)؟', options: ['قبل حرف ساكن', 'قبل حرف متحرك', 'قبل الأفعال', 'دائماً'], correctAnswer: 1 },
    ],
  },
  {
    id: 2, title: 'امتحان المفردات الأساسية', level: 'A1', questionCount: 7,
    questions: [
      { id: 1, text: 'ما معنى "Beautiful"؟', options: ['جميل', 'سريع', 'كبير', 'صغير'], correctAnswer: 0 },
      { id: 2, text: 'كيف تقول "أنا أحب القراءة"؟', options: ['I loves reading', 'I like to reading', 'I love reading', 'I loving reading'], correctAnswer: 2 },
      { id: 3, text: 'اختر المتضاد لـ "Hot"؟', options: ['Warm', 'Cold', 'Hot', 'Mild'], correctAnswer: 1 },
      { id: 4, text: 'جملة صحيحة: ___ they students?', options: ['Is', 'Are', 'Am', 'Be'], correctAnswer: 1 },
      { id: 5, text: 'معنى "Expensive"؟', options: ['رخيص', 'غالي', 'جديد', 'قديم'], correctAnswer: 1 },
      { id: 6, text: 'ما الاسم المستخدم للمكان الذي ندرس فيه؟', options: ['Hospital', 'School', 'Market', 'Airport'], correctAnswer: 1 },
      { id: 7, text: 'الساعة كم "It is 3 o\'clock"؟', options: ['الثانية', 'الثالثة', 'الرابعة', 'السادسة'], correctAnswer: 1 },
    ],
  },
  {
    id: 3, title: 'امتحان الأفعال والأزمنة البسيطة', level: 'A2', questionCount: 8,
    questions: [
      { id: 1, text: 'اختر الفعل الصحيح: She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 1 },
      { id: 2, text: 'متى نستخدم Past Simple؟', options: ['للمستقبل', 'للحدث المنتهي في الماضي', 'للحاضر', 'للعادات'], correctAnswer: 1 },
      { id: 3, text: 'اختر الصحيح: I ___ my homework yesterday.', options: ['do', 'does', 'did', 'done'], correctAnswer: 2 },
      { id: 4, text: 'ما صيغة الاستفهام لـ "She works"؟', options: ['Do she work?', 'Does she works?', 'Does she work?', 'Is she work?'], correctAnswer: 2 },
      { id: 5, text: 'اختر المكمل: They ___ watching TV now.', options: ['is', 'are', 'am', 'be'], correctAnswer: 1 },
      { id: 6, text: 'كيف تنفي "I like coffee"؟', options: ["I don't like coffee", "I doesn't like coffee", 'I not like coffee', 'I no like coffee'], correctAnswer: 0 },
      { id: 7, text: 'ما المضارع التام لـ "go"؟', options: ['goed', 'went', 'gone', 'going'], correctAnswer: 2 },
      { id: 8, text: 'He ___ in Cairo for 5 years.', options: ['live', 'lives', 'has lived', 'living'], correctAnswer: 2 },
    ],
  },
  {
    id: 4, title: 'امتحان القراءة والفهم', level: 'A2', questionCount: 7,
    questions: [
      { id: 1, text: '"The cat sat on the mat." — أين الجرو؟', options: ['على الحصيرة', 'تحت الكرسي', 'فوق الطاولة', 'بجانب الباب'], correctAnswer: 0 },
      { id: 2, text: 'مرادف "Happy" من الكلمات التالية؟', options: ['Sad', 'Angry', 'Glad', 'Tired'], correctAnswer: 2 },
      { id: 3, text: 'اختر الرابط المناسب: I was tired, ___ I went to bed early.', options: ['but', 'because', 'so', 'or'], correctAnswer: 2 },
      { id: 4, text: 'ما مضاد "Accept"؟', options: ['Receive', 'Reject', 'Approve', 'Allow'], correctAnswer: 1 },
      { id: 5, text: '"She is neither tall nor short." تعني؟', options: ['طويلة جداً', 'قصيرة جداً', 'متوسطة الطول', 'مجهول'], correctAnswer: 2 },
      { id: 6, text: 'ما اسم الفاعل من "Teach"؟', options: ['Teaching', 'Taught', 'Teacher', 'Teaches'], correctAnswer: 2 },
      { id: 7, text: 'جملة "She has a lot of friends" تعني؟', options: ['لديها أصدقاء كثيرون', 'ليس لديها أصدقاء', 'صديق واحد فقط', 'لا يعلم'], correctAnswer: 0 },
    ],
  },
  {
    id: 5, title: 'امتحان المنتصف الشامل', level: 'B1', questionCount: 10,
    questions: [
      { id: 1, text: 'If I ___ you, I would study harder.', options: ['was', 'were', 'am', 'be'], correctAnswer: 1 },
      { id: 2, text: 'They have been living here ___ 2010.', options: ['for', 'since', 'in', 'at'], correctAnswer: 1 },
      { id: 3, text: 'I am looking forward ___ you.', options: ['to see', 'to seeing', 'see', 'seeing'], correctAnswer: 1 },
      { id: 4, text: 'He ___ his homework before his father arrived.', options: ['has finished', 'finished', 'had finished', 'finishes'], correctAnswer: 2 },
      { id: 5, text: 'اختر الصحيح: I need some ___ regarding this issue.', options: ['advices', 'advice', 'advise', 'advises'], correctAnswer: 1 },
      { id: 6, text: 'The book ___ by the teacher last week.', options: ['recommended', 'was recommended', 'has recommended', 'is recommending'], correctAnswer: 1 },
      { id: 7, text: 'She ___ work harder if she wants to succeed.', options: ['can', 'should', 'would', 'might'], correctAnswer: 1 },
      { id: 8, text: 'The more you practice, ___ you become.', options: ['the best', 'the better', 'the good', 'better'], correctAnswer: 1 },
      { id: 9, text: 'By the time we arrived, the film ___.', options: ['ended', 'has ended', 'had ended', 'was ending'], correctAnswer: 2 },
      { id: 10, text: 'Despite ___ hard, he failed the exam.', options: ['study', 'studying', 'studied', 'to study'], correctAnswer: 1 },
    ],
  },
  {
    id: 6, title: 'امتحان الكتابة والتعبير', level: 'B1', questionCount: 10,
    questions: [
      { id: 1, text: 'أكمل الجملة بشكل صحيح: "She suggested ___ to the cinema."', options: ['go', 'going', 'went', 'to going'], correctAnswer: 1 },
      { id: 2, text: '"I wish I ___ there yesterday."', options: ['was', 'were', 'had been', 'am'], correctAnswer: 2 },
      { id: 3, text: 'الكلمة الشاذة في المجموعة؟', options: ['Quickly', 'Slowly', 'Hardly', 'Beautiful'], correctAnswer: 3 },
      { id: 4, text: 'She made me ___ for an hour.', options: ['wait', 'waiting', 'waited', 'to wait'], correctAnswer: 0 },
      { id: 5, text: 'الجملة الصحيحة؟', options: ['Yesterday I have seen him.', 'Yesterday I saw him.', 'Yesterday I see him.', 'Yesterday I seen him.'], correctAnswer: 1 },
      { id: 6, text: 'It\'s high time you ___ your work.', options: ['finished', 'finish', 'have finished', 'finishing'], correctAnswer: 0 },
      { id: 7, text: '"Had I known earlier, I ___ him."', options: ['would call', 'would have called', 'will call', 'called'], correctAnswer: 1 },
      { id: 8, text: 'She is used to ___ early.', options: ['wake', 'waking', 'woke', 'woken'], correctAnswer: 1 },
      { id: 9, text: 'The news ___ surprising.', options: ['are', 'were', 'is', 'have been'], correctAnswer: 2 },
      { id: 10, text: 'No sooner ___ than the phone rang.', options: ['I had left', 'had I left', 'I left', 'did I leave'], correctAnswer: 1 },
    ],
  },
  {
    id: 7, title: 'امتحان التحدث والمحادثة', level: 'B2', questionCount: 12,
    questions: [
      { id: 1, text: '"I can\'t help ___ when I hear that song."', options: ['cry', 'to cry', 'crying', 'cried'], correctAnswer: 2 },
      { id: 2, text: 'مرادف "Fastidious"؟', options: ['Fast', 'Fussy', 'Friendly', 'Famous'], correctAnswer: 1 },
      { id: 3, text: 'He tends ___ things out of proportion.', options: ['blow', 'to blow', 'blowing', 'blown'], correctAnswer: 1 },
      { id: 4, text: 'Scarcely ___ he left when it began to snow.', options: ['did', 'had', 'has', 'was'], correctAnswer: 1 },
      { id: 5, text: '"She went to bed without ___ dinner."', options: ['eat', 'eating', 'ate', 'to eat'], correctAnswer: 1 },
      { id: 6, text: 'المعنى الصحيح لـ "Procrastinate"؟', options: ['يتقدم سريعاً', 'يتأخر', 'يحتج', 'يتذكر'], correctAnswer: 1 },
      { id: 7, text: '"It goes without ___ that honesty is essential."', options: ['saying', 'to say', 'said', 'say'], correctAnswer: 0 },
      { id: 8, text: 'Provided that you ___ hard, you will succeed.', options: ['work', 'worked', 'working', 'works'], correctAnswer: 0 },
      { id: 9, text: '"She is prone to ___ mistakes under pressure."', options: ['make', 'making', 'made', 'makes'], correctAnswer: 1 },
      { id: 10, text: 'مضاد "Verbose"؟', options: ['Talkative', 'Concise', 'Wordy', 'Loquacious'], correctAnswer: 1 },
      { id: 11, text: '"Not until midnight ___ arrive."', options: ['he did', 'did he', 'he was', 'was he'], correctAnswer: 1 },
      { id: 12, text: '"She\'s the most ___ person I\'ve ever met." (صواب؟)', options: ['diligent', 'diligenter', 'more diligent', 'most diligent'], correctAnswer: 0 },
    ],
  },
  {
    id: 8, title: 'امتحان الاستماع والتحليل', level: 'B2', questionCount: 12,
    questions: [
      { id: 1, text: '"The speaker was at pains to ___ his point clearly."', options: ['make', 'making', 'made', 'makes'], correctAnswer: 0 },
      { id: 2, text: 'كلمة بمعنى "مدّعٍ بلا موهبة"؟', options: ['Expert', 'Charlatan', 'Mentor', 'Scholar'], correctAnswer: 1 },
      { id: 3, text: '"Little ___ that he was being watched."', options: ['he knew', 'did he know', 'he did know', 'knew he'], correctAnswer: 1 },
      { id: 4, text: '"She tends to ___ the obvious."', options: ['overlook', 'overlooks', 'overlooking', 'overlooked'], correctAnswer: 0 },
      { id: 5, text: 'صواب أم خطأ: "Each of the students have their own desk."', options: ['صحيحة', 'خاطئة - يجب "has"', 'خاطئة - يجب "their"', 'خاطئة كلياً'], correctAnswer: 1 },
      { id: 6, text: '"By the time she retires, she ___ for 40 years."', options: ['will work', 'will have worked', 'has worked', 'worked'], correctAnswer: 1 },
      { id: 7, text: 'معنى التعبير "Bite the bullet"؟', options: ['يأكل الرصاصة', 'يتحمل الألم بصبر', 'يكون شجاعاً جداً', 'يرفض الأمر'], correctAnswer: 1 },
      { id: 8, text: '"She ___ sooner than expected, much to everyone\'s surprise."', options: ['had left', 'left', 'has left', 'leave'], correctAnswer: 1 },
      { id: 9, text: '"Were it not for his help, we ___ failed."', options: ['would fail', 'will fail', 'would have failed', 'had failed'], correctAnswer: 2 },
      { id: 10, text: 'الكلمة الصحيحة: "His ___ behaviour alarmed everyone."', options: ['erratic', 'erractic', 'eratic', 'erritac'], correctAnswer: 0 },
      { id: 11, text: '"The CEO was held ___ for the financial scandal."', options: ['accountable', 'accountability', 'account', 'accounted'], correctAnswer: 0 },
      { id: 12, text: 'نقيض "Ambiguous"؟', options: ['Vague', 'Unclear', 'Unequivocal', 'Dubious'], correctAnswer: 2 },
    ],
  },
  {
    id: 9, title: 'امتحان مستوى الاحتراف', level: 'C1', questionCount: 14,
    questions: [
      { id: 1, text: '"She is averse to ___ risks."', options: ['take', 'taking', 'taken', 'takes'], correctAnswer: 1 },
      { id: 2, text: 'معنى "Magnanimous"؟', options: ['بخيل', 'غاضب', 'كريم سخي', 'فخور'], correctAnswer: 2 },
      { id: 3, text: '"The committee ___ to a decision after hours of debate."', options: ['came', 'come', 'comes', 'is coming'], correctAnswer: 0 },
      { id: 4, text: '"Seldom ___ such stunning performance."', options: ['I had seen', 'had I seen', 'I have seen', 'have I seen'], correctAnswer: 3 },
      { id: 5, text: '"The findings ___ with the existing literature."', options: ['corroborate', 'corroborates', 'is corroborating', 'corroborated'], correctAnswer: 0 },
      { id: 6, text: 'معنى "Ephemeral"؟', options: ['خالد أبدي', 'مؤقت عابر', 'معقد', 'قوي'], correctAnswer: 1 },
      { id: 7, text: '"She ___ been promoted had she not missed the deadline."', options: ['might have', 'could have', 'would have', 'all correct'], correctAnswer: 3 },
      { id: 8, text: '"The policy is tantamount ___ discrimination."', options: ['to', 'with', 'of', 'at'], correctAnswer: 0 },
      { id: 9, text: 'صيغة صحيحة؟', options: ['He insisted that she leave immediately.', 'He insisted that she leaves immediately.', 'He insisted that she left immediately.', 'He insisted that she is leaving.'], correctAnswer: 0 },
      { id: 10, text: '"His speech was replete ___ metaphors."', options: ['of', 'with', 'in', 'by'], correctAnswer: 1 },
      { id: 11, text: 'نقيض "Laconic"؟', options: ['Verbose', 'Brief', 'Concise', 'Terse'], correctAnswer: 0 },
      { id: 12, text: '"The initiative ___ considerable momentum in recent months."', options: ['gained', 'has gained', 'gains', 'gain'], correctAnswer: 1 },
      { id: 13, text: 'ما معنى "Caveat"؟', options: ['تحذير / تحفظ', 'فرصة', 'اتفاقية', 'مكافأة'], correctAnswer: 0 },
      { id: 14, text: '"Rather than ___ the issue, she addressed it directly."', options: ['avoid', 'avoiding', 'avoided', 'to avoid'], correctAnswer: 1 },
    ],
  },
  {
    id: 10, title: 'الامتحان النهائي - مستوى الإتقان', level: 'C2', questionCount: 15,
    questions: [
      { id: 1, text: '"Not only ___ the exam, but he also got the highest score."', options: ['he passed', 'did he pass', 'has he passed', 'he did pass'], correctAnswer: 1 },
      { id: 2, text: '"By this time next year, I ___ my degree."', options: ['will finish', 'will have finished', 'am finishing', 'finish'], correctAnswer: 1 },
      { id: 3, text: '"It is essential that she ___ on time." (Subjunctive)', options: ['arrives', 'arrive', 'arrived', 'arriving'], correctAnswer: 1 },
      { id: 4, text: '"___ had I left the house when it started raining."', options: ['Hardly', 'No sooner', 'Scarcely', 'Barely'], correctAnswer: 0 },
      { id: 5, text: '"She objected to ___ treated like a child."', options: ['be', 'being', 'have been', 'been'], correctAnswer: 1 },
      { id: 6, text: 'معنى "Sycophant"؟', options: ['متملق مداح', 'ناقد بنّاء', 'زعيم شعبي', 'حكيم متأمل'], correctAnswer: 0 },
      { id: 7, text: '"The results, ___ by independent researchers, confirm the theory."', options: ['verifying', 'verified', 'to verify', 'having verified'], correctAnswer: 1 },
      { id: 8, text: '"Were she to apply, she ___ accepted immediately."', options: ['will be', 'would be', 'would have been', 'is'], correctAnswer: 1 },
      { id: 9, text: '"His ___ grasp of the subject impressed the panel."', options: ['exhaustive', 'exhausting', 'exhausted', 'exhaust'], correctAnswer: 0 },
      { id: 10, text: 'معنى التعبير "A storm in a teacup"؟', options: ['عاصفة حقيقية', 'ضجة في فنجان - ضجة من لا شيء', 'شيء مهم جداً', 'مناخ متغير'], correctAnswer: 1 },
      { id: 11, text: '"Albeit ___ for a short time, his impact was significant."', options: ['ruling', 'to rule', 'ruled', 'rules'], correctAnswer: 0 },
      { id: 12, text: '"The phenomenon is far more ___ than previously assumed."', options: ['widespread', 'widespreadly', 'widely spread', 'wide spread'], correctAnswer: 0 },
      { id: 13, text: 'نقيض "Perspicacious"؟', options: ['Astute', 'Shrewd', 'Obtuse', 'Perceptive'], correctAnswer: 2 },
      { id: 14, text: '"She had no sooner ___ than the fire alarm went off."', options: ['fall asleep', 'fallen asleep', 'falling asleep', 'fell asleep'], correctAnswer: 1 },
      { id: 15, text: '"The onus ___ upon the defendant to provide evidence."', options: ['lies', 'lie', 'lying', 'lied'], correctAnswer: 0 },
    ],
  },
];

export default function ExamSection({ courseId, courseName }: { courseId: string; courseName: string }) {
  const isComprehensive = courseId.includes('comprehensive');
  const exams = isComprehensive ? englishExams : [englishExams[0]];

  const [completedExams, setCompletedExams] = useState<Set<number>>(new Set());
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const isUnlocked = (idx: number) => idx === 0 || completedExams.has(exams[idx - 1].id);

  const startExam = (exam: Exam) => {
    setActiveExam(exam);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleSelect = (qId: number, optionIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const submitExam = () => {
    if (!activeExam) return;
    let newScore = 0;
    activeExam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) newScore++;
    });
    setScore(newScore);
    setSubmitted(true);
    if (newScore >= Math.ceil(activeExam.questions.length / 2)) {
      setCompletedExams(prev => new Set([...prev, activeExam.id]));
    }
  };

  const levelColors: Record<string, string> = {
    'A1': 'bg-green-100 text-green-700',
    'A2': 'bg-teal-100 text-teal-700',
    'B1': 'bg-blue-100 text-blue-700',
    'B2': 'bg-indigo-100 text-indigo-700',
    'C1': 'bg-purple-100 text-purple-700',
    'C2': 'bg-red-100 text-red-700',
  };

  if (!activeExam) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold mb-4 font-cairo">امتحانات كورس: {courseName}</h3>
        {exams.map((exam, idx) => {
          const unlocked = isUnlocked(idx);
          const done = completedExams.has(exam.id);
          return (
            <div key={exam.id} className={`rounded-2xl p-5 border flex items-center justify-between gap-4 transition-all ${done ? 'bg-green-50 border-green-200' : unlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${done ? 'bg-green-500 text-white' : unlocked ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? <IoCheckmarkCircle size={22} /> : unlocked ? idx + 1 : <IoLockClosed size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800">{exam.title}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[exam.level] || 'bg-gray-100 text-gray-600'}`}>{exam.level}</span>
                    {done && <span className="text-xs text-green-600 font-bold">✓ مكتمل</span>}
                  </div>
                  <p className="text-gray-500 text-sm">{exam.questionCount} أسئلة — {unlocked ? 'متاح' : 'يتطلب إتمام الامتحان السابق'}</p>
                </div>
              </div>
              {unlocked && !done && (
                <button
                  onClick={() => startExam(exam)}
                  className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                >
                  <IoPlay size={16} /> ابدأ
                </button>
              )}
              {done && (
                <button
                  onClick={() => startExam(exam)}
                  className="shrink-0 px-5 py-2.5 bg-white border border-green-300 text-green-700 font-bold rounded-xl transition-all text-sm hover:bg-green-50"
                >
                  إعادة
                </button>
              )}
              {!unlocked && <IoLockClosed size={20} className="text-gray-400 shrink-0" />}
            </div>
          );
        })}
        {completedExams.size === exams.length && exams.length > 1 && (
          <div className="bg-gradient-to-l from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 flex items-center gap-4 mt-4">
            <IoTrophyOutline size={40} className="text-yellow-500 shrink-0" />
            <div>
              <p className="font-black text-yellow-700 text-lg font-cairo">🎉 مبروك! أتممت جميع الامتحانات</p>
              <p className="text-yellow-600 text-sm font-cairo mt-1">أنت الآن مؤهل للحصول على شهادة إتمام الكورس</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const passed = submitted && score >= Math.ceil(activeExam.questions.length / 2);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 font-cairo">{activeExam.title}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${levelColors[activeExam.level]}`}>{activeExam.level}</span>
        </div>
        <button onClick={() => setActiveExam(null)} className="text-gray-500 hover:text-red-500 font-bold text-sm transition-colors">
          ← العودة للقائمة
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {activeExam.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-lg mb-4 text-gray-800 font-cairo">
              <span className="text-blue-600 ml-2">{qIndex + 1}.</span>
              {q.text}
            </h4>
            <div className="flex flex-col gap-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                const isCorrect = q.correctAnswer === optIdx;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={submitted}
                    className={`flex items-center justify-between p-4 rounded-xl border text-right transition-all font-cairo ${
                      showCorrect ? 'bg-green-50 border-green-500 text-green-700'
                      : showWrong ? 'bg-red-50 border-red-500 text-red-700'
                      : isSelected ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <span>{opt}</span>
                    {showCorrect && <IoCheckmarkCircle className="text-xl text-green-500 shrink-0" />}
                    {showWrong && <IoCloseCircle className="text-xl text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100">
        {!submitted ? (
          <button
            onClick={submitExam}
            disabled={Object.keys(answers).length !== activeExam.questions.length}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all w-full md:w-auto font-cairo"
          >
            إنهاء وتسليم الإجابات ({Object.keys(answers).length}/{activeExam.questions.length})
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`w-full flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-center md:text-right mb-4 md:mb-0">
              <p className="text-lg font-bold text-gray-800 font-cairo">النتيجة النهائية:</p>
              <p className={`text-5xl font-black mt-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score} / {activeExam.questions.length}
              </p>
              <p className={`text-sm font-bold mt-2 font-cairo ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? '✓ ناجح — يمكنك الانتقال للامتحان التالي' : '✗ يجب إعادة الامتحان للانتقال'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startExam(activeExam)} className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-bold rounded-xl transition-all font-cairo">
                إعادة الامتحان
              </button>
              {passed && (
                <button onClick={() => setActiveExam(null)} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all font-cairo">
                  العودة للقائمة
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
