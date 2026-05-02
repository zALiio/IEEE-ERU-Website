import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, ArrowLeft, Loader2, 
  ShieldCheck, Database, Zap, FileText, 
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Meta from '../components/Meta';
import '../styles/Events.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
            const { data } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) setEvent(data);
      } catch (err) {
        console.error("Dossier Access Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-primary font-black uppercase tracking-[1em]">
       <Loader2 className="animate-spin" size={40} />
       Decrypting Mission Intel...
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
       <h1 className="text-4xl font-black mb-8 italic text-primary">404_INTEL_GHOST</h1>
       <p className="text-white/40 mb-12">This mission log does not exist in the neural network.</p>
       <Link to="/events" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-primary transition-all text-sm font-black uppercase tracking-widest">
         Return to Base
       </Link>
    </div>
  );

  // Gallery Logic
  const gallery = event.gallery && event.gallery.length > 0 
    ? event.gallery 
    : [event.image_url, event.image_url]; // Fallback to cover if no gallery

  const nextSlide = () => setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  const prevSlide = () => setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="event-detail-page bg-[#020408]">
      <Meta 
        title={event.title}
        description={event.description.substring(0, 160)}
        image={event.image_url}
        keywords={`${event.title}, IEEE ERU Event, ${event.location}, Engineering Workshop, ERU Mission`}
      />
      {/* 01. NAVIGATION & HEADER */}
      <header className="detail-header-refined">
        <Link to="/events" className="flex items-center gap-3 text-white/30 hover:text-primary transition-all mb-12 group">
           <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary">
              <ArrowLeft size={16} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest">Back to Archives</span>
        </Link>
        
        <motion.h1 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          className="detail-title-new"
        >
          {event.title}
        </motion.h1>

        <div className="detail-meta-bar">
           <div className="meta-item-refined">
              <span>DEPLOYMENT_DATE</span>
              <span>{event.date}</span>
           </div>
           <div className="w-[1px] h-8 bg-white/5 hidden md:block" />
           <div className="meta-item-refined">
              <span>TARGET_LOCATION</span>
              <span>{event.location}</span>
           </div>
           <div className="w-[1px] h-8 bg-white/5 hidden md:block" />
           <div className="meta-item-refined">
              <span>MISSION_ID</span>
              <span className="text-white/40">#{String(event.id).slice(-6).toUpperCase()}</span>
           </div>
        </div>
      </header>

      {/* 02. CINEMATIC STAGE */}
      <section className="detail-visual-stage group">
        <div className="stage-hud-overlay" />
        <img src={event.image_url} alt={event.title} className="detail-main-img" />
        <div className="stage-badge">MISSION_ASSET_01</div>
        
        <div className="absolute top-8 right-8 flex gap-4">
          <div className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/40">
            <ShieldCheck size={20} />
          </div>
        </div>
      </section>

      {/* 03. MISSION INTEL REPORT */}
      <div className="detail-content-wrap">
         <motion.div 
           initial={{ opacity: 0 }} 
           whileInView={{ opacity: 1 }}
           className="detail-summary-text"
         >
            {event.description}
         </motion.div>

         <div className="mission-intel-grid">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="intel-block">
               <div className="flex items-center gap-4 mb-8 text-primary">
                  <FileText size={20} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Intelligence Report</h4>
               </div>
               <div className="text-white/50 text-base leading-loose font-light space-y-6">
                  {event.full_description?.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="intel-block">
               <div className="flex items-center gap-4 mb-8 text-primary">
                  <Database size={20} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Technical Schematics</h4>
               </div>
               <div className="space-y-6">
                  <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                     <span className="text-[10px] font-black text-white/20 block mb-2">STATUS</span>
                     <span className="text-sm text-white font-bold uppercase tracking-wider">Operational Success</span>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                     <span className="text-[10px] font-black text-white/20 block mb-2">SECURITY_LEVEL</span>
                     <span className="text-sm text-white font-bold uppercase tracking-wider">Level 4 Certified</span>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                     <span className="text-[10px] font-black text-white/20 block mb-2">COMMITTEE</span>
                     <span className="text-sm text-white font-bold uppercase tracking-wider">Multiple Task Forces</span>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      {/* 04. TACTICAL MISSION DECK (IMAGE SLIDER) */}
      <section className="max-w-7xl mx-auto mb-40 px-6">
         <div className="flex items-center justify-between mb-16">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Mission <span className="text-primary italic">Visuals</span></h3>
            <div className="flex gap-4">
               <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-white"><ChevronLeft size={20}/></button>
               <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-white"><ChevronRight size={20}/></button>
            </div>
         </div>

         <div className="deck-viewer-wrap">
            <div className="deck-stage">
               {gallery.map((img, idx) => {
                  let position = "hidden-state";
                  if (idx === activeImageIndex) position = "active";
                  else if (idx === (activeImageIndex - 1 + gallery.length) % gallery.length) position = "prev";
                  else if (idx === (activeImageIndex + 1) % gallery.length) position = "next";

                  return (
                     <div key={idx} className={`deck-item ${position}`}>
                        <div className="scan-line" />
                        <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-10 left-10 flex items-center gap-4">
                           <div className="w-10 h-[10px] bg-primary border-r-2 border-white/20" />
                           <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">ASSET_{idx + 1}</span>
                        </div>
                     </div>
                   );
               })}
            </div>

            <div className="deck-hud-nav">
               {gallery.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`hud-dot ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                     <div className="dot-fill" />
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 05. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto text-center py-40">
         <div className="w-16 h-1 bg-primary/20 mx-auto mb-12 rounded-full" />
         <h2 className="text-3xl md:text-5xl font-black text-white uppercase mb-12 tracking-tighter">Ready for the Next <span className="text-primary">Operation?</span></h2>
         <Link to="/join" className="group relative inline-flex items-center gap-4 px-12 py-6 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10">Join the Collective</span>
            <Zap size={20} className="relative z-10" />
         </Link>
      </section>
    </div>
  );
};

export default EventDetailPage;
