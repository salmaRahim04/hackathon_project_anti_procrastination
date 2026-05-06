import { NextResponse } from 'next/server'
import { ai as gemini } from '@/lib/ai'

export async function POST(request) {
  try {
    const { task, projectName, recentSessions } = await request.json()
    if (!task?.trim()) return NextResponse.json({ error: 'Task required' }, { status: 400 })

    const ctx = recentSessions?.length
      ? `Recent work: ${recentSessions.slice(0, 3).map(s => `"${s.taskDescription}"`).join(', ')}`
      : ''

    let draft
    try {
    draft = await gemini(
      'You are Maya, a focused productivity co-pilot. Give the user a short concrete starting plan they can act on in the first 2 minutes. Remove the blinking cursor paralysis. Max 130 words. Be direct, no fluff.\n\nReply in this format:\n**Start here**: [The single most important first action]\n**Then**:\n• [step]\n• [step]\n• [step]\n**Watch out for**: [One common pitfall — optional]',
      `Task: "${task.trim()}"${projectName ? `\nProject: ${projectName}` : ''}${ctx ? `\n${ctx}` : ''}`,
      { maxTokens: 220 }
    )
    } catch (aiErr) {
      if (aiErr.message.includes('429') || aiErr.message.includes('quota')) {
        draft = '**Start here**: Open the file and write the first line.\n**Then**:\n• Break the task into 3 smaller steps\n• Do step 1 only\n• Reassess after 10 minutes'
      } else { throw aiErr }
    }

    return NextResponse.json({ draft })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
