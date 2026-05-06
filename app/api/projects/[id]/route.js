import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    await prisma.task.deleteMany({ where: { projectId: params.id } })
    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
