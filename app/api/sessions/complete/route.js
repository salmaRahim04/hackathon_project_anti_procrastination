import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  calculateEarnedMinutes, getStreakMultiplier, incrementStreak,
  calculateSessionXP, xpToLevel, checkAchievements,
} from '@/lib/timeBank'

export async function POST(request) {
  try {
    const { sessionId, actualMinutes } = await request.json()

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // Streak
    let streak = await prisma.streak.findFirst()
    if (!streak) streak = await prisma.streak.create({ data: {} })
    const newStreakCount = incrementStreak(streak.lastActiveDate, streak.currentStreak)
    const multiplier     = getStreakMultiplier(newStreakCount)
    const minutes        = actualMinutes ?? session.plannedMinutes
    const earnedMinutes  = calculateEarnedMinutes(session.plannedMinutes, minutes, multiplier)

    // Completed session
    const completed = await prisma.session.update({
      where: { id: sessionId },
      data: { actualMinutes: minutes, completed: true, earnedMinutes, completedAt: new Date() },
    })

    // Update streak record
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak:  newStreakCount,
        longestStreak:  Math.max(streak.longestStreak, newStreakCount),
        lastActiveDate: new Date(),
        multiplier,
      },
    })

    // Bank
    let bank = await prisma.scrollBank.findFirst()
    if (!bank) bank = await prisma.scrollBank.create({ data: {} })
    await prisma.scrollBank.update({
      where: { id: bank.id },
      data: { totalEarned: { increment: earnedMinutes }, balance: { increment: earnedMinutes } },
    })

    // Task stats
    if (session.taskId) {
      await prisma.task.updateMany({
        where: { id: session.taskId },
        data: { minutesSpent: { increment: earnedMinutes }, sessions: { increment: 1 } },
      })
    }

    // Gamification
    let gamif = await prisma.gamification.findFirst()
    if (!gamif) gamif = await prisma.gamification.create({ data: {} })

    const allSessions = await prisma.session.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
    })
    const isFirstEver = allSessions.length === 1

    const baseXP = calculateSessionXP(earnedMinutes, completed.completed, isFirstEver)
    const { unlocked, newEarnedJson } = checkAchievements({
      session: completed, allSessions, currentStreak: newStreakCount, gamif,
    })
    const achievementXP = unlocked.reduce((a, ach) => a + ach.xp, 0)
    const totalXP = baseXP + achievementXP

    const newXP    = gamif.xp + totalXP
    const newLevel = xpToLevel(newXP)
    const newConsec = completed.completed
      ? (gamif.consecutiveCompletions || 0) + 1
      : 0

    await prisma.gamification.update({
      where: { id: gamif.id },
      data: {
        xp: newXP,
        level: newLevel,
        achievementsEarned: newEarnedJson,
        consecutiveCompletions: newConsec,
      },
    })

    return NextResponse.json({
      earnedMinutes,
      multiplier,
      currentStreak: newStreakCount,
      xpEarned: totalXP,
      level: newLevel,
      newAchievements: unlocked,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
