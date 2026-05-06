import { NextResponse } from 'next/server'
// Ensure this is importing your new Groq aiChat function
import { aiChat } from '@/lib/ai' 
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { message, history = [], systemOverride } = await request.json()

    // ... (Your database context gathering stays the same)
    const [sessions, bank, streak, projects, gamif, queueItems] = await Promise.all([
      prisma.session.findMany({ where: { completed: true }, orderBy: { completedAt: 'desc' }, take: 5 }),
      prisma.scrollBank.findFirst(),
      prisma.streak.findFirst(),
      prisma.project.findMany(),
      prisma.gamification.findFirst(),
      prisma.mayaQueue.findMany({ where: { status: 'queued' }, take: 5 }),
    ])

    const ctx = [
      `Scroll bank: ${bank?.balance ?? 0} minutes`,
      `Streak: ${streak?.currentStreak ?? 0} days`,
      `XP: ${gamif?.xp ?? 0} (Level ${gamif?.level ?? 1})`,
      `Projects: ${projects.map(p => p.name).join(', ') || 'none'}`,
      `Recent sessions: ${sessions.map(s => `"${s.taskDescription}" (${s.earnedMinutes}min)`).join(', ') || 'none'}`,
      queueItems.length ? `Queued for digest: ${queueItems.map(q => q.title).join(', ')}` : '',
    ].filter(Boolean).join('\n')

    const system = systemOverride
      ? `${systemOverride}\n\nUser's real-time context:\n${ctx}`
      : `You are Maya, the user's personal productivity agent... Reference their real data when relevant.\n\nUser context:\n${ctx}`

    let reply
    try {
      // Call your updated aiChat (which now uses Groq internally)
      reply = await aiChat(system, history, message, { maxTokens: 400 })
    } catch (aiErr) {
      console.error("AI Error:", aiErr.message)
      
      // Update this fallback message to be more generic since you aren't using Gemini anymore
      if (aiErr.message.includes('429') || aiErr.message.toLowerCase().includes('quota')) {
        reply = "I'm receiving too many requests right now. Please wait a moment or check my API limits."
      } else if (aiErr.message.includes('401') || aiErr.message.includes('key')) {
        reply = "My API key seems to be missing or invalid. Check the server logs."
      } else {
        reply = "I'm having a bit of trouble connecting to my brain. Can you try again?"
      }
    }
    
    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Route Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}