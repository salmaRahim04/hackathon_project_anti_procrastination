/**
 * Earn Your Scroll — Content Script
 * Polls the app API every 5 s directly so blocking activates instantly,
 * bypassing Chrome MV3's 1-minute alarm minimum.
 */

const APP = 'http://localhost:3001'

// Fallback blocklist used if the API is unreachable
const FALLBACK_BLOCKLIST = [
  'youtube.com','twitter.com','x.com','reddit.com',
  'instagram.com','tiktok.com','facebook.com','netflix.com',
]

let blocklist    = []          // loaded from /api/blocked-sites
let lastState    = null        // last known state string (for change detection)
let pollInterval = null

// ── Overlay helpers ────────────────────────────────────────────────────────────

function isBlocked() {
  const host = location.hostname.replace(/^www\./, '')
  const list = blocklist.length ? blocklist : FALLBACK_BLOCKLIST
  return list.some(d => host === d || host.endsWith('.' + d))
}

function clearOverlays() {
  ;['eys-overlay','eys-badge','eys-banner'].forEach(id => {
    const el = document.getElementById(id); if (el) el.remove()
  })
  document.body.style.filter = ''
}

async function queueCurrentPage() {
  const btn = document.getElementById('eys-queue-btn')
  if (btn) {
    btn.textContent = '✅ Queued! Maya will summarize after your session.'
    btn.style.background = 'rgba(0,255,136,0.15)'
    btn.style.color = '#00FF88'
    btn.style.border = '1px solid rgba(0,255,136,0.3)'
    btn.disabled = true
  }
  try {
    await fetch(`${APP}/api/maya/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: location.href, title: document.title }),
    })
  } catch {}
}

function showWorkingOverlay(minutesLeft) {
  document.body.style.filter = 'grayscale(100%) saturate(0)'
  if (!isBlocked() || document.getElementById('eys-overlay')) return

  const el = document.createElement('div')
  el.id = 'eys-overlay'
  el.style.cssText = [
    'position:fixed','inset:0','background:rgba(10,10,10,.95)',
    'z-index:2147483647','display:flex','align-items:center',
    'justify-content:center','font-family:-apple-system,Inter,sans-serif',
  ].join(';')
  el.innerHTML = `
    <div style="text-align:center;max-width:320px;padding:32px;color:#fff">
      <div style="font-size:52px;margin-bottom:16px">⏳</div>
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Working right now</h2>
      <p style="color:rgba(255,255,255,.5);margin:0 0 20px;font-size:15px;line-height:1.5">
        This site unlocks in <strong style="color:#00E5FF">${minutesLeft} min</strong>
      </p>

      <div style="
        background:rgba(0,229,255,0.07);border:1px solid rgba(0,229,255,0.2);
        border-radius:14px;padding:14px;margin-bottom:20px;text-align:left">
        <p style="color:#00E5FF;font-size:12px;font-weight:700;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px">
          🤖 Don't miss this
        </p>
        <p style="color:rgba(255,255,255,.55);font-size:13px;margin:0 0 12px;line-height:1.5">
          Maya can summarize this for you while you work. Check it after your session — no FOMO.
        </p>
        <button id="eys-queue-btn" style="
          width:100%;background:rgba(0,229,255,0.15);color:#00E5FF;
          border:1px solid rgba(0,229,255,0.3);border-radius:999px;
          padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;
          font-family:-apple-system,Inter,sans-serif">
          📬 Queue for Maya to summarize
        </button>
      </div>

      <a href="${APP}" target="_blank" style="
        display:inline-block;padding:11px 28px;background:#00E5FF;color:#000;
        border-radius:999px;font-weight:700;text-decoration:none;font-size:14px">
        Back to work →
      </a>
    </div>`
  document.body.appendChild(el)

  // Wire up the queue button after DOM insert
  setTimeout(() => {
    const btn = document.getElementById('eys-queue-btn')
    if (btn) btn.addEventListener('click', queueCurrentPage)
  }, 0)
}

function showSpendingBadge(minutesLeft) {
  document.body.style.filter = ''
  if (document.getElementById('eys-badge')) return
  const el = document.createElement('div')
  el.id = 'eys-badge'
  el.style.cssText = [
    'position:fixed','top:12px','right:12px','z-index:2147483647',
    'background:rgba(0,255,136,.12)','border:1px solid rgba(0,255,136,.25)',
    'border-radius:10px','padding:8px 14px',
    'font-family:-apple-system,Inter,sans-serif','font-size:13px',
    'color:#00FF88','backdrop-filter:blur(12px)',
  ].join(';')
  el.textContent = `${minutesLeft} min remaining — enjoy it 🎉`
  document.body.appendChild(el)
}

function showIdleBanner(balance) {
  if (!isBlocked()) return
  document.body.style.filter = 'grayscale(40%)'
  if (document.getElementById('eys-banner')) return
  const el = document.createElement('div')
  el.id = 'eys-banner'
  el.style.cssText = [
    'position:fixed','bottom:16px','left:50%','transform:translateX(-50%)',
    'z-index:2147483647','background:rgba(10,10,10,.92)',
    'border:1px solid rgba(255,255,255,.1)','border-radius:12px',
    'padding:10px 16px','font-family:-apple-system,Inter,sans-serif',
    'font-size:13px','color:rgba(255,255,255,.65)','white-space:nowrap',
    'backdrop-filter:blur(12px)',
  ].join(';')
  el.innerHTML = `Earn your scroll first. <strong style="color:#00E5FF">${balance} min</strong> in bank. <a href="${APP}" target="_blank" style="color:#00E5FF;text-decoration:none;margin-left:6px">Work →</a>`
  document.body.appendChild(el)
}

function applyState(mode, data) {
  clearOverlays()
  if (mode === 'WORKING') {
    const elapsed  = data.startTime ? Math.floor((Date.now() - data.startTime) / 60000) : 0
    const remaining = Math.max(0, (data.plannedMinutes || 25) - elapsed)
    showWorkingOverlay(remaining)
  } else if (mode === 'SPENDING') {
    showSpendingBadge(data.minutesRemaining || 0)
  } else {
    showIdleBanner(data.balance || 0)
  }
}

// ── API polling ────────────────────────────────────────────────────────────────

async function poll() {
  try {
    const [sessionRes, bankRes, blocklistRes] = await Promise.all([
      fetch(`${APP}/api/sessions/current`, { cache: 'no-store' }),
      fetch(`${APP}/api/bank/balance`,      { cache: 'no-store' }),
      fetch(`${APP}/api/blocked-sites`,     { cache: 'no-store' }),
    ])

    const { session } = await sessionRes.json()
    const { bank }    = await bankRes.json()
    const { sites }   = await blocklistRes.json()

    // Update blocklist
    if (sites?.length) blocklist = sites.map(s => s.domain)

    // Determine mode
    let mode, data
    if (session && !session.completed) {
      mode = 'WORKING'
      data = {
        task:          session.taskDescription,
        plannedMinutes: session.plannedMinutes,
        startTime:      new Date(session.createdAt).getTime(),
      }
    } else {
      // Check localStorage for SPENDING state set by the webapp
      try {
        const local = JSON.parse(localStorage.getItem('earn-scroll-state') || '{}')
        if (local.state === 'SPENDING') {
          mode = 'SPENDING'
          data = { minutesRemaining: local.minutesRemaining || 0 }
        } else {
          mode = 'IDLE'
          data = { balance: bank?.balance || 0 }
        }
      } catch {
        mode = 'IDLE'
        data = { balance: bank?.balance || 0 }
      }
    }

    // Only update DOM if state changed
    const stateKey = `${mode}-${JSON.stringify(data)}`
    if (stateKey !== lastState) {
      lastState = stateKey
      applyState(mode, data)
    }

    // Update badge via background
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', balance: bank?.balance || 0 }).catch(() => {})

  } catch {
    // App not running — clear overlays to avoid stale state
    if (lastState && lastState.startsWith('WORKING')) {
      clearOverlays()
      lastState = null
    }
  }
}

// Poll immediately, then every 5 seconds
poll()
pollInterval = setInterval(poll, 5000)
