import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: { completed: true, earnedMinutes: { gt: 0 } },
      orderBy: { completedAt: 'desc' },
      take: 10,
    })
    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
