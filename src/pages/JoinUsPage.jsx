import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, CheckCircle2, AlertCircle, FileText, Sparkles, Network, User, GraduationCap, Target, Briefcase, Calendar, Clock, Instagram, MessageCircle, Heart, Paperclip } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Meta from '../components/Meta';
import '../styles/JoinUs.css';

const FACULTIES = [
  "Pharmacy", "Oral and Dental Medicine", "Engineering", 
  "Management, Economics and Business Technology", "Artificial Intelligence", 
  "Al-Alsun and Technical Languages", "Fine Arts", "Applied Arts", "Other"
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduated"];

const POSITIONS = [
  "Graphic Designing", "Video Editing", "Multi Media", "Marketing", 
  "Human Resources", "Public Relations", "Operations", "Projects"
];

const JoinUsPage = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(true); 
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', universityId: '', 
    nonEruInfo: '', faculty: '', yearOfStudy: '', phone: '', 
    position: '', whyJoin: '', whyPosition: '', 
    previousActivities: '', linkedin: '', comments: ''
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRecruitmentStatus();
  }, []);

  const fetchRecruitmentStatus = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'is_recruitment_open')
      .single();

    if (data) setIsFormOpen(data.value === true || data.value === 'true');
    setIsLoadingConfig(false);
    if (error) console.error("Sync Error:", error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setCvFile(file);
    } else if (file) {
      alert("File too large (Max 10MB)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      let publicUrl = null;

      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.firstName}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('cv-uploads').upload(fileName, cvFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('cv-uploads').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase.from('applications').insert([{
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        university_id: formData.universityId,
        non_eru_info: formData.nonEruInfo,
        faculty: formData.faculty,
        year_of_study: formData.yearOfStudy,
        position: formData.position,
        why_join: formData.whyJoin,
        why_position: formData.whyPosition,
        previous_activities: formData.previousActivities,
        linkedin: formData.linkedin,
        comments: formData.comments,
        cv_url: publicUrl,
        status: 'pending'
      }]);

      if (dbError) throw dbError;
      
      setFormData({
        firstName: '', lastName: '', email: '', universityId: '', 
        nonEruInfo: '', faculty: '', yearOfStudy: '', phone: '', 
        position: '', whyJoin: '', whyPosition: '', 
        previousActivities: '', linkedin: '', comments: ''
      });
      setCvFile(null);
      
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="join-page">
      <Meta 
        title="Join Us"
        description="Enlist in the IEEE ERU Student Branch. Apply for membership, explore various positions in engineering, marketing, HR, and multimedia. Start your journey with the Egyptian Russian University technical community."
        keywords="Join IEEE ERU, Student Recruitment ERU, Engineering Teams, Volunteering Cairo, IEEE Membership Application, ERU Career Development"
      />
      <div className="join-glow-top" />

      <div className="join-container">
        <div className="join-hero-header">
           <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="join-subtitle"
           >
              Passion × Impact
           </motion.span>
           <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="join-title"
           >
              JOIN OUR <span className="text-primary">FAMILY</span>
           </motion.h1>
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="join-description-text"
           >
              <p className="mb-4">
                Every great journey starts with a spark of curiosity, passion, and the will to make a difference ✨.
                That’s how <span className="text-white font-bold">IEEE ERU SB</span> was born, a place for dreamers and doers to grow together.
              </p>
              <p>Ready to start your journey? Apply now and let’s create impact together 💡🚀.</p>
           </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.8 }}
           className="form-card"
        >
          {isLoadingConfig ? (
             <div className="text-center py-20 text-white/20 uppercase font-black text-[10px] tracking-widest animate-pulse">Establishing Connection...</div>
          ) : !isFormOpen ? (
             <div className="text-center py-12 md:py-24">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-primary/20"
                >
                   <Heart size={40} className="text-primary animate-pulse" />
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                   Recruitment is <span className="text-primary">Closed</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mb-10">
                   <Calendar size={16} className="text-white/40" />
                   <span className="text-xs font-bold text-white/40 uppercase tracking-widest">See you next season!</span>
                </div>

                <p className="text-white/50 mb-16 max-w-md mx-auto leading-relaxed text-sm md:text-base">
                   Thank you for your interest in joining IEEE ERU! Our recruitment phase has ended for now, but our journey continues. Stay connected with us for future opportunities.
                </p>

                <div className="pt-8 border-t border-white/5">
                   <button onClick={() => navigate('/')} className="px-10 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">Back to Home</button>
                </div>
             </div>
          ) : status === 'success' ? (
             <div className="text-center py-20">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                   <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
                   <CheckCircle2 size={50} className="text-primary" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">TRANSITION_SUCCESS</h2>
                <p className="text-white/40 mb-12 max-w-md mx-auto">Your application has been securely uploaded to our mainframe. We will review your mission profile soon.</p>
                <button onClick={() => navigate('/')} className="final-submit-btn">RETURN TO HOME</button>
             </div>
          ) : (
             <form onSubmit={handleSubmit}>
                <div className="form-section">
                   <div className="section-header">
                      <span className="section-num">01/</span>
                      <h3 className="section-title">Personal Identity</h3>
                      <User size={18} className="text-primary/40 ml-auto" />
                   </div>
                   <div className="input-grid">
                      <div className="field-group">
                         <label className="field-label">First Name</label>
                         <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="form-field" placeholder="First Name" />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Last Name</label>
                         <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="form-field" placeholder="Last Name" />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Network Email</label>
                         <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-field" placeholder="Email Address" />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Phone Frequency</label>
                         <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-field" placeholder="+20 123..." />
                      </div>
                   </div>
                </div>

                <div className="form-section">
                   <div className="section-header">
                      <span className="section-num">02/</span>
                      <h3 className="section-title">Academic Parameters</h3>
                      <GraduationCap size={18} className="text-primary/40 ml-auto" />
                   </div>
                   <div className="input-grid">
                      <div className="field-group">
                         <label className="field-label">University ID</label>
                         <input type="text" name="universityId" value={formData.universityId} onChange={handleChange} required className="form-field" placeholder="University ID" />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Non-ERU Details (Optional)</label>
                         <input type="text" name="nonEruInfo" value={formData.nonEruInfo} onChange={handleChange} className="form-field" placeholder="Mention Univ/Faculty" />
                      </div>
                      <div className="field-group full">
                         <label className="field-label">Target Faculty</label>
                         <div className="selection-grid">
                            {FACULTIES.map(fac => (
                               <div 
                                 key={fac} 
                                 className={`selection-item ${formData.faculty === fac ? 'active' : ''}`}
                                 onClick={() => handleSelect('faculty', fac)}
                               >
                                  <div className="selection-indicator"><div className="selection-dot" /></div>
                                  <span className="selection-text">{fac}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="field-group full mt-4">
                         <label className="field-label">Your Academic Year</label>
                         <div className="flex flex-wrap gap-4">
                            {YEARS.map(y => (
                               <button 
                                 key={y} type="button"
                                 className={`px-8 py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${formData.yearOfStudy === y ? 'border-primary bg-primary/20 text-white shadow-[0_0_20px_rgba(0,122,204,0.1)]' : 'border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.05]'}`}
                                 onClick={() => handleSelect('yearOfStudy', y)}
                               >
                                  {y}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="form-section">
                   <div className="section-header">
                      <span className="section-num">03/</span>
                      <h3 className="section-title">Application Questions</h3>
                      <Target size={18} className="text-primary/40 ml-auto" />
                   </div>
                   <div className="field-group mb-12">
                      <label className="field-label">Select Position</label>
                      <div className="selection-grid">
                         {POSITIONS.map(pos => (
                            <div 
                              key={pos} 
                              className={`selection-item ${formData.position === pos ? 'active' : ''}`}
                              onClick={() => handleSelect('position', pos)}
                            >
                               <div className="selection-indicator"><div className="selection-dot" /></div>
                               <span className="selection-text">{pos}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-10">
                      <div className="field-group">
                         <label className="field-label">Mission Motive (Why Join IEEE?)</label>
                         <textarea name="whyJoin" value={formData.whyJoin} onChange={handleChange} required className="form-field form-textarea" placeholder="Describe your passion..." />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Role Focus (Why this position?)</label>
                         <textarea name="whyPosition" value={formData.whyPosition} onChange={handleChange} required className="form-field form-textarea" placeholder="Describe your experience..." />
                      </div>
                      <div className="field-group">
                         <label className="field-label">Previous Intelligence (Other Activities)</label>
                         <textarea name="previousActivities" value={formData.previousActivities} onChange={handleChange} required className="form-field form-textarea" placeholder="List student activities, roles, etc." />
                      </div>
                   </div>
                </div>

                <div className="form-section">
                   <div className="section-header">
                      <span className="section-num">04/</span>
                      <h3 className="section-title">Documents</h3>
                      <Briefcase size={18} className="text-primary/40 ml-auto" />
                   </div>
                   <div className="space-y-8">
                      <div className={`upload-zone group ${cvFile ? 'border-primary/40 bg-primary/5' : ''}`}>
                         <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                         <div className="file-info">
                            <Paperclip size={48} className={`transition-transform duration-500 group-hover:-translate-y-2 ${cvFile ? 'text-primary' : 'text-white/20'}`} />
                            <div className="space-y-1">
                               <p className="text-white font-bold">{cvFile ? cvFile.name : 'UPLOAD YOUR CV (OPTIONAL)'}</p>
                               <p className="text-white/30 text-[10px] uppercase tracking-widest font-black">Supported: PDF/DOCX // Max 10MB</p>
                            </div>
                         </div>
                      </div>
                      <div className="input-grid">
                         <div className="field-group">
                            <label className="field-label">LinkedIn Port</label>
                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-field" placeholder="https://..." />
                         </div>
                         <div className="field-group">
                            <label className="field-label">Additional Frequency (Comments)</label>
                            <input type="text" name="comments" value={formData.comments} onChange={handleChange} className="form-field" placeholder="Any extras..." />
                         </div>
                      </div>
                   </div>
                </div>

                {errorMsg && (
                   <div className="mt-10 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold uppercase tracking-widest">{errorMsg}</p>
                   </div>
                )}

                <div className="submit-action-wrap">
                   <button 
                     type="submit" 
                     disabled={status === 'submitting'}
                     className="final-submit-btn group"
                   >
                      <span className="flex items-center justify-center gap-3">
                         {status === 'submitting' ? 'Submitting...' : 'Submit Form'}
                         <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                   </button>
                </div>
             </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JoinUsPage;
