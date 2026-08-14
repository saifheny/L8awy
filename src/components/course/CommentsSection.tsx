'use client';

import { useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import Avatar from '@/components/ui/Avatar';
import { courseComments } from '@/data/comments';
import type { Comment, Reply } from '@/lib/types';

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
  const comments = allComments.slice(0, visibleCount);
  
  const handleInputClick = (e: React.MouseEvent) => {
    if (!isSubscribed) {
      e.preventDefault();
      alert('يجب الاشتراك أولاً في الكورس للتمكن من التعليق.');
    }
  };

  return (
    <div className="space-y-8 dir-rtl">
      
      {/* Add Comment Input */}
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-100 flex-shrink-0 flex items-center justify-center">
          <IoPerson className="text-blue-400 text-xl" />
        </div>
        <div className="flex-1 relative">
          <textarea 
            placeholder="أضف تعليقاً أو استفساراً حول الكورس..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[100px] resize-none focus:outline-none focus:border-blue-500 font-cairo shadow-inner"
            onClick={handleInputClick}
            readOnly={!isSubscribed}
          ></textarea>
          {!isSubscribed && (
            <div 
              className="absolute inset-0 bg-white/40 backdrop-blur-[1px] cursor-not-allowed rounded-2xl flex items-center justify-center border border-gray-200"
              onClick={handleInputClick}
            >
              <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold font-cairo shadow-sm border border-red-100 flex items-center gap-2">
                🔒 يجب الاشتراك أولاً للمشاركة
              </span>
            </div>
          )}
        </div>
      </div>

      {allComments.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-3xl text-center text-gray-500 font-bold border border-gray-100">
          لا توجد تعليقات حتى الآن. كن أول من يعلق!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment: Comment, index: number) => (
              <div
              key={comment.id}
              className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <Avatar name={comment.userName} color={comment.userAvatar} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{comment.userName}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded-md">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 font-cairo leading-relaxed">{comment.text}</p>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-6 mr-12 space-y-4 border-r-4 border-gray-100 pr-6">
                  {comment.replies.map((reply: Reply) => (
                    <div key={reply.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex gap-3">
                      <Avatar name={reply.userName} color={reply.role === 'teacher' ? '#3b82f6' : '#22c55e'} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">{reply.userName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${reply.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {reply.role === 'teacher' ? 'مدرس' : 'دعم فني'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-bold bg-white px-2 py-1 rounded-md border border-gray-200">{formatTimestamp(reply.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 text-sm font-cairo">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {visibleCount < allComments.length ? (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="px-8 py-3 bg-transparent border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 font-bold font-cairo rounded-xl transition-colors"
              >
                {isSubscribed ? 'عرض المزيد من التعليقات' : 'اشترك للمزيد من التعليقات'}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
