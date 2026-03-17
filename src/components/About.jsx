import { motion } from 'framer-motion'
import logo from '../assets/img/logo-white.webp'
import '../styles/About.css'

const About = () => {
  return (
    <section className="about-section-codex">
      {/* Background Subtle Energy */}
      <div className="about-wave-bg" />
      
      <div className="about-container">
        
        {/* Section Header */}
        <div className="codex-header">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="codex-label"
          >
            <span className="codex-label-dot" />
            <span className="codex-label-text">WHO WE ARE</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="codex-title"
          >
            IEEE <span className="text-primary italic">ERU</span>
          </motion.h2>
        </div>

        <div className="about-codex-grid">
          
          {/* Left: Content Manifesto Blocks */}
          <div className="codex-content">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="codex-block"
            >
              <div className="codex-tag">UNIT_01</div>
              <p className="codex-text primary">
                IEEE ERU is the local branch of IEEE (Institute of Electrical and Electronics Engineers) at the Egyptian Russian University.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="codex-block"
            >
              <div className="codex-tag">UNIT_02</div>
              <p className="codex-text">
                IEEE is the largest global community for engineers, connecting students and professionals around the world. Its membership is internationally recognized, giving you credibility and opportunities everywhere.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="codex-block"
            >
              <div className="codex-tag">UNIT_03</div>
              <p className="codex-text">
                Choosing IEEE ERU means you can learn from experts, participate in projects and workshops, develop your skills, and join a supportive network that helps you grow academically and professionally.
              </p>
            </motion.div>
          </div>

          {/* Right: Pulsing Energy Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="codex-visual"
          >
            <div className="energy-core-wrapper">
              {/* Optimized Waves - Now handled by CSS for better performance */}
              <div className="energy-wave wave-1" />
              <div className="energy-wave wave-2" />
              <div className="energy-wave wave-3" />
              <div className="energy-wave wave-4" />
              
              <motion.div 
                className="core-logo-container"
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <img src={logo} alt="IEEE ERU Logo" className="codex-logo-pulsing" />
              </motion.div>

              
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default About
