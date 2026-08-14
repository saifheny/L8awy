'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoArrowBack, IoSend, IoCheckmarkDoneOutline, IoCheckmarkOutline, IoPeopleOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { teachersData } from '@/app/teachers/page';
import { courses } from '@/data/courses';

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isSubscribedToCourse } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const teacher = teachersData.find(t => t.id === id);

  // Load Messages from Firebase
  useEffect(() => {
    if (!user || !teacher) return;
    
    const chatRef = ref(rtdb, `chats/${user.uid}_${teacher.id}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a: any, b: any) => {
          const timeA = a.createdAt || 0;
          const timeB = b.createdAt || 0;
          return timeA - timeB;
        });
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [user, teacher]);

  useEffect(() => {
    const checkSub = async () => {
      if (!user || !teacher) {
        setChecking(false);
        return;
      }
      
      const compCourse = courses.find(c => c.level === 'شامل' && c.language === teacher.lang);
      if (compCourse) {
        const sub = await isSubscribedToCourse(compCourse.id);
        setIsSubscribed(sub);
      }
      setChecking(false);
    };
    checkSub();
  }, [user, teacher, isSubscribedToCourse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (!user || !teacher) return null;

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (!isSubscribed) {
      showToast("يجب الاشتراك في الكورس الشامل أولاً لتتمكن من مراسلة المعلمين.");
      return;
    }
    
    const msgText = inputValue;
    setInputValue('');
    
    try {
      const chatRef = ref(rtdb, `chats/${user.uid}_${teacher.id}/messages`);
      await push(chatRef, {
        studentId: user.uid,
        studentName: user.displayName || 'طالب',
        studentPhone: user.phone || '',
        teacherId: teacher.id,
        teacherName: teacher.name,
        text: msgText,
        sender: 'user',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message", error);
      showToast("حدث خطأ أثناء إرسال الرسالة.");
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (!isSubscribed) {
      e.preventDefault();
      showToast("يجب الاشتراك في الكورس الشامل أولاً لتتمكن من مراسلة المعلمين.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dir-rtl relative h-[100dvh]">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg font-bold font-cairo text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header (WhatsApp Style) */}
      <div className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <IoPeopleOutline className="text-xl" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 font-cairo text-sm sm:text-base leading-tight">{teacher.name}</h2>
          </div>
        </div>
        
        {/* Back Button on the Left (end of flex since RTL) */}
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] opacity-95" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender === 'user';
          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                <p className="text-gray-800 font-cairo text-sm sm:text-base leading-relaxed break-words">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true }) : ''}
                  </span>
                  {isMe && (
                    msg.isRead ? 
                    <IoCheckmarkDoneOutline className="text-blue-500 text-sm" /> :
                    <IoCheckmarkOutline className="text-gray-400 text-sm" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Auto-reply waiting state */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] rounded-2xl rounded-tl-none px-4 py-2 shadow-sm bg-white border border-gray-100">
              <p className="text-gray-500 font-cairo text-sm sm:text-base leading-relaxed break-words">
                الرجاء الانتظار، سيتم الرد عليك في أقرب وقت...
              </p>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed to bottom */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 mt-auto shrink-0 w-full">
        {!checking && !isSubscribed ? (
          <div className="bg-red-50 text-red-600 font-bold p-3 rounded-xl text-center border border-red-100 text-sm">
            🔒 لا يمكنك إرسال رسائل. يجب الاشتراك في الكورس الشامل أولاً.
          </div>
        ) : (
          <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onClick={handleInputClick}
                placeholder="اكتب رسالة..."
                className="w-full bg-gray-100 border-none rounded-2xl px-4 py-3 min-h-[50px] max-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-cairo"
                rows={1}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                inputValue.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <IoSend className="rotate-180 ml-1" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
