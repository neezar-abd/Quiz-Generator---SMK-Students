'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { QuizPayload, QuizStoreState, GenerateQuizRequest } from '@/types/quiz';
import { ensureQuizPayload } from '@/lib/quizSchema';

// Initial state
const initialState: QuizStoreState = {
  currentQuiz: null,
  quizzes: [],
  isLoading: false,
  error: null,
};

// Actions
type QuizAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_QUIZ'; payload: QuizPayload | null }
  | { type: 'ADD_QUIZ'; payload: QuizPayload }
  | { type: 'UPDATE_QUIZ'; payload: QuizPayload }
  | { type: 'DELETE_QUIZ'; payload: string }
  | { type: 'SET_ALL_QUIZZES'; payload: QuizPayload[] }
  | { type: 'CLEAR_CURRENT_QUIZ' };

// Reducer
function quizReducer(state: QuizStoreState, action: QuizAction): QuizStoreState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_QUIZ':
      return { ...state, currentQuiz: action.payload };
    case 'ADD_QUIZ':
      return { 
        ...state, 
        quizzes: [action.payload, ...state.quizzes],
        currentQuiz: action.payload 
      };
    case 'UPDATE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.map(quiz => 
          quiz.id === action.payload.id ? action.payload : quiz
        ),
        currentQuiz: state.currentQuiz?.id === action.payload.id ? action.payload : state.currentQuiz
      };
    case 'DELETE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.filter(quiz => quiz.id !== action.payload),
        currentQuiz: state.currentQuiz?.id === action.payload ? null : state.currentQuiz
      };
    case 'SET_ALL_QUIZZES':

      return { ...state, quizzes: action.payload };
    case 'CLEAR_CURRENT_QUIZ':
      return { ...state, currentQuiz: null };
    default:
      return state;
  }
}

// Sanitize quiz before API submit
function sanitizeQuizForApi(quiz: QuizPayload): QuizPayload {
  const anyQuiz: any = quiz as any;
  const { _metadata, ...rest } = anyQuiz;
  const normalizedLevel = rest.metadata?.level === 'GENERAL' ? 'General' : rest.metadata?.level;
  const normalizedStatus = typeof rest.metadata?.status === 'string' ? rest.metadata.status.toLowerCase() : rest.metadata?.status;
  const mcqs = (rest.multipleChoice || []).map((q: any) => ({
    question: (q.question ?? '').toString().trim(),
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map((o: any) => (o ?? '').toString()) : ['', '', '', ''],
    answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : 0,
    explanation: q.explanation ? String(q.explanation) : undefined
  }));
  const essays = (rest.essay || []).map((e: any) => ({
    question: (e.question ?? '').toString().trim(),
    rubric: (e.rubric ?? '').toString().trim()
  }));
  return {
    id: rest.id,
    metadata: { ...rest.metadata, level: normalizedLevel, status: normalizedStatus },
    multipleChoice: mcqs,
    essay: essays
  } as QuizPayload;
}

// Context
const QuizContext = createContext<{
  state: QuizStoreState;
  dispatch: React.Dispatch<QuizAction>;
  actions: {
    generateQuiz: (request: GenerateQuizRequest) => Promise<QuizPayload>;
    generateQuizFromFile: (file: File, options: {
      topic: string;
      level: 'X' | 'XI' | 'XII' | 'General';
      mcqCount: number;
      essayCount: number;
    }) => Promise<QuizPayload>;
    saveQuiz: (quiz: QuizPayload) => Promise<void>;
    updateQuiz: (quiz: QuizPayload) => Promise<void>;
    deleteQuiz: (id: string) => Promise<void>;
    loadQuizzes: () => Promise<void>;
    getQuizById: (id: string) => QuizPayload | undefined;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    setCurrentQuiz: (quiz: QuizPayload | null) => void;
    getQuizzesByLevel: (level: 'X' | 'XI' | 'XII' | 'General') => QuizPayload[];
    getRecentQuizzes: (limit?: number) => QuizPayload[];
  };
} | null>(null);

// Provider
interface QuizProviderProps {
  children: ReactNode;
}

export function QuizProvider({ children }: QuizProviderProps) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Mock API function for generating quiz
  const generateQuiz = async (request: GenerateQuizRequest): Promise<QuizPayload> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Call the real API endpoint
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          topic: request.topic,
          level: request.level,
          mcqCount: request.mcqCount,
          essayCount: request.essayCount,
        }),
      });

      if (!response.ok) {
        // Handle API errors
        let errorMessage = 'Failed to generate quiz';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If error response isn't JSON, use status text
          errorMessage = `API Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const newQuiz: QuizPayload = await response.json();
      
      // Add to store
      dispatch({ type: 'ADD_QUIZ', payload: newQuiz });
      dispatch({ type: 'SET_CURRENT_QUIZ', payload: newQuiz });
      
      return newQuiz;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // New method for file upload quiz generation
  const generateQuizFromFile = async (file: File, options: {
    topic: string;
    level: 'X' | 'XI' | 'XII' | 'General';
    mcqCount: number;
    essayCount: number;
  }): Promise<QuizPayload> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Import server action dynamically
      const { handleFileUpload } = await import('@/app/upload/actions');
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionCount', options.mcqCount.toString());
      formData.append('difficulty', getDifficultyFromLevel(options.level));
      formData.append('includeEssay', (options.essayCount > 0).toString());
      formData.append('topic', options.topic);

      const result = await handleFileUpload(formData);

      if (!result.success || !result.quizData) {
        throw new Error(result.error || 'Failed to generate quiz from file');
      }

      // Add to store
      dispatch({ type: 'ADD_QUIZ', payload: result.quizData });
      dispatch({ type: 'SET_CURRENT_QUIZ', payload: result.quizData });
      
      return result.quizData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz from file';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Save quiz to database
  const saveQuiz = useCallback(async (quiz: QuizPayload): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Import user utility
      const { getCurrentUserId } = await import('@/lib/userUtils');
      
      const clean = sanitizeQuizForApi(quiz);
      // Validate client-side to avoid 400s
      ensureQuizPayload(clean);

      const payloadToSend = { ...clean, userId: getCurrentUserId() };

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save quiz');
      }

      const result = await response.json();
      const savedQuiz = result.data;

      dispatch({ type: 'ADD_QUIZ', payload: savedQuiz });
      dispatch({ type: 'SET_CURRENT_QUIZ', payload: savedQuiz });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update quiz in database
  const updateQuiz = async (quiz: QuizPayload): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Import user utility
      const { getCurrentUserId } = await import('@/lib/userUtils');
      
      const clean = sanitizeQuizForApi(quiz);
      ensureQuizPayload(clean);

      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...clean, userId: getCurrentUserId() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update quiz');
      }

      const result = await response.json();
      const updatedQuiz = result.data;

      dispatch({ type: 'UPDATE_QUIZ', payload: updatedQuiz });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delete quiz from database
  const deleteQuiz = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete quiz');
      }

      dispatch({ type: 'DELETE_QUIZ', payload: id });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load all quizzes from API
  const loadQuizzes = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Import user utility
      const { getCurrentUserId } = await import('@/lib/userUtils');
      const userId = getCurrentUserId();
      
      const response = await fetch(`/api/quizzes?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load quizzes');
      }

      const responseText = await response.text();
      
      // Check if response is empty
      if (!responseText.trim()) {
        dispatch({ type: 'SET_ALL_QUIZZES', payload: [] });
        return;
      }
      
      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse quiz response:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      // Extract quizzes from nested data structure
      const quizzes = result.data?.quizzes || result.data || [];
      dispatch({ type: 'SET_ALL_QUIZZES', payload: quizzes });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quizzes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const actions = useMemo(() => ({
    generateQuiz,
    generateQuizFromFile,
    saveQuiz,
    updateQuiz,
    deleteQuiz,
    loadQuizzes,
    getQuizById: (id: string) => {
      return state.quizzes.find(quiz => quiz.id === id);
    },
    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setCurrentQuiz: (quiz: QuizPayload | null) => {
      dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
    },
    // Method to get all quizzes by level
    getQuizzesByLevel: (level: 'X' | 'XI' | 'XII' | 'General') => {
      return state.quizzes.filter(quiz => quiz.metadata.level === level);
    },
    // Method to get recent quizzes
    getRecentQuizzes: (limit: number = 5) => {
      return state.quizzes
        .sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
        .slice(0, limit);
    }
  }), [generateQuiz, generateQuizFromFile, saveQuiz, updateQuiz, deleteQuiz, loadQuizzes, state.quizzes]);

  return (
    <QuizContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </QuizContext.Provider>
  );
}

// Hook
export function useQuizStore() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizStore must be used within a QuizProvider');
  }
  return context;
}

// Helper function to convert level to difficulty
function getDifficultyFromLevel(level: 'X' | 'XI' | 'XII' | 'General'): string {
  switch (level) {
    case 'X': return 'easy';
    case 'XI': return 'medium';
    case 'XII': return 'hard';
    case 'General': return 'medium';
    default: return 'medium';
  }
}

// Helper functions for generating mock data
function generateMockMCQs(count: number, topic: string) {
  return Array.from({ length: count }, (_, i) => ({
    id: `mcq-${i + 1}`,
    question: `What is the key concept #${i + 1} related to ${topic}?`,
    options: [
      `Option A for ${topic} concept ${i + 1}`,
      `Option B for ${topic} concept ${i + 1}`, 
      `Option C for ${topic} concept ${i + 1}`,
      `Option D for ${topic} concept ${i + 1}`
    ] as [string, string, string, string],
    answerIndex: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
    explanation: `This explains why the correct answer relates to ${topic}.`
  }));
}

function generateMockEssays(count: number, topic: string) {
  return Array.from({ length: count }, (_, i) => ({
    id: `essay-${i + 1}`,
    question: `Explain the importance of ${topic} concept ${i + 1} and provide real-world examples.`,
    rubric: `Grade based on: understanding of ${topic}, use of examples, clarity of explanation, depth of analysis.`
  }));
}

// Dummy data for initial state
function getDummyQuizzes(): QuizPayload[] {
  return [
    {
      id: 'quiz-1',
      metadata: {
        topic: 'Basic Electronics Fundamentals',
        level: 'XI',
        createdAt: '2024-12-08T10:00:00Z',
        status: 'published'
      },
      multipleChoice: generateMockMCQs(10, 'Electronics'),
      essay: generateMockEssays(2, 'Electronics')
    },
    {
      id: 'quiz-2', 
      metadata: {
        topic: 'Programming Logic & Algorithms',
        level: 'XII',
        createdAt: '2024-12-07T14:30:00Z',
        status: 'draft'
      },
      multipleChoice: generateMockMCQs(15, 'Programming'),
      essay: generateMockEssays(3, 'Programming')
    },
    {
      id: 'quiz-3',
      metadata: {
        topic: 'Mechanical Engineering Basics',
        level: 'X',
        createdAt: '2024-12-06T09:15:00Z', 
        status: 'published'
      },
      multipleChoice: generateMockMCQs(8, 'Mechanical Engineering'),
      essay: generateMockEssays(2, 'Mechanical Engineering')
    }
  ];
}
