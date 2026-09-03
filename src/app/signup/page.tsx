'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Batch {
  id: string
  name: string
}

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [batchId, setBatchId] = useState('')
  const [error, setError] = useState('')
  
  const [batches, setBatches] = useState<Batch[]>([])

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(() => {})
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, batchId })
      })
      
      if (res.ok) {
        if (email.toLowerCase() === 'admin@coaching.com') {
          router.push('/')
        } else {
          router.push('/student')
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to sign up')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const isAdmin = email.toLowerCase() === 'admin@coaching.com'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
      <div className="stat-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create Account</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          {!isAdmin && (
            <div className="form-group">
              <label className="form-label">Select Batch</label>
              <select 
                className="form-input" 
                required 
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
              >
                <option value="" disabled>-- Choose your batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign Up</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
