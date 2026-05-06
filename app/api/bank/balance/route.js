import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let bank = await prisma.scrollBank.findFirst()
    if (!bank) bank = await prisma.scrollBank.create({ data: {} })
    return NextResponse.json({ bank })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
