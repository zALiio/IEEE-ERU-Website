import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import flag from '../assets/img/falg-white.webp'
import '../styles/Navbar.css'
import '../styles/Admin.css'
import { Menu, X, ArrowUpRight, Lock, ShieldCheck, Fingerprint, LogIn } from 'lucide-react'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  // ADMIN STEALTH STATES
  const [logoClicks, setLogoClicks] = useState(0)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loginData, setLoginData] = useState({ user: '', pass: '' })
  const [loginError, setLoginError] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
  ]

  return (
    <div className={`nav-container ${isScrolled ? 'nav-container-scrolled' : ''}`}>
      <motion.div 
        className={`nav-dock ${isScrolled ? 'nav-dock-scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Left: Branding */}
        <div className="nav-logo-area">
          <Link 
            to="/" 
            className="flex items-center cursor-default"
            onClick={(e) => {
              // Secret Admin Entry: 5 clicks
              const newCount = logoClicks + 1;
              if (newCount >= 5) {
                setShowAdminLogin(true);
                setLogoClicks(0);
                e.preventDefault();
              } else {
                setLogoClicks(newCount);
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
          >
            <motion.img 
              src={flag} 
              alt="IEEE Flag" 
              className="h-10 sm:h-12 w-auto pointer-events-none"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
        </div>

        {/* Center: Welcome Text (Mobile Only) */}
        <div className="nav-welcome-text">
          WELCOME
        </div>

        {/* Center: Tactile Links (Desktop) */}
        <div className="nav-links hidden md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
                onClick={(e) => {
                  if (isActive) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="nav-link-bg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ left: 0, right: 0 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="nav-action-area flex items-center gap-4">
          <Link 
            to="/join" 
            className="dock-btn hidden md:flex items-center gap-2"
            onClick={() => {
              if (location.pathname === '/join') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            JOIN <ArrowUpRight size={14} />
          </Link>
          
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
          >
            <div className="hamburger-staggered">
              <span className="ham-line line-full" />
              <span className="ham-line line-mid" />
              <span className="ham-line line-short" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Universal Mobile HUD Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background Energy Pulse */}
            <div className="hud-ambient-glow" />

            {/* HUD Header */}
            <div className="hud-header">
              <div className="hud-branding">
                 <img src={flag} alt="IEEE Flag" className="h-20 w-auto" />
                 
              </div>
              <button 
                className="hud-close-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="close-icon-wrap">
                   <span className="close-line line-1" />
                   <span className="close-line line-2" />
                </div>
              </button>
            </div>

            {/* HUD Navigation */}
            <div className="hud-nav-center">
              <div className="hud-links-wrap">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="hud-link-outer"
                  >
                    <Link 
                      to={link.path} 
                      className={`hud-link-item group ${location.pathname === link.path ? 'active' : ''}`}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        if (location.pathname === link.path) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      <span className="hud-link-index">0{i + 1}</span>
                      <span className="hud-link-text">{link.name}</span>
                      <ArrowUpRight className="hud-link-arrow" size={24} />
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="hud-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link 
                  to="/join" 
                  className="hud-primary-btn inline-block text-center w-full" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (location.pathname === '/join') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                   JOIN US
                </Link>
              </motion.div>
            </div>

            {/* HUD Tactical Footer */}
            <div className="hud-footer">
               <div className="hud-coord">IEEE_ERU_SB // PORT:8080</div>
               <div className="hud-social-brief">
                  CONNECTING GLOBAL ENGINEERS
               </div>
            </div>

            {/* Technical Corner Accents */}
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="admin-login-overlay px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="login-card"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Fingerprint size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase tracking-widest">Admin Authorization</h3>
                <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-2">IEEE ERU SB Command Control</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase ml-2">Access Key</p>
                   <input 
                      type="text" 
                      placeholder="Enter Username"
                      className={`login-field ${loginError ? 'border-red-500/50 bg-red-500/5' : ''}`}
                      onChange={(e) => setLoginData({...loginData, user: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase ml-2">Secure Pass</p>
                   <input 
                      type="password" 
                      placeholder="Enter Password"
                      className={`login-field ${loginError ? 'border-red-500/50 bg-red-500/5' : ''}`}
                      onChange={(e) => setLoginData({...loginData, pass: e.target.value})}
                   />
                </div>
              </div>

              {loginError && (
                <div className="mt-4 text-center">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Invalid Logic Matrix (Access Denied)</p>
                </div>
              )}

              <div className="mt-10 mb-6 px-1 flex flex-col gap-3">
                 <button 
                    onClick={() => {
                        if (loginData.user === 'tasbeeh' && loginData.pass === 'zahy') {
                            setLogoClicks(0);
                            setShowAdminLogin(false);
                            navigate('/dashboard');
                        } else {
                            setLoginError(true);
                            setTimeout(() => setLoginError(false), 2000);
                        }
                    }} 
                    className="admin-action-btn justify-center"
                 >
                    <LogIn size={14} /> Authorize Access
                 </button>
                 <button onClick={() => setShowAdminLogin(false)} className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors">Abort Mission</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Navbar
