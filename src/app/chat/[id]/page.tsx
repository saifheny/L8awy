'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IoArrowBack, IoSend, IoCheckmarkDoneOutline, IoCheckmarkOutline, IoPeopleOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { teachersData } from '@/data/teachers';
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
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#f5ede8]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <IoPeopleOutline className="text-3xl text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-cairo">ابدأ المحادثة مع {teacher.name}</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.sender === 'user';
          const prevMsg = messages[idx - 1];
          const senderChanged = !prevMsg || prevMsg.sender !== msg.sender;
          
          // Date separator: show if first msg or day changed
          const msgDate = msg.createdAt ? new Date(msg.createdAt) : null;
          const prevDate = prevMsg?.createdAt ? new Date(prevMsg.createdAt) : null;
          const showDateSep = idx === 0 || (msgDate && prevDate && msgDate.toDateString() !== prevDate.toDateString());

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDateSep && msgDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-full px-3 py-1 shadow-sm">
                    <span className="text-[10px] text-gray-500 font-cairo">
                      {msgDate.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Sender name separator (when sender changes) */}
              {senderChanged && !isMe && (
                <div className="flex items-center gap-2 mt-3 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <IoPeopleOutline className="text-white text-[10px]" />
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold font-cairo">{teacher.name}</span>
                </div>
              )}
              {senderChanged && isMe && idx !== 0 && (
                <div className="flex items-center justify-end gap-2 mt-3 mb-1 px-1">
                  <span className="text-[10px] text-gray-500 font-cairo">أنت</span>
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                    <IoPeopleOutline className="text-white text-[10px]" />
                  </div>
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-0.5`}
              >
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm relative ${isMe ? 'bg-[#dcf8c6] rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}>
                  <p className="text-gray-800 font-cairo text-sm leading-relaxed break-words">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true }) : ''}
                    </span>
                    {isMe && (
                      msg.isRead ? 
                      <IoCheckmarkDoneOutline className="text-blue-500 text-xs" /> :
                      <IoCheckmarkOutline className="text-gray-400 text-xs" />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
        
        {/* Auto-reply waiting state */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mt-1"
          >
            <div className="max-w-[60%] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm bg-white border border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
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
