import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.mayaQueue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { url, title } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Deduplicate within 24 hours
    const cutoff   = new Date(Date.now() - 86400000)
    const existing = await prisma.mayaQueue.findFirst({
      where: { url, createdAt: { gte: cutoff } },
    })
    if (existing) return NextResponse.json({ item: existing, duplicate: true })

    const item = await prisma.mayaQueue.create({
      data: { url, title: title || new URL(url).hostname },
    })
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      await prisma.mayaQueue.delete({ where: { id } })
    } else {
      await prisma.mayaQueue.deleteMany({ where: { status: 'done' } })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
