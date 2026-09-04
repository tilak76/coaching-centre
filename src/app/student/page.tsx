import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import LogoutButton from '../LogoutButton'

const secretKey = 'super-secret-key-change-this-in-production'
const key = new TextEncoder().encode(secretKey)

export default async function StudentDashboard() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  
  if (!session) redirect('/login')

  let payload
  try {
    const { payload: decoded } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    payload = decoded
  } catch (error) {
    redirect('/login')
  }

  // Get student details
  const student = await prisma.student.findUnique({
    where: { userId: payload.userId as string },
    include: { batch: true }
  })

  if (!student) {
    return <div>Error loading student profile.</div>
  }

  const today = new Date().toISOString().split('T')[0]

  // Get today's attendance
  const attendance = await prisma.attendance.findUnique({
    where: { date_studentId: { date: today, studentId: student.id } }
  })

  // Get today's material
  const material = await prisma.dailyMaterial.findUnique({
    where: { date_batchId: { date: today, batchId: student.batchId } }
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Welcome, {student.name}!</h1>
          <p className="page-subtitle">Batch: {student.batch.name}</p>
        </div>
        <LogoutButton />
      </div>

      {student.status === 'PENDING' ? (
        <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Approval Pending</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your account is currently waiting for admin approval. You will be able to see your attendance and daily materials once you are approved.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-title">Today's Attendance</h3>
              <div className="stat-value" style={{ 
                color: attendance?.status === 'PRESENT' ? 'var(--success)' : 
                       attendance?.status === 'ABSENT' ? 'var(--danger)' : 'var(--text-muted)',
                fontSize: '24px'
              }}>
                {attendance?.status || 'Not Marked Yet'}
              </div>
            </div>
          </div>

          <div className="table-container" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary)' }}>📚 Today's Topic</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {material?.topic || 'No topic uploaded for today yet.'}
            </p>
          </div>

          <div className="table-container" style={{ padding: '32px' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary)' }}>✍️ Practice Questions</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', padding: '16px', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              {material?.questions || 'No practice questions for today.'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
