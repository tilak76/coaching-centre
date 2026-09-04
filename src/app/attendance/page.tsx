'use client'

import { useState, useEffect } from 'react'

interface Batch {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  status: 'PRESENT' | 'ABSENT'
}

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatchId && selectedDate) {
      fetchAttendanceData()
    } else {
      setStudents([])
      setAttendance({})
    }
  }, [selectedBatchId, selectedDate])

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches')
      setBatches(await res.json())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch batches', error)
      setLoading(false)
    }
  }

  const fetchAttendanceData = async () => {
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        fetch(`/api/students?batchId=${selectedBatchId}&status=APPROVED`),
        fetch(`/api/attendance?batchId=${selectedBatchId}&date=${selectedDate}`)
      ])
      
      const studentsData: Student[] = await studentsRes.json()
      const attendanceData: AttendanceRecord[] = await attendanceRes.json()
      
      setStudents(studentsData)
      
      const attendanceMap: Record<string, 'PRESENT' | 'ABSENT'> = {}
      attendanceData.forEach(record => {
        attendanceMap[record.studentId] = record.status
      })
      setAttendance(attendanceMap)
      
    } catch (error) {
      console.error('Failed to fetch attendance data', error)
    }
  }

  const markAttendance = async (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    // Optimistic UI update
    setAttendance(prev => ({ ...prev, [studentId]: status }))
    
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          studentId,
          status
        })
      })
    } catch (error) {
      console.error('Failed to save attendance', error)
      // Revert on failure (simple version)
      fetchAttendanceData()
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance Tracking</h1>
        <p className="page-subtitle">Mark and view daily attendance for students.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Select Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <label className="form-label">Select Batch</label>
          <select 
            className="form-input"
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
          >
            <option value="">-- Choose a batch --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedBatchId ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>No students in this batch.</td>
                </tr>
              ) : (
                students.map(student => {
                  const currentStatus = attendance[student.id]
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td>
                        {currentStatus ? (
                          <span className={`badge ${currentStatus === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                            {currentStatus}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Not marked</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className={`btn ${currentStatus === 'PRESENT' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => markAttendance(student.id, 'PRESENT')}
                          >
                            Present
                          </button>
                          <button 
                            className={`btn ${currentStatus === 'ABSENT' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 12px', fontSize: '13px', background: currentStatus === 'ABSENT' ? 'var(--danger)' : undefined, borderColor: currentStatus === 'ABSENT' ? 'var(--danger)' : undefined }}
                            onClick={() => markAttendance(student.id, 'ABSENT')}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          Please select a batch and date to view students.
        </div>
      )}
    </div>
  )
}
