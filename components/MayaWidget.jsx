'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

// ─── Speech lines per state ────────────────────────────────────────────────────
const LINES = {
  idle:        null,
  alert:       ["Got it. I'm on standby.", "Let's get this done.", "I'm ready when you are."],
  working:     null,
  distracted:  ["Hey. 👀", "Focus.", "You were doing so well…", "Back to work."],
  returning:   ["That's it! 🔥", "Welcome back. ✨", "Good call."],
  celebrating: ["You crushed it! 🎉", "Look at you go! ⚡", "Session done! 🔥"],
}
function pick(state) {
  const opts = LINES[state]
  return opts ? opts[Math.floor(Math.random() * opts.length)] : null
}

// ─── Sparkle particles ─────────────────────────────────────────────────────────
const SPARKS = [
  { x: -38, y: -48, d: 0,    s: '✦' },
  { x:  38, y: -48, d: 0.1,  s: '✧' },
  { x: -50, y: -20, d: 0.18, s: '✦' },
  { x:  50, y: -20, d: 0.15, s: '⋆' },
  { x: -22, y: -60, d: 0.06, s: '✧' },
  { x:  22, y: -60, d: 0.24, s: '✦' },
  { x:   0, y: -65, d: 0.12, s: '⋆' },
]

function Sparkles({ active }) {
  return (
    <AnimatePresence>
      {active && SPARKS.map((sp, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: sp.x, y: sp.y, scale: [0, 1.4, 1, 0] }}
          transition={{ duration: 0.9, delay: sp.d, ease: 'easeOut' }}
          className="absolute pointer-events-none select-none text-yellow-300"
          style={{ fontSize: 10, left: '50%', top: '30%', marginLeft: -5, marginTop: -5 }}
        >
          {sp.s}
        </motion.span>
      ))}
    </AnimatePresence>
  )
}

// ─── The SVG character ─────────────────────────────────────────────────────────
function MayaCharacter({ state, accentColor }) {
  const isIdle        = state === 'idle'
  const isAlert       = state === 'alert'
  const isDistracted  = state === 'distracted'
  const isReturning   = state === 'returning'
  const isCelebrating = state === 'celebrating'

  const legAnim = {
    idle:        { rotate: [14, -14, 14], transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' } },
    default:     { rotate: 0,             transition: { duration: 0.4 } },
  }
  const legAnimR = {
    idle:    { rotate: [-14, 14, -14], transition: { repeat: Infinity, duration: 1, ease: 'easeInOut', delay: 0.1 } },
    default: { rotate: 0, transition: { duration: 0.4 } },
  }

  return (
    <svg viewBox="0 0 80 125" width="72" height="112" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="maya-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Outer halo ── */}
      <motion.circle cx="40" cy="28" r="26"
        fill="none"
        animate={{ stroke: accentColor, opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        strokeWidth="1"
      />

      {/* ── Antenna ── */}
      <motion.line x1="40" y1="5" x2="40" y2="10" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: isDistracted ? [-5, 5, -5] : 0 }}
        transition={{ repeat: isDistracted ? Infinity : 0, duration: 0.4 }}
        style={{ transformOrigin: '40px 28px' }}
      />
      <motion.circle cx="40" cy="4" r="3.5"
        fill={accentColor}
        filter="url(#maya-glow)"
        animate={{ scale: isCelebrating ? [1, 1.5, 1] : 1 }}
        transition={{ repeat: isCelebrating ? Infinity : 0, duration: 0.4 }}
      />

      {/* ── Head ── */}
      <motion.g
        animate={
          isCelebrating ? { rotate: [-8, 8, -8, 0], transition: { repeat: Infinity, duration: 0.5 } }
          : isDistracted ? { rotate: -8,             transition: { duration: 0.3 } }
          : isReturning  ? { rotate: 6,              transition: { duration: 0.3 } }
          :                { rotate: 0,              transition: { duration: 0.3 } }
        }
        style={{ transformOrigin: '40px 28px' }}
      >
        {/* Head circle */}
        <motion.circle cx="40" cy="28" r="19"
          fill="#0d0d1a"
          animate={{ stroke: accentColor }}
          strokeWidth="2"
          filter="url(#maya-glow)"
        />

        {/* Eyes — left */}
        <motion.ellipse cx="33" cy="25" rx="3.5" ry="3.5"
          fill={accentColor}
          animate={
            isDistracted ? { ry: 1.2, ry: 1.2 }
            : isCelebrating || isReturning ? { ry: 2, rx: 4 }
            : { ry: 3.5, rx: 3.5 }
          }
          transition={{ duration: 0.25 }}
        />
        {/* Eyes — right */}
        <motion.ellipse cx="47" cy="25" rx="3.5" ry="3.5"
          fill={accentColor}
          animate={
            isDistracted ? { ry: 1.2 }
            : isCelebrating || isReturning ? { ry: 2, rx: 4 }
            : { ry: 3.5, rx: 3.5 }
          }
          transition={{ duration: 0.25 }}
        />

        {/* Mouth */}
        <motion.path
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            d: isDistracted ? 'M33,36 Q40,32 47,36'            // frown
              : isCelebrating || isReturning ? 'M31,35 Q40,42 49,35'  // big smile
              : isAlert ? 'M33,35 Q40,40 47,35'                 // medium smile
              : 'M34,35 Q40,39 46,35',                          // gentle smile
            stroke: accentColor,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shush finger (distracted only) */}
        <AnimatePresence>
          {isDistracted && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.line x1="40" y1="32" x2="40" y2="26"
                stroke={accentColor} strokeWidth="3" strokeLinecap="round"
                animate={{ y1: [32, 30, 32] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.g>

      {/* ── Body ── */}
      <motion.g
        animate={
          isIdle ? { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }
          :         { y: 0,          transition: { duration: 0.4 } }
        }
      >
        {/* Torso */}
        <motion.rect x="29" y="47" width="22" height="19" rx="5"
          fill="#0d0d1a"
          animate={{ stroke: accentColor }}
          strokeWidth="1.5"
        />
        {/* Circuit detail */}
        <motion.line x1="33" y1="53" x2="38" y2="53" stroke={accentColor} strokeWidth="1" opacity="0.4"/>
        <motion.line x1="42" y1="53" x2="47" y2="53" stroke={accentColor} strokeWidth="1" opacity="0.4"/>
        <motion.line x1="34" y1="58" x2="46" y2="58" stroke={accentColor} strokeWidth="1" opacity="0.3"/>
        {/* Center dot */}
        <motion.circle cx="40" cy="56" r="2.5"
          fill={accentColor}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />

        {/* ── Left arm ── */}
        <motion.g
          animate={
            isDistracted
              ? { rotate: -110, transition: { duration: 0.35, type: 'spring', stiffness: 180, damping: 14 } }
              : isAlert
              ? { rotate: -25,  transition: { duration: 0.35, type: 'spring', stiffness: 180 } }
              : isIdle
              ? { rotate: [12, -12, 12], transition: { repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.2 } }
              : { rotate: 10,   transition: { duration: 0.3 } }
          }
          style={{ transformOrigin: '29px 52px' }}
        >
          <line x1="29" y1="52" x2="14" y2="64" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
          <circle cx="14" cy="64" r="4" fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
        </motion.g>

        {/* ── Right arm ── */}
        <motion.g
          animate={
            isReturning || isCelebrating
              ? { rotate: -130, transition: { duration: 0.35, type: 'spring', stiffness: 180 } }
              : isAlert
              ? { rotate: 30,   transition: { duration: 0.35, type: 'spring', stiffness: 180 } }
              : isIdle
              ? { rotate: [-12, 12, -12], transition: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } }
              : { rotate: -10,  transition: { duration: 0.3 } }
          }
          style={{ transformOrigin: '51px 52px' }}
        >
          <line x1="51" y1="52" x2="66" y2="64" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
          {/* Hand / thumbs-up indicator */}
          <motion.circle cx="66" cy="64" r="4" fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
          {/* Thumb shape when returning */}
          <AnimatePresence>
            {(isReturning || isCelebrating) && (
              <motion.path
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                d="M63,60 Q66,55 69,59"
                fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round"
                style={{ transformOrigin: '66px 64px' }}
              />
            )}
          </AnimatePresence>
        </motion.g>

        {/* Clipboard (alert state) */}
        <AnimatePresence>
          {isAlert && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ transformOrigin: '70px 70px' }}
            >
              <rect x="62" y="65" width="14" height="18" rx="2"
                fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
              <line x1="65" y1="71" x2="73" y2="71" stroke={accentColor} strokeWidth="1" opacity="0.6"/>
              <line x1="65" y1="75" x2="73" y2="75" stroke={accentColor} strokeWidth="1" opacity="0.4"/>
              <line x1="65" y1="79" x2="70" y2="79" stroke={accentColor} strokeWidth="1" opacity="0.4"/>
              <rect x="67" y="63" width="6" height="4" rx="1"
                fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Left leg ── */}
        <motion.g
          animate={isIdle ? legAnim.idle : legAnim.default}
          style={{ transformOrigin: '35px 66px' }}
        >
          <line x1="35" y1="66" x2="31" y2="84" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
          <circle cx="31" cy="84" r="4.5" fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
        </motion.g>

        {/* ── Right leg ── */}
        <motion.g
          animate={isIdle ? legAnimR.idle : legAnimR.default}
          style={{ transformOrigin: '45px 66px' }}
        >
          <line x1="45" y1="66" x2="49" y2="84" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round"/>
          <circle cx="49" cy="84" r="4.5" fill="#0d0d1a" stroke={accentColor} strokeWidth="1.5"/>
        </motion.g>
      </motion.g>
    </svg>
  )
}

// ─── Speech bubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, x: 16, scale: 0.85 }}
          animate={{ opacity: 1, x: 0,  scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.85 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="absolute right-full mr-3 bottom-10 bg-[#12121f] border border-white/15 rounded-2xl rounded-br-none px-3 py-2 text-white text-xs font-semibold shadow-xl max-w-[148px] leading-relaxed"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}
        >
          {text}
          <div className="absolute -right-[7px] bottom-0 w-0 h-0
            border-l-[7px] border-l-[#12121f]
            border-t-[7px] border-t-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main widget ───────────────────────────────────────────────────────────────
const ACCENT = {
  idle:        '#00E5FF',
  alert:       '#00E5FF',
  working:     '#00E5FF',
  distracted:  '#f39c12',
  returning:   '#00FF88',
  celebrating: '#00E5FF',
}

export default function MayaWidget({ mode = 'idle', task = '' }) {
  const [state, setState]     = useState('idle')
  const [speech, setSpeech]   = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const prevMode = useRef(mode)

  useEffect(() => {
    if (mode === prevMode.current) return
    prevMode.current = mode

    setState(mode)
    const line = pick(mode)
    setSpeech(line)

    // Auto-clear speech after 4 seconds (except distracted)
    if (line && mode !== 'distracted') {
      const t = setTimeout(() => setSpeech(null), 4000)
      return () => clearTimeout(t)
    }
  }, [mode])

  const accentColor = ACCENT[state] || '#00E5FF'
  const showSparkles = state === 'returning' || state === 'celebrating'

  return (
    <motion.div
      className="fixed bottom-[76px] right-4 z-40 flex flex-col items-end gap-1 select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Collapse toggle */}
      {!collapsed && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(true)}
          className="text-white/20 text-xs hover:text-white/50 transition-colors mr-1"
        >
          ▾ hide
        </motion.button>
      )}

      {collapsed ? (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44` }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          🤖
        </motion.button>
      ) : (
        <div className="relative">
          <SpeechBubble text={speech} />
          <Sparkles active={showSparkles} />

          {/* Glow backdrop */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            animate={{ opacity: [0.15, 0.35, 0.15], backgroundColor: accentColor }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />

          <motion.div
            animate={state === 'distracted' ? { x: [-2, 2, -2, 0] } : {}}
            transition={{ duration: 0.3, repeat: state === 'distracted' ? 3 : 0 }}
            className="cursor-pointer"
            onClick={() => {
              const line = pick(state)
              if (line) { setSpeech(line); setTimeout(() => setSpeech(null), 4000) }
            }}
          >
            <MayaCharacter state={state} accentColor={accentColor} />
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
