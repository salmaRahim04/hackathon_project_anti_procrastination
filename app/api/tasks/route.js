import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : {},
      orderBy: [{ done: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { title, projectId } = await request.json()
    const task = await prisma.task.create({
      data: { title: title.trim(), projectId: projectId || null },
    })
    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
