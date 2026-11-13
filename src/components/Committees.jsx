import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, ArrowRight, Settings, Rocket, Camera, BarChart3, Palette, Video, Users2, MessageSquare, ShieldCheck, Activity, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getSettingValue } from '../lib/supabaseSettings'
import { SITE_CARD_DEFAULTS, SITE_CARDS_KEY } from '../lib/siteCards'
import '../styles/Committees.css'

const iconMap = { Settings, Rocket, Camera, BarChart3, Palette, Video, Users2, MessageSquare, ShieldCheck }

const CommitteeFlipCard = ({ name, summary, responsibilities, icon: Icon, image_url: imageUrl, index }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="committee-flip-perspective">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
        className="committee-flip-inner"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="card-face-v3 card-front-v3">
          <div className="block-background-v3">
            {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
            <div className="bg-number-v3">0{index + 1}</div>
            <div className="bg-grid-v3" />
          </div>
          <div className="block-content-v3">
            <div className="block-header-v3">
              <div className="icon-wrapper-v3"><Icon size={24} /></div>
              <div className="status-indicator-v3"><div className="pulse-dot-v3" /><span>UNIT_READY</span></div>
            </div>
            <h3 className="block-title-v3">{name}</h3>
            <p className="block-summary-v3">{summary}</p>
            <button onClick={() => setIsFlipped(true)} className="action-btn-v3">Learn More <ArrowRight size={14} /></button>
          </div>
        </div>

        <div className="card-face-v3 card-back-v3">
          <div className="back-header-clean">
            <button onClick={() => setIsFlipped(false)} className="back-close-accent"><X size={18} /></button>
          </div>
          <div className="back-body-clean">
            <div className="responsibilities-list">
              {(responsibilities || []).map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={isFlipped ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 + (idx * 0.1) }} className="resp-item-clean">
                  <ChevronRight size={18} className="resp-icon-v3" /><span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="back-footer-clean"><div className="footer-line" /><span className="footer-ref">REFERENCE_LOG_0X{index + 1}</span></div>
        </div>
      </motion.div>
    </div>
  )
}

const Committees = () => {
  const [data, setData] = useState(SITE_CARD_DEFAULTS.committees)

  useEffect(() => {
    const fetchCards = async () => {
      const { data: setting, error } = await supabase.from('settings').select('key, value').eq('key', SITE_CARDS_KEY).single()
      if (error && error.code !== 'PGRST116') {
        console.error('Committee cards fetch failed:', error)
        return
      }
      const cards = getSettingValue(setting ? [setting] : [], SITE_CARDS_KEY, SITE_CARD_DEFAULTS)
      setData(cards.committees || SITE_CARD_DEFAULTS.committees)
    }
    fetchCards()
  }, [])

  return (
    <section id="committees" className="committees-section-v3">
      <div className="section-glow-v3" />
      <div className="committees-container">
        <div className="comm-header-v3">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="sys-badge-v3"><Activity size={12} /><span>SYSTEM_CORE_UNITS</span></motion.div>
          <motion.h2 className="comm-title-v3">Our Committees</motion.h2>
          <div className="comm-underline-v3" />
        </div>
        <div className="committees-grid-v3">
          {data.map((comm, i) => (
            <motion.div key={comm.id || comm.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <CommitteeFlipCard {...comm} icon={iconMap[comm.icon] || Settings} index={i} />
            </motion.div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Link to="/join" className="inline-flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-white transition-all hover:-translate-y-1 hover:bg-primary hover:border-primary">
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Committees
