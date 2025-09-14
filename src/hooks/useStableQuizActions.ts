/**
 * Stable Quiz Actions Hook
 * Provides memoized quiz actions to prevent infinite re-renders
 */

import { useCallback } from 'react';
import { useQuizStore } from './useQuizStore';
import { QuizPayload } from '@/types/quiz';

export function useStableQuizActions() {
  const { actions } = useQuizStore();

  const stableLoadQuizzes = useCallback(() => {
    return actions.loadQuizzes();
  }, []);

  const stableSaveQuiz = useCallback((quiz: QuizPayload) => {
    return actions.saveQuiz(quiz);
  }, []);

  const stableUpdateQuiz = useCallback((quiz: QuizPayload) => {
    return actions.updateQuiz(quiz);
  }, []);

  const stableDeleteQuiz = useCallback((id: string) => {
    return actions.deleteQuiz(id);
  }, []);

  return {
    loadQuizzes: stableLoadQuizzes,
    saveQuiz: stableSaveQuiz,
    updateQuiz: stableUpdateQuiz,
    deleteQuiz: stableDeleteQuiz,
    // Pass through other actions that don't cause re-renders
    generateQuiz: actions.generateQuiz,
    generateQuizFromFile: actions.generateQuizFromFile,
    getQuizById: actions.getQuizById,
    clearError: actions.clearError,
    setLoading: actions.setLoading,
    setCurrentQuiz: actions.setCurrentQuiz,
    getQuizzesByLevel: actions.getQuizzesByLevel,
    getRecentQuizzes: actions.getRecentQuizzes,
  };
}