'use client'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, TrendingUp, Calendar, Briefcase } from 'lucide-react'

function formatDuration(mins) {
  if (!mins) return '—'
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
  return `${mins}m`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'just now'
}

export default function TaskCard({ session }) {
  const isCompleted = session.completedAt

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group bg-white rounded-xl p-4 flex items-center justify-between gap-3 border transition-all cursor-pointer ${
        isCompleted
          ? 'border-[#E8EDEB] shadow-sm hover:shadow-md'
          : 'border-[#E8EDEB] hover:border-[#C4DDD2]'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon based on session type */}
        <div className={`p-2 rounded-xl transition-colors ${
          isCompleted ? 'bg-[#E8F5F0]' : 'bg-[#F5F7F6] group-hover:bg-[#E8F5F0]'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-[#1D5D3D]" />
          ) : (
            <Briefcase className="w-4 h-4 text-[#6B7A74] group-hover:text-[#1D5D3D]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[#1A2E26] text-sm font-medium truncate">
            {session.taskDescription}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#94A6A0]" />
              <p className="text-[#6B7A74] text-xs">
                {formatDuration(session.actualMinutes || session.plannedMinutes)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#94A6A0]" />
              <p className="text-[#6B7A74] text-xs">
                {timeAgo(session.completedAt) || 'In progress'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badge */}
      <div className={`text-right shrink-0 transition-all ${
        isCompleted ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
      }`}>
        <div className="flex items-center gap-1.5 bg-[#E8F5F0] rounded-lg px-3 py-1.5">
          <TrendingUp className="w-3 h-3 text-[#1D5D3D]" />
          <span className="text-[#1D5D3D] font-bold text-sm">
            +{session.earnedMinutes}
            <span className="text-[10px] font-normal ml-0.5">min</span>
          </span>
        </div>
        <p className="text-[#94A6A0] text-[10px] mt-1">earned</p>
      </div>
    </motion.div>
  )
}