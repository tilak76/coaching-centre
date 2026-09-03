import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  const date = searchParams.get('date') // ISO string like "2023-10-25"

  if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 })

  try {
    const records = await prisma.attendance.findMany({
      where: {
        date,
        ...(batchId ? { student: { batchId } } : {})
      },
      include: { student: true }
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { date, studentId, status } = await request.json()
    if (!date || !studentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Upsert attendance record
    const record = await prisma.attendance.upsert({
      where: {
        date_studentId: {
          date,
          studentId
        }
      },
      update: { status },
      create: { date, studentId, status }
    })
    return NextResponse.json(record, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 })
  }
}
