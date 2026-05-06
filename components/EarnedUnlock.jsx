'use client'
import { motion } from 'framer-motion'
import { Sparkles, Wallet, TrendingUp } from 'lucide-react'

export default function EarnedUnlock({ minutes, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-[#F5F7F6] to-white flex flex-col items-center justify-center z-50 px-8"
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#1D5D3D]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4A500]/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, -10, 10, -5, 5, 0],
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="w-24 h-24 bg-[#E8F5F0] rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <Sparkles className="w-12 h-12 text-[#D4A500]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-[#1A2E26] text-sm font-semibold uppercase tracking-wider mb-4">
          Time Earned
        </h2>
        <p className="text-[#1D5D3D] font-black text-8xl text-center mb-2 tabular-nums">
          +{minutes}
        </p>
        <p className="text-[#6B7A74] text-xl mb-2">
          {minutes === 1 ? 'minute' : 'minutes'}
        </p>
        
        <div className="flex items-center justify-center gap-2 mt-2 mb-6">
          <Wallet className="w-4 h-4 text-[#1D5D3D]" />
          <p className="text-[#1D5D3D] text-base font-semibold">
            Added to your scroll bank!
          </p>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="px-10 py-4 rounded-xl bg-[#1D5D3D] text-white font-bold text-lg hover:bg-[#154d31] transition-all shadow-lg flex items-center gap-2"
      >
        <TrendingUp className="w-5 h-5" />
        Awesome!
      </motion.button>

      {/* Progress Bar Animation */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#1D5D3D] to-[#4CAF50]"
      />
    </motion.div>
  )
}