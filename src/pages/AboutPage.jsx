import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, Zap, Users, Globe, Briefcase, Code, GraduationCap, ArrowUpRight, Shield, Cpu, Activity } from 'lucide-react';
import logo from '../assets/img/logo-blue.webp';
import Meta from '../components/Meta';
import '../styles/AboutPage.css';

const AboutPage = () => {
  const goals = [
    { num: "G-01", text: "Develop practical skills through real projects." },
    { num: "G-02", text: "Connect with IEEE branches and students nationwide." },
    { num: "G-03", text: "Join local and global innovation programs." },
    { num: "G-04", text: "Build strong professional networks." },
    { num: "G-05", text: "Prepare students for the job market." }
  ];

  const offerings = [
      { title: "Technical Development", icon: Code, desc: "Hands-on workshops in AI, robotics, embedded systems, and sustainable energy." },
      { title: "Global Access", icon: Globe, desc: "Connection to IEEE resources, technical talks, and a worldwide engineering network." },
      { title: "Leadership", icon: Cpu, desc: "Practical roles that help students organize, communicate, and deliver projects." },
      { title: "Industry Links", icon: Briefcase, desc: "Opportunities to meet industry guests, alumni, and university partners." },
      { title: "Technical Challenges", icon: Zap, desc: "Hackathons and competitions that strengthen problem-solving and teamwork." },
      { title: "Recognition", icon: GraduationCap, desc: "Certificates and achievements that strengthen student portfolios." }
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="about-page">
      <Meta 
        title="About Us"
        description="Learn about IEEE ERU Student Branch mission, vision, and strategic goals. We empower Egyptian Russian University students through technical excellence, leadership, and global networking."
        keywords="IEEE ERU About, Mission and Vision, Student Engineering Society ERU, Technical Education Egypt, Student Volunteering ERU"
      />
      {/* 01. THE ENERGY CORE (LOGO HERO) */}
      <section className="about-core-visual">
        <div className="core-logo-glow" />
        <div className="core-rings">
          <div className="ring-particle" />
          <div className="ring-particle" />
        </div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="core-logo-plate"
        >
           <img src={logo} alt="IEEE ERU Logo" className="about-logo-main" />
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5 }}
           className="text-center mt-12 px-6"
        >
           <div className="refined-badge mx-auto">MISSION_CRITICAL_CORE_V4.0</div>
                <p className="max-w-xl text-lg md:text-xl text-white/40 leading-relaxed font-light mx-auto">
                   Welcome to the strategic heart of innovation at ERU, where we shape the minds that will build the future.
                </p>
        </motion.div>
      </section>

      {/* 02. MISSION & VISION PANELS */}
      <section className="mission-vision-row">
         {/* MISSION */}
         <motion.div {...fadeUp} className="panel-strategic group">
            <div className="panel-hud-bits">
               <div className="hud-bit" />
               <div className="hud-bit" />
            </div>
            <span className="panel-label">PRIORITY_DIRECTIVE</span>
            <h2 className="panel-title-refined">
               <Target className="text-primary" />
               MISSION
            </h2>
            <p className="panel-content-text">
               We aim to build a student branch that gives students meaningful technical, leadership, and volunteering opportunities at our university.
            </p>
         </motion.div>

         {/* VISION */}
         <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="panel-strategic group">
            <div className="panel-hud-bits">
               <div className="hud-bit" />
               <div className="hud-bit" />
            </div>
            <span className="panel-label">FUTURE_STATE_TARGET</span>
            <h2 className="panel-title-refined">
               <Compass className="text-primary italic" />
               VISION
            </h2>
            <p className="panel-content-text">
               Our vision is to help students explore, learn, and lead while connecting them with opportunities that strengthen real-world skills.
            </p>
         </motion.div>
      </section>

      {/* 03. STRATEGIC GOALS (DOSSIER STYLE) */}
      <section className="goals-section-refined">
         <div className="section-header-refined">
            <div className="refined-badge">EXECUTION_STRATEGY</div>
            <h2 className="refined-title">OUR GOALS</h2>
            <div className="refined-underline" />
         </div>

         <div className="goals-dossier">
           {goals.map((goal, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="goal-entry"
             >
               <div className="entry-hex">{goal.num}</div>
               <div className="entry-text">{goal.text}</div>
               <ArrowUpRight className="ml-auto text-white/10" size={16} />
             </motion.div>
           ))}
         </div>
      </section>

      {/* 04. CAPABILITY HUB (WHAT WE OFFER) */}
      <section className="capability-section-refined">
         <div className="section-header-refined">
            <div className="refined-badge">MEMBER_VAL_PROPOSITION</div>
            <h2 className="refined-title">WHAT WE OFFER</h2>
            <div className="refined-underline" />
         </div>

         <div className="offerings-grid-clean">
           {offerings.map((offer, i) => (
             <motion.div 
               key={i}
               {...fadeUp}
               transition={{ delay: i * 0.1 }}
               className="clean-offer-card group"
             >
               <div className="offer-icon-box">
                  <offer.icon size={28} />
               </div>
               <h3 className="offer-name-clean">{offer.title}</h3>
               <p className="offer-desc-clean">{offer.desc}</p>
             </motion.div>
           ))}
         </div>
      </section>

      {/* HUD AUTH FOOTER */}
      <div className="max-w-7xl mx-auto mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[8px] font-mono tracking-[0.5em] text-white uppercase">
         <div className="flex items-center gap-2">
            <Shield size={10} className="text-primary" />
            AUTHORIZED_BRANCH_ACCESS: ERU_3932
         </div>
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
               <Activity size={10} className="text-primary" /> STATUS: OPERATIONAL
            </span>
            <span>DATA_POOL: ENCRYPTED</span>
         </div>
      </div>
    </div>
  );
};

export default AboutPage;
