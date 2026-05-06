import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'asc' } })
    const sessions = await prisma.session.findMany({ where: { completed: true, projectId: { not: null } } })
    const tasks    = await prisma.task.findMany()

    const enriched = projects.map(p => ({
      ...p,
      totalMinutes: sessions.filter(s => s.projectId === p.id).reduce((a, s) => a + s.earnedMinutes, 0),
      taskCount:    tasks.filter(t => t.projectId === p.id).length,
      doneCount:    tasks.filter(t => t.projectId === p.id && t.done).length,
    }))

    return NextResponse.json({ projects: enriched })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, emoji, color } = await request.json()
    const project = await prisma.project.create({
      data: { name: name.trim(), emoji: emoji || '📋', color: color || '#00E5FF' },
    })
    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
