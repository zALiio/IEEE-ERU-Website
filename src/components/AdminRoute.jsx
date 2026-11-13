import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminDashboard from '../pages/AdminDashboard'
import '../styles/Admin.css'

const isAdmin = (user) => user?.app_metadata?.role === 'admin'

const AdminRoute = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      setSession(data?.session || null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError(loginError.message)
      return
    }
    if (!isAdmin(data.user)) {
      await supabase.auth.signOut()
      setError('This account is not authorized for the admin dashboard.')
    }
  }

  if (loading) return <div className="min-h-[60vh]" />
  if (session && isAdmin(session.user)) return <AdminDashboard />

  return (
    <div className="admin-login-overlay px-4">
      <form onSubmit={handleLogin} className="login-card">
        <h1 className="mb-2 text-2xl font-black uppercase text-primary">Admin Authorization</h1>
        <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/30">Sign in with your authorized Supabase account</p>
        <div className="space-y-4">
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" className="login-field" />
          <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="login-field" />
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button type="submit" className="admin-action-btn mt-8 w-full justify-center">Sign In</button>
      </form>
    </div>
  )
}

export default AdminRoute
