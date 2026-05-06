import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: 'toggle' in body
        ? { done: !task.done, doneAt: !task.done ? new Date() : null }
        : body,
    })
    return NextResponse.json({ task: updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
