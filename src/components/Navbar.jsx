import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import flag from '../assets/img/falg-white.webp'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

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
          <Link to="/" className="flex items-center">
            <motion.img 
              src={flag} 
              alt="IEEE Flag" 
              className="h-14 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
        </div>

        {/* Center: Tactile Links */}
        <div className="nav-links hidden md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
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
          <button className="dock-btn hidden md:flex items-center gap-2">
            JOIN <ArrowUpRight size={14} />
          </button>
          
          <button 
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.div>

      {/* Mobile HUD Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-hud"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <button 
              className="absolute top-10 right-10 text-white/50 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={40} strokeWidth={1} />
            </button>

            <div className="flex flex-col items-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <Link 
                    to={link.path} 
                    className={`hud-item ${location.pathname === link.path ? 'text-white' : 'text-white/20'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.button 
                className="btn-primary mt-12 w-64 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                JOIN THE BRANCH
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Navbar
