'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/Tabs';
import ShareDialog from '@/components/ShareDialog';
import { useQuizStore } from '@/hooks/useQuizStore';
import { QuizPayload } from '@/types/quiz';

export default function QuizDetail() {
  const params = useParams();
  const router = useRouter();
  const { actions } = useQuizStore();
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const quizId = params.id as string;

  useEffect(() => {
    if (quizId) {
      const foundQuiz = actions.getQuizById(quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        router.push('/dashboard');
      }
    }
  }, [quizId, actions, router]);

  const handlePrint = () => {
    window.print();
  };

  const handlePresent = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleExport = () => {
    if (!quiz) return;
    
    const exportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${quiz.metadata.topic} - Quiz Export</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #000; 
              line-height: 1.6;
            }
            .header { 
              border-bottom: 2px solid #000; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .question { 
              margin: 25px 0; 
              page-break-inside: avoid; 
            }
            .question-number { 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .options { 
              margin-left: 20px; 
              margin-top: 10px;
            }
            .option { 
              margin: 5px 0; 
            }
            .answer-key { 
              page-break-before: always; 
              margin-top: 40px;
            }
            .essay-space {
              border: 1px solid #ccc;
              min-height: 100px;
              margin-top: 10px;
              padding: 10px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${quiz.metadata.topic}</h1>
            <p><strong>Level:</strong> ${quiz.metadata.level} | <strong>Date:</strong> ${new Date(quiz.metadata.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Questions:</strong> ${quiz.multipleChoice.length + quiz.essay.length} (MCQ: ${quiz.multipleChoice.length}, Essay: ${quiz.essay.length})</p>
          </div>
          
          <h2>Multiple Choice Questions</h2>
          ${quiz.multipleChoice.map((mcq, i) => `
            <div class="question">
              <div class="question-number">${i + 1}. ${mcq.question}</div>
              <div class="options">
                ${mcq.options.map((option, j) => `
                  <div class="option">${String.fromCharCode(65 + j)}. ${option}</div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          <h2>Essay Questions</h2>
          ${quiz.essay.map((essay, i) => `
            <div class="question">
              <div class="question-number">${quiz.multipleChoice.length + i + 1}. ${essay.question}</div>
              <div class="essay-space"></div>
            </div>
          `).join('')}
          
          <div class="answer-key">
            <h2>Answer Key</h2>
            <h3>Multiple Choice Answers</h3>
            ${quiz.multipleChoice.map((mcq, i) => `
              <div><strong>${i + 1}.</strong> ${String.fromCharCode(65 + mcq.answerIndex)}${mcq.explanation ? ` - ${mcq.explanation}` : ''}</div>
            `).join('')}
            
            <h3>Essay Rubrics</h3>
            ${quiz.essay.map((essay, i) => `
              <div class="question">
                <strong>${quiz.multipleChoice.length + i + 1}.</strong> ${essay.rubric}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([exportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quiz.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!quiz) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <p className="text-black/60">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PreviewTab = () => (
    <div className="space-y-8">
      {/* Multiple Choice Section */}
      {quiz.multipleChoice.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-black mb-6 print-section-title">
            Multiple Choice Questions
          </h3>
          <div className="space-y-6">
            {quiz.multipleChoice.map((mcq, index) => (
              <div key={index} className="border border-black/10 rounded-lg p-6 print-question">
                <div className="font-medium text-black mb-4">
                  {index + 1}. {mcq.question}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                  {mcq.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <span className="w-6 h-6 border border-black/30 rounded flex items-center justify-center text-sm">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="text-black/80">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essay Section */}
      {quiz.essay.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-black mb-6 print-section-title">
            Essay Questions
          </h3>
          <div className="space-y-6">
            {quiz.essay.map((essay, index) => (
              <div key={`essay-${index}`} className="border border-black/10 rounded-lg p-6 print-question">
                <div className="font-medium text-black mb-4">
                  {quiz.multipleChoice.length + index + 1}. {essay.question}
                </div>
                <div className="border border-black/10 rounded min-h-[100px] p-4 print-answer-space">
                  <span className="text-black/40 text-sm">Answer space</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const AnswerKeyTab = () => (
    <div className="space-y-8">
      {/* MCQ Answer Key */}
      {quiz.multipleChoice.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-black mb-6">
            Multiple Choice Answer Key
          </h3>
          <div className="space-y-4">
            {quiz.multipleChoice.map((mcq, index) => (
              <div key={`answer-${index}`} className="border border-black/10 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="font-medium text-black min-w-[2rem]">
                    {index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black mb-2">
                      Answer: {String.fromCharCode(65 + mcq.answerIndex)}
                    </div>
                    {mcq.explanation && (
                      <div className="text-black/70 text-sm">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essay Rubrics */}
      {quiz.essay.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-black mb-6">
            Essay Grading Rubrics
          </h3>
          <div className="space-y-4">
            {quiz.essay.map((essay, index) => (
              <div key={`essay-answer-${index}`} className="border border-black/10 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="font-medium text-black min-w-[2rem]">
                    {quiz.multipleChoice.length + index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black mb-2">Grading Criteria:</div>
                    <div className="text-black/70 text-sm">{essay.rubric}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ShareTab = () => (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <div className="border border-black/10 rounded-lg p-6">
          <h3 className="font-semibold text-black mb-4">Quiz Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/60">Topic:</span>
              <span className="text-black">{quiz.metadata.topic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Level:</span>
              <span className="text-black">{quiz.metadata.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Questions:</span>
              <span className="text-black">{quiz.multipleChoice.length + quiz.essay.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Created:</span>
              <span className="text-black">{formatDate(quiz.metadata.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Status:</span>
              <Badge variant={quiz.metadata.status === 'published' ? 'default' : 'outline'}>
                {quiz.metadata.status.charAt(0).toUpperCase() + quiz.metadata.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border border-black/10 rounded-lg p-6">
          <h3 className="font-semibold text-black mb-4">Sharing Options</h3>
          <div className="space-y-4">
            <Button
              onClick={() => setShowShareDialog(true)}
              className="w-full"
            >
              Generate Share Link
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full"
            >
              Export as HTML
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full"
            >
              Print Quiz
            </Button>
          </div>
        </div>

        <div className="border border-black/10 rounded-lg p-6">
          <h3 className="font-semibold text-black mb-4">QR Code</h3>
          <div className="flex justify-center">
            <div className="w-32 h-32 border-2 border-dashed border-black/30 rounded-lg flex items-center justify-center">
              <span className="text-black/40 text-sm">QR Placeholder</span>
            </div>
          </div>
          <p className="text-xs text-black/60 text-center mt-2">
            Scan to access quiz on mobile devices
          </p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'preview',
      label: 'Preview',
      content: <PreviewTab />
    },
    {
      id: 'answers',
      label: 'Answer Key',
      content: <AnswerKeyTab />
    },
    {
      id: 'share',
      label: 'Share',
      content: <ShareTab />
    }
  ];

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 20px; }
          .print-question { 
            break-inside: avoid; 
            margin-bottom: 20px; 
          }
          .print-section-title {
            break-after: avoid;
            margin-top: 30px;
          }
          .print-answer-space {
            min-height: 80px;
            border: 1px solid #ccc;
          }
        }
      `}</style>
      
      <Container className="pt-20 pb-12">
        {/* Back Button */}
        <div className="mb-6 no-print">
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
        </div>

        {/* Header */}
        <div className="mb-8 no-print mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 leading-tight">
                {quiz.metadata.topic}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-black/60">
                <span>Level {quiz.metadata.level}</span>
                <span>•</span>
                <span>{quiz.multipleChoice.length + quiz.essay.length} questions</span>
                <span>•</span>
                <span>Created {formatDate(quiz.metadata.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={handlePresent}
                variant="outline"
                size="sm"
              >
                Present
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
              >
                Print
              </Button>
              <Button
                onClick={() => router.push(`/builder?id=${quiz.id}`)}
                size="sm"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs
          tabs={tabs}
          defaultTab="preview"
          className="no-print"
        />

        {/* Share Dialog */}
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          quiz={quiz}
        />
      </Container>
    </>
  );
}