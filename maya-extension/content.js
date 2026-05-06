/**
 * Maya — self-contained content script.
 * NO iframe, NO localhost embed.
 * Injects Maya's full UI directly into the page and calls the EYS API
 * via fetch() (extension content scripts bypass CORS).
 */
;(function () {
  if (document.getElementById('eys-root')) return

  const EYS = 'http://localhost:3005'

  // ── Site classification ─────────────────────────────────────────────────────
  const HOST = location.hostname.replace(/^www\./, '')
  const DISTRACTIONS = ['youtube.com','twitter.com','x.com','reddit.com','instagram.com','tiktok.com','facebook.com','netflix.com','twitch.tv','snapchat.com','threads.net','9gag.com']
  const WORK_SITES   = ['github.com','gitlab.com','stackoverflow.com','mdn','docs.','figma.com','linear.app','notion.so','vercel.app','railway.app']
  const siteType = DISTRACTIONS.some(d => HOST.includes(d)) ? 'distraction'
                 : WORK_SITES.some(w => HOST.includes(w))   ? 'work'
                 : 'neutral'

  // ── Maya's SVG character ───────────────────────────────────────────────────
  const MAYA_SVG = `<svg id="eys-svg" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" style="width:62px;height:82px;display:block;overflow:visible">
  <circle cx="30" cy="7" r="9" fill="#3b2314"/>
  <circle cx="30" cy="7" r="5" fill="#5c3520" opacity=".6"/>
  <ellipse cx="30" cy="12" rx="5" ry="3" fill="#c084fc"/>
  <ellipse cx="30" cy="30" rx="26" ry="26" fill="#3b2314"/>
  <ellipse cx="30" cy="34" rx="20" ry="23" fill="#f5c5a3"/>
  <ellipse cx="30" cy="14" rx="24" ry="14" fill="#3b2314"/>
  <path d="M10,26 Q16,18 22,24 Q26,18 30,24 Q34,18 38,24 Q44,18 50,26" fill="#3b2314"/>
  <g id="eys-eye-l">
    <ellipse cx="22" cy="35" rx="6.5" ry="7" fill="white"/>
    <ellipse cx="22" cy="36" rx="4.5" ry="5.5" fill="#7c3aed"/>
    <ellipse cx="22" cy="37" rx="2.8" ry="3.5" fill="#1e0a3c"/>
    <circle  cx="24" cy="34" r="1.8" fill="white"/>
    <path d="M15.5,29 Q18,26 21,28" fill="none" stroke="#3b2314" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g id="eys-eye-r">
    <ellipse cx="38" cy="35" rx="6.5" ry="7" fill="white"/>
    <ellipse cx="38" cy="36" rx="4.5" ry="5.5" fill="#7c3aed"/>
    <ellipse cx="38" cy="37" rx="2.8" ry="3.5" fill="#1e0a3c"/>
    <circle  cx="40" cy="34" r="1.8" fill="white"/>
    <path d="M39,28 Q42,26 44.5,29" fill="none" stroke="#3b2314" stroke-width="2" stroke-linecap="round"/>
  </g>
  <path id="eys-brow-l" d="M15,31 Q22,28 29,31" fill="none" stroke="#3b2314" stroke-width="2.5" stroke-linecap="round" style="transition:d .3s"/>
  <path id="eys-brow-r" d="M31,31 Q38,28 45,31" fill="none" stroke="#3b2314" stroke-width="2.5" stroke-linecap="round" style="transition:d .3s"/>
  <path d="M27.5,44 Q30,47 32.5,44" fill="none" stroke="#e8a882" stroke-width="1.5" stroke-linecap="round"/>
  <path id="eys-mouth" d="M22,56 Q30,63 38,56" fill="none" stroke="#d4817a" stroke-width="2.5" stroke-linecap="round" style="transition:d .3s"/>
  <ellipse id="eys-blush-l" cx="12" cy="46" rx="7" ry="4" fill="#ff8fab" opacity="0"/>
  <ellipse id="eys-blush-r" cx="48" cy="46" rx="7" ry="4" fill="#ff8fab" opacity="0"/>
  <circle cx="10" cy="38" r="2.5" fill="#c084fc"/>
  <circle cx="50" cy="38" r="2.5" fill="#c084fc"/>
  <rect   x="12" y="56" width="36" height="20" rx="12" fill="#6d28d9"/>
  <rect   x="17" y="58" width="26" height="8"  rx="4"  fill="rgba(255,255,255,.15)"/>
  <path id="eys-arm-l" d="M12,66 Q4,72 2,78"  fill="none" stroke="#f5c5a3" stroke-width="5.5" stroke-linecap="round" style="transition:all .4s cubic-bezier(.34,1.56,.64,1)"/>
  <path id="eys-arm-r" d="M48,66 Q56,72 58,78" fill="none" stroke="#f5c5a3" stroke-width="5.5" stroke-linecap="round" style="transition:all .4s cubic-bezier(.34,1.56,.64,1)"/>
  <g id="eys-phone" opacity=".85">
    <rect x="52" y="58" width="10" height="17" rx="2" fill="#1e0a3c" stroke="#c084fc" stroke-width="1"/>
    <rect x="53.5" y="60" width="7" height="11" rx="1" fill="#2d1b69"/>
    <circle cx="57" cy="73" r="1" fill="#c084fc"/>
  </g>
</svg>`

  // ── CSS (namespaced with eys-) ──────────────────────────────────────────────
  const css = `
  #eys-root{position:fixed;bottom:16px;right:16px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;font-family:-apple-system,system-ui,sans-serif}
  #eys-chat-panel{width:260px;background:rgba(10,6,26,.97);border:1px solid rgba(192,132,252,.25);border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.6);pointer-events:auto}
  #eys-chat-header{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.07)}
  #eys-chat-header span{flex:1;color:#fff;font-size:13px;font-weight:700}
  #eys-close-chat{background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:13px;padding:0}
  #eys-messages{height:180px;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
  #eys-messages:empty::after{content:"Ask Maya anything…";color:rgba(255,255,255,.2);font-size:12px;text-align:center;display:block;margin-top:24px}
  .eys-msg{max-width:85%;border-radius:16px;padding:8px 12px;font-size:12px;line-height:1.4}
  .eys-msg.user{align-self:flex-end;background:linear-gradient(135deg,#7c3aed,#c084fc);color:#fff;border-bottom-right-radius:4px}
  .eys-msg.maya{align-self:flex-start;background:rgba(255,255,255,.09);color:rgba(255,255,255,.85);border-bottom-left-radius:4px}
  .eys-typing{display:flex;gap:4px;padding:10px 14px}
  .eys-dot{width:6px;height:6px;border-radius:50%;background:#c084fc;animation:eys-bounce 1.2s infinite}
  .eys-dot:nth-child(2){animation-delay:.2s}
  .eys-dot:nth-child(3){animation-delay:.4s}
  #eys-input-row{display:flex;gap:8px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.07)}
  #eys-input{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:7px 10px;color:#fff;font-size:12px;outline:none;font-family:inherit}
  #eys-input:focus{border-color:rgba(192,132,252,.5)}
  #eys-send{background:linear-gradient(135deg,#7c3aed,#c084fc);border:none;border-radius:8px;width:32px;color:#fff;font-weight:700;cursor:pointer;font-size:13px}
  #eys-bubble{background:rgba(10,6,26,.96);border:1.5px solid rgba(192,132,252,.3);border-radius:14px;border-bottom-right-radius:2px;padding:9px 13px;max-width:190px;text-align:right;font-size:12px;font-weight:600;color:#eee;line-height:1.45;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.5);animation:eys-pop .25s cubic-bezier(.34,1.56,.64,1)}
  #eys-controls{display:flex;gap:6px;align-items:center;pointer-events:auto}
  .eys-ctrl-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.5);cursor:pointer;font-size:12px;padding:4px 8px;pointer-events:auto}
  .eys-ctrl-btn:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.1)}
  #eys-char-wrap{pointer-events:auto;cursor:pointer;position:relative}
  .eys-glow{position:absolute;inset:0;border-radius:50%;filter:blur(20px);opacity:.2;pointer-events:none;animation:eys-glow-pulse 2.5s ease-in-out infinite}
  #eys-zz{position:absolute;top:5%;left:58%;font-size:14px;font-weight:700;color:#a78bfa;animation:eys-zzz 2.3s ease-in-out infinite;display:none}
  @keyframes eys-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes eys-pop{from{opacity:0;transform:scale(.75) translateY(-6px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes eys-glow-pulse{0%,100%{opacity:.1}50%{opacity:.3}}
  @keyframes eys-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes eys-celebrate{0%,100%{transform:rotate(0)}33%{transform:rotate(-4deg)}66%{transform:rotate(4deg)}}
  @keyframes eys-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
  @keyframes eys-lean{to{transform:rotate(20deg) translateY(8px) translateX(8px)}}
  @keyframes eys-zzz{0%{opacity:0;transform:translate(0,0) scale(.7)}30%,70%{opacity:.9}100%{opacity:0;transform:translate(18px,-22px) scale(1.1)}}
  `

  const styleEl = document.createElement('style')
  styleEl.textContent = css
  document.head.appendChild(styleEl)

  // ── Build DOM ──────────────────────────────────────────────────────────────
  const root = document.createElement('div')
  root.id = 'eys-root'
  root.innerHTML = `
    <div id="eys-chat-panel" style="display:none">
      <div id="eys-chat-header">
        <span>Maya</span>
        <button id="eys-close-chat">✕</button>
      </div>
      <div id="eys-messages"></div>
      <div id="eys-input-row">
        <input id="eys-input" placeholder="Talk to Maya…" autocomplete="off">
        <button id="eys-send">↑</button>
      </div>
    </div>

    <div id="eys-bubble" style="display:none"></div>

    <div id="eys-controls">
      <button class="eys-ctrl-btn" id="eys-chat-btn">💬</button>
      <button class="eys-ctrl-btn" id="eys-hide-btn">▾ hide</button>
    </div>

    <div id="eys-char-wrap">
      <div class="eys-glow" id="eys-glow" style="background:#c084fc"></div>
      ${MAYA_SVG}
      <div id="eys-zz">z</div>
    </div>
  `
  document.body.appendChild(root)

  // ── State ──────────────────────────────────────────────────────────────────
  let curState   = 'idle'
  let profile    = null
  let sysprompt  = null
  let msgHistory = []
  let bubTimer   = null
  let pollTimer  = null
  let lastMode   = null

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const charWrap   = document.getElementById('eys-char-wrap')
  const chatPanel  = document.getElementById('eys-chat-panel')
  const bubble     = document.getElementById('eys-bubble')
  const messagesEl = document.getElementById('eys-messages')
  const inputEl    = document.getElementById('eys-input')
  const glow       = document.getElementById('eys-glow')
  const zz         = document.getElementById('eys-zz')

  // ── Character face updates ─────────────────────────────────────────────────
  const mouth  = document.getElementById('eys-mouth')
  const browL  = document.getElementById('eys-brow-l')
  const browR  = document.getElementById('eys-brow-r')
  const blushL = document.getElementById('eys-blush-l')
  const blushR = document.getElementById('eys-blush-r')
  const armL   = document.getElementById('eys-arm-l')
  const armR   = document.getElementById('eys-arm-r')
  const eyeL   = document.getElementById('eys-eye-l')
  const eyeR   = document.getElementById('eys-eye-r')
  const phone  = document.getElementById('eys-phone')
  const svg    = document.getElementById('eys-svg')

  function setCharState(s) {
    curState = s
    svg.style.animation = ''
    zz.style.display = 'none'
    charWrap.style.animation = ''

    // Arms
    const armIdle     = ['M12,66 Q4,72 2,78',  'M48,66 Q56,72 58,78']
    const armWork     = ['M12,63 Q4,60 1,55',  'M48,63 Q56,60 59,55']
    const armCelebrate= ['M12,60 Q3,50 0,44',  'M48,60 Q57,50 60,44']
    const armDistract = ['M12,62 Q8,58 6,52',  'M48,62 Q52,58 54,52']
    let la = armIdle[0], ra = armIdle[1]

    switch (s) {
      case 'working':
        mouth.setAttribute('d','M23,56 Q30,62 37,56')
        browL.setAttribute('d','M15,29 Q22,26 29,29')
        browR.setAttribute('d','M31,29 Q38,26 45,29')
        blushL.setAttribute('opacity','0'); blushR.setAttribute('opacity','0')
        phone.setAttribute('opacity','0')
        la = armWork[0]; ra = armWork[1]
        glow.style.background = '#00E5FF'
        svg.style.animation = 'eys-idle 3s ease-in-out infinite'
        break
      case 'distracted':
        mouth.setAttribute('d','M24,60 Q30,55 36,60')
        browL.setAttribute('d','M15,33 Q22,29 29,33')
        browR.setAttribute('d','M31,33 Q38,29 45,33')
        blushL.setAttribute('opacity','0'); blushR.setAttribute('opacity','0')
        phone.setAttribute('opacity','0')
        la = armDistract[0]; ra = armDistract[1]
        glow.style.background = '#f59e0b'
        charWrap.style.animation = 'eys-shake .3s ease-in-out 3'
        break
      case 'celebrating':
      case 'returning':
        mouth.setAttribute('d','M20,56 Q30,68 40,56')
        browL.setAttribute('d','M15,29 Q22,25 29,29')
        browR.setAttribute('d','M31,29 Q38,25 45,29')
        blushL.setAttribute('opacity','.55'); blushR.setAttribute('opacity','.55')
        phone.setAttribute('opacity','0')
        la = armCelebrate[0]; ra = armCelebrate[1]
        glow.style.background = '#00FF88'
        svg.style.animation = 'eys-celebrate .4s ease-in-out infinite'
        break
      case 'sleeping':
        mouth.setAttribute('d','M27,57 Q30,59 33,57')
        browL.setAttribute('d','M17,32 Q22,30 27,32')
        browR.setAttribute('d','M33,32 Q38,30 43,32')
        blushL.setAttribute('opacity','0'); blushR.setAttribute('opacity','0')
        phone.setAttribute('opacity','0')
        glow.style.background = '#a78bfa'
        svg.style.animation = 'eys-lean 1s ease-out forwards'
        zz.style.display = 'block'
        break
      default: // idle
        mouth.setAttribute('d','M22,56 Q30,63 38,56')
        browL.setAttribute('d','M15,31 Q22,28 29,31')
        browR.setAttribute('d','M31,31 Q38,28 45,31')
        blushL.setAttribute('opacity','.25'); blushR.setAttribute('opacity','.25')
        phone.setAttribute('opacity','.85')
        glow.style.background = '#c084fc'
        svg.style.animation = 'eys-idle 2.5s ease-in-out infinite'
    }
    armL.setAttribute('d', la)
    armR.setAttribute('d', ra)
  }

  // ── Speech bubble ──────────────────────────────────────────────────────────
  function say(text, ms = 5000) {
    if (bubTimer) clearTimeout(bubTimer)
    bubble.textContent = text
    bubble.style.display = 'block'
    // re-trigger animation
    bubble.style.animation = 'none'
    void bubble.offsetWidth
    bubble.style.animation = 'eys-pop .25s cubic-bezier(.34,1.56,.64,1)'
    bubTimer = setTimeout(() => { bubble.style.display = 'none' }, ms)
  }

  // ── Load profile from storage ──────────────────────────────────────────────
  chrome.storage.local.get(['mayaProfile', 'mayaSysprompt'], async (data) => {
    profile   = data.mayaProfile   || null
    sysprompt = data.mayaSysprompt || null

    if (!profile) {
      say("I'm Maya. Set me up at localhost:3005 first! 👋", 8000)
    } else {
      setCharState('idle')
      say(profile.phrase || "I'm watching. Let's go.", 4000)
    }

    startPolling()
    reactToCurrentSite()
  })

  // ── Poll EYS session state ─────────────────────────────────────────────────
  function startPolling() {
    const poll = async () => {
      try {
        const r = await fetch(`${EYS}/api/sessions/current`, { signal: AbortSignal.timeout(3000) })
        const { session } = await r.json()
        const mode = session && !session.completed ? 'working' : 'idle'

        if (mode !== lastMode) {
          const prev = lastMode
          lastMode = mode

          if (mode === 'working') {
            setCharState('working')
            const task = session.taskDescription
            const line = await callMaya(`User just started a focus session: "${task}". React as their twin, briefly.`)
            say(line || (profile?.phrase ? `${profile.phrase}. Let's go.` : "Focus mode. 🔒"), 5000)
          } else if (mode === 'idle' && prev === 'working') {
            setCharState('celebrating')
            const line = await callMaya('User just finished their session. React as their twin — celebrate briefly.')
            say(line || "That's the one. 🎉", 5000)
            setTimeout(() => setCharState('idle'), 4000)
          }
        }
      } catch { /* EYS not running */ }
    }
    poll()
    pollTimer = setInterval(poll, 5000)
  }

  // ── React to current site ──────────────────────────────────────────────────
  async function reactToCurrentSite() {
    if (siteType === 'distraction' && lastMode !== 'working') {
      setTimeout(async () => {
        setCharState('distracted')
        const line = await callMaya(`User is browsing ${HOST} — a distraction site. They're not in a work session. React as their twin using their own language. Their #1 excuse: "${profile?.excuse || '...'}"`)
        say(line || `${HOST}? Really? 👀`, 6000)
      }, 1500)
    } else if (siteType === 'work') {
      setTimeout(() => {
        setCharState('working')
        say(`${HOST} — solid. 💻`, 3000)
        setTimeout(() => setCharState('idle'), 4000)
      }, 1500)
    }
  }

  // ── Tab visibility watcher ─────────────────────────────────────────────────
  document.addEventListener('visibilitychange', async () => {
    if (!profile) return
    if (lastMode !== 'working') return

    if (document.hidden) {
      setCharState('distracted')
      const line = await callMaya(`User switched tabs away during a work session. Their excuse: "${profile?.excuse}". Call it out briefly in their voice.`)
      say(line || 'Hey... 👀', 7000)
    } else {
      setCharState('returning')
      const line = await callMaya('User came back to their work tab. React as their twin.')
      say(line || (profile?.phrase || 'Good call. 🔥'), 4000)
      setTimeout(() => setCharState('working'), 3500)
    }
  })

  // ── Gemini via EYS API ─────────────────────────────────────────────────────
  async function callMaya(situation) {
    if (!sysprompt) return null
    try {
      const r = await fetch(`${EYS}/api/maya/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: situation, history: [], systemOverride: sysprompt }),
        signal: AbortSignal.timeout(8000),
      })
      const d = await r.json()
      return d.reply || null
    } catch { return null }
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  function addMsg(role, text) {
    const div = document.createElement('div')
    div.className = `eys-msg ${role}`
    div.textContent = text
    messagesEl.appendChild(div)
    messagesEl.scrollTop = messagesEl.scrollHeight
    return div
  }

  async function sendChat() {
    const msg = inputEl.value.trim()
    if (!msg) return
    inputEl.value = ''
    addMsg('user', msg)
    msgHistory.push({ role: 'user', content: msg })

    // Typing indicator
    const typing = document.createElement('div')
    typing.className = 'eys-typing'
    typing.innerHTML = '<div class="eys-dot"></div><div class="eys-dot"></div><div class="eys-dot"></div>'
    messagesEl.appendChild(typing)
    messagesEl.scrollTop = messagesEl.scrollHeight

    try {
      const r = await fetch(`${EYS}/api/maya/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: msgHistory.slice(-8), systemOverride: sysprompt }),
      })
      const d = await r.json()
      typing.remove()
      const reply = d.reply || 'EYS app not running at localhost:3005.'
      addMsg('maya', reply)
      msgHistory.push({ role: 'assistant', content: reply })
      say(reply.slice(0, 80), 5000)
    } catch {
      typing.remove()
      addMsg('maya', 'EYS app not running. Start it at localhost:3005.')
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────────
  charWrap.addEventListener('click', async () => {
    if (chatPanel.style.display !== 'none') return
    const line = await callMaya(`User clicked on Maya. She's in "${curState}" state. Say something brief, in their voice.`)
    say(line || (profile?.phrase || '👀'), 4000)
  })

  document.getElementById('eys-chat-btn').addEventListener('click', () => {
    const open = chatPanel.style.display !== 'none'
    chatPanel.style.display = open ? 'none' : 'flex'
    chatPanel.style.flexDirection = 'column'
    if (!open) inputEl.focus()
  })

  document.getElementById('eys-close-chat').addEventListener('click', () => {
    chatPanel.style.display = 'none'
  })

  document.getElementById('eys-hide-btn').addEventListener('click', () => {
    root.style.display = 'none'
    // Show a tiny revival button
    const revive = document.createElement('button')
    revive.textContent = '🤖'
    revive.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;background:rgba(124,58,237,.2);border:1px solid rgba(192,132,252,.3);border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;pointer-events:auto'
    revive.id = 'eys-revive'
    document.body.appendChild(revive)
    revive.addEventListener('click', () => { root.style.display = 'flex'; revive.remove() })
  })

  document.getElementById('eys-send').addEventListener('click', sendChat)
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat() })

  // ── Sync profile from background storage ──────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PROFILE_UPDATED') {
      profile   = msg.profile
      sysprompt = msg.sysprompt
      chrome.storage.local.set({ mayaProfile: profile, mayaSysprompt: sysprompt })
    }
  })

  setCharState('idle')
})()
