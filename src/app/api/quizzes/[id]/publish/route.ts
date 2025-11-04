/**
 * Quiz Publishing API
 * POST /api/quizzes/[id]/publish - Publish/unpublish quiz
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-helpers';
import { nanoid } from 'nanoid';

/**
 * POST /api/quizzes/[id]/publish - Publish or unpublish a quiz
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 Require authentication
    const authResult = await requireAuth();
    if (!authResult) {
      return createUnauthorizedResponse();
    }
    
    const { id: quizId } = await params;
    const body = await request.json();
    const { publish } = body; // true to publish, false to unpublish

    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz ID is required'
        },
        { status: 400 }
      );
    }

    // Check if quiz exists and user owns it
    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        userId: authResult.userId 
      }
    });
    
    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found or access denied'
        },
        { status: 404 }
      );
    }

    // Update quiz publication status
    const updateData: {
      isPublic: boolean;
      status: 'PUBLISHED' | 'DRAFT';
      shareToken?: string;
    } = {
      isPublic: publish === true,
      status: publish ? 'PUBLISHED' : 'DRAFT'
    };

    // Generate share token if publishing and doesn't have one
    if (publish && !quiz.shareToken) {
      updateData.shareToken = nanoid(12); // Generate unique 12-char token
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedQuiz.id,
        isPublic: updatedQuiz.isPublic,
        shareToken: updatedQuiz.shareToken,
        status: updatedQuiz.status,
        shareUrl: updatedQuiz.isPublic 
          ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/take/${updatedQuiz.id}`
          : null
      },
      message: publish ? 'Quiz published successfully' : 'Quiz unpublished successfully'
    });

  } catch (error) {
    console.error('Quiz publish error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update quiz',
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
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
