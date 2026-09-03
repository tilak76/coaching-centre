'use client'

import { useState, useEffect } from 'react'

interface Batch {
  id: string
  name: string
  _count: { students: number }
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [newBatchName, setNewBatchName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches')
      const data = await res.json()
      setBatches(data)
    } catch (error) {
      console.error('Failed to fetch batches', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchName.trim()) return

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBatchName })
      })
      if (res.ok) {
        setNewBatchName('')
        fetchBatches()
      }
    } catch (error) {
      console.error('Failed to create batch', error)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Batches</h1>
        <p className="page-subtitle">Manage classes and student groups.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div className="table-container" style={{ flex: 2 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center' }}>No batches found. Create one to get started.</td>
                </tr>
              ) : (
                batches.map(batch => (
                  <tr key={batch.id}>
                    <td style={{ fontWeight: 500 }}>{batch.name}</td>
                    <td>{batch._count.students}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Batch</h3>
          <form onSubmit={handleCreateBatch}>
            <div className="form-group">
              <label className="form-label">Batch Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Class 10th - Morning"
                value={newBatchName}
                onChange={e => setNewBatchName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Create Batch
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
