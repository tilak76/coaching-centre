'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton({ fullWidth }: { fullWidth?: boolean }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login' // using window.location to force full reload and clear state
  }

  return (
    <button 
      onClick={handleLogout} 
      className="btn btn-secondary" 
      style={fullWidth ? { width: '100%' } : {}}
    >
      Logout
    </button>
  )
}
