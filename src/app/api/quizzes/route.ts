/**
 * Quiz API Routes - Main endpoints for quiz management
 * POST /api/quizzes - Create quiz from QuizPayload
 * GET /api/quizzes - List quizzes with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { QuizPayloadSchema, ensureQuizPayload, ensureQuizPayloadForCreate } from '@/lib/quizSchema';
import { 
  mapQuizPayloadToDatabase, 
  createQuizWithQuestions,
  mapDatabaseToQuizPayload 
} from '@/server/quizMapper';

/**
 * POST /api/quizzes - Create new quiz
 * Accepts QuizPayload and creates quiz with questions atomically
 */
export async function POST(request: NextRequest) {
  try {
  const body = await request.json();

  // NOTE: Client may include userId and UI-only keys (like _metadata).
    // Our QuizPayload schema is strict and rejects unknown fields.
  // Strip them before validation to avoid false negatives.
  const { userId: rawUserId, _metadata: _ignored, ...rawQuiz } = body ?? {};

    // Validate request body (creation allows missing id)
    let quizPayload;
    try {
      quizPayload = ensureQuizPayloadForCreate(rawQuiz);
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quiz data format',
          details: validationError instanceof Error ? validationError.message : 'Validation failed'
        },
        { status: 400 }
      );
    }

    // For now, use a default user ID (in production, get from auth)
    const userId = rawUserId || 'default-user';

    // Map to database format
    const quizData = mapQuizPayloadToDatabase(quizPayload, userId);

    // Create quiz with atomic transaction
    const result = await createQuizWithQuestions(quizData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create quiz',
          details: result.error
        },
        { status: 500 }
      );
    }

    // Return the created quiz
    const createdQuiz = await mapDatabaseToQuizPayload(result.quizId!);

    return NextResponse.json({
      success: true,
      data: createdQuiz,
      message: 'Quiz created successfully'
    });

  } catch (error) {
    console.error('Quiz creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quizzes - List quizzes with optional filtering
 * Query params: topic, level, status, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const topic = searchParams.get('topic');
    const level = searchParams.get('level') as 'X' | 'XI' | 'XII' | 'GENERAL' | null;
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId') || 'default-user';

    // Build where clause
    const where: any = { userId };
    
    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' };
    }
    
    if (level) {
      // Normalize to DB enum casing
      where.level = level.toUpperCase();
    }
    
    if (status) {
      // Normalize to DB enum casing
      where.status = status.toUpperCase();
    }

    // Fetch quizzes with questions
    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          multipleChoice: {
            orderBy: { order: 'asc' }
          },
          essays: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              multipleChoice: true,
              essays: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100), // Max 100 items
        skip: offset,
      }),
      prisma.quiz.count({ where })
    ]);

    // Convert to QuizPayload format
    const formattedQuizzes = await Promise.all(
      quizzes.map(async (quiz: any) => {
        const quizPayload = await mapDatabaseToQuizPayload(quiz.id);
        return {
          ...quizPayload,
          _metadata: {
            questionCounts: {
              mcq: quiz._count.multipleChoice,
              essay: quiz._count.essays,
              total: quiz._count.multipleChoice + quiz._count.essays
            }
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        quizzes: formattedQuizzes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + quizzes.length < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Quiz listing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quizzes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}