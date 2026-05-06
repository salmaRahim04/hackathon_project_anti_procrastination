/**
 * Background service worker — only handles the icon badge.
 * Actual blocking is done by the content script which polls every 5 s.
 */

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'UPDATE_BADGE') {
    const text = msg.balance > 0 ? String(msg.balance) : ''
    chrome.action.setBadgeText({ text })
    chrome.action.setBadgeBackgroundColor({ color: '#00E5FF' })
  }
})
