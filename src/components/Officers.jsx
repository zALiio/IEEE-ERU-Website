import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap, FileText, ChevronRight, Binary } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getSettingValue } from '../lib/supabaseSettings';
import { mergeSiteCardsWithDefaults, SITE_CARD_DEFAULTS, SITE_CARDS_KEY } from '../lib/siteCards';
import '../styles/Officers.css';

const OfficerCard = ({ officer, index, OfficerIcon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 50 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8 }}
    className="officer-card group"
  >
    <div className="card-frame">
      <div className="card-hud-bits">
        <div className="hud-marker" />
        <div className="hud-marker-tr" />
      </div>
      <div className="clearance-badge">{officer.clearance}</div>
      <div className="officer-img-wrap">
        <img
          src={officer.image_url}
          alt={officer.name}
          className="officer-img"
          onError={(event) => {
            event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(officer.name || 'Officer')}&background=007acc&color=fff&size=512&bold=true`;
          }}
        />
      </div>
      <div className="officer-overlay">
        <div className="officer-role-tag">
          <OfficerIcon size={10} />
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
);

const Officers = () => {
  const [highCommand, setHighCommand] = useState(SITE_CARD_DEFAULTS.officers);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from('settings').select('key, value').eq('key', SITE_CARDS_KEY).single();
      if (error && error.code !== 'PGRST116') {
        console.error('High command cards fetch failed:', error);
        return;
      }
      const cards = mergeSiteCardsWithDefaults(getSettingValue(data ? [data] : [], SITE_CARDS_KEY, SITE_CARD_DEFAULTS));
      setHighCommand(cards.officers || []);
    };
    fetchCards();
  }, []);

  const iconMap = { ShieldCheck, Users, Zap, FileText };
  const normalizeRole = (role) => String(role || '').toUpperCase().replace(/\s+/g, '_');

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
        <div className="officers-tree">
          <div className="officers-tree-top">
            {highCommand
              .filter((officer) => ['CHAIRPERSON', 'VICE_CHAIRPERSON'].includes(normalizeRole(officer.role)))
              .map((officer, i) => {
                const OfficerIcon = iconMap[officer.icon] || ShieldCheck;
                return (
                  <OfficerCard
                    key={officer.id || i}
                    officer={officer}
                    index={i}
                    OfficerIcon={OfficerIcon}
                  />
                );
              })}
          </div>
          <div className="officers-tree-connector" />
          <div className="officers-tree-lower">
            {highCommand
              .filter((officer) => !['CHAIRPERSON', 'VICE_CHAIRPERSON'].includes(normalizeRole(officer.role)))
              .map((officer, i) => {
                const OfficerIcon = iconMap[officer.icon] || ShieldCheck;
                return (
                  <OfficerCard
                    key={officer.id || i}
                    officer={officer}
                    index={i + 2}
                    OfficerIcon={OfficerIcon}
                  />
                );
              })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Officers;
