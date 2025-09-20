/**
 * Stable Quiz Actions Hook
 * Provides memoized quiz actions to prevent infinite re-renders
 */

import { useCallback } from 'react';
import { useQuizStore } from './useQuizStore';
import { QuizPayload } from '@/types/quiz';

export function useStableQuizActions() {
  const { actions } = useQuizStore();
  const {
    loadQuizzes,
    saveQuiz,
    updateQuiz,
    deleteQuiz,
    generateQuiz,
    generateQuizFromFile,
    getQuizById,
    clearError,
    setLoading,
    setCurrentQuiz,
    getQuizzesByLevel,
    getRecentQuizzes,
  } = actions;

  const stableLoadQuizzes = useCallback(() => {
    return loadQuizzes();
  }, [loadQuizzes]);

  const stableSaveQuiz = useCallback((quiz: QuizPayload) => {
    return saveQuiz(quiz);
  }, [saveQuiz]);

  const stableUpdateQuiz = useCallback((quiz: QuizPayload) => {
    return updateQuiz(quiz);
  }, [updateQuiz]);

  const stableDeleteQuiz = useCallback((id: string) => {
    return deleteQuiz(id);
  }, [deleteQuiz]);

  return {
    loadQuizzes: stableLoadQuizzes,
    saveQuiz: stableSaveQuiz,
    updateQuiz: stableUpdateQuiz,
    deleteQuiz: stableDeleteQuiz,
    // Pass through other actions that don't cause re-renders
    generateQuiz,
    generateQuizFromFile,
    getQuizById,
    clearError,
    setLoading,
    setCurrentQuiz,
    getQuizzesByLevel,
    getRecentQuizzes,
  };
}