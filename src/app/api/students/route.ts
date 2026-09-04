import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  const status = searchParams.get('status')

  try {
    const students = await prisma.student.findMany({
      where: {
        ...(batchId ? { batchId } : {}),
        ...(status ? { status } : {}) // if status is passed, use it, else get all
      },
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
      data: { name, contact, batchId, status: 'APPROVED' } // Admin created ones are approved by default
    })
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: 'Id and status are required' }, { status: 400 })
    
    const student = await prisma.student.update({
      where: { id },
      data: { status }
    })
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}
