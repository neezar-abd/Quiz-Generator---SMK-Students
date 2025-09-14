/**
 * Individual Quiz API Routes
 * GET /api/quizzes/[id] - Get quiz details
 * PUT /api/quizzes/[id] - Update quiz
 * DELETE /api/quizzes/[id] - Delete quiz
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { ensureQuizPayload, ensureQuizPayloadForCreate } from '@/lib/quizSchema';
import { 
  mapDatabaseToQuizPayload,
  mapQuizPayloadToDatabase,
  updateQuizWithQuestions,
  deleteQuizWithQuestions
} from '@/server/quizMapper';

/**
 * GET /api/quizzes/[id] - Get quiz by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;

    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz ID is required'
        },
        { status: 400 }
      );
    }

    // Get quiz with questions
    const quiz = await mapDatabaseToQuizPayload(quizId);

    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[id] - Update quiz
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id: quizId } = await params;
  const rawBody = await request.json();
  // Strip userId and UI-only keys before schema validation
  const { userId: _userIdIgnored, _metadata: _ignored, ...body } = rawBody ?? {};

    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz ID is required'
        },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found'
        },
        { status: 404 }
      );
    }

    // Validate request body if it's a complete quiz payload
    let updateData: any = {};

    if (body.metadata || body.multipleChoice || body.essay) {
      // Full QuizPayload update
      try {
        // Normalize enum casing in metadata if present
        if (body.metadata) {
          if (typeof body.metadata.level === 'string' && body.metadata.level === 'GENERAL') {
            body.metadata.level = 'General';
          }
          if (typeof body.metadata.status === 'string') {
            body.metadata.status = body.metadata.status.toLowerCase();
          }
        }
        const quizPayload = ensureQuizPayloadForCreate(body);
        updateData = mapQuizPayloadToDatabase(quizPayload as any, existingQuiz.userId);
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
    } else {
      // Partial update (metadata only)
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.topic !== undefined) updateData.topic = body.topic;
      if (body.level !== undefined) updateData.level = (body.level || '').toString().toUpperCase();
      if (body.status !== undefined) updateData.status = (body.status || '').toString().toUpperCase();
    }

    // Update quiz
    const result = await updateQuizWithQuestions(quizId, updateData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update quiz',
          details: result.error
        },
        { status: 500 }
      );
    }

    // Return updated quiz
    const updatedQuiz = await mapDatabaseToQuizPayload(quizId);

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
      message: 'Quiz updated successfully'
    });

  } catch (error) {
    console.error('Quiz update error:', error);
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
 * DELETE /api/quizzes/[id] - Delete quiz
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;

    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz ID is required'
        },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found'
        },
        { status: 404 }
      );
    }

    // Delete quiz (cascade will handle questions)
    const result = await deleteQuizWithQuestions(quizId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete quiz',
          details: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Quiz deletion error:', error);
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
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}