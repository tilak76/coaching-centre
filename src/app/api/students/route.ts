import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')

  try {
    const students = await prisma.student.findMany({
      where: batchId ? { batchId } : undefined,
      orderBy: { name: 'asc' },
      include: { batch: true }
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, contact, batchId } = await request.json()
    if (!name || !batchId) return NextResponse.json({ error: 'Name and batchId are required' }, { status: 400 })
    
    const student = await prisma.student.create({
      data: { name, contact, batchId }
    })
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
