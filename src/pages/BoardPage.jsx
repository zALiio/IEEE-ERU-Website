import { motion } from 'framer-motion'
import { ShieldCheck, Users, Layers3, Award, ArrowRight } from 'lucide-react'
import Meta from '../components/Meta'
import Counselor from '../components/Counselor'
import Officers from '../components/Officers'
import Committees from '../components/Committees'
import BestMembers from '../components/BestMembers'
import HighBoard from '../components/HighBoard'

const boardSections = [
  {
    title: 'University Leadership',
    description: 'Academic guidance and strategic oversight for the branch.',
    icon: ShieldCheck,
    anchor: '#counselor',
  },
  {
    title: 'Executive Board',
    description: 'Core officers directing the branch operations and mission.',
    icon: Users,
    anchor: '#high-board',
  },
  {
    title: 'Committee Units',
    description: 'Specialized teams that power projects, media, outreach, and logistics.',
    icon: Layers3,
    anchor: '#committees',
  },
  {
    title: 'Best Members',
    description: 'Highlighted members shaping the branch identity and public face.',
    icon: Award,
    anchor: '#best-members',
  },
]

const BoardPage = () => {
  return (
    <div className="overflow-x-hidden bg-background text-white">
      <Meta
        title="Leadership Board"
        description="IEEE ERU leadership board and branch structure, presented in the same tactical theme as the rest of the website."
        keywords="IEEE ERU board, leadership, officers, counselor, committees, best members"
      />

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,122,204,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%,transparent)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-32 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-black tracking-[0.4em] uppercase text-primary mb-6">
              <ShieldCheck size={12} /> Branch Command Overview
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none">
              Leadership <span className="text-primary">Board</span>
            </h1>
            <p className="mt-6 max-w-2xl text-white/50 text-sm md:text-base leading-relaxed">
              A structured overview of IEEE ERU’s leadership layers, presented in the same clean tactical language used across the website. This page is inspired by the board-style idea you shared, but rebuilt for IEEE ERU’s identity.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {boardSections.map((section, index) => {
                const Icon = section.icon

                return (
                  <motion.a
                    key={section.title}
                    href={section.anchor}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl hover:border-primary/30 hover:bg-primary/[0.04] transition-all"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Icon className="text-primary/80 group-hover:text-primary transition-colors" size={18} />
                      <ArrowRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                    <h2 className="text-white font-black uppercase tracking-tight text-lg mb-2">{section.title}</h2>
                    <p className="text-white/35 text-xs leading-relaxed">{section.description}</p>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <Counselor />
        <div id="high-board">
          <HighBoard />
        </div>
        <Officers />
        <Committees />
        <div id="best-members">
          <BestMembers />
        </div>
      </div>
    </div>
  )
}

export default BoardPage