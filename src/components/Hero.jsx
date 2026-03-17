import { motion } from 'framer-motion'
import heroImg from '../assets/img/home.webp'
import '../styles/Hero.css'

const Hero = () => {
  return (
    <section className="hero-section">
      <div 
        className="hero-bg"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="hero-overlay-dark" />
        <div className="hero-overlay-gradient" />
      </div>

      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-4">
            <h1 className="hero-title">
              IEEE <span className="hero-title-accent">ERU</span>
            </h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="university-tag"
          >
            <div className="tag-line" />
            <span className="tag-text">
              Egyptian Russian University
            </span>
            <div className="tag-line" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="scroll-indicator"
      >
        <div className="scroll-line" />
      </motion.div>
    </section>
  )
}

export default Hero
