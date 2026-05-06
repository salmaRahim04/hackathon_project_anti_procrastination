'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Play, Timer, Target, TrendingUp, Sparkles, 
  CheckCircle, FolderKanban, ListTodo, Award,
  ArrowLeft, Zap, Flame, Clock, AlertCircle,
  Brain, Star
} from 'lucide-react'
import ColorReveal from '@/components/ColorReveal'
import WorkTimer from '@/components/WorkTimer'
import MoodRating from '@/components/MoodRating'
import MayaDraft from '@/components/MayaDraft'

const SESSION_LENGTHS = [15, 25, 45, 60]

function getTimeOfDay() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

export default function EarnPage() {
  const router = useRouter()
  const [phase, setPhase] = useState('setup')
  const [task, setTask]   = useState('')
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [session, setSession]     = useState(null)
  const [earnedMinutes, setEarned] = useState(0)
  const [xpEarned, setXpEarned]   = useState(0)
  const [newAchievements, setAchs] = useState([])
  const [streak, setStreak]       = useState(null)
  const [projects, setProjects]   = useState([])
  const [allTasks, setAllTasks]   = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTask, setSelectedTask]       = useState(null)
  const [showProjectPicker, setShowProjPicker] = useState(false)
  const [showTaskPicker, setShowTaskPicker]    = useState(false)
  const [showAbandon, setShowAbandon]   = useState(false)
  const [coachMsg, setCoachMsg]         = useState(null)
  const [starting, setStarting]         = useState(false)

  useEffect(() => {
    fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak))
    fetch('/api/projects').then(r => r.json()).then(d => setProjects(d.projects ?? []))
  }, [])

  const multiplier  = streak?.multiplier ?? 1.0
  const earnPreview = Math.round(selectedMinutes * multiplier)

  const handleStart = async () => {
    const desc = selectedTask?.title || task.trim()
    if (!desc || starting) return
    setStarting(true)
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskDescription: desc, plannedMinutes: selectedMinutes }),
      })
      const data = await res.json()
      setSession(data.session)
      localStorage.setItem('earn-scroll-state', JSON.stringify({
        state: 'WORKING', sessionId: data.session.id,
        task: desc, plannedMinutes: selectedMinutes, startTime: Date.now(),
      }))
      setPhase('active')
    } finally { setStarting(false) }
  }

  const handleComplete = async (actualMinutes) => {
    if (!session) return
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, actualMinutes }),
      })
      const data = await res.json()
      if (selectedTask) {
        await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutesSpent: { increment: data.earnedMinutes }, sessions: { increment: 1 } }),
        }).catch(() => {})
      }
      setEarned(data.earnedMinutes)
      setXpEarned(data.xpEarned ?? 0)
      setAchs(data.newAchievements ?? [])
      localStorage.setItem('earn-scroll-state', JSON.stringify({ state: 'IDLE' }))
      setPhase('rating')
    } catch (err) { console.error(err) }
  }

  const handleMoodDone = (mood) => {
    playSuccessSound()
    setPhase('celebrating')
  }

  const handleAbandon = async () => {
    if (!session) return
    const sid = session.id
    const taskDesc = task
    setShowAbandon(false)
    setPhase('abandoned')
    fetch('/api/sessions/abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {})
    localStorage.setItem('earn-scroll-state', JSON.stringify({ state: 'IDLE' }))
    try {
      const res  = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskDescription: taskDesc, timeOfDay: getTimeOfDay(), sessionsToday: 0 }),
      })
      const data = await res.json()
      setCoachMsg(data.message)
    } catch {
      router.push('/')
    }
  }

  const selectProject = async (p) => {
    setSelectedProject(p)
    setShowProjPicker(false)
    if (p) {
      const res = await fetch(`/api/tasks?projectId=${p.id}`)
      const d   = await res.json()
      setAllTasks(d.tasks?.filter(t => !t.done) ?? [])
    }
  }

  function playSuccessSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq; osc.type = 'sine'
        const t = ctx.currentTime + i * 0.14
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.25, t + 0.05)
        gain.gain.linearRampToValueAtTime(0, t + 0.35)
        osc.start(t); osc.stop(t + 0.35)
      })
    } catch {}
  }

  if (phase === 'celebrating') {
    return (
      <ColorReveal
        earnedMinutes={earnedMinutes}
        xpEarned={xpEarned}
        newAchievements={newAchievements}
        onDone={() => router.push('/')}
      />
    )
  }

  if (phase === 'rating') {
    return (
      <MoodRating
        sessionId={session?.id}
        earnedMinutes={earnedMinutes}
        xpEarned={xpEarned}
        onDone={handleMoodDone}
      />
    )
  }

  if (phase === 'abandoned') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white flex items-center justify-center px-4">
        {!coachMsg ? (
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1D5D3D]/20 border-t-[#1D5D3D] rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#1D5D3D] animate-pulse" />
              </div>
            </div>
            <p className="text-[#6B7A74] mt-4">Processing...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-[#E8EDEB]"
          >
            <div className="w-16 h-16 bg-[#E8F5F0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-[#1D5D3D]" />
            </div>
            <h3 className="text-[#1D5D3D] text-sm font-semibold uppercase tracking-wider text-center mb-3">Maya Reflects</h3>
            <p className="text-[#1A2E26] text-lg leading-relaxed text-center mb-8">
              {coachMsg}
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-[#1D5D3D] text-white rounded-xl font-semibold hover:bg-[#154d31] transition-all"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    )
  }

  if (phase === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
        <WorkTimer
          plannedMinutes={selectedMinutes}
          task={selectedTask?.title || task}
          onComplete={handleComplete}
          onAbandon={() => setShowAbandon(true)}
        />
        <AnimatePresence>
          {showAbandon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAbandon(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E8EDEB]"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-[#1A2E26] text-xl font-bold mb-2">Abandon Session?</h3>
                  <p className="text-[#6B7A74] mb-6">You'll lose all progress for this session.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAbandon}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
                    >
                      Yes, Abandon
                    </button>
                    <button
                      onClick={() => setShowAbandon(false)}
                      className="flex-1 px-4 py-2 bg-[#F5F7F6] text-[#1A2E26] rounded-xl font-semibold hover:bg-[#E8EDEB] transition"
                    >
                      Keep Going
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header - Normal top nav, not sticky bottom */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl shadow-sm border border-[#E8EDEB] hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#1D5D3D]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1A2E26]">New Session</h1>
            <p className="text-[#6B7A74] mt-1">Focus, earn time, and level up</p>
          </div>
        </div>

        {/* Streak Banner */}
        {streak && streak.current > 0 && (
          <div className="bg-gradient-to-r from-[#FEF8E7] to-[#FFF3E0] rounded-xl p-4 border border-[#F5E6BA] mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D4A500]" />
                <span className="text-sm font-medium text-[#1A2E26]">{streak.current} day streak!</span>
              </div>
              <div className="text-xs text-[#1D5D3D] font-medium">{streak.multiplier}x earning multiplier</div>
            </div>
          </div>
        )}

        {/* Two Column Layout for Desktop */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Project & Task Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowProjPicker(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E8EDEB] rounded-xl hover:shadow-md transition-all"
              >
                <FolderKanban className="w-4 h-4 text-[#1D5D3D]" />
                <span className="flex-1 text-left text-sm text-[#1A2E26] truncate">
                  {selectedProject?.name || 'No project'}
                </span>
                <span className="text-[#6B7A74] text-xs">▼</span>
              </button>

              <button
                onClick={() => allTasks.length ? setShowTaskPicker(true) : null}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E8EDEB] rounded-xl hover:shadow-md transition-all"
              >
                <ListTodo className="w-4 h-4 text-[#1D5D3D]" />
                <span className="flex-1 text-left text-sm text-[#1A2E26] truncate">
                  {selectedTask?.title || 'No task'}
                </span>
                <span className="text-[#6B7A74] text-xs">▼</span>
              </button>
            </div>

            {/* Task Description */}
            <div>
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder={selectedTask ? selectedTask.title : "What are you working on today?"}
                className="w-full bg-white text-[#1A2E26] rounded-xl p-4 text-base placeholder-[#94A6A0] border border-[#E8EDEB] focus:border-[#1D5D3D] focus:ring-2 focus:ring-[#1D5D3D]/20 focus:outline-none resize-none h-32 transition-all"
                autoFocus
              />
            </div>

            <MayaDraft
              task={selectedTask?.title || task}
              projectName={selectedProject?.name}
              recentSessions={[]}
            />

            {/* Duration Selection */}
            <div>
              <h3 className="text-sm font-medium text-[#1A2E26] mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#1D5D3D]" />
                Session length
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {SESSION_LENGTHS.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMinutes(m)}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                      selectedMinutes === m
                        ? 'bg-[#1D5D3D] text-white shadow-md'
                        : 'bg-white border border-[#E8EDEB] text-[#1A2E26] hover:border-[#1D5D3D]'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preview & CTA */}
          <div className="space-y-6">
            {/* Earn Preview Card */}
            <div className="bg-gradient-to-br from-[#1D5D3D] to-[#154d31] rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    You'll earn
                  </p>
                  <p className="text-white font-bold text-5xl">
                    {earnPreview}<span className="text-xl text-white/50 ml-1">min</span>
                  </p>
                  {multiplier > 1 && (
                    <p className="text-white/60 text-xs mt-2">Includes {multiplier}x streak bonus</p>
                  )}
                </div>
                {multiplier > 1 && (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                    <Star className="w-6 h-6 text-white mb-1" />
                    <p className="text-white font-bold text-xl">{multiplier}×</p>
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={(!task.trim() && !selectedTask) || starting}
              className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                (task.trim() || selectedTask) && !starting
                  ? 'bg-[#1D5D3D] text-white shadow-lg hover:shadow-xl hover:bg-[#154d31]'
                  : 'bg-[#E8EDEB] text-[#94A6A0] cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              {starting ? 'Starting...' : 'Start Focus Session'}
            </button>

            {/* Pro Tip */}
            <div className="bg-[#E8F5F0] rounded-xl p-4 border border-[#C4DDD2]">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-[#1D5D3D] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#1A2E26]">Pro Tip</p>
                  <p className="text-xs text-[#6B7A74]">Longer sessions give you more banked time. Stay focused!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Picker Modal */}
        <AnimatePresence>
          {showProjectPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
              onClick={() => setShowProjPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E8EDEB]"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-[#1A2E26] font-bold text-lg mb-4">Select Project</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <button onClick={() => selectProject(null)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F5F7F6] text-[#6B7A74] text-sm hover:bg-[#E8EDEB] transition">
                    <FolderKanban className="w-4 h-4" />
                    No project
                  </button>
                  {projects.map(p => (
                    <button key={p.id} onClick={() => selectProject(p)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7F6] transition">
                      <span className="text-xl">{p.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2E26] text-sm font-semibold">{p.name}</p>
                        <p className="text-[#6B7A74] text-xs">{p.totalMinutes ?? 0} min · {p.taskCount ?? 0} tasks</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Picker Modal */}
        <AnimatePresence>
          {showTaskPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
              onClick={() => setShowTaskPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E8EDEB]"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-[#1A2E26] font-bold text-lg mb-4">Select Task</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <button onClick={() => { setSelectedTask(null); setShowTaskPicker(false) }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F5F7F6] text-[#6B7A74] text-sm hover:bg-[#E8EDEB] transition">
                    <ListTodo className="w-4 h-4" />
                    No specific task
                  </button>
                  {allTasks.map(t => (
                    <button key={t.id} onClick={() => { setSelectedTask(t); setTask(t.title); setShowTaskPicker(false) }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7F6] transition">
                      <CheckCircle className="w-4 h-4 text-[#6B7A74]" />
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2E26] text-sm font-semibold">{t.title}</p>
                        <p className="text-[#6B7A74] text-xs">{t.sessions} sessions · {t.minutesSpent} min</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}