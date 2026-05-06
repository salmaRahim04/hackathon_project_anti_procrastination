// Direct Gemini REST API — no SDK dependency
const MODEL = 'gemini-2.0-flash'
const BASE  = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export async function gemini(systemPrompt, userMessage, { maxTokens = 300, temp = 0.85 } = {}) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')

  const res = await fetch(`${BASE}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: temp },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`)
  }

  const d = await res.json()
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

// Multi-turn chat variant
export async function geminiChat(systemPrompt, history = [], newMessage, { maxTokens = 400 } = {}) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')

  const contents = [
    ...history.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: newMessage }] },
  ]

  const res = await fetch(`${BASE}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.9 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`)
  }

  const d = await res.json()
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}
