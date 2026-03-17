import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import flag from '../assets/img/falg-white.webp'
import '../styles/Footer.css'

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          
          <div className="footer-logo-area">
            <motion.img 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              src={flag} 
              alt="IEEE ERU Logo" 
              className="footer-logo" 
            />
            <p className="footer-mission">
              IEEE Egyptian Russian University is a hub for innovation, leadership, and technical excellence. 
              Join a global network of over 400,000 members worldwide.
            </p>
          </div>

          <div>
            <h4 className="footer-links-title">Quick Links</h4>
            <ul className="footer-list">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/about" className="footer-link">About Us</a></li>
              <li><a href="/events" className="footer-link">Events</a></li>
              <li><a href="/committees" className="footer-link">Committees</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-links-title">Connect</h4>
            <ul className="footer-list text-white/50 text-sm">
              <li className="flex items-center gap-3"><MapPin size={16} /> ERU University, Badr City</li>
              <li className="flex items-center gap-3"><Phone size={16} /> +20 123 456 7890</li>
              <li className="flex items-center gap-3"><Mail size={16} /> info@ieee-eru.org</li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 IEEE ERU. Designed by IEEE ERU Developers Team.</p>
          <div className="footer-socials">
             <a href="#" className="social-icon-link"><Facebook size={20} /></a>
             <a href="#" className="social-icon-link"><Twitter size={20} /></a>
             <a href="#" className="social-icon-link"><Instagram size={20} /></a>
             <a href="#" className="social-icon-link"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
