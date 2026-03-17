import Hero from '../components/Hero'
import About from '../components/About'
import Committees from '../components/Committees'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="page-home overflow-x-hidden">
      <Hero />
      <About />
      <Committees />
      
      
    </div>
  )
}

export default Home
