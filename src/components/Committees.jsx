import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowRight, Settings, Rocket, Camera, BarChart3, Palette, Video, Users2, MessageSquare, ShieldCheck, Activity, ChevronRight } from 'lucide-react'
import '../styles/Committees.css'

const CommitteeFlipCard = ({ name, summary, responsibilities, icon: Icon, index }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="committee-flip-perspective">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
        className="committee-flip-inner"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face: The 'Command Center' Block Style you liked */}
        <div className="card-face-v3 card-front-v3">
          <div className="block-background-v3">
            <div className="bg-number-v3">0{index + 1}</div>
            <div className="bg-grid-v3" />
          </div>

          <div className="block-content-v3">
            <div className="block-header-v3">
              <div className="icon-wrapper-v3">
                <Icon size={24} />
              </div>
              <div className="status-indicator-v3">
                <div className="pulse-dot-v3" />
                <span>UNIT_READY</span>
              </div>
            </div>

            <h3 className="block-title-v3">{name}</h3>
            <p className="block-summary-v3">{summary}</p>

            <button 
              onClick={() => setIsFlipped(true)}
              className="action-btn-v3"
            >
              Learn More <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Back Face: Reverting to the Terminal Data View you liked */}
        <div className="card-face-v3 card-back-v3">
          <div className="back-header-clean">
            <button 
              onClick={() => setIsFlipped(false)} 
              className="back-close-accent"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="back-body-clean">
            <div className="responsibilities-list">
              {responsibilities.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isFlipped ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className="resp-item-clean"
                >
                  <ChevronRight size={18} className="resp-icon-v3" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="back-footer-clean">
            <div className="footer-line" />
            <span className="footer-ref">REFERENCE_LOG_0X{index + 1}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const Committees = () => {
  const data = [
    {
      name: 'Operations',
      icon: Settings,
      summary: 'Ensure smooth execution of IEEE ERU activities by handling logistics and organizing events from start to finish.',
      responsibilities: [
        'Arrange venues, equipment, and catering.',
        'Organize event schedules, coordinate volunteers.',
        'Collaborate with teams for resource efficiency.'
      ]
    },
    {
      name: 'Projects',
      icon: Rocket,
      summary: 'Research, create, and reinvent innovative ideas for competitions and events within IEEE ERU.',
      responsibilities: [
        'Research and invent new competition ideas.',
        'Recreate existing events with high creativity.',
        'Collaborate with teams to implement concepts.'
      ]
    },
    {
      name: 'Multimedia',
      icon: Camera,
      summary: 'Capture memorable moments and key events to showcase IEEE ERU’s vibrant community through photos and videos.',
      responsibilities: [
        'Capture high-quality event photos and videos.',
        'Coordinate with designers for seamless content.',
        'Support overall marketing with visual assets.'
      ]
    },
    {
      name: 'Marketing',
      icon: BarChart3,
      summary: 'Promote IEEE ERU through strategic campaigns, social media, and audience engagement.',
      responsibilities: [
        'Plan and execute marketing campaigns.',
        'Manage social media accounts and calendars.',
        'Analyze metrics and optimize outreach.'
      ]
    },
    {
      name: 'Graphic Design',
      icon: Palette,
      summary: 'Create eye-catching visuals to represent our identity and support the branch with creative content.',
      responsibilities: [
        'Design logos, posters, and social graphics.',
        'Ensure brand consistency across all platforms.',
        'Prepare files for print and digital use.'
      ]
    },
    {
      name: 'Video Editing',
      icon: Video,
      summary: 'Produce engaging video content that promotes IEEE ERU events and activities.',
      responsibilities: [
        'Edit event footage into polished videos.',
        'Add effects, transitions, and soundtracks.',
        'Work closely with photography and design.'
      ]
    },
    {
      name: 'Human Resources',
      icon: Users2,
      summary: 'Support the branch by recruiting, coordinating, and engaging our volunteers and members.',
      responsibilities: [
        'Manage recruitment and onboarding.',
        'Track participation and member engagement.',
        'Facilitate communication and resolution.'
      ]
    },
    {
      name: 'Public Relations',
      icon: MessageSquare,
      summary: 'Manage IEEE ERU’s external communications and maintain a positive global image.',
      responsibilities: [
        'Write press releases and newsletters.',
        'Build relationships with university contacts.',
        'Represent IEEE ERU at community events.'
      ]
    }
  ]

  return (
    <section id="committees" className="committees-section-v3">
      <div className="section-glow-v3" />
      <div className="committees-container">
        <div className="comm-header-v3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="sys-badge-v3"
          >
            <Activity size={12} />
            <span>SYSTEM_CORE_UNITS</span>
          </motion.div>
          <motion.h2 className="comm-title-v3">Our Committees</motion.h2>
          <div className="comm-underline-v3" />
        </div>

        <div className="committees-grid-v3">
          {data.map((comm, i) => (
            <motion.div
              key={comm.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <CommitteeFlipCard {...comm} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Committees
