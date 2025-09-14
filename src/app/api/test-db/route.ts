import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test if tables exist
    const quizCount = await prisma.quiz.count();
    
    return NextResponse.json({ 
      status: 'connected',
      message: 'Database connection successful',
      data: {
        connectionTest: result,
        quizCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}