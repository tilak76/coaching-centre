'use client'

import { useState, useEffect } from 'react'

interface Batch {
  id: string
  name: string
}

export default function MaterialsPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
  }, [])

  useEffect(() => {
    if (selectedBatchId && selectedDate) {
      setMessage('')
      fetch(`/api/materials?batchId=${selectedBatchId}&date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setTopic(data.topic || '')
          setQuestions(data.questions || '')
        })
    } else {
      setTopic('')
      setQuestions('')
    }
  }, [selectedBatchId, selectedDate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatchId || !selectedDate) return
    
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchId,
          date: selectedDate,
          topic,
          questions
        })
      })
      
      if (res.ok) {
        setMessage('Successfully saved materials for this batch!')
      } else {
        setMessage('Failed to save materials.')
      }
    } catch (error) {
      setMessage('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Materials</h1>
        <p className="page-subtitle">Upload topics and practice questions for your students.</p>
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
        <form onSubmit={handleSave} className="table-container" style={{ padding: '32px' }}>
          {message && (
            <div style={{ padding: '12px', marginBottom: '24px', borderRadius: 'var(--radius-md)', background: message.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('Success') ? 'var(--success)' : 'var(--danger)' }}>
              {message}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Today's Topic (What was taught?)</label>
            <textarea 
              className="form-input"
              rows={4}
              placeholder="e.g. Newton's Laws of Motion - First Law and Inertia."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Practice Questions (Homework)</label>
            <textarea 
              className="form-input"
              rows={8}
              placeholder="e.g. Q1. Define inertia.\nQ2. What happens when a bus stops suddenly?"
              value={questions}
              onChange={e => setQuestions(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Materials'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          Please select a batch and date to upload materials.
        </div>
      )}
    </div>
  )
}
