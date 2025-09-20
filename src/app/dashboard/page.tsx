'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useQuizStore } from '@/hooks/useQuizStore';
import { useStableQuizActions } from '@/hooks/useStableQuizActions';
import { QuizPayload } from '@/types/quiz';
import { SectionAnimated } from '@/components/animations';

// Dynamic imports for better performance
const QuizCard = dynamic(() => import('@/components/QuizCard'), {
  loading: () => <div className="h-[280px] bg-gray-100 animate-pulse rounded-2xl" />
});

const ShareDialog = dynamic(() => import('@/components/ShareDialog'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white p-6 rounded-lg">Loading...</div></div>
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { state } = useQuizStore();
  const { loadQuizzes: loadQuizzesStable } = useStableQuizActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [shareQuiz, setShareQuiz] = useState<QuizPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize level options
  const levelOptions = useMemo(() => [
    { value: '', label: 'All Levels' },
    { value: 'X', label: 'Class X' },
    { value: 'XI', label: 'Class XI' },
    { value: 'XII', label: 'Class XII' },
    { value: 'General', label: 'General' }
  ], []);

  // Ensure quizzes is always an array
  const quizzes = useMemo(() => 
    Array.isArray(state.quizzes) ? state.quizzes : [], 
    [state.quizzes]
  );

  // Fetch user's quizzes sekali saat sudah authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        await loadQuizzesStable();
      } catch (err) {
        console.error('Error loading quizzes:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [session?.user, status, loadQuizzesStable]);

  // Memoize filtered quizzes
  const filteredQuizzes = useMemo(() => 
    quizzes.filter((quiz: QuizPayload) => {
      const matchesSearch = quiz.metadata.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !levelFilter || quiz.metadata.level === levelFilter;
      return matchesSearch && matchesLevel;
    }), 
    [quizzes, searchTerm, levelFilter]
  );

  // Memoize statistics
  const statistics = useMemo(() => ({
    total: quizzes.length,
    published: quizzes.filter((q: QuizPayload) => q.metadata.status === 'published').length,
    draft: quizzes.filter((q: QuizPayload) => q.metadata.status === 'draft').length,
    totalQuestions: quizzes.reduce((acc: number, q: QuizPayload) => acc + q.multipleChoice.length + q.essay.length, 0)
  }), [quizzes]);

  // Memoized handlers
  const handleShare = useCallback((quiz: QuizPayload) => {
    setShareQuiz(quiz);
  }, []);

  const handleExport = useCallback((quiz: QuizPayload) => {
    // Create printable version
    const printContent = `
      <html>
        <head>
          <title>${quiz.metadata.topic} - Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
            .question { margin: 15px 0; page-break-inside: avoid; }
            .options { margin-left: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${quiz.metadata.topic} - Level ${quiz.metadata.level}</h1>
          <p>Created: ${new Date(quiz.metadata.createdAt).toLocaleDateString()}</p>
          
          <h2>Multiple Choice (${quiz.multipleChoice.length})</h2>
          ${quiz.multipleChoice.map((mcq, i) => `
            <div class="question">
              <strong>${i + 1}. ${mcq.question}</strong>
              <div class="options">
                ${mcq.options.map((option, j) => 
                  `<div>${String.fromCharCode(65 + j)}. ${option}</div>`
                ).join('')}
              </div>
            </div>
          `).join('')}
          
          <h2>Essay Questions (${quiz.essay.length})</h2>
          ${quiz.essay.map((essay, i) => `
            <div class="question">
              <strong>${i + 1}. ${essay.question}</strong>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Load quizzes when component mounts
  // Show loading while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-black/10 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-black/5 rounded-lg w-96 mx-auto mb-8"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/10 p-6 animate-pulse">
                  <div className="h-12 bg-black/5 rounded-xl mx-auto mb-3"></div>
                  <div className="h-8 bg-black/10 rounded mb-1"></div>
                  <div className="h-4 bg-black/5 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">Welcome to Your Dashboard</h1>
            <p className="text-lg text-black/60 mb-8">
              Please login to access your personal quiz collection and create new assessments.
            </p>
            <Link
              href="/"
              prefetch
              className="inline-flex items-center px-8 py-4 bg-black !text-white rounded-xl font-medium hover:bg-black/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <SectionAnimated className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">
            Quiz Dashboard
          </h1>
          <p className="text-lg text-black/60 max-w-2xl mx-auto mb-8">
            Manage all your quizzes in one place. Create, edit, share, and track your AI-generated assessments.
          </p>
          
          <Link
            href="/upload"
            prefetch
            className="inline-flex items-center px-8 py-4 bg-black !text-white rounded-xl font-medium hover:bg-black/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Quiz
          </Link>
        </SectionAnimated>

        {/* Stats Overview */}
        <SectionAnimated className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 text-center hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-black mb-1">{statistics.total}</div>
            <div className="text-black/60 text-sm font-medium">Total Quizzes</div>
            <div className="text-xs text-black/40 mt-1">All quizzes created</div>
          </div>
          
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 text-center hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-black mb-1">{statistics.published}</div>
            <div className="text-black/60 text-sm font-medium">Published</div>
            <div className="text-xs text-black/40 mt-1">Ready to use</div>
          </div>
          
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 text-center hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-black mb-1">{statistics.draft}</div>
            <div className="text-black/60 text-sm font-medium">Drafts</div>
            <div className="text-xs text-black/40 mt-1">Work in progress</div>
          </div>
          
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 text-center hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-black mb-1">{statistics.totalQuestions}</div>
            <div className="text-black/60 text-sm font-medium">Total Questions</div>
            <div className="text-xs text-black/40 mt-1">MCQ + Essay questions</div>
          </div>
        </SectionAnimated>

        {/* Search and Filter */}
        <SectionAnimated className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-2">Search Quizzes</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                  placeholder="Search by title or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-black mb-2">Filter by Level</label>
              <select
                className="w-full p-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between text-sm">
            <span className="text-black/60">
              Showing {filteredQuizzes.length} of {statistics.total} quizzes
            </span>
            {(searchTerm || levelFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLevelFilter('');
                }}
                className="text-black/60 hover:text-black transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </SectionAnimated>

        {/* Quiz Grid */}
        <SectionAnimated className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black">Your Quizzes</h2>
            <div className="flex items-center space-x-2 text-sm text-black/60">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Published</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Draft</span>
            </div>
          </div>
          
          {state.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-black mb-2">Loading your quizzes</h3>
                <p className="text-black/60">Please wait while we fetch your data...</p>
              </div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {searchTerm || levelFilter ? (
                  <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {searchTerm || levelFilter ? 'No quizzes found' : 'No quizzes yet'}
              </h3>
              <p className="text-black/60 mb-6 max-w-md mx-auto">
                {searchTerm || levelFilter
                  ? 'Try adjusting your search or filter criteria to find more quizzes.'
                  : 'Upload your first study material to generate a quiz and get started with AI-powered learning.'}
              </p>
              <Link
                href="/upload"
                prefetch
                className="inline-flex items-center px-6 py-3 bg-black !text-white rounded-xl font-medium hover:bg-black/90 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onShare={handleShare}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </SectionAnimated>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={!!shareQuiz}
        onClose={() => setShareQuiz(null)}
        quiz={shareQuiz}
      />
    </div>
  );
}