'use client'

import { useState, useEffect } from 'react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('TEACHER')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      const data = await res.json()
      setStaff(data)
    } catch (error) {
      console.error('Failed to fetch staff', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          email: newEmail, 
          password: newPassword,
          role: newRole 
        })
      })
      const data = await res.json()
      if (res.ok) {
        setNewName('')
        setNewEmail('')
        setNewPassword('')
        setNewRole('TEACHER')
        fetchStaff()
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch (error) {
      setError('Failed to create user')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Staff</h1>
        <p className="page-subtitle">Add other admins or teachers to the system.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div className="table-container" style={{ flex: 2 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>No staff found.</td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 500 }}>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className="badge" style={{ background: member.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)', color: 'white' }}>
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Staff</h3>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          <form onSubmit={handleCreateStaff}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Amit Kumar"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="e.g. amit@coaching.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Secure password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-input"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                required
              >
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
