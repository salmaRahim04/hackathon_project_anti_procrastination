'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, Flame, Zap } from 'lucide-react'

export default function WorkTimer({ plannedMinutes, task, onComplete, onAbandon }) {
  const totalSeconds = plannedMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete(plannedMinutes)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, onComplete, plannedMinutes])

  const handleEarlyDone = () => {
    const elapsed = totalSeconds - secondsLeft
    const actualMinutes = Math.max(1, Math.ceil(elapsed / 60))
    onComplete(actualMinutes)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = (totalSeconds - secondsLeft) / totalSeconds
  const circumference = 2 * Math.PI * 100

  // Motivational messages based on progress
  const getMotivationMessage = () => {
    if (progress < 0.25) return "You've got this! 💪"
    if (progress < 0.5) return "Great start, keep going! 🔥"
    if (progress < 0.75) return "Halfway there! You're crushing it! ⚡"
    if (progress < 0.95) return "Almost done! Final push! 🎯"
    return "Final stretch! You're amazing! 🌟"
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Task label with icon */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-1.5 bg-[#E8F5F0] rounded-lg">
            <Clock className="w-4 h-4 text-[#1D5D3D]" />
          </div>
          <span className="text-[#6B7A74] text-xs font-medium uppercase tracking-wide">Current Focus</span>
        </div>
        <p className="text-[#1A2E26] text-lg font-semibold px-4 leading-relaxed">
          {task}
        </p>
      </motion.div>

      {/* Circular timer */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
          <circle
            cx="112" cy="112" r="100"
            fill="none"
            stroke="#E8EDEB"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="112" cy="112" r="100"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D5D3D" />
              <stop offset="50%" stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#8BB5A4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulsing outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#1D5D3D]/20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />

        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[#1D5D3D] font-mono font-black text-6xl tracking-tight tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-[#94A6A0] text-xs mt-2">remaining</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#6B7A74] mb-2">
          <span>Focus progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 bg-[#E8EDEB] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1D5D3D] to-[#4CAF50] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Motivational message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[#1D5D3D] text-sm font-medium mb-6 flex items-center justify-center gap-2"
      >
        {progress < 0.95 ? (
          <>
            <Flame className="w-4 h-4 text-[#D4A500]" />
            {getMotivationMessage()}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-[#D4A500]" />
            {getMotivationMessage()}
          </>
        )}
      </motion.p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 px-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleEarlyDone}
          className="w-full py-3.5 rounded-xl bg-white border-2 border-[#1D5D3D] text-[#1D5D3D] font-semibold hover:bg-[#E8F5F0] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          I'm done early
        </motion.button>
        
        <button
          onClick={onAbandon}
          className="w-full py-2.5 text-[#94A6A0] text-sm transition-colors hover:text-red-500 flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Abandon session
        </button>
      </div>

      {/* Time earned preview */}
      {progress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-3 bg-[#E8F5F0] rounded-xl"
        >
          <p className="text-xs text-[#6B7A74]">You'll earn approximately</p>
          <p className="text-[#1D5D3D] font-bold text-lg">
            +{Math.max(1, Math.ceil((totalSeconds - secondsLeft) / 60))} min
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}