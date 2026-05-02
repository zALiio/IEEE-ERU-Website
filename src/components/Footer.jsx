import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Instagram, Linkedin, Mail, Phone, Send, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/img/logo-white.webp'
import '../styles/Footer.css'

const Footer = () => {
  const [suggestion, setSuggestion] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const currentYear = new Date().getFullYear();

  const [footerData, setFooterData] = useState({
    phone: '+20 11 58913093',
    email: 'ieee.eru.sb@gmail.com',
    facebook: 'https://facebook.com/IEEE.ERU.SB',
    instagram: 'https://instagram.com/ieee_erusb/',
    linkedin: 'https://linkedin.com/company/ieee-eru-sb/'
  });

  useEffect(() => {
    const fetchFooterData = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'footer_settings').single();
      if (data && data.value) {
        try {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setFooterData(prev => ({ ...prev, ...parsed }));
            } catch (error) {
               console.error('Footer settings parse failed:', error);
            }
      }
    };
    fetchFooterData();
  }, []);

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestion.trim() || status === 'sending') return;
    
    setStatus('sending');
    try {
      const { error } = await supabase.from('suggestions').insert([{ content: suggestion }]);
      if (error) throw error;
      
      setStatus('success');
      setSuggestion('');
      
      // Reset back to idle after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
      } catch (error) { 
         console.error('Suggestion submission failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        <div className="footer-main-grid-single-row">
           
           {/* 01. THE UNIT LOGO */}
           <div className="footer-logo-unit flex items-center justify-center lg:justify-start">
              <motion.img 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                src={logo} 
                alt="IEEE ERU" 
                className="footer-logo-compact-row" 
              />
           </div>

           {/* 02. MISSION INTEL & CONTACTS */}
           <div className="footer-intel-unit">
              <div className="flex items-center gap-3 text-primary mb-4 lg:justify-start justify-center">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] md:text-[11px] font-black tracking-[0.4em] uppercase">Intelligence 105</span>
              </div>
              <p className="footer-description-compact md:text-sm text-white/30 tracking-wider">
                 The IEEE ERU Branch is a hub for innovation, leadership, and technical excellence. 
                 Building the next generation.
              </p>
              <div className="footer-contacts-compact mt-8">
                 <div className="contact-row-mini md:text-[11px]"><Phone size={14}/>{footerData.phone}</div>
                 <div className="contact-row-mini md:text-[11px] mt-2"><Mail size={14}/>{footerData.email}</div>
              </div>
           </div>

           {/* 03. SUGGESTION HUB */}
           <div className="footer-feedback-unit">
              <form onSubmit={submitSuggestion} className="flex flex-col gap-3 relative">
                 <textarea 
                    value={suggestion}
                    onChange={e => setSuggestion(e.target.value)}
                    className={`feedback-input-compact ${status === 'success' ? 'border-green-500/50' : ''}`} 
                    placeholder="Submit message..."
                    disabled={status === 'sending' || status === 'success'}
                 />
                 
                 <button 
                    type="submit" 
                    disabled={status === 'sending' || status === 'success'} 
                    className={`feedback-btn-mini group transition-all duration-500 ${
                      status === 'success' ? 'bg-green-500 text-white !border-green-500' : 
                      status === 'error' ? 'bg-red-500 text-white !border-red-500' : ''
                    }`}
                 >
                    <AnimatePresence mode="wait">
                       {status === 'idle' && (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between w-full">
                             <span className="md:text-[10px]">TRANSMIT</span>
                             <Send size={14} className="group-hover:translate-x-1" />
                          </motion.div>
                       )}
                       {status === 'sending' && (
                          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                             <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                             <span>SENDING...</span>
                          </motion.div>
                       )}
                       {status === 'success' && (
                          <motion.div key="success" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between w-full">
                             <span>INTEL SENT</span>
                             <CheckCircle size={14} />
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </button>

                 <AnimatePresence>
                    {status === 'success' && (
                       <motion.p 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute -bottom-6 left-0 text-[9px] font-black text-green-500 uppercase tracking-widest"
                       >
                          Mission Intel Transmitted Successfully.
                       </motion.p>
                    )}
                 </AnimatePresence>
              </form>
           </div>

        </div>

        {/* BOTTOM TERMINAL UPGRADED */}
        <div className="footer-bottom-terminal-compact" id="footer">
           <div className="footer-social-strip-mini">
              <a href={footerData.facebook} target="_blank" rel="noreferrer" className="social-node-micro"><Facebook size={18}/></a>
              <a href={footerData.instagram} target="_blank" rel="noreferrer" className="social-node-micro"><Instagram size={18}/></a>
              <a href={footerData.linkedin} target="_blank" rel="noreferrer" className="social-node-micro"><Linkedin size={18}/></a>
           </div>

           <div className="footer-identity-credits-compact">
              <div className="footer-id-flex-container">
                 <span className="text-[12px] text-white/40 uppercase font-black tracking-[0.2em]">© {currentYear} IEEE ERU</span>
              </div>
           </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
