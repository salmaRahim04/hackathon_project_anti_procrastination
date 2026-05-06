'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Timer, Award, TrendingUp, ArrowLeft, Sparkles, Globe, Play, Square } from 'lucide-react'

const WHITELISTED_SITES = [
  { name: 'YouTube', url: 'https://youtube.com', icon: '📺', color: '#FF0000' },
  { name: 'Twitter', url: 'https://x.com', icon: '𝕏', color: '#1DA1F2' },
  { name: 'Instagram', url: 'https://instagram.com', icon: '📸', color: '#E4405F' },
  { name: 'Reddit', url: 'https://reddit.com', icon: '🤖', color: '#FF4500' },
  { name: 'Netflix', url: 'https://netflix.com', icon: '🎬', color: '#E50914' },
  { name: 'TikTok', url: 'https://tiktok.com', icon: '🎵', color: '#000000' },
]

const TIME_OPTIONS = [5, 10, 15, 20, 30]

export default function SpendPage() {
  const router = useRouter()
  const [bank, setBank] = useState(null)
  const [selectedMinutes, setSelectedMinutes] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [isSpending, setIsSpending] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bank/balance')
      .then((r) => r.json())
      .then((d) => {
        setBank(d.bank)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!isSpending || secondsLeft === null) return
    if (secondsLeft <= 0) {
      setIsSpending(false)
      setTimeExpired(true)
      localStorage.setItem('earn-scroll-state', JSON.stringify({ state: 'IDLE' }))
      return
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [isSpending, secondsLeft])

  const handleStartSpending = async () => {
    if (!selectedMinutes || !bank || bank.balance < selectedMinutes) return
    try {
      await fetch('/api/bank/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: selectedMinutes }),
      })
      setBank((prev) => ({ ...prev, balance: prev.balance - selectedMinutes }))
      setSecondsLeft(selectedMinutes * 60)
      setIsSpending(true)
      localStorage.setItem(
        'earn-scroll-state',
        JSON.stringify({ state: 'SPENDING', minutesRemaining: selectedMinutes })
      )
    } catch (err) {
      console.error(err)
    }
  }

  const availableOptions = TIME_OPTIONS.filter((m) => m <= (bank?.balance ?? 0))
  if (bank?.balance && !availableOptions.includes(bank.balance) && bank.balance > 0) {
    availableOptions.push(bank.balance)
    availableOptions.sort((a, b) => a - b)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1D5D3D]/30 border-t-[#1D5D3D] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Timer className="w-6 h-6 text-[#1D5D3D] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (timeExpired) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white flex flex-col items-center justify-center px-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-[#1D5D3D] to-[#154d31] rounded-full flex items-center justify-center mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: 2, duration: 0.5 }}
        >
          <Clock className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-[#1A2E26] mb-3">Time's Up!</h2>
        <p className="text-[#6B7A74] mb-10 max-w-sm">
          Your guilt-free scroll session is complete. Time to get back to work!
        </p>
        <Link href="/earn">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-[#1D5D3D] text-white font-bold text-lg shadow-lg hover:bg-[#154d31] transition-all"
          >
            Earn More Time
          </motion.button>
        </Link>
        <button onClick={() => router.push('/')} className="mt-4 text-[#94A6A0] text-sm hover:text-[#6B7A74] transition">
          Back to Dashboard
        </button>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white rounded-xl shadow-sm border border-[#E8EDEB] hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#1D5D3D]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1A2E26]">Spend Bank</h1>
              <p className="text-[#6B7A74] text-sm">Use your earned time guilt-free</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-[#E8EDEB]">
            <Sparkles className="w-4 h-4 text-[#1D5D3D]" />
            <span className="text-sm text-[#6B7A74]">Balance: <span className="font-bold text-[#1A2E26]">{bank?.balance || 0}</span> min</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSpending ? (
            <motion.div
              key="spending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Timer Card */}
              <div className="bg-gradient-to-br from-[#1D5D3D] to-[#154d31] rounded-2xl p-12 text-center shadow-xl">
                <p className="text-white/80 text-sm font-medium mb-4 flex items-center justify-center gap-2">
                  <Timer className="w-4 h-4" />
                  Guilt-free scroll time remaining
                </p>
                <p className="text-white font-mono font-bold text-7xl tracking-tight mb-4">
                  {String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')}:
                  {String((secondsLeft ?? 0) % 60).padStart(2, '0')}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: selectedMinutes * 60, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Popular Sites */}
              <div>
                <h3 className="text-lg font-semibold text-[#1A2E26] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#1D5D3D]" />
                  Popular Destinations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {WHITELISTED_SITES.map((site) => (
                    <motion.a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group bg-white rounded-xl p-4 text-center shadow-sm border border-[#E8EDEB] hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-2xl"
                           style={{ backgroundColor: `${site.color}15` }}>
                        {site.icon}
                      </div>
                      <div className="text-[#1A2E26] text-sm font-medium">{site.name}</div>
                    </motion.a>
                  ))}
                </div>
              </div>

              <p className="text-center text-[#94A6A0] text-sm">
                ✨ Enjoy your break — you've earned it!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="not-spending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {bank?.balance === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-[#E8EDEB]">
                  <div className="w-20 h-20 bg-[#F5F7F6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-[#94A6A0]" />
                  </div>
                  <p className="text-[#6B7A74] mb-6">No scroll time in your bank yet.</p>
                  <Link href="/earn">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 rounded-xl bg-[#1D5D3D] text-white font-semibold shadow-lg hover:bg-[#154d31] transition-all"
                    >
                      Earn Some Time
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Balance Card */}
                  <div className="bg-gradient-to-r from-[#1D5D3D] to-[#154d31] rounded-2xl p-8 mb-8 text-center shadow-xl">
                    <p className="text-white/80 text-sm mb-2">Available Balance</p>
                    <p className="text-white font-bold text-5xl mb-2">{bank?.balance}</p>
                    <p className="text-white/60 text-xs">minutes to spend</p>
                  </div>

                  {/* Time Selection */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EDEB] mb-8">
                    <h3 className="text-lg font-semibold text-[#1A2E26] mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#1D5D3D]" />
                      Choose your scroll time
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                      {availableOptions.slice(0, 6).map((mins) => (
                        <motion.button
                          key={mins}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMinutes(mins)}
                          className={`py-3 rounded-xl font-semibold text-base transition-all ${
                            selectedMinutes === mins
                              ? 'bg-[#1D5D3D] text-white shadow-md'
                              : 'bg-[#F5F7F6] text-[#6B7A74] hover:bg-[#E8EDEB]'
                          }`}
                        >
                          {mins}m
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartSpending}
                      disabled={!selectedMinutes}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        selectedMinutes
                          ? 'bg-[#1D5D3D] text-white shadow-lg hover:bg-[#154d31]'
                          : 'bg-[#E8EDEB] text-[#94A6A0] cursor-not-allowed'
                      }`}
                    >
                      {selectedMinutes ? `Start ${selectedMinutes}min Break` : 'Select time to continue'}
                    </motion.button>
                  </div>

                  {/* Tip Card */}
                  <div className="bg-[#FEF8E7] rounded-xl p-4 border border-[#F5E6BA]">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-[#D4A500] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#1A2E26]">Pro Tip</p>
                        <p className="text-xs text-[#6B7A74]">Using your earned time for breaks actually boosts productivity. Enjoy guilt-free!</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}