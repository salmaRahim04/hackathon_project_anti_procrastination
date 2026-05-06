'use client'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

export default function ScrollBank({ bank }) {
  if (!bank) return null

  const { balance, totalEarned, totalSpent } = bank
  const maxRef = Math.max(totalEarned, 60)
  const fillPercent = Math.min((balance / maxRef) * 100, 100)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[#E8F5F0] rounded-lg">
              <Wallet className="w-4 h-4 text-[#1D5D3D]" />
            </div>
            <p className="text-[#6B7A74] text-xs font-semibold uppercase tracking-wider">
              Available Balance
            </p>
          </div>
          <p className="text-[#1D5D3D] font-black text-5xl leading-none tabular-nums">
            {balance}
            <span className="text-xl text-[#94A6A0] font-semibold ml-2">min</span>
          </p>
        </div>
        
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-[#1D5D3D]" />
            <p className="text-[#6B7A74] text-xs">earned <span className="text-[#1A2E26] font-semibold">{totalEarned}</span> min</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-[#D4A500]" />
            <p className="text-[#6B7A74] text-xs">spent <span className="text-[#1A2E26] font-semibold">{totalSpent}</span> min</p>
          </div>
        </div>
      </div>

      {/* Fill bar with gradient */}
      <div className="relative">
        <div className="h-2 bg-[#E8EDEB] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #1D5D3D, #4CAF50, #8BB5A4)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        
        {/* Percentage indicator */}
        {balance > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-5 left-0 text-[10px] text-[#1D5D3D] font-medium"
            style={{ left: `${fillPercent}%`, transform: 'translateX(-50%)' }}
          >
            {Math.round(fillPercent)}%
          </motion.div>
        )}
      </div>

      {/* Motivational message based on balance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3"
      >
        {balance === 0 && (
          <p className="text-[#94A6A0] text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Complete a session to earn time
          </p>
        )}
        {balance > 0 && balance < 30 && (
          <p className="text-[#6B7A74] text-xs flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#1D5D3D]" />
            Great start! Keep building your bank
          </p>
        )}
        {balance >= 30 && balance < 100 && (
          <p className="text-[#1D5D3D] text-xs font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Nice balance! Ready for a guilt-free break
          </p>
        )}
        {balance >= 100 && (
          <p className="text-[#1D5D3D] text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Amazing! You've earned a long break 🎉
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}