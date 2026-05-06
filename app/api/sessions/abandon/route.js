import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { sessionId } = await request.json()

    await prisma.session.update({
      where: { id: sessionId },
      data: { completed: true, earnedMinutes: 0, completedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
