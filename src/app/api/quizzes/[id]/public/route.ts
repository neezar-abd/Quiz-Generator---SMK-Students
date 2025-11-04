/**
 * Public Quiz Access API
 * GET /api/quizzes/[id]/public - Get public quiz without authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { mapDatabaseToQuizPayload } from '@/server/quizMapper';

/**
 * GET /api/quizzes/[id]/public - Get public quiz (no auth required)
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

    // Check if quiz exists and is public
    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        isPublic: true,
        status: 'PUBLISHED' // Only published quizzes can be accessed
      }
    });
    
    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found or is not publicly accessible'
        },
        { status: 404 }
      );
    }

    // Get quiz with questions
    const quizPayload = await mapDatabaseToQuizPayload(quizId);

    if (!quizPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to load quiz data'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quizPayload
    });

  } catch (error) {
    console.error('Public quiz fetch error:', error);
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
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'GET, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
