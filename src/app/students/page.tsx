'use client'

import { useState, useEffect } from 'react'

interface Batch {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  contact: string | null
  batch: Batch
  status: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING'>('APPROVED')
  
  const [newName, setNewName] = useState('')
  const [newContact, setNewContact] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/batches')
      ])
      setStudents(await studentsRes.json())
      setBatches(await batchesRes.json())
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' })
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Failed to approve student', error)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !selectedBatchId) return

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          contact: newContact, 
          batchId: selectedBatchId 
        })
      })
      if (res.ok) {
        setNewName('')
        setNewContact('')
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create student', error)
    }
  }

  const displayedStudents = students.filter(s => s.status === activeTab)
  const pendingCount = students.filter(s => s.status === 'PENDING').length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Manage student profiles and assign batches.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <button 
              className={`btn ${activeTab === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('APPROVED')}
            >
              Approved Students
            </button>
            <button 
              className={`btn ${activeTab === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('PENDING')}
            >
              Pending Approvals {pendingCount > 0 && <span style={{ background: 'white', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>{pendingCount}</span>}
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Batch</th>
                  {activeTab === 'PENDING' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'PENDING' ? 4 : 3} style={{ textAlign: 'center' }}>Loading...</td>
                  </tr>
                ) : displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'PENDING' ? 4 : 3} style={{ textAlign: 'center' }}>No students found in this category.</td>
                  </tr>
                ) : (
                  displayedStudents.map(student => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td>{student.contact || '-'}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)' }}>
                          {student.batch.name}
                        </span>
                      </td>
                      {activeTab === 'PENDING' && (
                        <td>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            onClick={() => handleApprove(student.id)}
                          >
                            Approve
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-container" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Student</h3>
          <form onSubmit={handleCreateStudent}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Rahul Kumar"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. +91 9876543210"
                value={newContact}
                onChange={e => setNewContact(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Batch</label>
              <select 
                className="form-input"
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
                required
              >
                <option value="" disabled>Select a batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={batches.length === 0}>
              Add Student
            </button>
            {batches.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>
                Please create a batch first.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
