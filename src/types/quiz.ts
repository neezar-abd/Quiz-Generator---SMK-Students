// Import and re-export types from Zod schema for strict validation
export {
  MCQSchema,
  EssaySchema,
  QuizMetadataSchema,
  QuizPayloadSchema,
  GenerateQuizRequestSchema,
  PartialQuizPayloadSchema,
  ensureQuizPayload,
  ensureGenerateQuizRequest,
  ensurePartialQuizPayload,
  validateQuizId,
  validateTopic,
  validateLevel
} from '@/lib/quizSchema';

export type {
  MCQ,
  Essay,
  QuizMetadata,
  QuizPayload,
  GenerateQuizRequest,
  PartialQuizPayload
} from '@/lib/quizSchema';

// Import types for use in this file
import type {
  QuizPayload,
  GenerateQuizRequest,
  PartialQuizPayload
} from '@/lib/quizSchema';

// Additional types for application state management
export type QuizFormOptions = {
  topic: string;
  level: "X" | "XI" | "XII" | "General";
  mcqCount: number;
  essayCount: number;
};

export type QuizStoreState = {
  currentQuiz: QuizPayload | null;
  quizzes: QuizPayload[];
  isLoading: boolean;
  error: string | null;
};

export type QuizStoreActions = {
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

// Legacy types for backward compatibility (deprecated - use Zod types instead)
export type LegacyMCQ = {
  id: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation?: string;
};

export type LegacyEssay = {
  id: string;
  question: string;
  rubric: string;
};

export type LegacyQuizMetadata = {
  topic: string;
  level: "X" | "XI" | "XII" | "General";
  createdAt: string;
  updatedAt?: string;
  author?: string;
  status: "draft" | "published" | "archived";
};

export type LegacyQuizPayload = {
  id: string;
  metadata: LegacyQuizMetadata;
  multipleChoice: LegacyMCQ[];
  essay: LegacyEssay[];
};