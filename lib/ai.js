import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY,
})

const MODEL = 'llama-3.1-8b-instant'

// Single-turn: system prompt + one user message
export async function ai(systemPrompt, userMessage, { maxTokens = 1024, temp = 1 } = {}) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system',  content: systemPrompt },
      { role: 'user',    content: userMessage  },
    ],
    model:                MODEL,
    temperature:          temp,
    max_completion_tokens: maxTokens,
    top_p:                1,
    stream:               false,
    stop:                 null,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ''
}

// Multi-turn chat: history array + new user message as variable
export async function aiChat(systemPrompt, history = [], newMessage, { maxTokens = 1024 } = {}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    // Previous turns
    ...history.slice(-8).map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    // Latest message as variable — exactly like the docs example
    { role: 'user', content: newMessage },
  ]

  const completion = await groq.chat.completions.create({
    messages,
    model:                MODEL,
    temperature:          1,
    max_completion_tokens: maxTokens,
    top_p:                1,
    stream:               false,
    stop:                 null,
  })

  return completion.choices[0]?.message?.content?.trim() ?? ''
}
