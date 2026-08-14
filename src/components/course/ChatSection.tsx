'use client';

import Avatar from '@/components/ui/Avatar';

export default function ChatSection({ type, courseName }: { type: 'teachers' | 'students', courseName: string }) {
  const dummyMessages = type === 'teachers' 
    ? [
        { id: 1, name: 'مستر أحمد', text: `أهلاً بيك في كورس ${courseName}! لو عندك أي سؤال أنا موجود.`, role: 'teacher', color: 'bg-blue-500' },
        { id: 2, name: 'مستر خالد', text: 'هنبدأ المنهج الأسبوع الجاي إن شاء الله، شدوا حيلكم يا شباب.', role: 'teacher', color: 'bg-purple-500' }
      ]
    : [
        { id: 1, name: 'عمر المختار', text: 'حد خلص الواجب بتاع الدرس الأول؟', role: 'student', color: 'bg-gray-500' },
        { id: 2, name: 'نور أحمد', text: 'أيوة سهل جداً، محتاج مساعدة؟', role: 'student', color: 'bg-green-500' }
      ];

  return (
    <div className="glass rounded-2xl flex flex-col h-[600px] overflow-hidden">
      <div className="glass-strong p-4 border-b border-white/10">
        <h3 className="text-xl font-bold font-heading">
          {type === 'teachers' ? 'دردشة المعلمين' : 'دردشة الطلاب'} - {courseName}
        </h3>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {dummyMessages.map(msg => (
          <div key={msg.id} className="flex gap-4">
            <Avatar name={msg.name.split(' ')[1] || msg.name} color={msg.color} />
            <div className="glass px-5 py-3 rounded-2xl rounded-tr-none bg-white/5">
              <div className="text-sm font-bold text-gray-300 mb-1">{msg.name}</div>
              <div className="text-white">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 glass-strong border-t border-white/10 flex gap-3">
        <input 
          type="text" 
          disabled 
          placeholder="قريباً..." 
          className="flex-1 glass px-4 py-3 rounded-xl focus:outline-none disabled:opacity-50" 
        />
        <button disabled className="glass px-6 py-3 rounded-xl font-bold bg-blue-600/30 text-white disabled:opacity-50">
          إرسال
        </button>
      </div>
    </div>
  );
}
