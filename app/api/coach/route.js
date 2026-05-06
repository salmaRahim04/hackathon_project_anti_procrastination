import { NextResponse } from 'next/server'
import { ai as gemini } from '@/lib/ai'

export async function POST(request) {
  try {
    const { taskDescription, timeOfDay, sessionsToday } = await request.json()

    const reply = await gemini(
      'You are Maya, a calm non-judgmental productivity coach. The user is struggling to start working. Ask them ONE short question to help identify what is blocking them. Maximum 1 sentence. No advice yet — just the right question.',
      `Task: "${taskDescription}". Time of day: ${timeOfDay}. Sessions completed today: ${sessionsToday}.`,
      { maxTokens: 80 }
    )

    return NextResponse.json({ message: reply })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
