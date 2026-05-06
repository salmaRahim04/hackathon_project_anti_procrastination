/**
 * Real-time context store — used by VS Code + Chrome extension to tell
 * Maya what the user is doing outside the browser.
 * In-memory only (resets on server restart) — this is realtime status, not history.
 */

let context = {
  source:    null,   // 'vscode' | 'browser' | null
  status:    'idle', // 'active' | 'typing' | 'idle'
  file:      null,
  language:  null,
  site:      null,
  siteType:  null,   // 'distraction' | 'research' | 'work' | 'neutral'
  updatedAt: null,
}

export async function GET() {
  const stale = !context.updatedAt || Date.now() - context.updatedAt > 60000
  return Response.json({ ...context, stale })
}

export async function POST(request) {
  const data = await request.json()
  context = { ...context, ...data, updatedAt: Date.now() }
  return Response.json({ ok: true })
}
