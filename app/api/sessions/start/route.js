import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { taskDescription, plannedMinutes, projectId, taskId } = await request.json()

    // Close any stale open sessions
    await prisma.session.updateMany({
      where: { completed: false },
      data:  { completed: true },
    })

    const session = await prisma.session.create({
      data: {
        taskDescription,
        plannedMinutes,
        projectId: projectId || null,
        taskId:    taskId    || null,
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
