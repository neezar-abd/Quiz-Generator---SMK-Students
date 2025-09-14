import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Create default user if it doesn't exist
    const defaultUser = await prisma.user.upsert({
      where: { 
        email: 'default@localhost' 
      },
      update: {
        name: 'Default User'
      },
      create: {
        id: 'default-user',
        email: 'default@localhost',
        name: 'Default User'
      }
    });

    // Check if user was created/updated
    const userCount = await prisma.user.count();
    const quizCount = await prisma.quiz.count();

    return NextResponse.json({
      success: true,
      message: 'Default user created/updated successfully',
      data: {
        user: defaultUser,
        userCount,
        quizCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create default user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get user info
    const users = await prisma.user.findMany();
    const quizzes = await prisma.quiz.findMany({
      include: {
        user: true,
        multipleChoice: true,
        essays: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u: any) => ({ id: u.id, email: u.email, name: u.name })),
        quizzes: quizzes.map((q: any) => ({ 
          id: q.id, 
          title: q.title, 
          user: q.user.email,
          questionCount: q.multipleChoice.length + q.essays.length 
        })),
        counts: {
          users: users.length,
          quizzes: quizzes.length
        }
      }
    });

  } catch (error) {
    console.error('Data retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}