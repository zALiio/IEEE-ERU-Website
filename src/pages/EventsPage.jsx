import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Meta from '../components/Meta';
import '../styles/Events.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    window.scrollTo(0, 0);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  const featured = events.find(e => e.category === 'UPCOMING_ANNOUNCEMENT');
  const pastEvents = events.filter(e => e.category === 'PAST_EVENT');

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-primary font-black uppercase tracking-[1em]">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       Syncing Files...
    </div>
  );

  // Helper for conditional links
  const UpcomingWrapper = ({ children, event }) => {
    if (event.external_link) {
      return (
        <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="block">
           {children}
        </a>
      );
    }
    return <Link to={`/events/${event.id}`}>{children}</Link>;
  };

  return (
    <div className="events-page">
      <Meta 
        title="Events Archive"
        description="Explore IEEE ERU Mission History. From technical workshops to global hackathons, browse our comprehensive operations log and join our upcoming events at Egyptian Russian University."
        keywords="IEEE Events, ERU Workshops, Engineering Conferences Egypt, Student Branch Activities, IEEE ERU Gallery, Technical Sessions"
      />
      <div className="events-header">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-primary/40" />
            <span className="text-[10px] font-black tracking-[0.6em] text-white/40 uppercase">Dossier Access Authorized</span>
         </motion.div>
         <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="events-title">
            OPERATIONS <span className="text-primary italic">& LOGS</span>
         </motion.h1>
         <div className="w-12 h-1 bg-primary/20 rounded-full mt-4" />
      </div>

      {featured && (
         <section className="upcoming-hero group mb-40">
            <UpcomingWrapper event={featured}>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="upcoming-card">
                  <div className="upcoming-visual-stage">
                     <div className="upcoming-visual-bg" />
                     <img src={featured.image_url} alt={featured.title} className="upcoming-img" />
                     <div className="upcoming-badge">LEVEL_CRITICAL</div>
                  </div>
                  
                  <div className="upcoming-content">
                     <div className="flex items-center gap-3 mb-6 opacity-60">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,122,204,1)]" />
                        <span className="text-[10px] font-black tracking-[0.5em] text-white uppercase">FEATURED_OPERATION</span>
                     </div>
                     
                     <h2 className="upcoming-name italic !mb-10 group-hover:text-primary transition-all duration-500">
                        {featured.title}
                     </h2>
                     
                     <div className="flex flex-wrap gap-10 mb-12 pb-10 border-b border-white/5">
                        <div className="flex items-center gap-3">
                           <Calendar size={14} className="text-primary" />
                           <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{featured.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-primary" />
                           <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{featured.location}</span>
                        </div>
                     </div>

                     <p className="text-white/30 text-base mb-12 leading-relaxed font-light line-clamp-3 max-w-xl">
                        {featured.description}
                     </p>

                     <div className="flex items-center gap-6 group/cta">
                        <div className="h-[1px] w-12 bg-primary/40 group-hover:w-24 transition-all duration-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white group-hover:text-primary transition-colors">
                           {featured.external_link ? 'JOIN OPERATION (LINK)' : 'Open Mission Intel'}
                        </span>
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-all">
                           <ChevronRight size={16} className="text-primary" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            </UpcomingWrapper>
         </section>
      )}

      <div className="max-w-7xl mx-auto mb-16 flex items-center gap-6">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Mission <span className="text-primary italic">Archives</span></h2>
         <div className="flex-grow h-[1px] bg-white/5" />
      </div>

      <div className="events-grid">
         {pastEvents.length === 0 ? (
            <div className="col-span-full py-40 text-center opacity-10 uppercase font-black text-[10px] tracking-[1em]">Scanning Core Memories...</div>
         ) : pastEvents.map((event, index) => (
            <motion.div 
               key={event.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
            >
               <Link to={`/events/${event.id}`} className="event-card group">
                  <div className="event-img-wrap">
                     <img src={event.image_url} alt={event.title} className="event-thumbnail" />
                     <div className="event-meta-overlay">
                        <div className="meta-tab">LOG_#{String(event.id).slice(-4).toUpperCase()}</div>
                     </div>
                  </div>

                  <div className="event-info">
                     <div className="flex items-center gap-3 mb-6 text-primary">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{event.date}</span>
                     </div>
                     
                     <h3 className="event-card-title">{event.title}</h3>
                     <p className="event-card-excerpt">{event.description}</p>

                     <div className="event-card-btn">
                        <div className="flex items-center gap-2">
                           <MapPin size={10} />
                           <span>{event.location}</span>
                        </div>
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </Link>
            </motion.div>
         ))}
      </div>
    </div>
  );
};

export default EventsPage;
