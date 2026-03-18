import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Partners.css';

const Partners = () => {
  // Fixed count to match the 6 existing assets in the partners folder.
  const partnerCount = 6; 
  const partners = Array.from({ length: partnerCount }, (_, i) => ({
    id: i + 1,
    name: `ERU Partner ${i + 1}`,
    path: new URL(`../assets/img/partners/${i + 1}.webp`, import.meta.url).href
  }));

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <section className="partners-section" id="partners">
      <div className="partners-glow" />
      
      {/* Header stays inside container */}
      <div className="partners-container">
        <div className="partners-header">
          <motion.div {...fadeUp} className="partners-sys-badge">
             <span className="badge-status-dot" />
             AUTHORIZED_STRATEGIC_ALLIANCES
          </motion.div>
          <motion.h2 {...fadeUp} className="partners-title">
             OUR <span className="text-primary">PARTNERS</span>
             <div className="partners-underline" />
          </motion.h2>
        </div>
      </div>

      {/* Marquee wraps outside container for FULL WIDTH */}
      <div className="partners-marq-wrap">
        <div className="marquee-row">
          <div className="marquee-content h-full">
            {[...partners, ...partners].map((p, i) => (
              <div key={`${p.id}-${i}`} className="partner-card group">
                 <img 
                    src={p.path} 
                    alt={p.name} 
                    className="partner-logo"
                 />
              </div>
            ))}
          </div>
        </div>

        <div className="marquee-row">
          <div className="marquee-content-rev h-full">
            {[...partners, ...partners].map((p, i) => (
              <div key={`${p.id}-rev-${i}`} className="partner-card group">
                 <img 
                    src={p.path} 
                    alt={p.name} 
                    className="partner-logo"
                 />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
