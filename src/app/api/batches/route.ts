import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { students: true }
        }
      }
    })
    return NextResponse.json(batches)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    
    const batch = await prisma.batch.create({
      data: { name }
    })
    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}
