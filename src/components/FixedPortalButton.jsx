import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import '../styles/Navbar.css'
import { supabase } from '../lib/supabaseClient'

const VISIBLE_PATHS = ['/', '/about', '/board', '/events', '/join']

export default function FixedPortalButton(){
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Optionally restrict visibility to admins via env var
  const adminOnly = import.meta.env.VITE_PORTAL_ADMIN_ONLY === 'true'
  if(!VISIBLE_PATHS.includes(pathname)) return null

  if(adminOnly){
    try {
      const session = JSON.parse(localStorage.getItem('member-session') || 'null')
      if(!session || session.role !== 'admin') return null
    } catch (e) {
      return null
    }
  }

  const handleClick = async (e) => {
    e.preventDefault()
    // Try to log the access. If table doesn't exist, ignore error.
    try{
      await supabase.from('portal_access_logs').insert([{ path: pathname, accessed_at: new Date().toISOString() }])
    }catch(err){
      // ignore logging errors
      console.debug('Access log failed', err)
    }
    navigate('/member')
  }

  const button = (
    <div className="fixed-portal-wrap">
      <button onClick={handleClick} className="portal-btn" aria-label="IEEEIANS Hub">
        <LogIn size={14} />
        <span className="portal-label">IEEEIANS Hub</span>
      </button>
    </div>
  )

  if(!mounted) return null
  return ReactDOM.createPortal(button, document.body)
}
