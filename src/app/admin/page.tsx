'use client';

import { useState, useEffect } from 'react';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, serverTimestamp as fsServerTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, onValue, push, serverTimestamp, update } from 'firebase/database';
import { WalletTransaction } from '@/lib/types';
import { IoCheckmark, IoClose, IoWallet, IoPeople, IoChatbubbles, IoSend } from 'react-icons/io5';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { teachersData } from '@/data/teachers';
import { courses } from '@/data/courses';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Tabs state
  const [activeTab, setActiveTab] = useState<'wallet' | 'users' | 'chats'>('wallet');

  // Transactions State
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [processingTx, setProcessingTx] = useState<string | null>(null);
  const [approveAmounts, setApproveAmounts] = useState<Record<string, number | string>>({});
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Chats State
  const [chats, setChats] = useState<any[]>([]); // list of distinct student-teacher interactions
  const [selectedChat, setSelectedChat] = useState<{ studentId: string, teacherId: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  
  // Image Viewer State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Passcode Lock State
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const ADMIN_PASSCODE = 'Saifsa123'; // Custom passcode

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsLocked(false);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscode('');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Realtime listeners
  useEffect(() => {
    if (isLocked) return;

    // Listen to pending transactions
    setLoadingTransactions(true);
    const qTx = query(collection(db, 'transactions'), where('status', '==', 'pending'));
    const unsubscribeTx = onSnapshot(qTx, (snapshot) => {
      const data: WalletTransaction[] = [];
      snapshot.forEach((d) => {
        data.push({ id: d.id, ...d.data() } as WalletTransaction);
      });
      data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      setTransactions(data);
      setLoadingTransactions(false);
    });

    // Listen to all users
    setLoadingUsers(true);
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((d) => {
        data.push({ id: d.id, ...d.data() });
      });
      setUsers(data);
      setLoadingUsers(false);
    });

    return () => {
      unsubscribeTx();
      unsubscribeUsers();
    };
  }, [isLocked]);

  // Load distinct chats logic
  useEffect(() => {
    if (isLocked || activeTab !== 'chats') return;
    
    const chatsRef = ref(rtdb, 'chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChats([]);
        return;
      }
      
      const chatsArr: any[] = [];
      Object.keys(data).forEach(key => {
        const chatData = data[key];
        if (chatData.messages) {
          const msgs = Object.keys(chatData.messages).map(msgKey => ({
            id: msgKey,
            ...chatData.messages[msgKey]
          })).sort((a: any, b: any) => {
             const ta = a.createdAt || 0;
             const tb = b.createdAt || 0;
             return ta - tb;
          });
          
          if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            chatsArr.push({
              key,
              studentId: lastMsg.studentId,
              studentName: lastMsg.studentName,
              studentPhone: lastMsg.studentPhone,
              teacherId: lastMsg.teacherId,
              teacherName: lastMsg.teacherName,
              lastMessage: lastMsg.text,
              time: lastMsg.createdAt || 0,
              messages: msgs
            });
          }
        }
      });
      
      // sort chats by latest message
      chatsArr.sort((a, b) => b.time - a.time);
      
      setChats(chatsArr);
      
      if (selectedChat) {
        const active = chatsArr.find(c => c.studentId === selectedChat.studentId && c.teacherId === selectedChat.teacherId);
        if (active) {
          setChatMessages(active.messages);
          active.messages.forEach((msg: any) => {
            if (msg.sender === 'user' && !msg.isRead) {
              const msgRef = ref(rtdb, `chats/${selectedChat.studentId}_${selectedChat.teacherId}/messages/${msg.id}`);
              update(msgRef, { isRead: true }).catch(console.error);
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [isLocked, activeTab, selectedChat]);

  if (authLoading) {
    return <div className="min-h-screen p-8 text-center font-bold font-cairo">جاري التحقق من الصلاحيات...</div>;
  }

  // If locked, show the passcode screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 dir-rtl">
        <form onSubmit={handlePasscodeSubmit} className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-sm w-full">
          <IoWallet className="text-6xl text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-cairo text-gray-800 mb-2">لوحة الإدارة</h2>
          <p className="text-gray-500 font-cairo text-sm mb-8">يرجى إدخال رمز المرور السري للدخول</p>
          
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="رمز المرور..."
            className="w-full text-center text-2xl tracking-widest font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          {passcodeError && (
            <p className="text-red-500 text-sm font-bold mb-4 font-cairo animate-pulse">الرمز غير صحيح، حاول مرة أخرى</p>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors font-cairo"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  const handleApprove = async (transaction: WalletTransaction, overrideAmount: number) => {
    if (processingTx === transaction.id) return;
    setProcessingTx(transaction.id!);
    try {
      if (!transaction.id) return;
      await updateDoc(doc(db, 'transactions', transaction.id), {
        status: 'approved',
        amount: overrideAmount,
        processedAt: fsServerTimestamp()
      });
      const userRef = doc(db, 'users', transaction.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentBalance = userDoc.data().walletBalance || 0;
        await updateDoc(userRef, {
          walletBalance: currentBalance + overrideAmount
        });
      }
      showToast(`تم شحن محفظة الطالب بمبلغ ${overrideAmount} ج.م بنجاح!`);
    } catch (error) {
      console.error("Error approving", error);
      showToast('حدث خطأ أثناء الشحن');
    } finally {
      setProcessingTx(null);
    }
  };

  const handleReject = async (transaction: WalletTransaction) => {
    if (processingTx === transaction.id) return;
    setProcessingTx(transaction.id!);
    try {
      if (!transaction.id) return;
      await updateDoc(doc(db, 'transactions', transaction.id), {
        status: 'rejected',
        processedAt: fsServerTimestamp()
      });
      showToast('تم رفض الطلب');
    } catch (error) {
      console.error("Error rejecting", error);
      showToast('حدث خطأ أثناء الرفض');
    } finally {
      setProcessingTx(null);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChat) return;
    try {
      const chatRef = ref(rtdb, `chats/${selectedChat.studentId}_${selectedChat.teacherId}/messages`);
      await push(chatRef, {
        studentId: selectedChat.studentId,
        studentName: chats.find(c => c.studentId === selectedChat.studentId)?.studentName || 'طالب',
        teacherId: selectedChat.teacherId,
        teacherName: chats.find(c => c.teacherId === selectedChat.teacherId)?.teacherName || 'مدرس',
        text: replyText,
        sender: 'teacher',
        createdAt: serverTimestamp()
      });
      setReplyText('');
    } catch (error) {
      console.error("Error sending reply", error);
      showToast('حدث خطأ أثناء إرسال الرد');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 dir-rtl relative">
      
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="تكبير الصورة" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <button 
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <IoClose size={32} />
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl z-50 font-cairo font-bold flex items-center gap-2 animate-bounce">
          <IoCheckmark className="text-green-400 text-xl" />
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <img 
          src="https://i.postimg.cc/15BZXVCN/d42a254cb5f9f120bc8582cad00ac03d.png" 
          alt="لوحة الإدارة" 
          className="h-24 md:h-32 object-contain mb-8 select-none"
          draggable={false}
        />

        {/* Tabs Navigation */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 w-full max-w-2xl">
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold font-cairo flex items-center justify-center gap-2 transition-all ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <IoWallet size={20} /> طلبات الشحن
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold font-cairo flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <IoPeople size={20} /> الطلاب ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold font-cairo flex items-center justify-center gap-2 transition-all ${activeTab === 'chats' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <IoChatbubbles size={20} /> المحادثات
          </button>
        </div>

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="w-full">
            {loadingTransactions ? (
              <div className="text-center py-20 text-gray-500 font-bold">جاري تحميل الطلبات...</div>
            ) : transactions.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center text-gray-500 font-bold">
                لا توجد طلبات شحن معلقة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">طلب شحن</span>
                      <span className="text-2xl font-black text-gray-900">{tx.amount} ج.م</span>
                    </div>
                    <div className="mb-4 text-gray-600 font-bold text-sm">
                      <p>UID: {tx.userId}</p>
                      <p>الطالب: {tx.userName || 'غير متوفر'}</p>
                    </div>
                    <div className="mb-6 flex-1">
                      {tx.receiptImage ? (
                        <img 
                          src={tx.receiptImage} 
                          alt="Receipt" 
                          onClick={() => setSelectedImage(tx.receiptImage!)}
                          className="w-full h-48 object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity" 
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold">لا توجد صورة</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="text-sm font-bold text-gray-700">المبلغ المراد شحنه:</label>
                        <input 
                          type="number"
                          placeholder="اكتب المبلغ هنا (مثال: 150)"
                          value={approveAmounts[tx.id!] || ''}
                          onChange={(e) => setApproveAmounts({ ...approveAmounts, [tx.id!]: Number(e.target.value) || '' })}
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:border-blue-500 text-right font-cairo dir-rtl"
                        />
                        <button 
                          onClick={() => {
                            const amt = Number(approveAmounts[tx.id!]);
                            if (amt > 0) handleApprove(tx, amt);
                            else showToast('يرجى كتابة مبلغ صحيح أكبر من الصفر');
                          }}
                          disabled={processingTx === tx.id || !approveAmounts[tx.id!]}
                          className={`font-bold py-3 mt-1 rounded-xl transition-all font-cairo w-full ${processingTx === tx.id || !approveAmounts[tx.id!] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
                        >
                          {processingTx === tx.id ? 'جاري الشحن...' : 'تأكيد الشحن'}
                        </button>
                      </div>
                      <button 
                        onClick={() => handleReject(tx)} 
                        disabled={processingTx === tx.id}
                        className={`mt-2 w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-cairo ${processingTx === tx.id ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-50 hover:bg-red-500 hover:text-white text-red-600'}`}
                      >
                        <IoClose size={20} /> {processingTx === tx.id ? 'جاري المعالجة...' : 'رفض الطلب'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold font-cairo text-gray-800">قائمة الطلاب المسجلين</h2>
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold">الإجمالي: {users.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right font-cairo">
                  <thead className="bg-gray-100 text-gray-600 text-sm">
                    <tr>
                      <th className="p-4 font-bold">الاسم</th>
                      <th className="p-4 font-bold">الموبايل</th>
                      <th className="p-4 font-bold">الرصيد</th>
                      <th className="p-4 font-bold">اللغة المختارة</th>
                      <th className="p-4 font-bold">الاشتراكات (الكورسات)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800">{u.displayName || 'بدون اسم'}</td>
                        <td className="p-4 text-gray-600" dir="ltr">{u.phone || '-'}</td>
                        <td className="p-4 text-green-600 font-bold">{u.walletBalance || 0} ج.م</td>
                        <td className="p-4 text-gray-600">{u.selectedLanguage || '-'}</td>
                        <td className="p-4">
                          {u.subscribedCourses && u.subscribedCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {u.subscribedCourses.map((cId: string) => (
                                <span key={cId} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md">{cId}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">غير مشترك</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="w-full flex flex-col md:flex-row gap-6 h-[600px]">
            {/* Sidebar with active chats */}
            <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold font-cairo text-gray-700">المحادثات النشطة</div>
              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                  <p className="text-center p-8 text-gray-500 text-sm">لا توجد محادثات</p>
                ) : (
                  chats.map((chat) => (
                    <div 
                      key={chat.key} 
                      onClick={() => {
                        setSelectedChat({ studentId: chat.studentId, teacherId: chat.teacherId });
                        setChatMessages(chat.messages);
                      }}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedChat?.studentId === chat.studentId && selectedChat?.teacherId === chat.teacherId ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{chat.studentName}</h4>
                        <span className="text-[10px] text-gray-400">
                          {chat.time ? new Date(chat.time).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mb-1 font-bold">مع المدرس: {chat.teacherName}</p>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat Window */}
            <div className="w-full md:w-2/3 bg-[#e5ddd5] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}>
              {selectedChat ? (
                <>
                  <div className="bg-white p-4 flex items-center justify-between shadow-sm z-10">
                    <div>
                      <h3 className="font-bold text-gray-800 font-cairo">
                        تحدث مع: {chats.find(c => c.studentId === selectedChat.studentId)?.studentName}
                      </h3>
                      <p className="text-xs text-gray-500">بصفتك المدرس: {chats.find(c => c.teacherId === selectedChat.teacherId)?.teacherName}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map(msg => {
                      const isAdmin = msg.sender === 'teacher';
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isAdmin ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                            <p className="text-gray-800 font-cairo text-sm leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-white p-3 border-t border-gray-200 flex items-center gap-2">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendReply(); }}
                      placeholder="اكتب ردك كمعلم..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-cairo text-sm"
                    />
                    <button 
                      onClick={handleSendReply}
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <IoSend className="rotate-180 ml-1" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 font-bold font-cairo">
                  اختر محادثة من القائمة للرد عليها كمعلم
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
