import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { name, email, password, batchId } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    const isAdmin = email.toLowerCase() === 'admin@coaching.com'
    if (!isAdmin && !batchId) {
      return NextResponse.json({ error: 'Batch selection is required for students' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create User and Student record in a transaction (unless Admin)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: isAdmin ? 'ADMIN' : 'STUDENT'
        }
      })

      if (!isAdmin) {
        await tx.student.create({
          data: {
            name,
            batchId,
            userId: newUser.id
          }
        })
      }

      return newUser
    })

    const sessionData = { userId: user.id, role: user.role, name: user.name }
    const session = await encrypt(sessionData)
    const cookieStore = await cookies()
    
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return NextResponse.json({ message: 'Signup successful' }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
