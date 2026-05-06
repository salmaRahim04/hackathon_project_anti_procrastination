const EYS = 'http://localhost:3005'

const DISTRACTION_SITES = [
  'youtube.com','twitter.com','x.com','reddit.com','instagram.com',
  'tiktok.com','facebook.com','netflix.com','twitch.tv','snapchat.com',
  'pinterest.com','threads.net','9gag.com','buzzfeed.com',
]
const WORK_SITES = [
  'github.com','gitlab.com','stackoverflow.com','localhost','127.0.0.1',
  'developer.mozilla.org','docs.','figma.com','linear.app','notion.so',
  'jira.atlassian.com','trello.com','vercel.app','railway.app',
]

function classify(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (DISTRACTION_SITES.some(d => host.includes(d)))   return 'distraction'
    if (WORK_SITES.some(w => host.includes(w)))           return 'work'
    return 'neutral'
  } catch { return 'neutral' }
}

// Sync session + VS Code context → broadcast to all tabs
async function syncAndBroadcast() {
  let session = null, vscode = null, bank = null

  try {
    const [sRes, cRes, bRes] = await Promise.all([
      fetch(`${EYS}/api/sessions/current`),
      fetch(`${EYS}/api/maya/context`),
      fetch(`${EYS}/api/bank/balance`),
    ])
    session = (await sRes.json()).session
    vscode  = await cRes.json()
    bank    = (await bRes.json()).bank
  } catch { /* EYS not running */ }

  const sessionActive = session && !session.completed

  // Update badge
  const badgeText = bank?.balance > 0 ? String(bank.balance) : ''
  chrome.action.setBadgeText({ text: badgeText })
  chrome.action.setBadgeBackgroundColor({ color: '#c084fc' })

  // Store for content scripts to read
  await chrome.storage.local.set({
    sessionActive,
    sessionTask: session?.taskDescription || null,
    balance:     bank?.balance || 0,
    vscodeSrc:   vscode,
  })

  // Broadcast to all tabs
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SESSION_UPDATE',
      sessionActive,
      sessionTask: session?.taskDescription || null,
      balance: bank?.balance || 0,
      vscodeSrc: vscode,
    }).catch(() => {})
  }
}

// Poll every 8 seconds
chrome.alarms.create('sync', { periodInMinutes: 8 / 60 })
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'sync') syncAndBroadcast() })

// Also sync on tab change
chrome.tabs.onActivated.addListener(syncAndBroadcast)
chrome.runtime.onInstalled.addListener(syncAndBroadcast)

// Relay visibility + context from content scripts to Maya iframe
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'CLASSIFY_TAB') {
    const cls = classify(sender.tab?.url || '')
    const host = (() => { try { return new URL(sender.tab?.url).hostname.replace(/^www\./,'') } catch { return '' } })()
    // Send back to that tab's content script
    chrome.tabs.sendMessage(sender.tab.id, { type: 'CLASSIFICATION', classification: cls, site: host }).catch(() => {})
  }
})

syncAndBroadcast()
