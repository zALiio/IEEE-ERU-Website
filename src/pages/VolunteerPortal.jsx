import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import Meta from '../components/Meta'
import { ensureSettingsDefaults } from '../lib/supabaseSettings'
import {
  ShieldCheck,
  KeyRound,
  LogIn,
  LogOut,
  Gift,
  Award,
  CheckCircle2,
  Hourglass,
  Sparkles,
  ClipboardList,
} from 'lucide-react'
import '../styles/JoinUs.css'

const VolunteerPortal = () => {
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [pointLog, setPointLog] = useState([])
  const [invitePreview, setInvitePreview] = useState(null)
  const [inviteForm, setInviteForm] = useState({ code: '', name: '', email: '', password: '', confirmPassword: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const summaryStats = useMemo(() => {
    const totalPoints = profile?.points ?? 0
    const completedTasks = tasks.filter((task) => task.status === 'completed').length

    return [
      { label: 'Points', value: totalPoints, icon: Award },
      { label: 'Tasks', value: tasks.length, icon: ClipboardList },
      { label: 'Completed', value: completedTasks, icon: CheckCircle2 },
    ]
  }, [profile, tasks])

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        await ensureSettingsDefaults()
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session)
        if (data.session?.user) {
          await loadVolunteerData(data.session.user.id)
        }
      } catch (error) {
        if (mounted) setError(error.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        await loadVolunteerData(nextSession.user.id)
      } else {
        setProfile(null)
        setTasks([])
        setPointLog([])
      }
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const loadVolunteerData = async (userId) => {
    const { data: volunteerRow, error: volunteerError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (volunteerError) throw volunteerError

    if (!volunteerRow) {
      setProfile(null)
      setTasks([])
      setPointLog([])
      return
    }

    setProfile(volunteerRow)

    const [tasksResult, pointLogResult] = await Promise.all([
      supabase.from('volunteer_tasks').select('*').eq('assigned_to', volunteerRow.id).order('created_at', { ascending: false }),
      supabase.from('volunteer_points_log').select('*').eq('volunteer_id', volunteerRow.id).order('created_at', { ascending: false }),
    ])

    if (tasksResult.error) throw tasksResult.error
    if (pointLogResult.error) throw pointLogResult.error

    setTasks(tasksResult.data || [])
    setPointLog(pointLogResult.data || [])
  }

  const verifyInvite = async (inviteCode) => {
    const { data, error } = await supabase.rpc('verify_volunteer_invite', { invite_code: inviteCode })
    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('Invite code is not valid or has expired.')
    }

    return data[0]
  }

  const handleInviteSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setAuthLoading(true)

    try {
      if (inviteForm.password !== inviteForm.confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      const invite = await verifyInvite(inviteForm.code.trim())
      setInvitePreview(invite)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: inviteForm.email.trim(),
        password: inviteForm.password,
        options: {
          data: {
            full_name: inviteForm.name.trim(),
            invite_code: inviteForm.code.trim(),
            branch_role: 'Volunteer',
          },
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error('Could not create the volunteer account.')

      const { error: volunteerInsertError } = await supabase.from('volunteers').upsert([
        {
          user_id: data.user.id,
          invite_id: invite.id,
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          role: 'Volunteer',
          status: 'active',
        },
      ])

      if (volunteerInsertError) throw volunteerInsertError

      await supabase.rpc('redeem_volunteer_invite', {
        invite_code: inviteForm.code.trim(),
        user_id: data.user.id,
        volunteer_email: inviteForm.email.trim(),
      })

      setMessage('Volunteer access created. You can now log in and see your dashboard.')
      setLoginForm({ email: inviteForm.email.trim(), password: inviteForm.password })
    } catch (err) {
      setError(err.message)
    }

    setAuthLoading(false)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setAuthLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      if (signInError) throw signInError
      setMessage('Welcome back. Loading your volunteer dashboard...')
    } catch (err) {
      setError(err.message)
    }

    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setTasks([])
    setPointLog([])
  }

  return (
    <div className="join-page">
      <Meta
        title="Volunteer Portal"
        description="IEEE ERU volunteer invite portal with login, tasks, and points tracking."
        keywords="IEEE ERU volunteers, volunteer portal, invite code, points dashboard"
      />

      <div className="join-glow-top" />

      <div className="join-container">
        <div className="join-hero-header">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="join-subtitle"
          >
            Invite × Access
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="join-title"
          >
            VOLUNTEER <span className="text-primary">PORTAL</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="join-description-text"
          >
            <p className="mb-4">
              Redeem an invite code, create your volunteer account, and track your tasks and points in one place.
            </p>
            <p>Only invited volunteers can register. Existing volunteers can sign in below.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="form-card"
        >
          {loading ? (
            <div className="text-center py-20 text-white/20 uppercase font-black text-[10px] tracking-widest animate-pulse">
              Syncing volunteer channel...
            </div>
          ) : session?.user && profile ? (
            <div className="space-y-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">Authenticated Volunteer</p>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{profile.name || session.user.email}</h2>
                  <p className="text-white/40 text-sm mt-2">{profile.email}</p>
                </div>
                <button onClick={handleLogout} className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                  <LogOut size={14} /> Logout
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-[10px] uppercase tracking-[0.35em] font-bold">{item.label}</p>
                      <item.icon size={18} className="text-primary/70" />
                    </div>
                    <div className="mt-4 text-3xl font-black text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <ClipboardList size={18} className="text-primary" />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Assigned Tasks</h3>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-white/35 text-sm">No tasks assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-white font-bold">{task.title}</h4>
                              <p className="text-white/35 text-sm mt-1">{task.description}</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/80">{task.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Point Log</h3>
                  </div>
                  {pointLog.length === 0 ? (
                    <p className="text-white/35 text-sm">No point events yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {pointLog.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-medium">{entry.note || 'Point update'}</p>
                            <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-1">{new Date(entry.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-primary font-black">+{entry.points}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-primary" size={18} />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Redeem Invite</h3>
                </div>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <input className="form-field" placeholder="Invite Code" value={inviteForm.code} onChange={(e) => setInviteForm((prev) => ({ ...prev, code: e.target.value }))} />
                  <input className="form-field" placeholder="Full Name" value={inviteForm.name} onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))} />
                  <input className="form-field" type="email" placeholder="Email" value={inviteForm.email} onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))} />
                  <input className="form-field" type="password" placeholder="Password" value={inviteForm.password} onChange={(e) => setInviteForm((prev) => ({ ...prev, password: e.target.value }))} />
                  <input className="form-field" type="password" placeholder="Confirm Password" value={inviteForm.confirmPassword} onChange={(e) => setInviteForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
                  <button disabled={authLoading} className="final-submit-btn w-full inline-flex items-center justify-center gap-2">
                    <Gift size={16} /> {authLoading ? 'VERIFYING...' : 'CREATE VOLUNTEER ACCESS'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <LogIn className="text-primary" size={18} />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Volunteer Login</h3>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input className="form-field" type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))} />
                  <input className="form-field" type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} />
                  <button disabled={authLoading} className="final-submit-btn w-full inline-flex items-center justify-center gap-2">
                    <KeyRound size={16} /> {authLoading ? 'CONNECTING...' : 'SIGN IN'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {(message || error || invitePreview) && (
            <div className="mt-6 space-y-3">
              {message && <p className="text-primary text-sm font-medium">{message}</p>}
              {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
              {invitePreview && (
                <p className="text-white/35 text-sm">
                  Invite validated for <span className="text-white">{invitePreview.name || invitePreview.email || invitePreview.code}</span>.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default VolunteerPortal
