import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ai as gemini } from '@/lib/ai'

async function extractContent(url) {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(12000),
    })
    return (await res.text()).slice(0, 8000)
  } catch {
    return ''
  }
}

export async function POST(request) {
  let itemId
  try {
    ;({ itemId } = await request.json())

    const item = await prisma.mayaQueue.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (item.status === 'done') return NextResponse.json({ item })

    await prisma.mayaQueue.update({ where: { id: itemId }, data: { status: 'processing' } })

    const content = await extractContent(item.url)

    const summary = await gemini(
      'You are Maya, a smart productivity assistant. The user queued this content during a work session so they could keep working without missing it. Give them the actual value.\n\nReply in this exact format:\n**What it\'s about**: One sentence.\n**Key takeaways**:\n• [specific insight]\n• [specific insight]\n• [specific insight]\n**Worth going back to?**: Yes/No — one honest sentence.',
      `URL: ${item.url}\nTitle: ${item.title}\n\nContent:\n${content || '(Could not extract — base your summary on the URL and title.)'}`,
      { maxTokens: 400 }
    )

    const updated = await prisma.mayaQueue.update({
      where: { id: itemId },
      data: { summary, status: 'done', completedAt: new Date() },
    })

    return NextResponse.json({ item: updated })
  } catch (error) {
    if (itemId) {
      await prisma.mayaQueue.update({ where: { id: itemId }, data: { status: 'queued' } }).catch(() => {})
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
