import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { sessionId, mood } = await request.json()
    await prisma.session.update({ where: { id: sessionId }, data: { mood: parseInt(mood) } })

    // Bonus XP for flow state (mood 5)
    if (mood === 5) {
      let gamif = await prisma.gamification.findFirst()
      if (gamif) {
        await prisma.gamification.update({
          where: { id: gamif.id },
          data: { xp: { increment: 5 } },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
