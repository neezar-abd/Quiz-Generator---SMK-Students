import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-helpers';
import type { Quiz, QuestionMCQ } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quizId');
  const excludeId = searchParams.get('excludeId') || undefined;
  const excludeParam = searchParams.get('exclude') || '';
  const excludeList = excludeParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const excludeSet = new Set<string>([...excludeList, ...(excludeId ? [excludeId] : [])]);
    // Topic is optional here. We'll infer from quiz metadata if not provided.
    const topic = searchParams.get('topic') || undefined;
    if (!quizId) return new Response(JSON.stringify({ error: 'quizId required' }), { status: 400 });

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { mcqQuestions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404 });

    // Answers by user on this quiz (best-effort: if the model isn't generated yet, fall back to none)
    type UserAnswerRow = { mcqId: string | null; isCorrect: boolean | null; createdAt: Date | null };
    let answers: UserAnswerRow[] = [];
    try {
      const client = prisma as unknown as {
        userAnswer?: {
          findMany: (args: {
            where: { userId: string; quizId: string };
            select: { mcqId: true; isCorrect: true; createdAt: true };
          }) => Promise<UserAnswerRow[]>;
        };
      };
      answers = (await client.userAnswer?.findMany({
        where: { userId: auth.userId, quizId },
        select: { mcqId: true, isCorrect: true, createdAt: true },
      })) ?? [];
    } catch {
      // noop – adaptive tables may not exist yet in dev. Treat as unanswered.
    }
    const answered = new Set<string>(answers.map((a) => a.mcqId || '').filter(Boolean));

    // Try read mastery to see if topic is due (optional)
    let mastery: { nextReviewAt: Date | null } | null = null;
    try {
      const client = prisma as unknown as {
        userMastery?: {
          findUnique: (args: {
            where: { userId_topic: { userId: string; topic: string } };
            select: { nextReviewAt: true };
          }) => Promise<{ nextReviewAt: Date | null } | null>;
        };
      };
      const resolvedTopic = topic || (quiz as Quiz).topic || 'General';
      mastery = await client.userMastery?.findUnique({
        where: { userId_topic: { userId: auth.userId, topic: resolvedTopic } },
        select: { nextReviewAt: true },
      }) ?? null;
    } catch {
      // ignore if table not ready
    }

  // Prefer questions not answered yet
  // Filter by unanswered and excludeSet if provided
  const unanswered = quiz.mcqQuestions.filter(q => !answered.has(q.id) && !excludeSet.has(q.id));

    // Randomize among all unanswered to avoid hard loops when answers aren't persisted yet
    let next: QuestionMCQ | undefined = unanswered.length
      ? unanswered[Math.floor(Math.random() * unanswered.length)]
      : undefined;
    if (!next) {
      // All answered. Pick weakest based on accuracy and recency
      // Build stats: correctness ratio per mcq and last answered time
      const stats = new Map<string, { total: number; correct: number; lastAt: number }>();
      for (const a of answers) {
        const id = a.mcqId as string | undefined;
        if (!id) continue;
        const s = stats.get(id) || { total: 0, correct: 0, lastAt: 0 };
        s.total += 1;
        if (a.isCorrect) s.correct += 1;
        const ts = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        if (ts > s.lastAt) s.lastAt = ts;
        stats.set(id, s);
      }

      // Score each mcq: lower accuracy first, then older last answer
      const scored = quiz.mcqQuestions
        .filter(q => !excludeSet.has(q.id))
        .map((q, idx) => {
        const s = stats.get(q.id) || { total: 0, correct: 0, lastAt: 0 };
        const acc = s.total > 0 ? s.correct / s.total : 0;
        const lastAt = s.lastAt || 0;
        // If topic due for review, slightly penalize accurate items to surface weaker ones
  const due = mastery?.nextReviewAt ? new Date(mastery.nextReviewAt).getTime() <= Date.now() : false;
        const weight = due ? acc : acc; // reserved for future tuning
        return { q, idx, acc: weight, lastAt };
        });

      scored.sort((a, b) => {
        if (a.acc !== b.acc) return a.acc - b.acc; // lower accuracy first
        if (a.lastAt !== b.lastAt) return a.lastAt - b.lastAt; // older reviewed first
        return a.idx - b.idx; // keep original order as tie-breaker
      });

      // Take top 3 weakest, then pick one at random to avoid hard loops
      const top = scored.slice(0, Math.max(1, Math.min(3, scored.length)));
      // If nothing left after exclusions, return null to signal end-of-session
      if (top.length === 0) {
        return new Response(
          JSON.stringify({
            question: null,
            meta: {
              quizId,
              topic: topic || (quiz as Quiz).topic || 'General',
              totalMcq: quiz.mcqQuestions.length,
              unansweredCount: unanswered.length,
              due: mastery?.nextReviewAt ? new Date(mastery.nextReviewAt).getTime() <= Date.now() : false,
              strategy: 'weakest-first',
              excluded: excludeId || null,
              excludedCount: excludeSet.size,
            }
          }),
          { status: 200 }
        );
      }
      next = top[Math.floor(Math.random() * top.length)]?.q || scored[0].q;
    }

    return new Response(JSON.stringify({
      question: next ? {
        id: next.id,
        question: next.question,
        options: [next.optionA, next.optionB, next.optionC, next.optionD],
        answerIndex: next.answerIndex,
        explanation: next.explanation,
      } : null,
      // Echo back resolved metadata for debugging/UX if needed
      meta: {
        quizId,
        topic: topic || (quiz as Quiz).topic || 'General',
        totalMcq: quiz.mcqQuestions.length,
        unansweredCount: unanswered.length,
        due: mastery?.nextReviewAt ? new Date(mastery.nextReviewAt).getTime() <= Date.now() : false,
        strategy: unanswered.length > 0 ? 'unanswered-first' : 'weakest-first',
        excluded: excludeId || null,
        excludedCount: excludeSet.size,
      }
    }), { status: 200 });
  } catch (e: unknown) {
    const message = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message) : '';
    if (message.includes('Unauthorized')) return createUnauthorizedResponse();
    console.error('Adaptive next error:', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
