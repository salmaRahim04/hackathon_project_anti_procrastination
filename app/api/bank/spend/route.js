import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { minutes } = await request.json()

    let bank = await prisma.scrollBank.findFirst()
    if (!bank) return NextResponse.json({ error: 'No bank found' }, { status: 404 })
    if (bank.balance < minutes) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const updated = await prisma.scrollBank.update({
      where: { id: bank.id },
      data: {
        totalSpent: { increment: minutes },
        balance: { decrement: minutes },
      },
    })

    await prisma.spendSession.create({ data: { minutesSpent: minutes } })

    return NextResponse.json({ bank: updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
