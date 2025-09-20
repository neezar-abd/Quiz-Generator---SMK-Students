/**
 * Database client configuration using Prisma
 * Handles connection pooling and global client management
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Global Prisma client instance
 * Uses connection pooling in production, prevents multiple instances in development
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Database connection health check
 * Tests connectivity and returns status
 */
export async function checkDatabaseConnection(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

/**
 * Graceful database disconnection
 * Should be called on application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
}

/**
 * Database transaction wrapper
 * Provides atomic operations with proper error handling
 */
export async function withTransaction<T>(
  operation: (tx: unknown) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await operation(tx);
  });
}

/**
 * Clean database for testing
 * WARNING: Only use in test environment
 */
export async function cleanDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clean database in production');
  }

  // Delete in correct order to avoid foreign key constraints
  await prisma.questionEssay.deleteMany();
  await prisma.questionMCQ.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();
}

// Types will be available after database setup
export type DatabaseUser = unknown;
export type DatabaseQuiz = unknown;
export type DatabaseQuestionMCQ = unknown;
export type DatabaseQuestionEssay = unknown;