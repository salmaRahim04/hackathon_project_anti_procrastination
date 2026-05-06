'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Rich mock responses — feel personal by using real data ───────────────────
function getLine(situation, ctx = {}) {
  const { name = 'you', phrase = "let's go", excuse = 'one more video', streak = 0,
          todayMin = 0, bank = 0, task = '', earned = 0, sessions = 0 } = ctx

  const pools = {
    wake: [
      `Morning${name ? ', ' + name : ''}. What are we building today?`,
      `${phrase}. I'm here.`,
      `Ready when you are.`,
      `Your project won't finish itself. Let's move.`,
    ],
    working: [
      `${phrase}. I'm with you.`,
      `Focus mode. 🔒`,
      `${task ? `"${task}" — let's nail it.` : "Let's get this done."}`,
      `I'm watching. Make it count.`,
      `Deep work starts now.`,
    ],
    session_done: [
      `+${earned || '?'} min earned.${streak > 1 ? ` ${streak}-day streak. Don't stop now.` : ' First one done.'}`,
      `That's ${earned || 'some'} more minutes banked. You're building momentum.`,
      `Done.${bank > 30 ? ` ${bank} min in the bank now.` : ''} Good session.`,
      `${earned || 'Some'} minutes earned. Multiply that by consistency and you'll go far.`,
    ],
    distracted: [
      `Hey. 👀`,
      `"${excuse}" — I knew it.`,
      `Back to work.`,
      `You were 2 minutes in. Come on.`,
      `${name ? name + '.' : ''} Close the tab.`,
      `This is exactly how yesterday's session ended too.`,
    ],
    returning: [
      `${phrase}. Good call.`,
      `There you are. Don't make me knock again.`,
      `Welcome back. Let's not waste it.`,
      `That's more like it. 🔥`,
    ],
    celebrating: [
      `You actually did it. ${phrase}! 🎉`,
      `${streak > 2 ? `${streak} days straight. ` : ''}Look at you go.`,
      `Session complete.${bank > 0 ? ` ${bank} min banked.` : ''} 🔥`,
      `That's what showing up looks like.`,
    ],
    sleeping: [
      `Still there?`,
      `Your task misses you.`,
      `Knock knock. 🤛`,
      `2 minutes is all it takes to start.`,
    ],
    idle_nudge: [
      todayMin > 0
        ? `${todayMin} min done today.${todayMin < 60 ? ` ${60 - todayMin} to hit your goal.` : ' Goal hit. Keep stacking.'}`
        : `No sessions yet today. You know what to do.`,
      streak > 1
        ? `${streak}-day streak on the line. Don't break it today.`
        : `Today's a good day to start a streak.`,
      bank > 0
        ? `${bank} min banked. You earned that. Now earn more.`
        : `Bank is empty. Go earn some scroll time.`,
      sessions > 0
        ? `${sessions} session${sessions > 1 ? 's' : ''} this week. You're showing up.`
        : `This week is waiting. Start the first session.`,
      `Small sessions stack up. Even 10 minutes matters.`,
      `The best time to start was earlier. Second best time is now.`,
      `${task ? `"${task}" is waiting for you.` : 'What are we working on today?'}`,
    ],
    progress_check: [
      `${todayMin} min today, ${streak} day streak. ${streak >= 3 ? 'You\'re on a roll.' : 'Keep showing up.'}`,
      bank > 20 ? `You've got ${bank} min banked. Work mode pays off.` : `Hit one session and you'll have scroll time waiting.`,
      `${sessions > 0 ? `${sessions} sessions this week` : 'First session of the week is the hardest'}. ${phrase}.`,
    ],
    // Chat responses — keyword-matched
    chat_procrastinating: [
      `Open the file. Just open it. You don't have to do everything — just the first line.`,
      `"${excuse}" is the loop. Break it. 10 minutes. Timer on.`,
      `What's the smallest possible thing you can do right now? Do that.`,
      `You've beaten this before. You'll beat it again.`,
    ],
    chat_tired: [
      `Tired is real. But so is the 10-min rule — start tiny, momentum takes over.`,
      `Take a 5-min break with purpose. Then one focused block.`,
      `Your future self will thank you for even half a session today.`,
    ],
    chat_stats: [
      `${todayMin} min today. ${streak > 0 ? streak + '-day streak.' : 'No streak yet — start one.'} Bank: ${bank} min. ${todayMin >= 60 ? 'Goal hit!' : `${60 - todayMin} to go.`}`,
      `Level ${ctx.level || 1}. ${ctx.xp || 0} XP. You're ${streak > 5 ? 'on fire' : 'building'}. Keep stacking sessions.`,
    ],
    chat_project: [
      `Your project IS moving. Every session is a brick. ${sessions > 0 ? `${sessions} sessions this week prove it.` : 'Start the first session today.'}`,
      `Progress is invisible until it isn't. You're further than you think.`,
      `The work you've done is still there. Build on it.`,
    ],
    chat_default: [
      `${phrase}. That's all I've got for you.`,
      `Ask me about your stats, your project, or just tell me you're procrastinating.`,
      `I know your patterns. What do you need right now?`,
      `One thing at a time. What's the next step?`,
    ],
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  if (situation in pools) return pick(pools[situation])
  return pick(pools.chat_default)
}

function smartChatReply(message, ctx) {
  const msg = message.toLowerCase()
  if (/procrastinat|can't start|don't want|stuck|not starting/.test(msg)) return getLine('chat_procrastinating', ctx)
  if (/tired|exhausted|no energy|burnt|burn out/.test(msg)) return getLine('chat_tired', ctx)
  if (/how am i|doing|progress|stats|numbers|streak|xp|level/.test(msg)) return getLine('chat_stats', ctx)
  if (/project|work|build|app|code|feature/.test(msg)) return getLine('chat_project', ctx)
  return getLine('chat_default', ctx)
}

// ─── Onboarding ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { key: 'name',   type: 'text',   label: "What should I call you?",                              placeholder: 'Your name' },
  { key: 'swears', type: 'choice', label: "When frustrated, do you swear?",                       options: [{ v:'yes', label:'Hell yeah 😅' }, { v:'no', label:'Nah, keep it clean' }] },
  { key: 'style',  type: 'choice', label: "How should I talk to you?",                            options: [{ v:'tough', label:'Tough love — no BS 💪' }, { v:'gentle', label:'Gentle but honest 🤗' }] },
  { key: 'excuse', type: 'text',   label: "Your #1 excuse for not starting?",                     placeholder: 'e.g. "I\'ll start after this video"' },
  { key: 'phrase', type: 'text',   label: "One phrase only you would say.",                       placeholder: 'e.g. "Let\'s get it"' },
]

function Onboarding({ onDone }) {
  const [step, setStep]       = useState(-1)
  const [answers, setAnswers] = useState({})
  const [textVal, setTextVal] = useState('')
  const [leaving, setLeaving] = useState(false)

  const advance = useCallback((val) => {
    const q = QUESTIONS[step]; if (!q) return
    const updated = { ...answers, [q.key]: val ?? textVal }
    setAnswers(updated)
    if (step < QUESTIONS.length - 1) {
      setLeaving(true)
      setTimeout(() => { setTextVal(''); setLeaving(false); setStep(s => s + 1) }, 280)
    } else { onDone(updated) }
  }, [step, answers, textVal, onDone])

  const q        = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null
  const progress = step < 0 ? 0 : ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.97)', backdropFilter: 'blur(20px)' }}>
      {step >= 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div className="h-full bg-[#1D5D3D]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}/>
        </div>
      )}
      <motion.div className="max-w-sm w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: leaving ? 0 : 1, y: leaving ? -20 : 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="relative">
            <div className="absolute inset-0 blur-2xl rounded-full opacity-30" style={{ background: '#1D5D3D' }}/>
            <MayaAvatar state={step >= 0 ? 'idle' : 'celebrating'} size={90}/>
          </motion.div>
        </div>

        {!q ? (
          <>
            <h1 className="text-white font-black text-3xl mb-3">Hi. I'm Maya.</h1>
            <p className="text-white/55 text-base mb-2 leading-relaxed">Not a coach. Not a bot.</p>
            <p className="text-white/55 text-base mb-8 leading-relaxed">
              Your <span className="text-[#4ADE80] font-semibold">digital twin</span> — I'll use your own words to keep you honest.
            </p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(0)}
              className="w-full py-4 rounded-full font-bold text-lg text-white" style={{ background: '#1D5D3D' }}>
              Let's do this →
            </motion.button>
          </>
        ) : (
          <>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-6">{step + 1} of {QUESTIONS.length}</p>
            <h2 className="text-white font-bold text-xl mb-8 leading-snug">{q.label}</h2>
            {q.type === 'text' ? (
              <div className="flex flex-col gap-3">
                <input autoFocus value={textVal} onChange={e => setTextVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && textVal.trim() && advance()}
                  placeholder={q.placeholder}
                  className="w-full rounded-2xl px-5 py-4 text-white text-base text-center focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}/>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => textVal.trim() && advance()}
                  disabled={!textVal.trim()}
                  className="w-full py-3.5 rounded-full font-bold text-base"
                  style={{ background: textVal.trim() ? '#1D5D3D' : 'rgba(255,255,255,0.06)', color: textVal.trim() ? 'white' : 'rgba(255,255,255,0.25)' }}>
                  Continue →
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {q.options.map(opt => (
                  <motion.button key={opt.v} whileTap={{ scale: 0.97 }} onClick={() => advance(opt.v)}
                    className="w-full py-4 rounded-2xl font-semibold text-white text-base border transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            )}
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="text-white/25 text-xs mt-5">← back</button>}
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function MayaAvatar({ state = 'idle', size = 64 }) {
  const isHappy = state === 'celebrating' || state === 'returning'
  const isAngry = state === 'distracted'
  const isBored = state === 'sleeping'
  const isFocus = state === 'working'

  const mouth = isAngry ? 'M22,57 Q30,52 38,57' : isHappy ? 'M20,56 Q30,66 40,56' : isBored ? 'M24,57 Q30,59 36,57' : 'M22,56 Q30,63 38,56'
  const browL  = isAngry ? 'M12,33 Q19,29 26,33' : 'M12,31 Q19,28 26,31'
  const browR  = isAngry ? 'M34,33 Q41,29 48,33' : 'M34,31 Q41,28 48,31'
  const armL   = isHappy ? 'M12,60 Q3,50 0,44' : isFocus ? 'M12,63 Q4,60 1,55' : 'M12,66 Q4,72 2,78'
  const armR   = isHappy ? 'M48,60 Q57,50 60,44' : isFocus ? 'M48,63 Q56,60 59,55' : 'M48,66 Q56,72 58,78'

  return (
    <svg viewBox="0 0 60 80" width={size} height={size * 1.33} style={{ overflow:'visible', display:'block' }}>
      <circle cx="30" cy="7" r="9" fill="#3b2314"/>
      <circle cx="30" cy="7" r="5" fill="#5c3520" opacity="0.6"/>
      <ellipse cx="30" cy="12" rx="5" ry="3" fill="#2E7D52"/>
      <ellipse cx="30" cy="30" rx="26" ry="26" fill="#3b2314"/>
      <ellipse cx="30" cy="34" rx="20" ry="23" fill="#f5c5a3"/>
      <ellipse cx="30" cy="14" rx="24" ry="14" fill="#3b2314"/>
      <path d="M10,26 Q16,18 22,24 Q26,18 30,24 Q34,18 38,24 Q44,18 50,26" fill="#3b2314"/>
      {/* Left eye */}
      <ellipse cx="22" cy="35" rx="6.5" ry={isBored ? 1.5 : 7} fill="white"/>
      {!isBored && <><ellipse cx="22" cy="36" rx="4.5" ry="5.5" fill="#1D5D3D"/><ellipse cx="22" cy="37" rx="2.8" ry="3.5" fill="#0a2a1a"/><circle cx="24" cy="34" r="1.8" fill="white"/></>}
      <path d="M15.5,29 Q18,26 21,28" fill="none" stroke="#3b2314" strokeWidth="2" strokeLinecap="round"/>
      {/* Right eye */}
      <ellipse cx="38" cy="35" rx="6.5" ry={isBored ? 1.5 : 7} fill="white"/>
      {!isBored && <><ellipse cx="38" cy="36" rx="4.5" ry="5.5" fill="#1D5D3D"/><ellipse cx="38" cy="37" rx="2.8" ry="3.5" fill="#0a2a1a"/><circle cx="40" cy="34" r="1.8" fill="white"/></>}
      <path d="M39,28 Q42,26 44.5,29" fill="none" stroke="#3b2314" strokeWidth="2" strokeLinecap="round"/>
      <path d={browL} fill="none" stroke="#3b2314" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={browR} fill="none" stroke="#3b2314" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M27.5,44 Q30,47 32.5,44" fill="none" stroke="#e8a882" strokeWidth="1.5" strokeLinecap="round"/>
      <path d={mouth} fill="none" stroke="#d4817a" strokeWidth="2.5" strokeLinecap="round"/>
      {(isHappy || state === 'idle') && <><ellipse cx="12" cy="46" rx="7" ry="4" fill="#ff8fab" opacity={isHappy ? 0.55 : 0.25}/><ellipse cx="48" cy="46" rx="7" ry="4" fill="#ff8fab" opacity={isHappy ? 0.55 : 0.25}/></>}
      <circle cx="10" cy="38" r="2.5" fill="#2E7D52"/>
      <circle cx="50" cy="38" r="2.5" fill="#2E7D52"/>
      <rect x="12" y="56" width="36" height="20" rx="12" fill="#1D5D3D"/>
      <rect x="17" y="58" width="26" height="8" rx="4" fill="rgba(255,255,255,.2)"/>
      <path d="M26,58 Q28,64 26,70" fill="none" stroke="#2E7D52" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34,58 Q32,64 34,70" fill="none" stroke="#2E7D52" strokeWidth="1.5" strokeLinecap="round"/>
      <path d={armL} fill="none" stroke="#f5c5a3" strokeWidth="5.5" strokeLinecap="round" style={{ transition:'all .4s cubic-bezier(.34,1.56,.64,1)' }}/>
      <path d={armR} fill="none" stroke="#f5c5a3" strokeWidth="5.5" strokeLinecap="round" style={{ transition:'all .4s cubic-bezier(.34,1.56,.64,1)' }}/>
      {!isFocus && !isHappy && !isBored && <g opacity="0.85"><rect x="52" y="58" width="10" height="17" rx="2" fill="#1a3a2a" stroke="#2E7D52" strokeWidth="1"/><rect x="53.5" y="60" width="7" height="11" rx="1" fill="#0a2a1a"/><circle cx="57" cy="73" r="1" fill="#2E7D52"/></g>}
    </svg>
  )
}

// ─── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({ profile, messages, input, setInput, sending, onSend, onClose, suggestions }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, sending])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.92 }} transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="w-72 rounded-3xl overflow-hidden"
      style={{ background: '#ffffff', border: '1px solid #C4DDD2', boxShadow: '0 12px 40px rgba(29,93,61,0.15)' }}
    >
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #E8EDEB', background: '#F5FAF7' }}>
        <div className="relative shrink-0">
          <MayaAvatar state="idle" size={36}/>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#1D5D3D' }}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-none" style={{ color: '#1A2E26' }}>Maya</p>
          <p className="text-xs mt-0.5" style={{ color: '#4A7A5E' }}>your twin ✦</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-sm" style={{ color: '#6B7A74' }}>✕</button>
      </div>

      <div className="h-56 overflow-y-auto p-3 flex flex-col gap-2.5" style={{ background: '#FAFCFB' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 mt-3">
            <p className="text-xs text-center" style={{ color: '#6B7A74' }}>I know your patterns. What do you need?</p>
            {(suggestions || ["How am I doing?", "I'm procrastinating.", "How's my project?"]).map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs rounded-xl px-3 py-2 w-full text-left transition-all"
                style={{ color: '#4A7A5E', border: '1px solid #C4DDD2', background: 'white' }}>
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && <div className="shrink-0 mb-0.5"><MayaAvatar state="idle" size={22}/></div>}
            <div className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
              style={m.role === 'user'
                ? { background: '#1D5D3D', color: 'white', borderBottomRightRadius: 4 }
                : { background: '#E8F5F0', color: '#1A2E26', borderBottomLeftRadius: 4 }}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-end gap-2">
            <div className="shrink-0 mb-0.5"><MayaAvatar state="idle" size={22}/></div>
            <div className="rounded-2xl rounded-bl-sm px-3 py-3 flex gap-1" style={{ background: '#E8F5F0' }}>
              {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:'#1D5D3D', animationDelay:`${i*.15}s` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div className="flex gap-2 p-3" style={{ borderTop: '1px solid #E8EDEB', background: 'white' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Talk to Maya…"
          className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          style={{ background: '#F5F7F6', border: '1px solid #C4DDD2', color: '#1A2E26' }}/>
        <motion.button whileTap={{ scale: 0.92 }} onClick={onSend} disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: input.trim() && !sending ? '#1D5D3D' : '#E8EDEB', color: input.trim() && !sending ? 'white' : '#9CA3AF' }}>
          ↑
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Main MayaAgent ────────────────────────────────────────────────────────────
export default function MayaAgent({ extensionMode = false }) {
  const [mounted, setMounted]     = useState(false)
  const [profile, setProfile]     = useState(null)
  const [showOnboard, setOnboard] = useState(false)
  const [state, setState]         = useState('idle')
  const [speech, setSpeech]       = useState(null)
  const [chatOpen, setChatOpen]   = useState(false)
  const [msgs, setMsgs]           = useState([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [hidden, setHidden]       = useState(false)
  const [userData, setUserData]   = useState({})

  const speechTimer  = useRef(null)
  const proactiveRef = useRef(null)
  const lastMode     = useRef(null)
  const lastProMsg   = useRef(0)

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('maya-profile')
    if (!saved) { setOnboard(true); return }
    const p = JSON.parse(saved)
    setProfile(p)
    fetchUserData().then(data => {
      say(getLine('wake', { ...p, ...data }), 5000)
      scheduleProactive()
    })
  }, [])

  // ── Fetch real user data to enrich messages ───────────────────────────────
  async function fetchUserData() {
    try {
      const [gamif, bank, sessData] = await Promise.all([
        fetch('/api/gamification').then(r => r.json()),
        fetch('/api/bank/balance').then(r => r.json()),
        fetch('/api/sessions').then(r => r.json()),
      ])
      const data = {
        streak:    gamif.currentStreak ?? 0,
        todayMin:  gamif.todayMinutes  ?? 0,
        bank:      bank.bank?.balance  ?? 0,
        sessions:  sessData.sessions?.length ?? 0,
        level:     gamif.level ?? 1,
        xp:        gamif.xp   ?? 0,
        dailyGoal: gamif.dailyGoal ?? 60,
      }
      setUserData(data)
      return data
    } catch { return {} }
  }

  // ── ctx builder ───────────────────────────────────────────────────────────
  const ctx = (extra = {}) => ({
    name:    profile?.name    || '',
    phrase:  profile?.phrase  || "let's go",
    excuse:  profile?.excuse  || 'one more video',
    ...userData,
    ...extra,
  })

  // ── Poll sessions every 3s ────────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    const poll = async () => {
      try {
        const r = await fetch('/api/sessions/current')
        const { session } = await r.json()
        const mode = session && !session.completed ? 'working' : 'idle'
        if (mode === lastMode.current) return
        const prev = lastMode.current; lastMode.current = mode

        if (mode === 'working') {
          setState('working'); clearProactive()
          const task = session.taskDescription
          const line = await callMaya(
            `User just started a focus session: "${task}". React briefly as their twin — max 1 sentence, no fluff.`,
            'working', ctx({ task })
          )
          say(line, 5000)
        } else if (mode === 'idle' && prev === 'working') {
          setState('celebrating')
          const fresh = await fetchUserData()
          const line  = await callMaya(
            'User just finished a work session. Celebrate briefly, mention their streak or bank if notable — 1 sentence.',
            'session_done', ctx(fresh)
          )
          say(line, 5500)
          setTimeout(() => { setState('idle'); scheduleProactive() }, 4000)
        } else if (prev === null) {
          setState('idle'); scheduleProactive()
        }
      } catch {}
    }
    poll(); const t = setInterval(poll, 3000); return () => clearInterval(t)
  }, [profile])

  // ── Tab visibility (web app) ──────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    const handler = async () => {
      if (lastMode.current !== 'working') return
      if (document.hidden) {
        setState('distracted')
        const line = await callMaya(
          `User switched away from work tab. Their #1 excuse is "${profile?.excuse}". Call it out in 1 short sentence.`,
          'distracted'
        )
        say(line, 7000)
      } else {
        setState('returning')
        const line = await callMaya(
          'User just came back to their work tab after being distracted. React positively, 1 sentence.',
          'returning'
        )
        say(line, 4000)
        setTimeout(() => setState('working'), 3000)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [profile, userData])

  // ── Extension messages ────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    const handler = (event) => {
      const { type, classification, site } = event.data || {}
      if (type === 'VISIBILITY') {
        if (event.data.hidden && lastMode.current === 'working') {
          setState('distracted'); say(getLine('distracted', ctx()), 7000)
        } else if (!event.data.hidden && lastMode.current === 'working') {
          setState('returning'); say(getLine('returning', ctx()), 4000)
          setTimeout(() => setState('working'), 3000)
        }
      }
      if (type === 'CONTEXT' && classification === 'distraction' && lastMode.current !== 'working') {
        setState('distracted'); say(getLine('distracted', ctx()), 6000)
      }
    }
    window.addEventListener('message', handler); return () => window.removeEventListener('message', handler)
  }, [profile, userData])

  // ── Proactive messages — every 2-4 min ────────────────────────────────────
  function scheduleProactive() {
    clearProactive()
    // Stagger: don't flood. At least 2 min between messages.
    const delay = 120000 + Math.random() * 120000
    proactiveRef.current = setTimeout(doProactive, delay)
  }
  function clearProactive() {
    if (proactiveRef.current) { clearTimeout(proactiveRef.current); proactiveRef.current = null }
  }
  async function doProactive() {
    if (lastMode.current === 'working') { scheduleProactive(); return }

    // Refresh data before proactive message
    const fresh = await fetchUserData()
    const now   = Date.now()

    // Alternate between idle nudge and progress check
    const sinceLast = now - lastProMsg.current
    const situation = sinceLast > 300000 ? 'progress_check' : 'idle_nudge'
    lastProMsg.current = now

    if (Math.random() < 0.3) {
      setState('sleeping')
      say(getLine('sleeping', ctx(fresh)), 4000)
      setTimeout(() => setState('idle'), 5000)
    } else {
      // Try Groq for a personalized nudge, fall back to canned
      const prompt = `Send a short proactive check-in to ${profile?.name || 'the user'}.
Stats: ${fresh.todayMin || 0}min today, ${fresh.streak || 0}-day streak, ${fresh.bank || 0}min banked, ${fresh.sessions || 0} sessions this week.
Their phrase: "${profile?.phrase || 'let\'s go'}". 1 sentence max. Be direct and specific to the numbers.`
      const line = await callMaya(prompt, situation, ctx(fresh))
      say(line, 6000)
    }

    scheduleProactive()
  }

  // ── AI call — tries Groq, falls back to getLine() if unavailable ────────
  async function callMaya(situation, fallbackKey, fallbackCtx) {
    try {
      const r = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: situation, history: [], systemOverride: null }),
        signal: AbortSignal.timeout(6000),
      })
      if (!r.ok) throw new Error('non-200')
      const d = await r.json()
      if (d.reply) return d.reply
    } catch { /* fall through to mock */ }
    return getLine(fallbackKey || 'chat_default', fallbackCtx || ctx())
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  async function sendChat() {
    const msg = input.trim(); if (!msg || sending) return
    setInput(''); setSending(true)
    setMsgs(prev => [...prev, { role: 'user', content: msg }])

    const fresh = await fetchUserData()
    const c     = ctx(fresh)

    // Try Groq first, fall back to smart keyword matching
    let reply
    try {
      const r = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: msgs.slice(-8) }),
        signal: AbortSignal.timeout(8000),
      })
      const d = await r.json()
      reply = d.reply || null
    } catch {}

    if (!reply) reply = smartChatReply(msg, c)

    setMsgs(prev => [...prev, { role: 'assistant', content: reply }])
    say(reply.slice(0, 85), 6000)
    setSending(false)
  }

  // ── Speech ────────────────────────────────────────────────────────────────
  function say(text, dur = 5000) {
    if (speechTimer.current) clearTimeout(speechTimer.current)
    setSpeech(text); speechTimer.current = setTimeout(() => setSpeech(null), dur)
  }

  // ── Render guards ─────────────────────────────────────────────────────────
  if (!mounted) return null
  if (showOnboard) return <Onboarding onDone={(a) => { setProfile(a); setOnboard(false); localStorage.setItem('maya-profile', JSON.stringify(a)); fetchUserData().then(d => { say(getLine('wake', { ...a, ...d }), 5000); scheduleProactive() }) }}/>

  if (hidden) {
    return (
      <motion.button className={`${extensionMode ? 'absolute' : 'fixed'} bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-lg`}
        style={{ background: '#E8F5F0', border: '1px solid #C4DDD2', boxShadow: '0 2px 8px rgba(29,93,61,0.12)' }}
        whileTap={{ scale: 0.9 }} animate={{ scale: [1,1.05,1] }} transition={{ repeat: Infinity, duration: 2.5 }}
        onClick={() => setHidden(false)}>🤖</motion.button>
    )
  }

  const accentHex = state === 'distracted' ? '#D97706' : '#1D5D3D'

  return (
    <div className={`${extensionMode ? 'absolute bottom-3 right-3' : 'fixed bottom-6 right-6 z-50'} flex flex-col items-end gap-2 select-none`}>

      <AnimatePresence>
        {chatOpen && (
          <ChatPanel profile={profile} messages={msgs} input={input} setInput={setInput}
            sending={sending} onSend={sendChat} onClose={() => setChatOpen(false)}
            suggestions={[
              "How am I doing today?",
              "I'm procrastinating. Help.",
              "How's my project going?",
              `What would ${profile?.name || 'I'} do right now?`,
            ]}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {speech && !chatOpen && (
          <motion.div key={speech}
            initial={{ opacity: 0, x: 12, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.85 }} transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="max-w-[200px] text-right"
          >
            <div className="inline-block text-xs font-semibold px-3.5 py-2.5 rounded-2xl rounded-br-none leading-relaxed relative"
              style={{ background: 'white', border: '1.5px solid #C4DDD2', color: '#1A2E26', boxShadow: '0 4px 16px rgba(29,93,61,0.1)' }}>
              {speech}
              <div className="absolute -right-[7px] bottom-0 w-0 h-0"
                style={{ borderLeft: '7px solid white', borderTop: '7px solid transparent' }}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        <button onClick={() => setHidden(true)} className="text-[10px] mb-2 transition-colors leading-none" style={{ color: '#9CA3AF' }}>▾</button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setChatOpen(c => !c)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm mb-2 transition-all"
          style={{ background: chatOpen ? '#E8F5F0' : 'white', border: `1px solid ${chatOpen ? '#1D5D3D' : '#C4DDD2'}`, boxShadow: '0 1px 4px rgba(29,93,61,0.1)' }}>
          💬
        </motion.button>

        <motion.div className="relative cursor-pointer" style={{ width: 64, height: 85 }}
          onClick={() => { if (!chatOpen) say(getLine('idle_nudge', ctx()), 4000) }}
          whileTap={{ scale: 0.94 }}
          animate={state === 'idle' ? { y: [0,-5,0] } : state === 'celebrating' ? { rotate: [-4,4,-4,0] } : state === 'distracted' ? { x: [-2,2,-2,0] } : {}}
          transition={{ repeat: ['idle','celebrating','distracted'].includes(state) ? Infinity : 0, duration: state === 'idle' ? 2.5 : 0.45 }}
        >
          <motion.div className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            animate={{ opacity: [0.06,0.22,0.06], backgroundColor: accentHex }}
            transition={{ repeat: Infinity, duration: 2.5 }}/>

          <MayaAvatar state={state}/>

          <AnimatePresence>
            {(state === 'celebrating' || state === 'returning') &&
              [[-28,-35],[28,-35],[-38,-12],[38,-12],[0,-44]].map(([x,y],i) => (
                <motion.span key={i}
                  initial={{ opacity:0, x:0, y:0, scale:0 }} animate={{ opacity:[0,1,1,0], x, y, scale:[0,1.3,0] }}
                  transition={{ duration:.9, delay:i*.08, repeat:Infinity, repeatDelay:1.2 }}
                  className="absolute pointer-events-none text-yellow-500" style={{ fontSize:10, left:'50%', top:'25%' }}>✦</motion.span>
              ))}
          </AnimatePresence>

          <AnimatePresence>
            {state === 'sleeping' && (
              <motion.span initial={{ opacity:0, y:0, x:5 }} animate={{ opacity:[0,.9,.9,0], y:-18, x:20 }}
                transition={{ duration:2.3, repeat:Infinity }}
                className="absolute font-bold pointer-events-none" style={{ fontSize:14, color:'#6B7A74', top:'8%', left:'55%' }}>z</motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
