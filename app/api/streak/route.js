import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkStreakExpiry, getStreakMultiplier } from '@/lib/timeBank'

export async function GET() {
  try {
    let streak = await prisma.streak.findFirst()
    if (!streak) streak = await prisma.streak.create({ data: {} })

    const activeStreak = checkStreakExpiry(streak.lastActiveDate, streak.currentStreak)

    if (activeStreak !== streak.currentStreak) {
      streak = await prisma.streak.update({
        where: { id: streak.id },
        data: { currentStreak: activeStreak, multiplier: getStreakMultiplier(activeStreak) },
      })
    }

    const multiplier = getStreakMultiplier(streak.currentStreak)
    return NextResponse.json({ streak: { ...streak, multiplier } })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
