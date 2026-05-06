'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, ChevronUp, ChevronDown, X } from 'lucide-react'

function DraftMarkdown({ text }) {
  const lines = text.split('\n').filter(Boolean)
  return (
    <div className="text-sm leading-relaxed text-[#6B7A74] space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('•')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-[#1D5D3D] shrink-0 mt-0.5 text-xs">▸</span>
              <span dangerouslySetInnerHTML={{ __html: line.slice(1).trim().replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1A2E26]">$1</strong>') }} />
            </div>
          )
        }
        const html = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1A2E26]">$1</strong>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
      })}
    </div>
  )
}

export default function MayaDraft({ task, projectName, recentSessions }) {
  const [draft, setDraft]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDraft(null)
    setDismissed(false)

    if (!task || task.length < 8) return

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch('/api/maya/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, projectName, recentSessions }),
        })
        const data = await res.json()
        if (data.draft) setDraft(data.draft)
      } catch {}
      setLoading(false)
    }, 1800) // 1.8s debounce

    return () => clearTimeout(timer)
  }, [task, projectName])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {(loading || draft) && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-[#E8F5F0] border border-[#C4DDD2] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#1D5D3D] rounded-lg flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#1D5D3D] text-xs font-semibold uppercase tracking-wider">
                  {loading ? 'Maya is thinking…' : 'Maya drafted a start'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {draft && (
                  <button 
                    onClick={() => setExpanded(e => !e)}
                    className="text-[#94A6A0] hover:text-[#1A2E26] transition-colors"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <button 
                  onClick={() => setDismissed(true)}
                  className="text-[#94A6A0] hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex gap-1 py-1">
                {[0,1,2].map(i => (
                  <span key={i}
                    className="w-1.5 h-1.5 bg-[#1D5D3D]/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}

            <AnimatePresence>
              {draft && expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DraftMarkdown text={draft} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}