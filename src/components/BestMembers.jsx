import { motion } from 'framer-motion'
import { Award, Zap, Code, Users } from 'lucide-react'
import '../styles/BestMembers.css'

// Assuming images will be added to assets/img/
// Use placeholders or actual paths (you mentioned you will add them)
// Use local path strings instead of static imports to prevent Vite from crashing if files are missing.
// Once you add the files to assets/img/, you can revert to static imports for optimization.
import rokayaImg from '../assets/img/rokaya.webp';
import yasserImg from '../assets/img/yasser.webp';
import atefImg from '../assets/img/atef.webp';

const members = [
  {
    name: "Rokaya Hussein",
    role: "Marketing",
    unit: "UNIT_MKT",
    rank: "ELITE_X",
    icon: <Users size={12} />,
    image: rokayaImg
  },
  {
    name: "Yasser Mogahed",
    role: "Projects",
    unit: "UNIT_PROJ",
    rank: "ELITE_P",
    icon: <Code size={12} />,
    image: yasserImg
  },
  {
    name: "Atef Mohamed",
    role: "PR",
    unit: "UNIT_PR",
    rank: "ELITE_R",
    icon: <Zap size={12} />,
    image: atefImg
  }
]

const BestMembers = () => {
  return (
    <section className="best-members-section">
      <div className="best-container">
        
        {/* Section Header - Aligned with Committees Style */}
        <div className="best-header">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="best-sys-badge"
          >
            <span className="badge-status-dot" />
            ELITE_OPERATIVES_REGISTRY_V2.0
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="best-title"
          >
            BEST <span className="text-primary ">MEMBERS</span>
            <div className="best-underline" />
          </motion.h2>
        </div>

        {/* Member Grid */}
        <div className="best-grid">
          {members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="member-card-wrapper group"
            >
              <div className="member-card">
                {/* Tactical Markers */}
                <div className="card-marker marker-top-left">
                    <span className="status-indicator" />
                    {member.unit}
                </div>
                <div className="card-marker marker-top-right">
                  RANK:{member.rank}
                </div>
                
                {/* Avatar Visual Area */}
                <div className="member-visual-area">
                  <div className="member-energy-ring" />
                  <div className="member-avatar-frame">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="member-img" 
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=" + member.name + "&background=0D1117&color=007ACC"
                      }}
                    />
                  </div>
                </div>

                {/* Member Details */}
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <div className="member-role">
                      <span className="flex items-center gap-2">
                        {member.icon} {member.role}
                      </span>
                  </div>
                </div>

                {/* Achievement Badge */}
                <div className="excellence-badge">
                   EXCELLENCE ACHIEVED
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default BestMembers
