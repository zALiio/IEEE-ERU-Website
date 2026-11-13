import { useEffect, useState } from 'react'
import AdminDashboard from '../pages/AdminDashboard'
import '../styles/Admin.css'

const AdminRoute = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin-session')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not verify admin session')
        setAuthenticated(Boolean(data.authenticated))
      })
      .catch((sessionError) => {
        setError(sessionError.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }
      setAuthenticated(true)
    } catch {
      setError('Could not connect to the admin login service')
    }
  }

  if (loading) return <div className="min-h-[60vh]" />
  if (authenticated) return <AdminDashboard />

  return (
    <div className="admin-login-overlay px-4">
      <form onSubmit={handleLogin} className="login-card">
        <h1 className="mb-2 text-2xl font-black uppercase text-primary">Admin Authorization</h1>
        <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/30">IEEE ERU command access</p>
        <div className="space-y-4">
          <input required type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin username" className="login-field" />
          <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="login-field" />
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button type="submit" className="admin-action-btn mt-8 w-full justify-center">Sign In</button>
      </form>
    </div>
  )
}

export default AdminRoute
