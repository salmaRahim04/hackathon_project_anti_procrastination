import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { xpToLevel, xpProgressInLevel, LEVEL_NAMES, ACHIEVEMENTS, checkStreakExpiry } from '@/lib/timeBank'

export async function GET() {
  try {
    let gamif = await prisma.gamification.findFirst()
    if (!gamif) gamif = await prisma.gamification.create({ data: {} })

    let streak = await prisma.streak.findFirst()
    if (!streak) streak = await prisma.streak.create({ data: {} })

    // Expire streak if needed
    const activeStreak = checkStreakExpiry(streak.lastActiveDate, streak.currentStreak)
    if (activeStreak !== streak.currentStreak) {
      await prisma.streak.update({ where: { id: streak.id }, data: { currentStreak: 0, multiplier: 1.0 } })
    }

    const today = new Date().toISOString().split('T')[0]
    const todaySessions = await prisma.session.findMany({
      where: { completed: true, createdAt: { gte: new Date(today) } },
    })
    const todayMinutes = todaySessions.reduce((a, s) => a + s.earnedMinutes, 0)

    const level   = xpToLevel(gamif.xp)
    const progress = xpProgressInLevel(gamif.xp)
    const earned  = JSON.parse(gamif.achievementsEarned || '[]')

    return NextResponse.json({
      xp:            gamif.xp,
      level,
      levelName:     LEVEL_NAMES[level - 1] ?? 'Legend',
      xpInLevel:     progress.current,
      xpNeeded:      progress.needed,
      xpPct:         progress.pct,
      currentStreak: activeStreak,
      longestStreak: streak.longestStreak,
      dailyGoal:     gamif.dailyGoalMinutes,
      todayMinutes,
      achievementsEarned: earned,
      achievementsAll:    ACHIEVEMENTS,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { dailyGoal } = await request.json()
    let gamif = await prisma.gamification.findFirst()
    if (!gamif) gamif = await prisma.gamification.create({ data: {} })
    await prisma.gamification.update({
      where: { id: gamif.id },
      data: { dailyGoalMinutes: parseInt(dailyGoal) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
