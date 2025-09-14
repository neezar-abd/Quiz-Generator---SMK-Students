/**
 * Quiz API Client
 * Centralized API calls for quiz operations
 */

import { QuizPayload } from '@/types/quiz';

export interface QuizListResponse {
  success: boolean;
  data: QuizPayload[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

export interface QuizResponse {
  success: boolean;
  data?: QuizPayload;
  error?: string;
  message?: string;
}

export interface QuizListParams {
  page?: number;
  limit?: number;
  level?: 'X' | 'XI' | 'XII' | 'General';
  status?: 'draft' | 'published' | 'archived';
  search?: string;
}

/**
 * Quiz API Client Class
 */
export class QuizApiClient {
  private static baseURL = '/api/quizzes';

  /**
   * Create a new quiz
   */
  static async createQuiz(quiz: QuizPayload): Promise<QuizResponse> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create quiz'
      };
    }
  }

  /**
   * Get all quizzes with optional filtering
   */
  static async getQuizzes(params?: QuizListParams): Promise<QuizListResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.level) searchParams.set('level', params.level);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);

      const url = `${this.baseURL}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);

      return await response.json();
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch quizzes'
      };
    }
  }

  /**
   * Get a quiz by ID
   */
  static async getQuiz(id: string): Promise<QuizResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quiz'
      };
    }
  }

  /**
   * Update a quiz
   */
  static async updateQuiz(id: string, quiz: Partial<QuizPayload>): Promise<QuizResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update quiz'
      };
    }
  }

  /**
   * Delete a quiz
   */
  static async deleteQuiz(id: string): Promise<QuizResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete quiz'
      };
    }
  }
}

/**
 * Helper functions for common operations
 */

// Get recent quizzes (latest 10)
export const getRecentQuizzes = async (): Promise<QuizPayload[]> => {
  const result = await QuizApiClient.getQuizzes({ 
    limit: 10,
    page: 1
  });
  
  return result.success ? result.data : [];
};

// Get quizzes by level
export const getQuizzesByLevel = async (level: 'X' | 'XI' | 'XII' | 'General'): Promise<QuizPayload[]> => {
  const result = await QuizApiClient.getQuizzes({ level });
  return result.success ? result.data : [];
};

// Search quizzes
export const searchQuizzes = async (query: string): Promise<QuizPayload[]> => {
  const result = await QuizApiClient.getQuizzes({ 
    search: query,
    limit: 50
  });
  
  return result.success ? result.data : [];
};