'use client';

import { useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import Avatar from '@/components/ui/Avatar';
import { courseComments } from '@/data/comments';
import type { Comment, Reply } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function formatTimestamp(ts: string | number | Date): string {
  if (typeof ts === 'string') return ts;
  const date = ts instanceof Date ? ts : new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'النهاردة';
  if (diff === 1) return 'من إمبارح';
  if (diff < 7) return `من ${diff} أيام`;
  if (diff < 30) return `من ${Math.floor(diff / 7)} أسبوع`;
  return `من ${Math.floor(diff / 30)} شهر`;
}

export default function CommentsSection({ courseId, isSubscribed = false }: { courseId: string, isSubscribed?: boolean }) {
  const allComments = courseComments[courseId] || [];
  const [visibleCount, setVisibleCount] = useState(3);
  const [toast, setToast] = useState('');
  const comments = allComments.slice(0, visibleCount);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (!isSubscribed) {
      e.preventDefault();
      showToast('يجب الاشتراك أولاً في الكورس للتمكن من التعليق.');
    }
  };

  return (
    <div className="space-y-5 dir-rtl">
      
      {/* In-app Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl text-center"
          >
            🔒 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Comment Input */}
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center mt-1">
          <IoPerson className="text-gray-400 text-sm" />
        </div>
        <div className="flex-1 relative">
          <textarea 
            placeholder="أضف تعليقاً أو استفساراً..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[72px] resize-none focus:outline-none focus:border-blue-400 text-sm text-gray-700"
            style={{ fontFamily: 'system-ui, sans-serif' }}
            onClick={handleInputClick}
            readOnly={!isSubscribed}
          />
          {!isSubscribed && (
            <div 
              className="absolute inset-0 bg-white/50 backdrop-blur-[1px] cursor-not-allowed rounded-xl flex items-center justify-center"
              onClick={handleInputClick}
            >
              <span className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs border border-red-100 flex items-center gap-1.5">
                🔒 اشترك أولاً للمشاركة
              </span>
            </div>
          )}
        </div>
      </div>

      {allComments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
      ) : (
        /* Mobile: Chat-bubble container that visually separates comments from the page */
        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
          {/* Header strip */}
          <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-400">تعليقات الطلاب والردود</span>
          </div>

          <div className="px-3 py-2 divide-y divide-gray-100/70">
            {comments.map((comment: Comment) => (
              <div key={comment.id} className="py-4">
                {/* Comment bubble */}
                <div className="flex gap-2.5 items-start">
                  <Avatar name={comment.userName} color={comment.userAvatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-800">{comment.userName}</span>
                      <span className="text-[10px] text-gray-400">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    {/* Comment text in a bubble */}
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tr-none px-3 py-2 shadow-sm inline-block max-w-full">
                      <p className="text-sm text-gray-700 leading-relaxed break-words" style={{ fontFamily: 'system-ui, sans-serif' }}>{comment.text}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 mr-8 space-y-2.5">
                    {comment.replies.map((reply: Reply) => (
                      <div key={reply.id} className="flex gap-2.5 items-start">
                        <Avatar name={reply.userName} color={reply.role === 'teacher' ? '#3b82f6' : '#22c55e'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold text-gray-800">{reply.userName}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${reply.role === 'teacher' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {reply.role === 'teacher' ? 'مدرس' : 'دعم'}
                            </span>
                            <span className="text-[10px] text-gray-400">{formatTimestamp(reply.timestamp)}</span>
                          </div>
                          {/* Reply bubble - left aligned (teacher) */}
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm inline-block max-w-full">
                            <p className="text-sm text-gray-700 leading-relaxed break-words" style={{ fontFamily: 'system-ui, sans-serif' }}>{reply.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {visibleCount < allComments.length && (
            <div className="px-4 py-3 border-t border-gray-100 bg-white text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                عرض المزيد ↓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
