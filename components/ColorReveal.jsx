'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Trophy, Star, Award } from 'lucide-react'

export default function ColorReveal({ earnedMinutes, xpEarned = 0, newAchievements = [], onDone }) {
  const [phase, setPhase]         = useState(0)
  const [displayCount, setDisplay] = useState(0)

  // 0ms: gray  300ms: color bleeds  600ms: full color
  // 900ms: count-up  1200ms: confetti  1500ms: CTAs
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 900),
      setTimeout(async () => {
        setPhase(4)
        try {
          const { default: confetti } = await import('canvas-confetti')
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.3 },
            colors: ['#1D5D3D', '#4CAF50', '#8BB5A4', '#D4A500', '#FFD54F', '#C4DDD2'] })
          setTimeout(() => {
            confetti({ particleCount: 70, spread: 55, origin: { y: 0.3, x: 0.15 } })
            confetti({ particleCount: 70, spread: 55, origin: { y: 0.3, x: 0.85 } })
          }, 250)
        } catch {}
      }, 1200),
      setTimeout(() => setPhase(5), 1600),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  // Count-up animation
  useEffect(() => {
    if (phase < 3) return
    let start = null
    const raf = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 700, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(earnedMinutes * eased))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [phase, earnedMinutes])

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F7F6] to-white"
      animate={{ filter: phase >= 2 ? 'grayscale(0%)' : 'grayscale(100%)' }}
      transition={{ duration: 0.5 }}
    >
      {/* Radial burst */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, #1D5D3D18 0%, #8BB5A410 45%, transparent 70%)' }}
        animate={{ scale: phase >= 1 ? 5 : 0, opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 text-center px-8 w-full max-w-md">
        {/* Count-up */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 180 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#D4A500]" />
                <p className="text-[#6B7A74] text-lg font-medium">You earned</p>
              </div>
              <p className="text-[#1D5D3D] font-black leading-none tabular-nums"
                 style={{ fontSize: 'clamp(80px, 28vw, 120px)' }}>
                {displayCount}
              </p>
              <p className="text-[#1A2E26] text-2xl font-bold mt-2">
                {earnedMinutes === 1 ? 'minute' : 'minutes'}
              </p>
              <p className="text-[#1D5D3D] mt-2 text-base font-medium">of guilt-free scroll time</p>

              {/* XP earned */}
              {xpEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 mt-4 bg-[#E8F5F0] border border-[#C4DDD2] rounded-full px-4 py-1.5"
                >
                  <Star className="w-4 h-4 text-[#D4A500]" />
                  <span className="text-[#1D5D3D] font-bold text-sm">+{xpEarned} XP</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement unlocks */}
        <AnimatePresence>
          {phase >= 4 && newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 flex flex-col gap-2"
            >
              {newAchievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3 bg-[#E8F5F0] border border-[#C4DDD2] rounded-xl px-4 py-3 text-left"
                >
                  <div className="w-10 h-10 bg-[#1D5D3D]/10 rounded-full flex items-center justify-center text-2xl">
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1D5D3D] font-bold text-sm">{a.name} unlocked!</p>
                    <p className="text-[#6B7A74] text-xs">{a.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-[#D4A500]" />
                    <span className="text-[#1D5D3D] font-bold text-xs">+{a.xp}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTAs */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col gap-3"
            >
              <Link href="/spend">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-xl bg-[#1D5D3D] text-white font-bold text-lg hover:bg-[#154d31] transition-all shadow-lg">
                  Spend Now
                </motion.button>
              </Link>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onDone}
                className="w-full py-3 rounded-xl text-[#6B7A74] font-medium hover:text-[#1A2E26] transition-colors">
                Bank It
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}