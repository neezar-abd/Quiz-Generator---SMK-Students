import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-helpers';
import { difficultyFromQuizLevel, nextReviewDate, updateElo } from '@/server/adaptive';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = (await req.json()) as unknown;
    const {
      quizId,
      mcqId,
      essayId,
      topic,
      correct,
      answerIndex,
      timeMs,
      level,
    } = (body as Record<string, unknown>) ?? {};
    if (typeof topic !== 'string' || typeof correct !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // If adaptive tables are not yet migrated, gracefully no-op
    const client = prisma as unknown as {
      userMastery?: {
        upsert: (args: {
          where: { userId_topic: { userId: string; topic: string } };
          update: object;
          create: { userId: string; topic: string };
        }) => Promise<{ id: string; rating: number; streak: number }>;
        update: (args: {
          where: { id: string };
          data: {
            rating: number;
            streak: number;
            totalAnswered: { increment: number };
            lastReviewedAt: Date;
            nextReviewAt: Date;
          };
        }) => Promise<void>;
      };
      userAnswer?: {
        create: (args: {
          data: {
            userId: string;
            quizId?: unknown;
            mcqId?: unknown;
            essayId?: unknown;
            topic: string;
            isCorrect: boolean;
            answerIndex?: unknown;
            timeMs?: unknown;
            ratingBefore: number;
            ratingAfter: number;
          };
        }) => Promise<void>;
      };
    };
    if (!client.userMastery || !client.userAnswer) {
      return new Response(
        JSON.stringify({ ok: true, notice: 'Adaptive tables not found. Skipping persistence.' }),
        { status: 200 }
      );
    }

    // Upsert mastery
    const mastery = await client.userMastery.upsert({
      where: { userId_topic: { userId: auth.userId, topic } },
      update: {},
      create: { userId: auth.userId, topic },
    });

    const ratingBefore = mastery.rating;
    const opponent = difficultyFromQuizLevel(level as string | undefined);
    const ratingAfter = updateElo({ rating: ratingBefore, correct, opponent });
    const newStreak = correct ? mastery.streak + 1 : 0;
    const nextAt = nextReviewDate(new Date(), newStreak, correct);

    await prisma.$transaction(async (tx) => {
      await tx.userMastery.update({
        where: { id: mastery.id },
        data: {
          rating: ratingAfter,
          streak: newStreak,
          totalAnswered: { increment: 1 },
          lastReviewedAt: new Date(),
          nextReviewAt: nextAt,
        },
      });

      await tx.userAnswer.create({
        data: {
          userId: auth.userId,
          quizId: quizId as string | undefined,
          mcqId: mcqId as string | undefined,
          essayId: essayId as string | undefined,
          topic,
          isCorrect: correct,
          answerIndex: answerIndex as number | undefined,
          timeMs: timeMs as number | undefined,
          ratingBefore,
          ratingAfter,
        },
      });
    });

    return new Response(JSON.stringify({ ok: true, ratingAfter, nextReviewAt: nextAt }), { status: 200 });
  } catch (e: unknown) {
    const message = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message) : '';
    if (message.includes('Unauthorized')) return createUnauthorizedResponse();
    console.error('Adaptive record error:', e);
    // Handle missing table errors gracefully
    if (message.includes('userMastery') || message.includes('userAnswer') || message.includes('Table') || message.includes('relation')) {
      return new Response(
        JSON.stringify({ ok: true, notice: 'Adaptive tables missing. Persistence skipped.' }),
        { status: 200 }
      );
    }
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
