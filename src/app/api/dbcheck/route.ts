import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple, low-cost checks
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>('select now() as now')
    const userCount = await prisma.user.count().catch(() => -1)

    return NextResponse.json({ ok: true, now: now?.[0]?.now ?? null, userCount })
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message?: unknown }).message) : 'unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
