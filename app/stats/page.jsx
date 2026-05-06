'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, Target, Brain, TrendingUp, 
  Award, Flame, BarChart3, Zap, CalendarDays,
  CheckCircle, Star, Trophy, Activity
} from 'lucide-react'
import { ACHIEVEMENTS } from '@/lib/timeBank'

const MOOD_EMOJIS = ['', '😴', '😐', '😊', '⚡', '🔥']
const CAL_COLORS  = [
  '#F5F7F6',
  '#E8F5F0',
  '#C4DDD2',
  '#8BB5A4',
  '#1D5D3D',
]

function timeStr(mins) {
  if (!mins) return '0m'
  return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60 ? `${mins%60}m` : ''}` : `${mins}m`
}

export default function StatsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [gamif, setGamif]         = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/gamification').then(r => r.json()),
    ]).then(([a, g]) => { setAnalytics(a); setGamif(g) })
  }, [])

  if (!analytics || !gamif) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1D5D3D]/20 border-t-[#1D5D3D] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-[#1D5D3D] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const { daily, hourly, heatmap, totalSessions, completedCount, totalMinutes, completionRate, avgMood } = analytics
  const maxDaily  = Math.max(...daily.map(d => d.minutes), 1)
  const maxHourly = Math.max(...hourly, 1)
  const maxHeat   = Math.max(...Object.values(heatmap), 1)
  const earnedIds = new Set(gamif.achievementsEarned ?? [])

  // Build calendar grid (13 weeks)
  const calDays = []
  const today   = new Date()
  for (let i = 90; i >= 0; i--) {
    const d   = new Date(today); d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const val = heatmap[key] || 0
    const idx = val === 0 ? 0 : Math.min(Math.ceil((val / maxHeat) * 4), 4)
    calDays.push({ key, val, color: CAL_COLORS[idx] })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1A2E26]">Statistics</h1>
          <p className="text-[#6B7A74] mt-1">Track your productivity journey</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Time', value: timeStr(totalMinutes), icon: Clock, color: '#1D5D3D', bg: '#E8F5F0' },
            { label: 'Sessions', value: totalSessions, icon: Target, color: '#1D5D3D', bg: '#E8F5F0' },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, color: '#1D5D3D', bg: '#E8F5F0' },
            { label: 'Avg Mood', value: avgMood ? MOOD_EMOJIS[Math.round(avgMood)] : '—', icon: Brain, color: '#1D5D3D', bg: '#E8F5F0' },
          ].map((metric, i) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: metric.bg }}>
                    <Icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                  <span className="text-[#6B7A74] text-sm font-medium">{metric.label}</span>
                </div>
                <p className="text-3xl font-bold text-[#1A2E26]">{metric.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Weekly Bar Chart & Peak Hours - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Weekly Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1D5D3D]" />
                <h3 className="text-[#1A2E26] font-semibold">This Week</h3>
              </div>
              <span className="text-xs text-[#6B7A74]">Minutes per day</span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {daily.map((d, idx) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    className="w-full rounded-lg"
                    style={{ 
                      background: d.minutes > 0 
                        ? 'linear-gradient(180deg, #1D5D3D 0%, #154d31 100%)' 
                        : '#F5F7F6'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.minutes / maxDaily) * 120, d.minutes > 0 ? 8 : 0)}px` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                  />
                  <span className="text-[#6B7A74] text-xs font-medium">{d.label}</span>
                  {d.minutes > 0 && (
                    <span className="text-[#1D5D3D] text-[10px] font-bold">{d.minutes}m</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours Heatmap */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB]">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#1D5D3D]" />
              <h3 className="text-[#1A2E26] font-semibold">Peak Hours</h3>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1">
                {hourly.slice(0, 24).map((v, h) => {
                  const intensity = v === 0 ? 0.08 : Math.max(0.2, v / maxHourly)
                  return (
                    <motion.div
                      key={h}
                      title={`${h}:00 — ${v} min`}
                      className="aspect-square rounded-md cursor-help"
                      style={{ 
                        backgroundColor: `rgba(29, 93, 61, ${Math.min(intensity, 1)})`,
                        opacity: v === 0 ? 0.1 : 1
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: h * 0.01 }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-[#6B7A74] mt-3">
                <span>12am</span><span>3am</span><span>6am</span><span>9am</span><span>12pm</span><span>3pm</span><span>6pm</span><span>9pm</span><span>11pm</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#E8EDEB]">
                <span className="text-xs text-[#6B7A74]">Less active</span>
                <div className="flex gap-1">
                  {[0.1, 0.3, 0.5, 0.7, 1].map(opacity => (
                    <div key={opacity} className="w-6 h-3 rounded" style={{ backgroundColor: `rgba(29, 93, 61, ${opacity})` }} />
                  ))}
                </div>
                <span className="text-xs text-[#6B7A74]">More active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Calendar - SMALLER VERSION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB] mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#1D5D3D]" />
              <h3 className="text-[#1A2E26] font-semibold">Last 90 Days</h3>
            </div>
            <span className="text-xs text-[#6B7A74]">Darker = more focus</span>
          </div>
          
          {/* Smaller calendar grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(13, minmax(12px, 1fr))' }}>
                {calDays.map((d, idx) => (
                  <motion.div
                    key={d.key}
                    title={`${d.key}: ${d.val} min`}
                    className="aspect-square rounded-sm cursor-help transition-all hover:scale-110 hover:ring-1 hover:ring-[#1D5D3D]"
                    style={{ backgroundColor: d.color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.001 }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[9px] text-[#6B7A74]">Less</span>
                <div className="flex gap-1">
                  {CAL_COLORS.map((c, i) => (
                    <div key={i} className="w-4 h-2 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[9px] text-[#6B7A74]">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#1D5D3D]" />
              <h3 className="text-[#1A2E26] font-semibold">Achievements</h3>
            </div>
            <div className="px-3 py-1 bg-[#E8F5F0] rounded-full">
              <span className="text-sm font-semibold text-[#1D5D3D]">{earnedIds.size}</span>
              <span className="text-xs text-[#6B7A74]"> / {ACHIEVEMENTS.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ACHIEVEMENTS.map((a, idx) => {
              const unlocked = earnedIds.has(a.id)
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-help ${
                    unlocked
                      ? 'bg-gradient-to-br from-[#E8F5F0] to-[#F5F7F6] border border-[#C4DDD2]'
                      : 'bg-[#F5F7F6] border border-[#E8EDEB] opacity-50'
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <p className={`text-[10px] font-semibold text-center ${unlocked ? 'text-[#1A2E26]' : 'text-[#6B7A74]'}`}>
                    {a.name}
                  </p>
                  {unlocked && (
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-[#D4A500]" />
                      <span className="text-[9px] text-[#1D5D3D] font-medium">+{a.xp} XP</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}