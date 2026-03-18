import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap, FileText, ChevronRight, Binary } from 'lucide-react';
import '../styles/Officers.css';

import tasbeehImg from '../assets/img/tasbeeh.webp';
import zahyImg from '../assets/img/zahy.webp';
import azazyImg from '../assets/img/azazy.webp';
import hamssaImg from '../assets/img/hamssa.webp';

const Officers = () => {
  const highCommand = [
    {
       name: "TASBEEH MAHMOUD",
       role: "BRANCH_CHAIR",
       icon: ShieldCheck,
       clearance: "CLEARANCE_LVL_MAX",
       id: "CH-001",
       img: tasbeehImg
    },
    {
       name: "ZAHY ADEL",
       role: "VICE_CHAIR",
       icon: Users,
       clearance: "CLEARANCE_LVL_01",
       id: "VC-001",
       img: zahyImg
    },
    {
       name: "MOHAMED EL AZAZY",
       role: "TREASURER",
       icon: Zap,
       clearance: "CLEARANCE_LVL_01",
       id: "TR-001",
       img: azazyImg
    },
    {
       name: "HAMSSA HOSSAM",
       role: "SECRETARY",
       icon: FileText,
       clearance: "CLEARANCE_LVL_01",
       id: "SC-001",
       img: hamssaImg
    }
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <section className="officers-section" id="officers">
      {/* Background Kinetic Text */}
      <div className="officers-bg-text">COMMAND</div>
      
      <div className="officers-container">
        
        {/* Tactical Header */}
        <div className="officers-header">
           <motion.div {...fadeUp} className="officers-sys-badge">
              <span className="badge-status-dot" />
              UNIFIED_STRATEGIC_COUNCIL
           </motion.div>
           <motion.h2 {...fadeUp} className="officers-title">
              HIGH <span className="text-primary">COMMAND</span>
              <div className="officers-underline" />
           </motion.h2>
        </div>

        {/* Tactical Formation (Grid) */}
        <div className="officers-grid">
          {highCommand.map((officer, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.9, y: 50 }}
               whileInView={{ opacity: 1, scale: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.8 }}
               className="officer-card group"
            >
               <div className="card-frame">
                 {/* Decorative HUD bits */}
                 <div className="card-hud-bits">
                    <div className="hud-marker" />
                    <div className="hud-marker-tr" />
                 </div>
                 
                 <div className="clearance-badge">{officer.clearance}</div>

                 {/* Profile Portrait */}
                 <div className="officer-img-wrap">
                    <img 
                       src={officer.img} 
                       alt={officer.name} 
                       className="officer-img"
                       onError={(e) => {
                         e.target.src = `https://ui-avatars.com/api/?name=${officer.name.replace(' ', '+')}&background=007acc&color=fff&size=512&bold=true`;
                       }}
                    />
                 </div>

                 {/* Tactical Data Overlay */}
                 <div className="officer-overlay">
                    <div className="officer-role-tag">
                       <officer.icon size={10} />
                       {officer.role}
                    </div>
                    <div className="officer-name">{officer.name}</div>
                    <div className="flex items-center justify-between">
                       <span className="officer-credentials">{officer.id}</span>
                       <div className="flex gap-1">
                          <Binary size={10} className="text-primary/40" />
                          <ChevronRight size={10} className="text-primary/40 group-hover:text-primary transition-all duration-300" />
                       </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Officers;
