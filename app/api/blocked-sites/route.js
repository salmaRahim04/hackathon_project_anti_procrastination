import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_SITES = [
  { domain: 'youtube.com', name: 'YouTube' },
  { domain: 'x.com', name: 'X / Twitter' },
  { domain: 'reddit.com', name: 'Reddit' },
  { domain: 'instagram.com', name: 'Instagram' },
  { domain: 'tiktok.com', name: 'TikTok' },
  { domain: 'facebook.com', name: 'Facebook' },
  { domain: 'netflix.com', name: 'Netflix' },
  { domain: 'twitter.com', name: 'Twitter' },
]

export async function GET() {
  try {
    let sites = await prisma.blockedSite.findMany({ orderBy: { createdAt: 'asc' } })

    // Seed defaults on first run
    if (sites.length === 0) {
      for (const s of DEFAULT_SITES) {
        await prisma.blockedSite.upsert({
          where: { domain: s.domain },
          update: {},
          create: s,
        })
      }
      sites = await prisma.blockedSite.findMany({ orderBy: { createdAt: 'asc' } })
    }

    return NextResponse.json({ sites })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { domain, name } = await request.json()

    let normalised
    try {
      const raw = domain.trim()
      const url = raw.includes('://') ? raw : `https://${raw}`
      normalised = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    } catch {
      normalised = domain.trim().replace(/^www\./, '').toLowerCase()
    }
    if (!normalised || !normalised.includes('.')) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
    }

    const site = await prisma.blockedSite.upsert({
      where: { domain: normalised },
      update: { name: name || normalised },
      create: { domain: normalised, name: name || normalised },
    })

    return NextResponse.json({ site })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
