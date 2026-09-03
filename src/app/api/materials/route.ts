import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  const date = searchParams.get('date')

  if (!batchId || !date) {
    return NextResponse.json({ error: 'batchId and date are required' }, { status: 400 })
  }

  try {
    const material = await prisma.dailyMaterial.findUnique({
      where: {
        date_batchId: { date, batchId }
      }
    })
    return NextResponse.json(material || { topic: '', questions: '' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { date, batchId, topic, questions } = await request.json()
    if (!date || !batchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const record = await prisma.dailyMaterial.upsert({
      where: {
        date_batchId: { date, batchId }
      },
      update: { topic, questions },
      create: { date, batchId, topic, questions }
    })
    return NextResponse.json(record, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save material' }, { status: 500 })
  }
}
