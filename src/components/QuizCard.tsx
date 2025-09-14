'use client';

import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { QuizPayload } from '@/types/quiz';
import { formatDate } from '@/lib/dateUtils';

interface QuizCardProps {
  quiz: QuizPayload;
  onShare?: (quiz: QuizPayload) => void;
  onExport?: (quiz: QuizPayload) => void;
}

const QuizCard = memo<QuizCardProps>(function QuizCard({ quiz, onShare, onExport }) {
  const [displayDate, setDisplayDate] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Memoize computed values
  const totalQuestions = useMemo(() => 
    quiz.multipleChoice.length + quiz.essay.length, 
    [quiz.multipleChoice.length, quiz.essay.length]
  );

  const statusStyle = useMemo(() => 
    quiz.metadata.status === 'published' 
      ? 'bg-green-100 text-green-700 border border-green-200' 
      : 'bg-orange-100 text-orange-700 border border-orange-200',
    [quiz.metadata.status]
  );

  const statusText = useMemo(() => 
    quiz.metadata.status.charAt(0).toUpperCase() + quiz.metadata.status.slice(1),
    [quiz.metadata.status]
  );

  // Memoize handlers
  const handleShare = useCallback(() => {
    onShare?.(quiz);
  }, [onShare, quiz]);

  const handleExport = useCallback(() => {
    onExport?.(quiz);
  }, [onExport, quiz]);

  useEffect(() => {
    setIsClient(true);
    // Format date on client side to avoid hydration mismatch
    try {
      const date = new Date(quiz.metadata.createdAt);
      setDisplayDate(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }));
    } catch (error) {
      setDisplayDate(formatDate(quiz.metadata.createdAt));
    }
  }, [quiz.metadata.createdAt]);

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 h-[280px] flex flex-col">
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-black leading-tight flex-1 pr-3 line-clamp-2">
          {quiz.metadata.topic}
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
          {statusText}
        </div>
      </div>

      {/* Subtitle and Metadata */}
      <div className="mb-3 flex-shrink-0">
        <div className="text-xs text-black/60 mb-1 line-clamp-1">
          <span className="font-medium">Quiz generated from uploaded content</span>
          <span className="mx-1">•</span>
          <span>Level</span>
          <span className="mx-1">•</span>
          <span>{isClient ? displayDate : formatDate(quiz.metadata.createdAt)}</span>
        </div>
        <div className="text-base font-bold text-black">
          {quiz.metadata.level}
        </div>
      </div>

      {/* Question Stats */}
      <div className="flex items-center space-x-4 mb-4 flex-shrink-0">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{quiz.multipleChoice.length}</div>
          <div className="text-xs text-black/60">MCQ</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">{quiz.essay.length}</div>
          <div className="text-xs text-black/60">Essay</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-black">{totalQuestions}</div>
          <div className="text-xs text-black/60">Total</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mt-auto flex-shrink-0">
        <Link href={`/quiz/${quiz.id}`}>
          <button className="flex-1 px-3 py-2 border border-black/20 text-black rounded-lg hover:bg-black/5 transition-colors font-medium text-sm">
            View
          </button>
        </Link>
        
        {quiz.metadata.status === 'draft' ? (
          <Link href={`/builder?id=${quiz.id}`}>
            <button className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors font-medium text-sm">
              Continue
            </button>
          </Link>
        ) : (
          <Link href={`/builder?id=${quiz.id}`}>
            <button className="flex-1 px-3 py-2 border border-black/20 text-black rounded-lg hover:bg-black/5 transition-colors font-medium text-sm">
              Edit
            </button>
          </Link>
        )}

        {onShare && (
          <button 
            className="p-2 border border-black/20 text-black rounded-lg hover:bg-black/5 transition-colors"
            onClick={handleShare}
            title="Share Quiz"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        )}

        {onExport && (
          <button 
            className="p-2 border border-black/20 text-black rounded-lg hover:bg-black/5 transition-colors"
            onClick={handleExport}
            title="Export Quiz"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

export default QuizCard;