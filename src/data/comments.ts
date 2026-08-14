import { Comment } from '@/lib/types';

const enTeachers = ['أستاذ أحمد سلامة', 'أستاذة نور حسن', 'أستاذ محمد السيد'];
const deTeachers = ['أستاذ يوسف عطية', 'أستاذة مريم فوزي', 'أستاذ عمر بدران'];
const trTeachers = ['أستاذة ياسمين قاسم', 'أستاذ كريم النجار', 'أستاذة رنا سليم'];
const support = 'فريق الدعم';

const enT = (i: number) => enTeachers[i % 3];
const deT = (i: number) => deTeachers[i % 3];
const trT = (i: number) => trTeachers[i % 3];

function buildComments(
  courseId: string,
  lang: 'en' | 'de' | 'tr',
  prefix: string
): Comment[] {
  const teacher = lang === 'en' ? enT : lang === 'de' ? deT : trT;
  const langLabel = lang === 'en' ? 'الإنجليزي' : lang === 'de' ? 'الألماني' : 'التركي';

  return [
    {
      id: `${prefix}1`, courseId, userName: 'عمر عبد العزيز', userAvatar: '#3b82f6',
      text: `الكورس ده بجد مفيد جداً بدأت أفهم حاجات كانت صعبة عليا من زمان في ${langLabel} شكرا يا مستر`,
      timestamp: '2026-07-01T10:00:00Z',
      replies: [{ id: `${prefix}1r`, userName: teacher(0), role: 'teacher', text: 'يسعدنا دا يا عمر استمر وهتلاقي تقدم كبير مع كل درس', timestamp: '2026-07-01T11:00:00Z' }]
    },
    {
      id: `${prefix}2`, courseId, userName: 'سلمى إبراهيم', userAvatar: '#ec4899',
      text: 'ممكن امد الكورس لو اتشغلت شوية في الفترة دي؟',
      timestamp: '2026-07-03T14:00:00Z',
      replies: [{ id: `${prefix}2r`, userName: support, role: 'support', text: 'أيوه ينفع يا سلمى تواصلي مع الدعم وهنمدلك الفترة على طول', timestamp: '2026-07-03T15:00:00Z' }]
    },
    {
      id: `${prefix}3`, courseId, userName: 'خالد رضا', userAvatar: '#10b981',
      text: 'الصوت في الفيديو التالت واطي شوية ممكن تعدلوه',
      timestamp: '2026-07-07T09:00:00Z',
      replies: [{ id: `${prefix}3r`, userName: support, role: 'support', text: 'شكراً يا خالد تم إبلاغ الفريق التقني وهيتعدل قريب', timestamp: '2026-07-07T10:00:00Z' }]
    },
    {
      id: `${prefix}4`, courseId, userName: 'نادية فتحي', userAvatar: '#f59e0b',
      text: `أسلوب الشرح في ${langLabel} تحفة وبيختلف عن أي حاجة تانية جربتها شكراً جداً`,
      timestamp: '2026-07-10T16:00:00Z',
      replies: [{ id: `${prefix}4r`, userName: teacher(1), role: 'teacher', text: 'يسعدنا إنك حاسة بالفرق يا نادية استمري', timestamp: '2026-07-10T17:00:00Z' }]
    },
    {
      id: `${prefix}5`, courseId, userName: 'باسم حلمي', userAvatar: '#8b5cf6',
      text: 'في شهادة بعد خلاص الكورس؟',
      timestamp: '2026-07-14T11:00:00Z',
      replies: [{ id: `${prefix}5r`, userName: support, role: 'support', text: 'أيوه يا باسم تقدر تطبع شهادتك من حسابك بعد ما تعدي الامتحانات', timestamp: '2026-07-14T12:00:00Z' }]
    },
    {
      id: `${prefix}6`, courseId, userName: 'رانيا جمال', userAvatar: '#14b8a6',
      text: 'لقيت غلطة في ترجمة آخر جملة في الدرس الخامس',
      timestamp: '2026-07-18T08:00:00Z',
      replies: [{ id: `${prefix}6r`, userName: teacher(2), role: 'teacher', text: 'شكراً يا رانيا على ملاحظتك هنراجع الدرس ونصلح الغلطة', timestamp: '2026-07-18T09:00:00Z' }]
    },
    {
      id: `${prefix}7`, courseId, userName: 'تامر وليد', userAvatar: '#f97316',
      text: 'جربت الدروس المجانية وقررت أشترك الفرق واضح جداً في المستوى',
      timestamp: '2026-07-22T13:00:00Z',
      replies: [{ id: `${prefix}7r`, userName: teacher(0), role: 'teacher', text: 'أهلاً بيك في المنصة يا تامر هتلاقي تقدم كبير مع كل وحدة', timestamp: '2026-07-22T14:00:00Z' }]
    },
    {
      id: `${prefix}8`, courseId, userName: 'إيمان عثمان', userAvatar: '#6366f1',
      text: 'الأمثلة من الحياة اليومية بتثبت المعلومة أكتر بكتير وبتساعد في الحفظ',
      timestamp: '2026-07-26T18:00:00Z',
      replies: [{ id: `${prefix}8r`, userName: teacher(1), role: 'teacher', text: 'ده بالظبط هدفنا إن اللغة تبقى قريبة من الواقع مش بس نظريات', timestamp: '2026-07-26T19:00:00Z' }]
    },
    {
      id: `${prefix}9`, courseId, userName: 'محمد أنور', userAvatar: '#84cc16',
      text: 'في سيشن مع المدرسين على فيديو مباشر؟',
      timestamp: '2026-07-30T10:00:00Z',
      replies: [{ id: `${prefix}9r`, userName: support, role: 'support', text: 'تقدر تتواصل مع المدرسين عن طريق قسم الدردشة الموجود جوه الكورس', timestamp: '2026-07-30T11:00:00Z' }]
    },
    {
      id: `${prefix}10`, courseId, userName: 'أميرة وليد', userAvatar: '#f43f5e',
      text: 'بعيد الدروس أكتر من مرة والمحتوى بيتثبت كل مرة أحسن من اللي قبلها',
      timestamp: '2026-08-02T15:00:00Z',
      replies: [{ id: `${prefix}10r`, userName: teacher(2), role: 'teacher', text: 'التكرار هو أساس حفظ اللغة يا أميرة وده بيدل على جديتك في التعلم', timestamp: '2026-08-02T16:00:00Z' }]
    },
    {
      id: `${prefix}11`, courseId, userName: 'هيثم عادل', userAvatar: '#0ea5e9',
      text: 'مكنتش متوقع أتقدم بالسرعة دي المنصة غيرت طريقة تعلمي خالص',
      timestamp: '2026-08-06T20:00:00Z',
      replies: [{ id: `${prefix}11r`, userName: teacher(0), role: 'teacher', text: 'ده من اجتهادك يا هيثم استمر ومتوقفش', timestamp: '2026-08-06T21:00:00Z' }]
    },
    {
      id: `${prefix}12`, courseId, userName: 'لبنى ياسر', userAvatar: '#a78bfa',
      text: 'أقدر أشترك في أكتر من كورس في نفس الوقت؟',
      timestamp: '2026-08-09T11:00:00Z',
      replies: [{ id: `${prefix}12r`, userName: support, role: 'support', text: 'أيوه يا لبنى تقدري تشتركي في أي عدد من الكورسات المتاحة', timestamp: '2026-08-09T12:00:00Z' }]
    },
    {
      id: `${prefix}13`, courseId, userName: 'وسام جابر', userAvatar: '#64748b',
      text: 'الشرح دقيق والكلام واضح من غير تعقيدات بنصح بيه لأي حد عايز يبدأ',
      timestamp: '2026-08-11T13:00:00Z',
      replies: [{ id: `${prefix}13r`, userName: teacher(1), role: 'teacher', text: 'شكراً يا وسام ترشيحاتكم بتحمسنا نقدم أحسن', timestamp: '2026-08-11T14:00:00Z' }]
    },
  ];
}

export const courseComments: Record<string, Comment[]> = {
  'english-comprehensive': buildComments('english-comprehensive', 'en', 'encomp'),
  'english-beginner':      buildComments('english-beginner',      'en', 'enbeg'),
  'english-a1':            buildComments('english-a1',            'en', 'ena1'),
  'english-a2':            buildComments('english-a2',            'en', 'ena2'),
  'english-b1':            buildComments('english-b1',            'en', 'enb1'),
  'english-b2':            buildComments('english-b2',            'en', 'enb2'),
  'english-c1':            buildComments('english-c1',            'en', 'enc1'),
  'english-c2':            buildComments('english-c2',            'en', 'enc2'),
  'german-comprehensive':  buildComments('german-comprehensive',  'de', 'decomp'),
  'german-beginner':       buildComments('german-beginner',       'de', 'debeg'),
  'german-a1':             buildComments('german-a1',             'de', 'dea1'),
  'german-a2':             buildComments('german-a2',             'de', 'dea2'),
  'german-b1':             buildComments('german-b1',             'de', 'deb1'),
  'german-b2':             buildComments('german-b2',             'de', 'deb2'),
  'turkish-comprehensive': buildComments('turkish-comprehensive', 'tr', 'trcomp'),
  'turkish-beginner':      buildComments('turkish-beginner',      'tr', 'trbeg'),
  'turkish-a1':            buildComments('turkish-a1',            'tr', 'tra1'),
  'turkish-a2':            buildComments('turkish-a2',            'tr', 'tra2'),
  'turkish-b1':            buildComments('turkish-b1',            'tr', 'trb1'),
  'turkish-b2':            buildComments('turkish-b2',            'tr', 'trb2'),
};
