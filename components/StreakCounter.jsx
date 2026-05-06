'use client'
import { motion } from 'framer-motion'

export default function StreakCounter({ streak }) {
  const { currentStreak, multiplier } = streak
  if (currentStreak === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-2 justify-center mb-2"
    >
      <motion.span
        className="text-xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        🔥
      </motion.span>
      <span className="text-white font-bold text-lg tabular-nums">{currentStreak}</span>
      <span className="text-white/40 text-sm">day streak</span>
      {multiplier > 1 && (
        <span className="text-[#00E5FF] text-sm font-semibold">{multiplier}x</span>
      )}
    </motion.div>
  )
}
