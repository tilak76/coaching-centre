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
  const [mobile, setMobile] = useState('')
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
        body: JSON.stringify({ name, email, password, batchId, contact: mobile })
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)', padding: '32px 16px' }}>
      <div className="stat-card" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
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
            <label className="form-label">Mobile Number</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={mobile}
              onChange={e => setMobile(e.target.value)}
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
              <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Select Course / Class</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {batches.map(b => (
                  <label 
                    key={b.id} 
                    style={{
                      border: batchId === b.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: batchId === b.id ? 'rgba(37, 99, 235, 0.05)' : 'var(--background)',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: batchId === b.id ? 600 : 400,
                      color: batchId === b.id ? 'var(--primary)' : 'var(--text-main)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="batchId"
                      value={b.id}
                      checked={batchId === b.id}
                      onChange={e => setBatchId(e.target.value)}
                      style={{ display: 'none' }}
                      required
                    />
                    {b.name}
                  </label>
                ))}
              </div>
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
