import { Course } from '@/lib/types';

export const courses: Course[] = [
  // ---------------- ENGLISH ----------------
  {
    id: 'english-comprehensive',
    title: 'الكورس الشامل لتعلم الإنجليزية',
    description: 'كورس متكامل يضم جميع المستويات من الصفر وحتى الاحتراف (A1-C2). الأفضل والأوفر!',
    level: 'شامل',
    playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj',
    image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80',
    teacherCount: 6,
    examCount: 20,
    price: 69,
    originalPrice: 150,
    durationMonths: 6,
    language: 'en',
    color: '#0ea5e9',
  },
  { id: 'english-beginner', title: 'الإنجليزية من الصفر', description: 'كورس تأسيسي في اللغة الإنجليزية يبدأ معاك من الحروف لحد ما تقدر تكون جمل وتتكلم بثقة.', level: 'مبتدئ', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 2, examCount: 3, price: 0, durationMonths: 2, language: 'en', color: '#3b82f6' },
  { id: 'english-a1', title: 'الإنجليزية - المستوى الأول (A1)', description: 'خطوتك الأولى لفهم القواعد الأساسية والمحادثات اليومية البسيطة والتعريف بالنفس.', level: 'A1', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 3, examCount: 4, price: 0, durationMonths: 2, language: 'en', color: '#2563eb' },
  { id: 'english-a2', title: 'الإنجليزية - المستوى الثاني (A2)', description: 'تطوير مهارات الاستماع والتحدث في المواقف الحياتية المختلفة وبناء جمل معقدة.', level: 'A2', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 4, examCount: 5, price: 0, durationMonths: 2, language: 'en', color: '#1d4ed8' },
  { id: 'english-b1', title: 'الإنجليزية - المستوى المتوسط (B1)', description: 'القدرة على التعبير عن الرأي وفهم النصوص الطويلة والمشاركة في نقاشات مفتوحة.', level: 'B1', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 4, examCount: 6, price: 0, durationMonths: 2, language: 'en', color: '#1e40af' },
  { id: 'english-b2', title: 'الإنجليزية - المستوى المتقدم (B2)', description: 'إتقان اللغة بشكل يسمح بالعمل والدراسة الأكاديمية والتحدث بطلاقة تامة.', level: 'B2', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 5, examCount: 8, price: 0, durationMonths: 2, language: 'en', color: '#1e3a8a' },
  { id: 'english-c1', title: 'الإنجليزية - مستوى الاحتراف (C1)', description: 'الوصول لمرحلة الاحترافية في اللغة، فهم النصوص المعقدة والتحدث بعفوية وطلاقة.', level: 'C1', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 5, examCount: 10, price: 0, durationMonths: 3, language: 'en', color: '#172554' },
  { id: 'english-c2', title: 'الإنجليزية - مستوى الإتقان التام (C2)', description: 'أعلى مستوى في الإنجليزية، التحدث والكتابة كالمتحدث الأصلي بدون أي صعوبة.', level: 'C2', playlistId: 'PLub_qDbo3FKkcdXUjt_DjJcGSevNIbJwj', image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=800&q=80', teacherCount: 6, examCount: 12, price: 0, durationMonths: 3, language: 'en', color: '#0f172a' },

  // ---------------- GERMAN ----------------
  { id: 'german-comprehensive', title: 'الكورس الشامل لتعلم الألمانية', description: 'كورس متكامل يضم جميع مستويات اللغة الألمانية من الصفر حتى مستوى B2.', level: 'شامل', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 5, examCount: 15, price: 69, originalPrice: 150, durationMonths: 5, language: 'de', color: '#eab308' },
  { id: 'german-beginner', title: 'الألمانية من الصفر', description: 'ابدأ رحلتك مع اللغة الألمانية من نقطة الصفر وتعلم الأساسيات بأسلوب ممتع.', level: 'مبتدئ', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 2, examCount: 3, price: 0, durationMonths: 2, language: 'de', color: '#ca8a04' },
  { id: 'german-a1', title: 'الألمانية - المستوى A1', description: 'تعلم المفردات الأساسية والجمل البسيطة في المواقف اليومية مثل التسوق والتعريف بالنفس.', level: 'A1', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 3, examCount: 4, price: 0, durationMonths: 2, language: 'de', color: '#a16207' },
  { id: 'german-a2', title: 'الألمانية - المستوى A2', description: 'توسيع المفردات وتعلم التراكيب النحوية الأساسية للتواصل في مواقف أكثر تنوعاً.', level: 'A2', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 3, examCount: 5, price: 0, durationMonths: 2, language: 'de', color: '#854d0e' },
  { id: 'german-b1', title: 'الألمانية - المستوى B1', description: 'مرحلة التواصل المستقل - تعبير عن الآراء وفهم المحادثات الطويلة والنصوص العادية.', level: 'B1', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 4, examCount: 7, price: 0, durationMonths: 2, language: 'de', color: '#713f12' },
  { id: 'german-b2', title: 'الألمانية - المستوى B2', description: 'إتقان اللغة الألمانية بمستوى يؤهلك للدراسة أو العمل في بيئة ناطقة بالألمانية.', level: 'B2', playlistId: 'PLawKOZJF6P4aFnQ0IZ8DruunUg5PZEflI', image: 'https://images.unsplash.com/photo-1467459164157-7b17e6d01fc5?w=800&q=80', teacherCount: 4, examCount: 9, price: 0, durationMonths: 3, language: 'de', color: '#422006' },

  // ---------------- TURKISH ----------------
  { id: 'turkish-comprehensive', title: 'الكورس الشامل لتعلم التركية', description: 'كورس متكامل لتعلم اللغة التركية من الصفر حتى مستوى B2 لتستطيع فهم المسلسلات والتحدث بطلاقة.', level: 'شامل', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 5, examCount: 12, price: 79, originalPrice: 180, durationMonths: 4, language: 'tr', color: '#ef4444' },
  { id: 'turkish-beginner', title: 'التركية للمبتدئين', description: 'تعلم اللغة التركية من البداية بأسلوب تفاعلي وممتع مع التركيز على المحادثة والاستماع.', level: 'مبتدئ', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 2, examCount: 3, price: 0, durationMonths: 2, language: 'tr', color: '#dc2626' },
  { id: 'turkish-a1', title: 'التركية - المستوى A1', description: 'تعلم الأحرف التركية والمفردات الأساسية والجمل اليومية البسيطة.', level: 'A1', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 3, examCount: 4, price: 0, durationMonths: 2, language: 'tr', color: '#b91c1c' },
  { id: 'turkish-a2', title: 'التركية - المستوى A2', description: 'توسيع المفردات والقواعد التركية للتعبير في مواقف أكثر تنوعاً.', level: 'A2', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 3, examCount: 5, price: 0, durationMonths: 2, language: 'tr', color: '#991b1b' },
  { id: 'turkish-b1', title: 'التركية - المستوى B1', description: 'التواصل بثقة في مواقف الحياة اليومية وفهم المسلسلات التركية دون ترجمة.', level: 'B1', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 4, examCount: 7, price: 0, durationMonths: 2, language: 'tr', color: '#7f1d1d' },
  { id: 'turkish-b2', title: 'التركية - المستوى B2', description: 'إتقان اللغة التركية بمستوى يؤهلك للتواصل الاحترافي والفهم الكامل.', level: 'B2', playlistId: 'PLxCFn5-t8kLUU2LnDePYwLGJBA91K-K9T', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', teacherCount: 4, examCount: 9, price: 0, durationMonths: 3, language: 'tr', color: '#450a0a' },
];
