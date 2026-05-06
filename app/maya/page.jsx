'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, MessageSquare, Inbox, Sparkles, Send, 
  X, ChevronDown, ChevronUp, Clock, Globe
} from 'lucide-react'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}

function SummaryMarkdown({ text }) {
  const lines = text.split('\n').filter(Boolean)
  return (
    <div className="text-sm leading-relaxed text-[#1A2E26] space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('•')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#1D5D3D] mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: line.slice(1).trim().replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1A2E26]">$1</strong>') }} />
            </div>
          )
        }
        const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1A2E26]">$1</strong>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
      })}
    </div>
  )
}

function DigestCard({ item, onDigest, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const digest = async () => {
    setLoading(true)
    await onDigest(item.id)
    setLoading(false)
    setExpanded(true)
  }

  const hostname = (() => { try { return new URL(item.url).hostname.replace('www.', '') } catch { return item.url } })()

  // Simple emoji-based icon
  const getIcon = () => {
    if (hostname.includes('youtube')) return '📺'
    if (hostname.includes('reddit')) return '🤖'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return '𝕏'
    if (hostname.includes('medium')) return '📝'
    return '🌐'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`rounded-xl p-4 border transition-all ${
        item.status === 'done'
          ? 'bg-[#E8F5F0] border-[#C4DDD2]'
          : 'bg-white border-[#E8EDEB] shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
          item.status === 'done' ? 'bg-white' : 'bg-[#F5F7F6]'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#1A2E26] font-semibold text-sm leading-tight truncate">{item.title || hostname}</p>
          <p className="text-[#94A6A0] text-xs mt-0.5">{hostname} · {formatTime(item.createdAt)}</p>
        </div>
        <button 
          onClick={() => onDelete(item.id)} 
          className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-[#94A6A0] hover:text-red-500" />
        </button>
      </div>

      <div className="mt-3">
        {item.status === 'queued' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={digest}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#1D5D3D] text-white text-sm font-medium hover:bg-[#154d31] transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Maya is reading…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Summarize for me
              </span>
            )}
          </motion.button>
        )}

        {item.status === 'processing' && (
          <div className="flex items-center gap-2 text-[#1D5D3D] text-sm py-2">
            <div className="w-4 h-4 border-2 border-[#1D5D3D]/30 border-t-[#1D5D3D] rounded-full animate-spin" />
            Maya is reading this…
          </div>
        )}

        {item.status === 'done' && item.summary && (
          <>
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full text-left py-2 text-[#1D5D3D] text-sm font-medium flex items-center justify-between hover:bg-[#F5F7F6] px-2 rounded-lg transition-all"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                View Maya's summary
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-2 border-t border-[#E8EDEB] bg-white rounded-lg p-3">
                    <SummaryMarkdown text={item.summary} />
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-[#1D5D3D] hover:text-[#154d31] transition-colors"
                    >
                      Open original →
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function MayaPage() {
  const [queue, setQueue]       = useState([])
  const [tab, setTab]           = useState('queue')
  const [loading, setLoading]   = useState(true)
  const [chatHistory, setChat]  = useState([])
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending]   = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    loadQueue()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  async function loadQueue() {
    setLoading(true)
    const res  = await fetch('/api/maya/queue')
    const data = await res.json()
    setQueue(data.items ?? [])
    setLoading(false)
  }

  async function handleDigest(itemId) {
    const res  = await fetch('/api/maya/digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    const data = await res.json()
    if (data.item) {
      setQueue(prev => prev.map(q => q.id === itemId ? data.item : q))
    }
  }

  async function handleDelete(itemId) {
    await fetch(`/api/maya/queue?id=${itemId}`, { method: 'DELETE' })
    setQueue(prev => prev.filter(q => q.id !== itemId))
  }

  async function handleDigestAll() {
    const queued = queue.filter(q => q.status === 'queued')
    for (const item of queued) {
      await handleDigest(item.id)
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || sending) return
    const msg = chatInput.trim()
    setChatInput('')
    setSending(true)
    const newHistory = [...chatHistory, { role: 'user', content: msg }]
    setChat(newHistory)

    const res  = await fetch('/api/maya/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory }),
    })
    const data = await res.json()
    setChat([...newHistory, { role: 'assistant', content: data.reply || 'Something went wrong.' }])
    setSending(false)
  }

  const pending = queue.filter(q => q.status === 'queued' || q.status === 'processing')
  const done    = queue.filter(q => q.status === 'done')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#1D5D3D] to-[#154d31] rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1A2E26]">Maya</h1>
            <p className="text-[#6B7A74] mt-1">Your AI productivity agent</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 border-b border-[#E8EDEB]">
          {[
            { id: 'queue', label: 'Digest Queue', icon: Inbox, count: pending.length },
            { id: 'chat', label: 'Chat with Maya', icon: MessageSquare },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                  tab === t.id
                    ? 'text-[#1D5D3D]'
                    : 'text-[#6B7A74] hover:text-[#1A2E26]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count > 0 && tab !== 'queue' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#1D5D3D] text-white text-xs rounded-full">
                    {t.count}
                  </span>
                )}
                {tab === t.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D5D3D]"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Queue Tab */}
        {tab === 'queue' && (
          <div>
            {pending.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDigestAll}
                className="w-full py-3 rounded-xl bg-[#1D5D3D] text-white text-sm font-medium mb-6 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Summarize all ({pending.length} items)
              </motion.button>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-3 border-[#1D5D3D]/20 border-t-[#1D5D3D] rounded-full animate-spin" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E8EDEB]">
                <div className="w-20 h-20 bg-[#E8F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-10 h-10 text-[#1D5D3D]" />
                </div>
                <p className="text-[#1A2E26] font-medium text-lg mb-2">Queue is empty</p>
                <p className="text-[#6B7A74] text-sm max-w-md mx-auto">
                  When you visit a blocked site during a work session, you'll see a 
                  "Queue for Maya" button. She'll summarize it so you don't miss anything.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pending.length > 0 && (
                  <div>
                    <h3 className="text-[#1A2E26] font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1D5D3D]" />
                      Pending ({pending.length})
                    </h3>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {pending.map(item => (
                          <DigestCard key={item.id} item={item} onDigest={handleDigest} onDelete={handleDelete} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                
                {done.length > 0 && (
                  <div>
                    <h3 className="text-[#1A2E26] font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#1D5D3D]" />
                      Completed ({done.length})
                    </h3>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {done.map(item => (
                          <DigestCard key={item.id} item={item} onDigest={handleDigest} onDelete={handleDelete} />
                        ))}
                      </AnimatePresence>
                    </div>
                    <button 
                      onClick={() => fetch('/api/maya/queue', { method: 'DELETE' }).then(loadQueue)}
                      className="mt-4 text-sm text-[#94A6A0] hover:text-red-500 transition-colors flex items-center gap-1 mx-auto"
                    >
                      Clear all completed
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {tab === 'chat' && (
          <div className="bg-white rounded-2xl border border-[#E8EDEB] shadow-sm overflow-hidden">
            {/* Chat Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#E8F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-[#1D5D3D]" />
                  </div>
                  <p className="text-[#6B7A74] mb-6">Ask Maya anything about your work, tasks, or progress.</p>
                  <div className="space-y-2 max-w-md mx-auto">
                    {[
                      "What should I focus on today?",
                      "How's my streak looking?",
                      "I'm procrastinating. Help me focus.",
                      "Summarize my week's progress",
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="w-full text-left px-4 py-2 bg-[#F5F7F6] rounded-lg text-[#1A2E26] text-sm hover:bg-[#E8F5F0] transition-colors"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#1D5D3D] text-white'
                        : 'bg-[#F5F7F6] text-[#1A2E26]'
                    }`}>
                      {m.role === 'assistant' ? <SummaryMarkdown text={m.content} /> : m.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#F5F7F6] rounded-xl px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#1D5D3D] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-2 h-2 bg-[#1D5D3D] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-2 h-2 bg-[#1D5D3D] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-[#E8EDEB] p-4 bg-white">
              <div className="flex gap-3">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask Maya anything…"
                  className="flex-1 bg-[#F5F7F6] text-[#1A2E26] rounded-xl px-4 py-2.5 text-sm placeholder-[#94A6A0] border border-[#E8EDEB] focus:border-[#1D5D3D] focus:ring-2 focus:ring-[#1D5D3D]/20 focus:outline-none transition-all"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || sending}
                  className={`p-2.5 rounded-xl font-semibold text-sm transition-all ${
                    chatInput.trim() && !sending
                      ? 'bg-[#1D5D3D] text-white hover:bg-[#154d31]'
                      : 'bg-[#F5F7F6] text-[#94A6A0] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}