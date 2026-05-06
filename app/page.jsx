'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Wallet, 
  TrendingUp, 
  Play, 
  Calendar,
  Award,
  Target,
  ChevronRight,
  Zap,
  CheckCircle,
  Leaf,
  Sun,
  LayoutDashboard,
  FolderKanban,
  Bot,
  Settings,
  Shield,
  BarChart3,
  Menu,
  X
} from 'lucide-react'

export default function Home() {
  const pathname = usePathname()
  const [bank, setBank]         = useState(null)
  const [gamif, setGamif]       = useState(null)
  const [sessions, setSessions] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted]   = useState(false)   // hydration guard

  useEffect(() => {
    setMounted(true)
    Promise.all([
      fetch('/api/bank/balance').then(r => r.json()),
      fetch('/api/gamification').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json()),
    ]).then(([bankData, gamifData, sessData, analyticsData]) => {
      setBank(bankData.bank)
      setGamif(gamifData)
      setSessions(sessData.sessions?.slice(0, 4) ?? [])
      setStats(analyticsData)
    }).finally(() => setLoading(false))
  }, [])

  const hasBalance   = (bank?.balance ?? 0) > 0
  const streak       = gamif?.currentStreak ?? 0
  const todayMinutes = gamif?.todayMinutes   ?? 0
  const dailyGoal    = gamif?.dailyGoal      ?? 60
  const goalPct      = dailyGoal > 0 ? Math.min((todayMinutes / dailyGoal) * 100, 100) : 0
  const level        = gamif?.level          ?? 1
  // Correct field names from /api/gamification
  const xpNeeded     = gamif?.xpNeeded       ?? 100
  const xpInLevel    = gamif?.xpInLevel      ?? 0
  const xpPct        = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 0
  // Real stats from analytics
  const totalSessions  = stats?.totalSessions   ?? 0
  const totalMinutes   = stats?.totalMinutes    ?? 0
  const completionRate = stats?.completionRate  ?? 0

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Earn', href: '/earn', icon: Play },
    { name: 'Spend', href: '/spend', icon: Wallet },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Stats', href: '/stats', icon: BarChart3 },
    { name: 'Maya', href: '/maya', icon: Bot },
    { name: 'Blocked Sites', href: '/settings', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1D5D3D]/30 border-t-[#1D5D3D] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-[#1D5D3D] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-[#E8EDEB]"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-[#1D5D3D]" /> : <Menu className="w-5 h-5 text-[#1D5D3D]" />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E8EDEB] z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1D5D3D] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1A2E26]">Earn your scroll</h1>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              // mounted guard prevents server/client pathname mismatch (hydration error)
              const isActive = mounted && pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#E8F5F0] text-[#1D5D3D]'
                        : 'text-[#6B7A74] hover:bg-[#F5F7F6] hover:text-[#1A2E26]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                </Link>
              )
            })}
          </nav>

          {/* User Info Footer */}
          <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-[#E8EDEB]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1D5D3D] rounded-full flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A2E26]">John Doe</p>
                <p className="text-xs text-[#6B7A74]">Level {level}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-[#1D5D3D] p-2 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A2E26]">Earn your scroll</h1>
                <p className="text-[#6B7A74] text-sm">Master your time, master your life</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white shadow-sm border border-[#E8EDEB] px-4 py-2 rounded-full">
                <Award className="w-4 h-4 text-[#D4A500]" />
                <span className="text-[#1A2E26] font-semibold">Level {level}</span>
              </div>
              <button className="bg-white shadow-sm border border-[#E8EDEB] p-2 rounded-full hover:bg-[#F5F7F6] transition-all">
                <Calendar className="w-5 h-5 text-[#6B7A74]" />
              </button>
            </div>
          </header>

          {/* Stats Grid - Clean cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* XP Card */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#1D5D3D]" />
                  <span className="text-[#1A2E26] font-semibold">XP Progress</span>
                </div>
                <span className="text-[#6B7A74] text-sm">{xpInLevel} / {xpNeeded} XP</span>
              </div>
              <div className="h-2 bg-[#E8EDEB] rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-[#1D5D3D]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-[#D4A500]" />
                    <span className="text-[#1A2E26] font-bold text-lg">{streak}</span>
                  </div>
                  <p className="text-[#6B7A74] text-xs">Day Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-[#1D5D3D]" />
                    <span className="text-[#1A2E26] font-bold text-lg">{todayMinutes}</span>
                  </div>
                  <p className="text-[#6B7A74] text-xs">Today</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Wallet className="w-4 h-4 text-[#1D5D3D]" />
                    <span className="text-[#1A2E26] font-bold text-lg">{bank?.balance ?? 0}</span>
                  </div>
                  <p className="text-[#6B7A74] text-xs">Banked</p>
                </div>
              </div>
            </div>

            {/* Daily Goal Card */}
            <div className="md:col-span-2 bg-[#E8F5F0] rounded-2xl p-6 border border-[#C4DDD2]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-[#D4A500]" />
                  <span className="text-[#1A2E26] font-semibold">Daily Goal</span>
                </div>
                <span className="text-[#1A2E26] text-sm font-medium">{todayMinutes} / {dailyGoal} min</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-[#1D5D3D] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              {goalPct >= 100 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#1D5D3D] text-sm font-medium text-center flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Daily goal achieved! Great job! 🎉
                </motion.p>
              )}
              {goalPct < 100 && goalPct > 0 && (
                <p className="text-[#6B7A74] text-xs text-center">
                  {Math.round(goalPct)}% complete - keep going!
                </p>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Balance & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E8EDEB] sticky top-8">
                <AnimatePresence mode="wait">
                  {hasBalance ? (
                    <motion.div
                      key="has"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center"
                    >
                      <div className="relative inline-block mb-4">
                        <div className="text-7xl font-black text-[#1D5D3D]">
                          {bank.balance}
                        </div>
                        <div className="absolute -top-2 -right-6">
                          <Sparkles className="w-6 h-6 text-[#D4A500]" />
                        </div>
                      </div>
                      <p className="text-[#6B7A74] mb-2">Minutes Available</p>
                      <p className="text-[#1D5D3D] text-sm font-medium mb-6">✨ Time to enjoy your reward!</p>
                      <Link href="/spend">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-xl bg-[#1D5D3D] text-white font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <Wallet className="w-5 h-5" />
                          Spend Your Minutes
                        </motion.button>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center"
                    >
                      <div className="text-7xl font-black text-[#E8EDEB] mb-2">0</div>
                      <p className="text-[#6B7A74] mb-2">Minutes in Bank</p>
                      <p className="text-[#6B7A74] text-sm mb-6">Complete sessions to earn time</p>
                      <Link href="/earn">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-xl bg-[#1D5D3D] text-white font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <Play className="w-5 h-5" />
                          Start Working
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 pt-6 border-t border-[#E8EDEB]">
                  <div className="flex items-center justify-between text-sm text-[#6B7A74] mb-2">
                    <span>Today's Progress</span>
                    <span>{todayMinutes} min worked</span>
                  </div>
                  <div className="h-2 bg-[#E8EDEB] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1D5D3D]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((todayMinutes / 480) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Sessions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#1D5D3D]" />
                  <h2 className="text-xl font-bold text-[#1A2E26]">Recent Focus Sessions</h2>
                </div>
                <Link href="/stats" className="text-[#1D5D3D] hover:text-[#1D5D3D]/80 flex items-center gap-1 text-sm font-medium">
                  View all stats <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-5 shadow-sm border border-[#E8EDEB] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#E8F5F0] rounded-lg">
                            <Zap className="w-4 h-4 text-[#1D5D3D]" />
                          </div>
                          <div>
                            <h3 className="text-[#1A2E26] font-semibold">{session.title || 'Focus Session'}</h3>
                            <p className="text-[#6B7A74] text-xs">{session.duration || 25} minutes</p>
                          </div>
                        </div>
                        <div className="text-[#1D5D3D] text-sm font-semibold bg-[#E8F5F0] px-2 py-1 rounded">
                          +{session.earned || 25} min
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B7A74]">{session.date || 'Today'}</span>
                        <span className="text-[#1D5D3D] group-hover:text-[#1D5D3D]/80 transition-colors font-medium">View details →</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-[#E8EDEB]">
                    <Clock className="w-12 h-12 text-[#C4DDD2] mx-auto mb-3" />
                    <p className="text-[#6B7A74]">No sessions yet</p>
                    <p className="text-[#6B7A74] text-sm">Start your first focus session now!</p>
                  </div>
                )}
              </div>

              {/* Motivational Quote Card */}
              <div className="mt-8 bg-[#E8F5F0] rounded-xl p-6 border border-[#C4DDD2]">
                <p className="text-[#1A2E26] text-center font-medium italic">
                  "The secret of your future is hidden in your daily routine."
                </p>
                <p className="text-[#6B7A74] text-center text-sm mt-2">— Mike Mudock</p>
              </div>

              {/* Achievement Preview */}
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4 border border-[#E8EDEB]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FEF8E7] rounded-lg">
                    <Award className="w-5 h-5 text-[#D4A500]" />
                  </div>
                  <div>
                    <p className="text-[#1A2E26] font-semibold text-sm">Next Milestone</p>
                    <p className="text-[#6B7A74] text-xs">Complete 5 more sessions to level up!</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7A74]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}