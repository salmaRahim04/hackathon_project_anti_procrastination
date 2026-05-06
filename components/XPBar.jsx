'use client'
import { motion } from 'framer-motion'
import { Crown, Star, TrendingUp, Award, Sparkles } from 'lucide-react'
import { LEVEL_NAMES } from '@/lib/timeBank'

export default function XPBar({ gamif }) {
  if (!gamif) return null
  const { level, levelName, xpPct, xp, xpInLevel, xpNeeded } = gamif

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-3 border border-[#E8EDEB] shadow-sm"
    >
      <div className="flex items-center gap-3">
        {/* Level Badge */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative shrink-0"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#1D5D3D] to-[#154d31] rounded-xl flex flex-col items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">{level}</span>
            <span className="text-white/60 text-[8px] font-medium">LVL</span>
          </div>
          {level >= 5 && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-3 h-3 text-[#D4A500] fill-[#D4A500]" />
            </div>
          )}
        </motion.div>

        {/* Level Info */}
        <div className="shrink-0">
          <p className="text-[#1A2E26] font-semibold text-sm">{levelName}</p>
          <p className="text-[#94A6A0] text-xs flex items-center gap-1">
            <Star className="w-3 h-3" />
            {xp}/{xpNeeded} XP to next level
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[10px] text-[#94A6A0] mb-1">
            <span>Progress</span>
            <span>{Math.round(xpPct)}%</span>
          </div>
          <div className="h-2 bg-[#E8EDEB] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#1D5D3D] to-[#4CAF50]"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* XP Display */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="shrink-0 bg-[#E8F5F0] rounded-lg px-3 py-1.5 text-center"
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4A500]" />
            <span className="text-[#1D5D3D] font-bold text-xs tabular-nums">{xp}</span>
            <span className="text-[#94A6A0] text-[10px]">XP</span>
          </div>
        </motion.div>
      </div>

      {/* Next milestone preview */}
      {xpNeeded - xpInLevel > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.2 }}
          className="mt-2 pt-2 border-t border-[#E8EDEB]"
        >
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#6B7A74]">Next level in</span>
            <span className="text-[#1D5D3D] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {xpNeeded - xpInLevel} XP
            </span>
          </div>
          <div className="mt-1 h-1 bg-[#E8EDEB] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4A500] to-[#1D5D3D] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(xpInLevel / xpNeeded) * 100}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}