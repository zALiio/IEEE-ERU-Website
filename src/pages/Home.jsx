import Meta from '../components/Meta'
import Hero from '../components/Hero'
import About from '../components/About'
import Officers from '../components/Officers'
import Counselor from '../components/Counselor'
import Committees from '../components/Committees'
import BestMembers from '../components/BestMembers'
import Partners from '../components/Partners'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="page-home overflow-x-hidden">
      <Meta 
        title="Official Student Branch"
        description="IEEE Egyptian Russian University (IEEE ERU) is a premier technical student branch in Cairo, Egypt. Discover our missions, units, events, and how to enlist in our elite technical community."
        keywords="IEEE, ERU, Egyptian Russian University, Student Activity, Engineering, Technology, Innovation, Student Branch Cairo, IEEE Egypt, IEEE ERU SB"
      />
      <Hero />
      <About />
      <Committees />
      <BestMembers />
      <Counselor />
      <Officers />
      <Partners />
    </div>
  )
}

export default Home
