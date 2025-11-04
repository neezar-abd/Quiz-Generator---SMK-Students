'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { QuizPayload } from '@/types/quiz';

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  const quizId = params.id as string;

  useEffect(() => {
    const fetchPublicQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}/public`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load quiz');
        }
        
        const data = await response.json();
        setQuiz(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchPublicQuiz();
    }
  }, [quizId]);

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.multipleChoice.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    // Calculate score
    let correctCount = 0;
    quiz.multipleChoice.forEach((question, index) => {
      if (selectedAnswers[index] === question.answerIndex) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-black/10 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-black/10 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-black/60 mt-4">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Unable to Load Quiz</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Home
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-black/60">Quiz not found</p>
        </div>
      </Container>
    );
  }

  // Results View
  if (showResults) {
    const percentage = Math.round((score / quiz.multipleChoice.length) * 100);
    
    return (
      <Container className="py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-black/10 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-black mb-4">Quiz Completed! 🎉</h2>
            
            <div className="my-8">
              <div className="text-6xl font-bold text-black mb-2">
                {percentage}%
              </div>
              <p className="text-black/60">
                You scored {score} out of {quiz.multipleChoice.length} questions
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {quiz.multipleChoice.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.answerIndex;
                
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 text-left ${
                      isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`text-2xl ${isCorrect ? '✅' : '❌'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-black mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          Your answer: {question.options[userAnswer] || 'Not answered'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700 mt-1">
                            Correct answer: {question.options[question.answerIndex]}
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-black/70 mt-2 italic">
                            💡 {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4 justify-center">
              <Button onClick={handleRetry}>
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="outline">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Quiz Taking View
  const currentQuestion = quiz.multipleChoice[currentQuestionIndex];
  const totalQuestions = quiz.multipleChoice.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <Container className="py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{quiz.metadata.topic}</h1>
          <div className="flex items-center justify-between text-sm text-black/60">
            <span>Level: {quiz.metadata.level}</span>
            <span>{answeredCount} / {totalQuestions} answered</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-black/60 mb-2">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-black/10 rounded-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-black mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 hover:border-black/40 bg-white text-black'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                      isSelected ? 'border-white' : 'border-black/30'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            ← Previous
          </Button>

          <div className="flex space-x-3">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next →
              </Button>
            )}
          </div>
        </div>

        {/* Answer Status */}
        {answeredCount < totalQuestions && (
          <div className="mt-6 text-center text-sm text-black/60">
            Please answer all questions before submitting
          </div>
        )}
      </div>
    </Container>
  );
}
