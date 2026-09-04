'use client'

import { useState } from 'react'

export default function CourseSelector({ 
  batches, 
  currentBatchId, 
  studentId 
}: { 
  batches: { id: string, name: string }[], 
  currentBatchId: string, 
  studentId: string 
}) {
  const [selected, setSelected] = useState(currentBatchId)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleApply = async () => {
    if (selected === currentBatchId) return
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/students/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, batchId: selected })
      })
      if (res.ok) {
        setMessage('Application sent! Waiting for admin approval.')
        window.location.reload()
      } else {
        setMessage('Failed to apply. Please try again.')
      }
    } catch (err) {
      setMessage('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '32px', background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Available Courses & Classes</h3>
      <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
        Select a course below to apply for admission. The Admin will review your request.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {batches.map(b => (
          <label 
            key={b.id} 
            style={{
              border: selected === b.id ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: selected === b.id ? 'rgba(37, 99, 235, 0.05)' : 'var(--background)',
              padding: '16px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: selected === b.id ? 600 : 400,
              color: selected === b.id ? 'var(--primary)' : 'var(--text-main)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <input 
              type="radio" 
              name="dashboardBatch"
              value={b.id}
              checked={selected === b.id}
              onChange={e => setSelected(e.target.value)}
              style={{ display: 'none' }}
            />
            {b.name}
          </label>
        ))}
      </div>
      
      {message && <div style={{ marginBottom: '16px', color: 'var(--success)', fontWeight: 500 }}>{message}</div>}
      
      <button 
        className="btn btn-primary" 
        onClick={handleApply} 
        disabled={selected === currentBatchId || loading}
      >
        {loading ? 'Applying...' : 'Apply for Selected Course'}
      </button>
    </div>
  )
}
