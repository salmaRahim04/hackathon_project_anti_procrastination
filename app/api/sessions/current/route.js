import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await prisma.session.findFirst({
      where: { completed: false },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ session })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
