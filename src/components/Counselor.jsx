import React from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap, Microscope, ShieldCheck, Zap, Globe, FileText, Users } from 'lucide-react';
import '../styles/Counselor.css';

import counselorImg from '../assets/img/counselor.webp';

const Counselor = () => {
  const stats = [
    { value: '73+', label: 'INTERNATL AWARDS', icon: Award },
    { value: '600+', label: 'RESEARCH PAPERS', icon: FileText },
    { value: '21', label: 'PATENTS HELD', icon: Globe },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const awards = [
    { title: "73+ International Awards", text: "Global recipient for excellence in innovation and leadership." },
    { title: "Top 40 under 40", text: "Ranked as a top business leader of tomorrow worldwide." },
    { title: "Phi Beta Delta Fellow", text: "Honored fellowship of the International Honor Society." }
  ];

  const leadership = [
    { title: "London Metropolitan University", text: "Senior Professor and International Academic Leader." },
    { title: "ERU Data Science", text: "Department Head driving future-tech engineering at the heart of ERU." },
    { title: "The American University (AUC)", text: "Professor of Electrical and Electronic Engineering." }
  ];

  const research = [
    { title: "2 PhDs & 3 MSc Degrees", text: "Advanced academic qualifications plus an MBA and 6 Diplomas." },
    { title: "60,000+ Teaching Hours", text: "Legacy of education scaled from small groups to 14,000+ per session." },
    { title: "Global Senior Member", text: "Distinguished IEEE, ACM, and SPIE Registered Professional Engineer." }
  ];

  return (
    <section className="counselor-section" id="counselor">
      <div className="counselor-container">
        
        {/* Section Header */}
        <div className="counselor-header">
          <motion.div {...fadeUp} className="counselor-sys-badge">
            <span className="badge-status-dot" />
            UNIFIED_BRANCH_ADVISORY_CORE
          </motion.div>
          <motion.h2 {...fadeUp} className="counselor-title">
            THE <span className="text-primary">COUNSELOR</span>
            <div className="counselor-underline" />
          </motion.h2>
        </div>

        {/* Top Profile: Focused Image & Bio */}
        <div className="counselor-top-profile">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="counselor-portrait-wrap"
          >
            <div className="counselor-image-wrapper group">
              <div className="hud-tag-top">BIO_DATA_SCAN_V2</div>
              <div className="counselor-scan-line" />
              <img 
                src={counselorImg} 
                alt="Dr. Wael Badawy" 
                className="counselor-img"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=Wael+Badawy&background=007acc&color=fff&size=512`;
                }}
              />
              <div className="hud-tag-bottom">ERU_CMD_CENTER</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="counselor-bio-wrap"
          >
            <div className="counselor-name-block">
              <span className="counselor-rank">Senior Branch Counselor</span>
              <h3 className="counselor-full-name">DR. WAEL <span className="text-primary">BADAWY</span></h3>
              <p className="counselor-intro-text">
                Visionary leader in innovation and academic excellence. 
                Combining over 60,000 hours of strategic education with a legacy of globally recognized contributions.
              </p>
            </div>

            {/* Tactical Stats Matrix */}
            <div className="counselor-stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-box">
                   <div className="stat-header">
                      <stat.icon size={14} className="text-primary" />
                      <span className="stat-label">{stat.label}</span>
                   </div>
                   <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Distributed Data Grid - Aligned with Members Cards */}
        <div className="counselor-details-grid">
          
          {/* Column 1: Recognition */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="detail-panel">
            <div className="panel-header">
              <Award className="panel-icon" />
              <span className="panel-title">Global Impact</span>
            </div>
            <div className="detail-list">
              {awards.map((item, i) => (
                <div key={i} className="detail-item group">
                  <div className="item-bullet" />
                  <div className="item-text">
                    <strong>{item.title}</strong>
                    <summary>{item.text}</summary>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Governance */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="detail-panel">
            <div className="panel-header">
              <GraduationCap className="panel-icon" />
              <span className="panel-title">Academic Governance</span>
            </div>
            <div className="detail-list">
              {leadership.map((item, i) => (
                <div key={i} className="detail-item group">
                  <div className="item-bullet" />
                  <div className="item-text">
                    <strong>{item.title}</strong>
                    <summary>{item.text}</summary>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Column 3: Expertise */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="detail-panel">
            <div className="panel-header">
              <Microscope className="panel-icon" />
              <span className="panel-title">Core Expertise</span>
            </div>
            <div className="detail-list">
              {research.map((item, i) => (
                <div key={i} className="detail-item group">
                  <div className="item-bullet" />
                  <div className="item-text">
                    <strong>{item.title}</strong>
                    <summary>{item.text}</summary>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Counselor;
