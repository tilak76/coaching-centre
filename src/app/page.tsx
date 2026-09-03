import prisma from '@/lib/prisma'

export default async function Dashboard() {
  const studentsCount = await prisma.student.count()
  const batchesCount = await prisma.batch.count()
  
  // Get today's attendance summary
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = await prisma.attendance.findMany({
    where: { date: today }
  })
  
  const presentCount = todayAttendance.filter((a: { status: string }) => a.status === 'PRESENT').length
  const absentCount = todayAttendance.filter((a: { status: string }) => a.status === 'ABSENT').length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Total Students</h3>
          <div className="stat-value">{studentsCount}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Active Batches</h3>
          <div className="stat-value">{batchesCount}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Present Today</h3>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{presentCount}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Absent Today</h3>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{absentCount}</div>
        </div>
      </div>
    </div>
  )
}
