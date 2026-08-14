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
    <div className="space-y-6 dir-rtl">
      
      {/* Add Comment Input */}
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
          <IoPerson className="text-gray-400 text-base" />
        </div>
        <div className="flex-1 relative">
          <textarea 
            placeholder="أضف تعليقاً أو استفساراً حول الكورس..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[80px] resize-none focus:outline-none focus:border-blue-400 text-sm text-gray-700 shadow-inner"
            style={{ fontFamily: 'system-ui, sans-serif' }}
            onClick={handleInputClick}
            readOnly={!isSubscribed}
          ></textarea>
          {!isSubscribed && (
            <div 
              className="absolute inset-0 bg-white/50 backdrop-blur-[1px] cursor-not-allowed rounded-xl flex items-center justify-center"
              onClick={handleInputClick}
            >
              <span className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-sm border border-red-100 flex items-center gap-1.5">
                🔒 اشترك أولاً للمشاركة
              </span>
            </div>
          )}
        </div>
      </div>

      {allComments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="py-5">
              {/* Comment */}
              <div className="flex gap-3 items-start">
                <Avatar name={comment.userName} color={comment.userAvatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{comment.userName}</span>
                    <span className="text-xs text-gray-400">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>{comment.text}</p>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 mr-10 space-y-3 border-r-2 border-gray-100 pr-4">
                  {comment.replies.map((reply: Reply) => (
                    <div key={reply.id} className="flex gap-3 items-start">
                      <Avatar name={reply.userName} color={reply.role === 'teacher' ? '#3b82f6' : '#22c55e'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{reply.userName}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${reply.role === 'teacher' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {reply.role === 'teacher' ? 'مدرس' : 'دعم فني'}
                          </span>
                          <span className="text-xs text-gray-400">{formatTimestamp(reply.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {visibleCount < allComments.length && (
            <div className="pt-4 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
              >
                عرض المزيد من التعليقات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
