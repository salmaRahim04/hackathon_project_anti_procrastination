'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Star, TrendingUp, CheckCircle } from 'lucide-react'

const MOODS = [
  { value: 1, emoji: '😴', label: 'Zoned out', color: '#94A6A0' },
  { value: 2, emoji: '😐', label: 'Distracted', color: '#D4A500' },
  { value: 3, emoji: '😊', label: 'Focused', color: '#8BB5A4' },
  { value: 4, emoji: '⚡', label: 'In the zone', color: '#4CAF50' },
  { value: 5, emoji: '🔥', label: 'Flow state', color: '#1D5D3D' },
]

export default function MoodRating({ sessionId, earnedMinutes, xpEarned, onDone }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSelect = async (mood) => {
    setSelected(mood)
    setSubmitting(true)
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, mood }),
      })
    } catch {}
    setTimeout(() => onDone(mood), 600)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#F5F7F6] to-white flex flex-col items-center justify-center px-6 z-40"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1D5D3D]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A500]/5 rounded-full blur-3xl"
        />
      </div>

      {/* Earned summary */}
      <motion.div
        className="text-center mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 14 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#D4A500]" />
          <p className="text-[#6B7A74] text-sm font-medium uppercase tracking-wide">Session complete!</p>
        </div>
        
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D5D3D] to-[#4CAF50] blur-2xl opacity-20 rounded-full" />
          <p className="relative text-[#1D5D3D] font-black text-8xl leading-none tabular-nums">
            {earnedMinutes}
          </p>
        </div>
        
        <p className="text-[#6B7A74] text-xl mt-2">minutes earned</p>
        
        {xpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 mt-4 bg-[#E8F5F0] border border-[#C4DDD2] rounded-full px-4 py-1.5"
          >
            <Brain className="w-4 h-4 text-[#1D5D3D]" />
            <span className="text-[#1D5D3D] font-bold text-sm">+{xpEarned} XP</span>
          </motion.div>
        )}
      </motion.div>

      {/* Mood question */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-[#1A2E26] text-lg font-semibold">How was your focus?</h3>
          <p className="text-[#6B7A74] text-sm mt-1">Rate your session experience</p>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {MOODS.map((m) => (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !submitting && handleSelect(m.value)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                selected === m.value
                  ? `border-[${m.color}] bg-[${m.color}]/10 shadow-md`
                  : 'border-[#E8EDEB] bg-white hover:border-[#C4DDD2]'
              }`}
              style={{
                borderColor: selected === m.value ? m.color : undefined,
                backgroundColor: selected === m.value ? `${m.color}10` : undefined
              }}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-[#6B7A74] font-medium text-center leading-tight px-1">
                {m.label}
              </span>
              {selected === m.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <CheckCircle className="w-4 h-4 text-[#1D5D3D]" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !submitting && onDone(null)}
          className="w-full mt-6 py-2 text-[#94A6A0] text-sm hover:text-[#6B7A74] transition-colors"
        >
          Skip this step
        </motion.button>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#1D5D3D] to-[#4CAF50]"
      />
    </motion.div>
  )
}