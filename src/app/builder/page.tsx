'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import QuizEditor from '@/components/QuizEditor';
import { useQuizStore } from '@/hooks/useQuizStore';
import { QuizPayload, MCQ, Essay } from '@/types/quiz';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, actions } = useQuizStore();
  
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const quizId = searchParams.get('id');

  const levelOptions = [
    { value: 'X', label: 'Class X' },
    { value: 'XI', label: 'Class XI' },
    { value: 'XII', label: 'Class XII' },
    { value: 'General', label: 'General' }
  ];

  // Load quiz from store
  useEffect(() => {
    if (quizId) {
      const foundQuiz = actions.getQuizById(quizId);
      if (foundQuiz) {
        setQuiz({ ...foundQuiz });
      } else {
        router.push('/dashboard');
      }
    } else if (state.currentQuiz) {
      setQuiz({ ...state.currentQuiz });
    } else {
      router.push('/upload');
    }
  }, [quizId, state.currentQuiz, actions, router]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const markAsChanged = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  const updateMetadata = (field: keyof QuizPayload['metadata'], value: string | number) => {
    if (!quiz) return;
    
    setQuiz(prev => ({
      ...prev!,
      metadata: {
        ...prev!.metadata,
        [field]: value,
        updatedAt: new Date().toISOString()
      }
    }));
    markAsChanged();
  };

  const handleUpdateMCQ = (index: number, mcq: MCQ) => {
    if (!quiz) return;
    
    const newMCQs = [...quiz.multipleChoice];
    newMCQs[index] = mcq;
    setQuiz(prev => ({ ...prev!, multipleChoice: newMCQs }));
    markAsChanged();
  };

  const handleUpdateEssay = (index: number, essay: Essay) => {
    if (!quiz) return;
    
    const newEssays = [...quiz.essay];
    newEssays[index] = essay;
    setQuiz(prev => ({ ...prev!, essay: newEssays }));
    markAsChanged();
  };

  const handleDeleteMCQ = (index: number) => {
    if (!quiz) return;
    
    const newMCQs = quiz.multipleChoice.filter((_, i) => i !== index);
    setQuiz(prev => ({ ...prev!, multipleChoice: newMCQs }));
    markAsChanged();
  };

  const handleDeleteEssay = (index: number) => {
    if (!quiz) return;
    
    const newEssays = quiz.essay.filter((_, i) => i !== index);
    setQuiz(prev => ({ ...prev!, essay: newEssays }));
    markAsChanged();
  };

  const handleMoveMCQ = (index: number, direction: 'up' | 'down') => {
    if (!quiz) return;
    
    const newMCQs = [...quiz.multipleChoice];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newMCQs.length) {
      const tmp = newMCQs[index];
      newMCQs[index] = newMCQs[targetIndex]!;
      newMCQs[targetIndex] = tmp!;
      setQuiz(prev => ({ ...prev!, multipleChoice: newMCQs }));
      markAsChanged();
    }
  };

  const handleMoveEssay = (index: number, direction: 'up' | 'down') => {
    if (!quiz) return;
    
    const newEssays = [...quiz.essay];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newEssays.length) {
      const tmp = newEssays[index];
      newEssays[index] = newEssays[targetIndex]!;
      newEssays[targetIndex] = tmp!;
      setQuiz(prev => ({ ...prev!, essay: newEssays }));
      markAsChanged();
    }
  };

  const handleAddMCQ = () => {
    if (!quiz) return;
    
    const newMCQ: MCQ = {
      question: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explanation: ''
    };
    
    setQuiz((prev: QuizPayload | null) => ({
      ...prev!,
      multipleChoice: [...prev!.multipleChoice, newMCQ]
    }));
    markAsChanged();
  };

  const handleAddEssay = () => {
    if (!quiz) return;
    
    const newEssay: Essay = {
      question: '',
      rubric: ''
    };
    
    setQuiz((prev: QuizPayload | null) => ({
      ...prev!,
      essay: [...prev!.essay, newEssay]
    }));
    markAsChanged();
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!quiz) return;
    
    setIsSaving(true);
    
    const updatedQuiz = {
      ...quiz,
      metadata: {
        ...quiz.metadata,
        status,
        updatedAt: new Date().toISOString()
      }
    };
    
    try {
      await actions.updateQuiz(updatedQuiz);
      setQuiz(updatedQuiz);
      setHasUnsavedChanges(false);
      
      // Show success message (you can add a toast here)
      console.log(`Quiz saved as ${status}`);
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!quiz) return;
    
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${quiz.metadata.topic} - Quiz</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1, h2 { color: #000; }
              .question { margin: 20px 0; }
              .options { margin-left: 20px; }
              .answer-key { page-break-before: always; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${quiz.metadata.topic}</h1>
            <p>Level: ${quiz.metadata.level} | Questions: ${quiz.multipleChoice.length + quiz.essay.length}</p>
            
            <h2>Multiple Choice Questions</h2>
            ${quiz.multipleChoice.map((mcq: MCQ, i: number) => `
              <div class="question">
                <strong>${i + 1}. ${mcq.question}</strong>
                <div class="options">
                  ${mcq.options.map((option: string, j: number) => `
                    <div>${String.fromCharCode(65 + j)}. ${option}</div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            
            <h2>Essay Questions</h2>
            ${quiz.essay.map((essay: Essay, i: number) => `
              <div class="question">
                <strong>${i + 1}. ${essay.question}</strong>
              </div>
            `).join('')}
            
            <div class="answer-key">
              <h2>Answer Key</h2>
              ${quiz.multipleChoice.map((mcq: MCQ, i: number) => `
                <div><strong>${i + 1}.</strong> ${String.fromCharCode(65 + mcq.answerIndex)} ${mcq.explanation ? `- ${mcq.explanation}` : ''}</div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!quiz) {
    return (
      <Container className="pt-20 pb-12">
        <div className="text-center">
          <p className="text-black/60">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Sticky Toolbar */}
      <div className="sticky top-16 bg-white border-b border-black/10 z-40">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-black/60 hover:text-black"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </Button>
              <div className="w-px h-6 bg-black/10"></div>
              <h1 className="text-xl font-semibold text-black">Quiz Builder</h1>
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600">• Unsaved changes</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? 'Hide' : 'Show'} Answers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('published')}
                disabled={isSaving}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                Export
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-8 pb-8">
        {/* Quiz Metadata */}
        <div className="mb-8 p-6 border border-black/15 rounded-xl">
          <h2 className="text-lg font-semibold text-black mb-4">Quiz Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Topic"
              value={quiz.metadata.topic}
              onChange={(e) => updateMetadata('topic', e.target.value)}
            />
            <Select
              label="Level"
              options={levelOptions}
              value={quiz.metadata.level}
              onChange={(e) => updateMetadata('level', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Status
              </label>
              <span className={`px-3 py-2 text-sm font-medium border rounded ${
                quiz.metadata.status === 'published' 
                  ? 'bg-black text-white' 
                  : 'border-black/30 text-black/60'
              }`}>
                {quiz.metadata.status.charAt(0).toUpperCase() + quiz.metadata.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Editor */}
        <QuizEditor
          mcqs={quiz.multipleChoice}
          essays={quiz.essay}
          onUpdateMCQ={handleUpdateMCQ}
          onUpdateEssay={handleUpdateEssay}
          onDeleteMCQ={handleDeleteMCQ}
          onDeleteEssay={handleDeleteEssay}
          onMoveMCQ={handleMoveMCQ}
          onMoveEssay={handleMoveEssay}
          onAddMCQ={handleAddMCQ}
          onAddEssay={handleAddEssay}
          showAnswers={showAnswers}
        />
      </Container>
    </div>
  );
}

export default function Builder() {
  return (
    <Suspense fallback={
      <Container className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Container>
    }>
      <BuilderContent />
    </Suspense>
  );
}