import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Attendance System | Coaching Centre',
  description: 'Automated attendance tracking for coaching centres',
}

const secretKey = 'super-secret-key-change-this-in-production'
const key = new TextEncoder().encode(secretKey)

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  
  let role = null
  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
      role = payload.role as string
    } catch (error) {}
  }

  // If not logged in, render without sidebar
  if (!role) {
    return (
      <html lang="en">
        <body className={outfit.className}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>EduTrack</span>
            </div>
            
            <nav className="nav-links">
              {role === 'ADMIN' ? (
                <>
                  <Link href="/" className="nav-item">Dashboard</Link>
                  <Link href="/batches" className="nav-item">Batches</Link>
                  <Link href="/students" className="nav-item">Students</Link>
                  <Link href="/attendance" className="nav-item">Attendance</Link>
                  <Link href="/materials" className="nav-item">Daily Materials</Link>
                </>
              ) : (
                <>
                  <Link href="/student" className="nav-item">My Dashboard</Link>
                </>
              )}
            </nav>

            <div style={{ marginTop: 'auto' }}>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
              </form>
            </div>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
