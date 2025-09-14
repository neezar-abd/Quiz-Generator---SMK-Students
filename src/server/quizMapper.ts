/**
 * Database mapping utilities
 * Converts between QuizPayload types and Prisma database models
 */

import { QuizPayload, MCQ, Essay, QuizMetadata } from '@/lib/quizSchema';
import { prisma } from './db';

/**
 * Convert QuizPayload to database format
 * Maps from our Zod schema to Prisma database structure
 */
export interface CreateQuizData {
  title: string;
  description?: string;
  topic: string;
  level: 'X' | 'XI' | 'XII' | 'GENERAL';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  userId: string;
  multipleChoice: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    answerIndex: number;
    explanation?: string;
    order: number;
  }>;
  essays: Array<{
    question: string;
    rubric: string;
    order: number;
  }>;
}

/**
 * Map QuizPayload to CreateQuizData for database insertion
 */
export function mapQuizPayloadToDatabase(
  quizPayload: QuizPayload | Omit<QuizPayload, 'id'>,
  userId: string
): CreateQuizData {
  return {
    title: quizPayload.metadata.topic, // Use topic as title
    description: quizPayload.metadata.description,
    topic: quizPayload.metadata.topic,
    level: quizPayload.metadata.level === 'General' ? 'GENERAL' : quizPayload.metadata.level,
    status: mapStatus(quizPayload.metadata.status),
    userId,
    multipleChoice: quizPayload.multipleChoice.map((mcq, index) => ({
      question: mcq.question,
      optionA: mcq.options[0],
      optionB: mcq.options[1],
      optionC: mcq.options[2],
      optionD: mcq.options[3],
      answerIndex: mcq.answerIndex,
      explanation: mcq.explanation,
      order: index + 1,
    })),
    essays: quizPayload.essay.map((essay, index) => ({
      question: essay.question,
      rubric: essay.rubric,
      order: index + 1,
    })),
  };
}

/**
 * Map database quiz to QuizPayload format
 */
export async function mapDatabaseToQuizPayload(quizId: string): Promise<QuizPayload | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      multipleChoice: {
        orderBy: { order: 'asc' }
      },
      essays: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!quiz) {
    return null;
  }

  return {
    id: quiz.id,
    metadata: {
      topic: quiz.topic,
      level: quiz.level as 'X' | 'XI' | 'XII' | 'General',
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      description: quiz.description || undefined,
      status: mapDatabaseStatus(quiz.status),
    },
    multipleChoice: quiz.multipleChoice.map((mcq: any) => ({
      question: mcq.question,
      options: [mcq.optionA, mcq.optionB, mcq.optionC, mcq.optionD] as [string, string, string, string],
      answerIndex: mcq.answerIndex as 0 | 1 | 2 | 3,
      explanation: mcq.explanation || undefined,
    })),
    essay: quiz.essays.map((essay: any) => ({
      question: essay.question,
      rubric: essay.rubric,
    })),
  };
}

/**
 * Create quiz with atomic transaction
 * Ensures all questions are created successfully or none at all
 */
export async function createQuizWithQuestions(
  quizData: CreateQuizData
): Promise<{ success: boolean; quizId?: string; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Ensure user exists, create if not
      await tx.user.upsert({
        where: { id: quizData.userId },
        update: {},
        create: {
          id: quizData.userId,
          email: `${quizData.userId}@localhost`,
          name: 'Default User'
        }
      });

      // Create the quiz
      const quiz = await tx.quiz.create({
        data: {
          title: quizData.title,
          description: quizData.description,
          topic: quizData.topic,
          level: quizData.level,
          status: quizData.status,
          userId: quizData.userId,
        },
      });

      // Create multiple choice questions
      if (quizData.multipleChoice.length > 0) {
        await tx.questionMCQ.createMany({
          data: quizData.multipleChoice.map(mcq => ({
            ...mcq,
            quizId: quiz.id,
          })),
        });
      }

      // Create essay questions
      if (quizData.essays.length > 0) {
        await tx.questionEssay.createMany({
          data: quizData.essays.map(essay => ({
            ...essay,
            quizId: quiz.id,
          })),
        });
      }

      return quiz.id;
    });

    return { success: true, quizId: result };
  } catch (error) {
    console.error('Failed to create quiz with questions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

/**
 * Update quiz with questions (atomic)
 */
export async function updateQuizWithQuestions(
  quizId: string,
  quizData: Partial<CreateQuizData>
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Update quiz metadata
      const updateData: any = {};
      if (quizData.title) updateData.title = quizData.title;
      if (quizData.description !== undefined) updateData.description = quizData.description;
      if (quizData.topic) updateData.topic = quizData.topic;
      if (quizData.level) updateData.level = quizData.level;
      if (quizData.status) updateData.status = quizData.status;

      if (Object.keys(updateData).length > 0) {
        await tx.quiz.update({
          where: { id: quizId },
          data: updateData,
        });
      }

      // Update questions if provided
      if (quizData.multipleChoice) {
        // Delete existing MCQs and recreate
        await tx.questionMCQ.deleteMany({
          where: { quizId },
        });

        if (quizData.multipleChoice.length > 0) {
          await tx.questionMCQ.createMany({
            data: quizData.multipleChoice.map(mcq => ({
              ...mcq,
              quizId,
            })),
          });
        }
      }

      if (quizData.essays) {
        // Delete existing essays and recreate
        await tx.questionEssay.deleteMany({
          where: { quizId },
        });

        if (quizData.essays.length > 0) {
          await tx.questionEssay.createMany({
            data: quizData.essays.map(essay => ({
              ...essay,
              quizId,
            })),
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update quiz:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

/**
 * Delete quiz and all associated questions
 */
export async function deleteQuizWithQuestions(quizId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.quiz.delete({
      where: { id: quizId },
      // Cascade delete will handle questions automatically
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete quiz:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Quiz not found or already deleted'
    };
  }
}

/**
 * Helper functions for status mapping
 */
function mapStatus(status: 'draft' | 'published' | 'archived'): 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' {
  return status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

function mapDatabaseStatus(status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): 'draft' | 'published' | 'archived' {
  return status.toLowerCase() as 'draft' | 'published' | 'archived';
}

/**
 * Get quiz statistics for a user
 */
export async function getQuizStatistics(userId: string) {
  const stats = await prisma.quiz.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  const totalMCQs = await prisma.questionMCQ.count({
    where: {
      quiz: { userId }
    }
  });

  const totalEssays = await prisma.questionEssay.count({
    where: {
      quiz: { userId }
    }
  });

  return {
    total: stats.reduce((acc: number, stat: any) => acc + stat._count, 0),
    byStatus: {
      draft: stats.find((s: any) => s.status === 'DRAFT')?._count || 0,
      published: stats.find((s: any) => s.status === 'PUBLISHED')?._count || 0,
      archived: stats.find((s: any) => s.status === 'ARCHIVED')?._count || 0,
    },
    totalQuestions: {
      mcq: totalMCQs,
      essay: totalEssays,
      total: totalMCQs + totalEssays,
    }
  };
}