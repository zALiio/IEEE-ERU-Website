import { motion } from 'framer-motion'
import { Globe, Cpu, Users, Award, ChevronRight } from 'lucide-react'
import '../styles/About.css'

const About = () => {
  return (
    <section className="about-section">
      <div className="about-glow" />

      <div className="about-container">
        <div className="about-grid">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="about-text-content"
          >
            <div className="about-badge">
              <span className="about-badge-line" />
              <span className="about-badge-text">Global Vision • Local Impact</span>
            </div>

            <h2 className="about-heading">
              About <br /> <span className="text-primary">IEEE ERU</span>
            </h2>

            <div className="about-quote">
              <p className="about-quote-text">
                "IEEE ERU is the local branch of the Institute of Electrical and Electronics Engineers at the Egyptian Russian University."
              </p>
            </div>

            <p className="about-description">
              As the largest global community for engineers, we connect you to a network that is internationally recognized, 
              giving you credibility and opportunities everywhere. Join experts, participate in projects, and develop your skills in a supportive network.
            </p>

            <div className="about-actions">
              <button className="btn-primary px-12 py-4">BECOME A MEMBER</button>
              <button className="glass px-12 py-4 font-bold border-white/5 hover:border-accent transition-colors flex items-center gap-2 group">
                LEARN MORE <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Visual Area */}
          <div className="about-visual-area">
             <motion.div 
               whileInView={{ opacity: 1, x: 0 }}
               initial={{ opacity: 0, x: 50 }}
               viewport={{ once: true }}
               className="about-card about-card-primary"
             >
                <div className="card-icon-bg">
                  <Award size={120} />
                </div>
                <Award className="card-icon text-accent" size={40} />
                <h3 className="card-title">Credibility</h3>
                <p className="card-desc">Internationally recognized membership for global academic and professional success.</p>
             </motion.div>
             
             <motion.div 
               whileInView={{ opacity: 1, x: 0 }}
               initial={{ opacity: 0, x: 50 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="about-card about-card-white"
             >
                <div className="card-icon-bg">
                  <Users size={120} />
                </div>
                <Users className="card-icon text-white" size={40} />
                <h3 className="card-title">Community</h3>
                <p className="card-desc">Join the world's largest community for innovators and engineering students.</p>
             </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="about-stats-row">
          {[
            { label: 'Global Network', value: '400K+', icon: Globe },
            { label: 'Technical Core', value: 'Experts', icon: Cpu },
            { label: 'Recognition', value: 'Global', icon: Award },
            { label: 'Heritage', value: 'Russian', icon: Award },
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
