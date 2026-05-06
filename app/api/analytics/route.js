import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: { completed: true },
      orderBy: { completedAt: 'desc' },
    })

    // Last 7 days
    const daily = []
    for (let i = 6; i >= 0; i--) {
      const d    = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      const day  = sessions.filter(s => s.completedAt >= d && s.completedAt < next)
      daily.push({
        label:   ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
        date:    d.toISOString().split('T')[0],
        minutes: day.reduce((a, s) => a + s.earnedMinutes, 0),
        count:   day.length,
      })
    }

    // Hourly distribution (0-23)
    const hourly = Array(24).fill(0)
    sessions.forEach(s => {
      if (s.completedAt) hourly[new Date(s.completedAt).getHours()] += s.earnedMinutes
    })

    // Activity heatmap last 90 days
    const heatmap = {}
    sessions.forEach(s => {
      if (s.completedAt) {
        const key = new Date(s.completedAt).toISOString().split('T')[0]
        heatmap[key] = (heatmap[key] || 0) + s.earnedMinutes
      }
    })

    const totalSessions  = sessions.length
    const completedCount = sessions.filter(s => s.completed).length
    const totalMinutes   = sessions.reduce((a, s) => a + s.earnedMinutes, 0)
    const moods          = sessions.map(s => s.mood).filter(Boolean)
    const avgMood        = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null

    return NextResponse.json({
      daily, hourly, heatmap,
      totalSessions, completedCount, totalMinutes,
      completionRate: totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0,
      avgMood,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
