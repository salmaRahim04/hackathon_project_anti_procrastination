'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

function ExtensionStatus() {
  const [detected, setDetected] = useState(null) // null = checking

  useEffect(() => {
    // If chrome.runtime is available and an extension responds, it's installed
    const timeout = setTimeout(() => setDetected(false), 800)
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        // Try to message any extension — just checking if API is available
        setDetected(true)
        clearTimeout(timeout)
      }
    } catch {
      setDetected(false)
    }
    return () => clearTimeout(timeout)
  }, [])

  if (detected === null) return null

  return (
    <div className={`rounded-xl p-4 border text-sm ${
      detected
        ? 'bg-[#E8F5F0] border-[#C4DDD2] text-[#1D5D3D]'
        : 'bg-[#FEF8E7] border-[#F5E6BA] text-[#D4A500]'
    }`}>
      {detected ? (
        <p>✅ Chrome extension is active — blocking will work automatically during sessions.</p>
      ) : (
        <div>
          <p className="font-semibold mb-2">⚠️ Extension not detected</p>
          <p className="text-[#6B7A74] text-xs leading-relaxed">
            To block sites during work sessions:
          </p>
          <ol className="text-[#6B7A74] text-xs leading-relaxed mt-1 list-decimal list-inside space-y-0.5">
            <li>Open Chrome → go to <code className="text-[#1D5D3D]">chrome://extensions</code></li>
            <li>Enable <strong className="text-[#1A2E26]">Developer mode</strong> (top right)</li>
            <li>Click <strong className="text-[#1A2E26]">Load unpacked</strong></li>
            <li>Select the <code className="text-[#1D5D3D]">earn-your-scroll/extension</code> folder</li>
          </ol>
        </div>
      )}
    </div>
  )
}

const SITE_ICONS = {
  'youtube.com': '📺',
  'x.com': '𝕏',
  'twitter.com': '𝕏',
  'reddit.com': '🤖',
  'instagram.com': '📸',
  'tiktok.com': '🎵',
  'facebook.com': '👥',
  'netflix.com': '🎬',
  'twitch.tv': '🎮',
  'linkedin.com': '💼',
  'discord.com': '💬',
  'threads.net': '🧵',
  'snapchat.com': '👻',
  'pinterest.com': '📌',
  'tumblr.com': '📓',
}

const SUGGESTIONS = [
  { domain: 'twitch.tv', name: 'Twitch' },
  { domain: 'linkedin.com', name: 'LinkedIn' },
  { domain: 'discord.com', name: 'Discord' },
  { domain: 'threads.net', name: 'Threads' },
  { domain: 'snapchat.com', name: 'Snapchat' },
  { domain: 'pinterest.com', name: 'Pinterest' },
]

function parseDomain(input) {
  const trimmed = input.trim()
  try {
    const url = trimmed.includes('://') ? trimmed : `https://${trimmed}`
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return trimmed.replace(/^www\./, '').toLowerCase()
  }
}

function siteIcon(domain) {
  return SITE_ICONS[domain] ?? '🌐'
}

export default function SettingsPage() {
  const router = useRouter()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/blocked-sites')
      .then((r) => r.json())
      .then((d) => {
        setSites(d.sites ?? [])
        setLoading(false)
      })
  }, [])

  const blockedDomains = new Set(sites.map((s) => s.domain))

  const handleAdd = async (domainOrUrl, suggestedName) => {
    const domain = parseDomain(domainOrUrl)
    if (!domain || blockedDomains.has(domain)) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/blocked-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, name: suggestedName || domain }),
      })
      const data = await res.json()
      if (data.site) {
        setSites((prev) => [...prev, data.site])
        setInput('')
      }
    } catch {
      setError('Failed to add site')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await fetch(`/api/blocked-sites/${id}`, { method: 'DELETE' })
      setSites((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Failed to remove')
    } finally {
      setRemovingId(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) handleAdd(input)
  }

  const availableSuggestions = SUGGESTIONS.filter((s) => !blockedDomains.has(s.domain))

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] to-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl shadow-sm border border-[#E8EDEB] hover:shadow-md transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1A2E26]">Blocked Sites</h1>
            <p className="text-[#6B7A74] mt-1">Control your distractions</p>
          </div>
        </div>

        {/* Extension status banner */}
        <div className="mb-8">
          <ExtensionStatus />
        </div>

        <p className="text-[#6B7A74] text-sm leading-relaxed mb-6">
          These sites will be grayed out and blocked while you're working. You can
          access them guilt-free once you've earned scroll time.
        </p>

        {/* Add input */}
        <div className="bg-white rounded-xl p-6 border border-[#E8EDEB] shadow-sm mb-8">
          <h3 className="text-[#1A2E26] font-semibold mb-4">Add a site to block</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError('') }}
                placeholder="e.g., twitter.com or https://youtube.com"
                className="flex-1 bg-[#F5F7F6] text-[#1A2E26] rounded-xl px-4 py-3 text-sm placeholder-[#94A6A0] border border-[#E8EDEB] focus:border-[#1D5D3D] focus:ring-2 focus:ring-[#1D5D3D]/20 focus:outline-none transition-all"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={!input.trim() || adding}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  input.trim() && !adding
                    ? 'bg-[#1D5D3D] text-white hover:bg-[#154d31] shadow-sm'
                    : 'bg-[#F5F7F6] text-[#94A6A0] cursor-not-allowed'
                }`}
              >
                {adding ? 'Adding...' : 'Block Site'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </form>
        </div>

        {/* Current blocked sites */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#1D5D3D]/20 border-t-[#1D5D3D] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1A2E26] font-semibold">Blocked Sites</h3>
              <span className="px-2 py-0.5 bg-[#E8F5F0] rounded-full text-xs text-[#1D5D3D] font-medium">
                {sites.length}
              </span>
            </div>
            
            {sites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#E8EDEB]">
                <p className="text-[#6B7A74]">No sites blocked yet.</p>
                <p className="text-[#94A6A0] text-sm mt-1">Add one above to start blocking distractions.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E8EDEB] overflow-hidden">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-4 border-b border-[#E8EDEB] last:border-0 hover:bg-[#F5F7F6] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{siteIcon(site.domain)}</span>
                      <div>
                        <p className="text-[#1A2E26] font-medium">{site.name}</p>
                        <p className="text-[#94A6A0] text-xs">{site.domain}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(site.id)}
                      disabled={removingId === site.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                    >
                      {removingId === site.id ? (
                        <div className="w-4 h-4 border-2 border-[#1D5D3D]/20 border-t-[#1D5D3D] rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#94A6A0] group-hover:text-red-500">
                          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
          <div>
            <h3 className="text-[#1A2E26] font-semibold mb-3">Quick Add Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((s) => (
                <button
                  key={s.domain}
                  onClick={() => handleAdd(s.domain, s.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8EDEB] rounded-xl text-sm text-[#1A2E26] hover:border-[#1D5D3D] hover:shadow-sm transition-all"
                >
                  <span className="text-lg">{siteIcon(s.domain)}</span>
                  <span>{s.name}</span>
                  <span className="text-[#1D5D3D]">+</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tip Footer */}
        <div className="mt-8 pt-6 border-t border-[#E8EDEB]">
          <p className="text-xs text-[#94A6A0]">
            💡 The Chrome extension needs to be installed for automatic blocking. 
            Make sure it's loaded and enabled in <code className="bg-[#F5F7F6] px-1 rounded">chrome://extensions</code>
          </p>
        </div>
      </div>
    </div>
  )
}