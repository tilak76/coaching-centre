import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { studentId, batchId } = await request.json()
    if (!studentId || !batchId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { batchId, status: 'PENDING' }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 })
  }
}
