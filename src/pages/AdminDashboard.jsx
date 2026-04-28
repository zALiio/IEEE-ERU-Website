import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, FileSpreadsheet, Power, Search, ExternalLink, 
  Trash2, RefreshCw, ChevronRight, LayoutDashboard, Settings,
  Plus, Image, Edit, Award, LayoutGrid, Zap, CheckCircle, Shield, Link as LinkIcon, MessageSquare
} from 'lucide-react';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [applications, setApplications] = useState([]);
  const [bestMembers, setBestMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', role: '', unit: '', rank: '', imageFile: null });

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', location: '', description: '', full_description: '', category: 'PAST_EVENT', external_link: '', imageFile: null, galleryFiles: []
  });

  const [isFormOpen, setIsFormOpen] = useState(true); 

  const [websiteSettings, setWebsiteSettings] = useState({
    phone: '+20 11 58913093',
    email: 'ieee.eru.sb@gmail.com',
    facebook: 'https://facebook.com/IEEE.ERU.SB',
    instagram: 'https://instagram.com/ieee_erusb/',
    linkedin: 'https://linkedin.com/company/ieee-eru-sb/'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchBestMembers();
    fetchEvents();
    fetchSuggestions();
    fetchSettings();
  }, []);

  const fetchApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (data) setApplications(data);
  };

  const updateStatus = async (id, status) => {
    setLoading(true);
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) alert('Error updating status: ' + error.message);
    else fetchApplications();
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (data) setSuggestions(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const openRecruit = data.find(s => s.key === 'is_recruitment_open');
      if (openRecruit) setIsFormOpen(openRecruit.value === true || openRecruit.value === 'true');
      
      const footerData = data.find(s => s.key === 'footer_settings');
      if (footerData) {
         try {
           const parsed = typeof footerData.value === 'string' ? JSON.parse(footerData.value) : footerData.value;
           setWebsiteSettings(prev => ({ ...prev, ...parsed }));
         } catch(e) {}
      }
    }
  };

  const saveWebsiteSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { data, error: selectError } = await supabase.from('settings').select('id').eq('key', 'footer_settings');
      if (selectError) throw selectError;

      const stringifiedValue = JSON.stringify(websiteSettings);
      if (data && data.length > 0) {
        const { error: updateError } = await supabase.from('settings').update({ value: stringifiedValue }).eq('key', 'footer_settings');
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('settings').insert([{ key: 'footer_settings', value: stringifiedValue }]);
        if (insertError) throw insertError;
      }
      alert('Settings Saved Successfully!');
    } catch (err) {
      alert("Error saving: " + err.message);
    }
    setIsSavingSettings(false);
  };

  const exportApplicationsToCSV = () => {
    if (applications.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = Object.keys(applications[0]);
    const csvRows = [
      headers,
      ...applications.map(app => headers.map(header => {
        let cell = String(app[header] ?? '');
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }))
    ];
    
    const csvString = csvRows.map(row => row.join(',')).join('\\n');
    const blob = new Blob(['\\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IEEE_ERU_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSuggestion = async (id) => {
     if(!confirm("Erase intelligence?")) return;
     await supabase.from('suggestions').delete().eq('id', id);
     fetchSuggestions();
  };

  const convertToWebP = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.82);
        };
      };
    });
  };

  const fetchBestMembers = async () => {
    const { data } = await supabase.from('best_members').select('*').order('created_at', { ascending: true });
    if (data) setBestMembers(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  const toggleForm = async () => {
    const newState = !isFormOpen;
    setIsFormOpen(newState);
    await supabase.from('settings').update({ value: String(newState) }).eq('key', 'is_recruitment_open');
  };

  const addBestMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setUploadProgress(20);
      let imageUrl = '';
      if (newMember.imageFile) {
        const webp = await convertToWebP(newMember.imageFile);
        const name = `${Date.now()}_member.webp`;
        const { error } = await supabase.storage.from('member-avatars').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('member-avatars').getPublicUrl(name);
        imageUrl = publicUrl;
      }
      setUploadProgress(70);
      await supabase.from('best_members').insert([{ name: newMember.name, role: newMember.role, unit: newMember.unit, rank: newMember.rank, image_url: imageUrl }]);
      setUploadProgress(100);
      setTimeout(() => { setIsAddingMember(false); setNewMember({ name: '', role: '', unit: '', rank: '', imageFile: null }); fetchBestMembers(); setLoading(false); setUploadProgress(0); }, 500);
    } catch (err) { setLoading(false); alert(err.message); }
  };

  const updateBestMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setUploadProgress(30);
      let img = editingMember.image_url;
      if (editingMember.imageFile) {
        const webp = await convertToWebP(editingMember.imageFile);
        const name = `${Date.now()}_mem_upd.webp`;
        const { error } = await supabase.storage.from('member-avatars').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('member-avatars').getPublicUrl(name);
        img = publicUrl;
      }
      setUploadProgress(80);
      await supabase.from('best_members').update({ name: editingMember.name, role: editingMember.role, unit: editingMember.unit, rank: editingMember.rank, image_url: img }).eq('id', editingMember.id);
      setUploadProgress(100);
      setTimeout(() => { setIsEditingMember(false); setEditingMember(null); fetchBestMembers(); setLoading(false); setUploadProgress(0); }, 500);
    } catch (err) { setLoading(false); alert(err.message); }
  };

  const deleteMember = async (id) => { if(confirm("Erase member?")) { await supabase.from('best_members').delete().eq('id', id); fetchBestMembers(); } };
  const deleteEvent = async (id) => { if(confirm("Erase event?")) { await supabase.from('events').delete().eq('id', id); fetchEvents(); } };

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setUploadProgress(10);
      let imageUrl = '';
      if (newEvent.imageFile) {
        const webp = await convertToWebP(newEvent.imageFile);
        const name = `${Date.now()}_cover.webp`;
        const { error } = await supabase.storage.from('event-images').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(name);
        imageUrl = publicUrl;
      }
      setUploadProgress(40);

      let galleryUrls = [];
      if (newEvent.category === 'PAST_EVENT' && newEvent.galleryFiles.length > 0) {
        const total = newEvent.galleryFiles.length;
        for (let i = 0; i < total; i++) {
          const webp = await convertToWebP(newEvent.galleryFiles[i]);
          const name = `${Date.now()}_${i}_gal.webp`;
          const { error } = await supabase.storage.from('event-images').upload(name, webp, { contentType: 'image/webp' });
          if (!error) {
             const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(name);
             galleryUrls.push(publicUrl);
          }
          setUploadProgress(40 + ((i+1)/total * 50));
        }
      }

      await supabase.from('events').insert([{
        title: newEvent.title, date: newEvent.date, location: newEvent.location, description: newEvent.description,
        full_description: newEvent.full_description, category: newEvent.category, external_link: newEvent.external_link,
        image_url: imageUrl, gallery: galleryUrls
      }]);
      setUploadProgress(100);
      setTimeout(() => { setIsAddingEvent(false); setNewEvent({ title: '', date: '', location: '', description: '', full_description: '', category: 'PAST_EVENT', external_link: '', imageFile: null, galleryFiles: [] }); fetchEvents(); setLoading(false); setUploadProgress(0); }, 500);
    } catch (err) { setLoading(false); alert(err.message); }
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setUploadProgress(20);
      let img = editingEvent.image_url;
      if (editingEvent.imageFile) {
        const webp = await convertToWebP(editingEvent.imageFile);
        const name = `${Date.now()}_upd.webp`;
        const { error } = await supabase.storage.from('event-images').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(name);
        img = publicUrl;
      }
      
      let gal = editingEvent.gallery || [];
      if (editingEvent.category === 'PAST_EVENT' && editingEvent.galleryFiles.length > 0) {
        const total = editingEvent.galleryFiles.length;
        for (let i = 0; i < total; i++) {
          const webp = await convertToWebP(editingEvent.galleryFiles[i]);
          const name = `${Date.now()}_${i}_upd.webp`;
          const { error } = await supabase.storage.from('event-images').upload(name, webp, { contentType: 'image/webp' });
          if (!error) {
             const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(name);
             gal.push(publicUrl);
          }
          setUploadProgress(50 + ((i+1)/total * 40));
        }
      }

      await supabase.from('events').update({
        title: editingEvent.title, date: editingEvent.date, location: editingEvent.location, description: editingEvent.description,
        full_description: editingEvent.full_description, category: editingEvent.category, external_link: editingEvent.external_link,
        image_url: img, gallery: gal
      }).eq('id', editingEvent.id);
      
      setUploadProgress(100);
      setTimeout(() => { setIsEditingEvent(false); fetchEvents(); setLoading(false); }, 500);
    } catch (err) { setLoading(false); alert(err.message); }
  };

  return (
    <div className="admin-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3 text-primary"><Shield size={20} /><span className="text-[10px] font-black tracking-[0.4em] uppercase">Security Protocol v4.0</span></div>
             <h1 className="text-4xl font-black uppercase tracking-tighter">Command <span className="text-primary">Center</span></h1>
          </div>
          <div className="flex flex-wrap gap-4">
             {activeTab === 'applications' && <button onClick={exportApplicationsToCSV} className="admin-action-btn secondary"><FileSpreadsheet size={14} /> Export</button>}
             {activeTab === 'best_members' && <button onClick={() => setIsAddingMember(true)} className="admin-action-btn"><Plus size={14} /> Add Operative</button>}
             {activeTab === 'events' && <button onClick={() => setIsAddingEvent(true)} className="admin-action-btn"><Plus size={14} /> Register Event</button>}
             <button onClick={() => { fetchApplications(); fetchBestMembers(); fetchEvents(); fetchSuggestions(); fetchSettings(); }} className="admin-action-btn secondary"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-10 p-2 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
           {['applications', 'best_members', 'events', 'suggestions', 'settings'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}>
                {tab.replace('_', ' ')}
             </button>
           ))}
        </div>

        {activeTab === 'applications' ? (
           <div className="admin-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                 <div className="admin-stat-card"><p className="text-[10px] font-black text-white/40 uppercase mb-4 tracking-widest">Total Intelligence</p><div className="flex items-end gap-3"><h2 className="text-4xl font-black">{applications.length}</h2><Users className="text-primary mb-1" size={18}/></div></div>
                 <div className="admin-stat-card md:col-span-2 flex items-center justify-between">
                    <div><p className="text-[10px] text-white/40 uppercase mb-1">Recruitment Status</p><h3 className={`text-lg font-bold uppercase ${isFormOpen ? 'text-primary' : 'text-red-500'}`}>{isFormOpen ? 'PORTAL ACTIVE' : 'PORTAL LOCKED'}</h3></div>
                    <button onClick={toggleForm} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFormOpen ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                       {isFormOpen ? 'Lock Portal' : 'Open Portal'}
                    </button>
                 </div>
              </div>
              <div className="admin-table-container"><table className="admin-table"><thead><tr><th>Identity</th><th>Contact</th><th>Position</th><th>Status</th><th>Credentials</th><th>Log</th></tr></thead><tbody>{applications.map(app=>(<tr key={app.id}><td><div className="font-bold text-white uppercase">{app.first_name} {app.last_name}</div></td><td><div className="text-[10px] opacity-40 mb-1">{app.email}</div><div className="text-[10px] text-primary tracking-widest font-black">{app.phone}</div></td><td><span className="admin-badge badge-accepted">{app.position}</span></td><td><select value={app.status || 'pending'} onChange={(e) => updateStatus(app.id, e.target.value)} className="bg-black text-white border border-white/20 rounded px-2 py-1 text-xs"><option value="pending">pending</option><option value="accepted">accepted</option><option value="rejected">rejected</option></select></td><td className="text-xs uppercase opacity-30">{app.faculty} / YEAR_{app.year_of_study}</td><td><a href={app.cv_url} target="_blank" className="text-primary hover:text-white flex items-center gap-2 text-[10px] font-black uppercase"><span className="border-b border-primary/20">Access Dossier</span><ExternalLink size={12}/></a></td></tr>))}</tbody></table></div>
           </div>
        ) : activeTab === 'suggestions' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.map(s => (
                <div key={s.id} className="admin-card group !bg-white/[0.02]">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><MessageSquare size={18}/></div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(s.created_at).toLocaleString()}</span>
                            <button onClick={() => deleteSuggestion(s.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                         </div>
                         <p className="text-sm text-white/60 leading-relaxed italic">"{s.content}"</p>
                      </div>
                   </div>
                </div>
              ))}
              {suggestions.length === 0 && <div className="col-span-full py-20 text-center opacity-10 uppercase font-black text-[10px] tracking-[1em]">No Incoming Intel...</div>}
           </div>
        ) : activeTab === 'best_members' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestMembers.map(m => (
                <div key={m.id} className="admin-card group">
                   <div className="flex items-center gap-4">
                      <img src={m.image_url} className="w-16 h-16 rounded-xl object-cover object-top border border-white/10" />
                      <div className="flex-grow"><h4 className="font-bold text-white uppercase tracking-tighter">{m.name}</h4><p className="text-[10px] text-primary/60 font-black uppercase">{m.role}</p></div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingMember({...m, imageFile: null}); setIsEditingMember(true); }} className="p-3 bg-white/5 rounded-lg text-white hover:bg-primary"><Edit size={14}/></button><button onClick={() => deleteMember(m.id)} className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button></div>
                   </div>
                </div>
              ))}
           </div>
        ) : activeTab === 'settings' ? (
           <div className="admin-card max-w-2xl">
              <div className="flex items-center gap-3 mb-8 text-primary">
                 <Settings size={24} />
                 <h3 className="text-2xl font-black uppercase">Platform Variables</h3>
              </div>
              <form onSubmit={saveWebsiteSettings} className="space-y-6">
                 <div>
                    <label className="field-label">Contact Phone</label>
                    <input type="text" required value={websiteSettings.phone} onChange={e => setWebsiteSettings({...websiteSettings, phone: e.target.value})} className="login-field" />
                 </div>
                 <div>
                    <label className="field-label">Contact Email</label>
                    <input type="text" required value={websiteSettings.email} onChange={e => setWebsiteSettings({...websiteSettings, email: e.target.value})} className="login-field" />
                 </div>
                 <div>
                    <label className="field-label">Facebook Link</label>
                    <input type="url" required value={websiteSettings.facebook} onChange={e => setWebsiteSettings({...websiteSettings, facebook: e.target.value})} className="login-field" />
                 </div>
                 <div>
                    <label className="field-label">Instagram Link</label>
                    <input type="url" required value={websiteSettings.instagram} onChange={e => setWebsiteSettings({...websiteSettings, instagram: e.target.value})} className="login-field" />
                 </div>
                 <div>
                    <label className="field-label">LinkedIn Link</label>
                    <input type="url" required value={websiteSettings.linkedin} onChange={e => setWebsiteSettings({...websiteSettings, linkedin: e.target.value})} className="login-field" />
                 </div>
                 <button type="submit" disabled={isSavingSettings} className="admin-action-btn w-full justify-center py-4 mt-6">
                    {isSavingSettings ? 'Deploying...' : 'Deploy Updates'}
                 </button>
              </form>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {events.map(ev => (
                <div key={ev.id} className="admin-card group flex gap-6 items-start">
                   <img src={ev.image_url} className="w-40 h-40 rounded-2xl object-cover border border-white/10" />
                   <div className="flex-grow">
                      <div className="flex justify-between items-start"><h4 className="text-xl font-bold text-white uppercase tracking-tighter">{ev.title}</h4><div className="flex gap-2"><button onClick={() => { setEditingEvent({...ev, galleryFiles: []}); setIsEditingEvent(true); }} className="p-2 bg-white/5 hover:bg-primary rounded text-white"><Edit size={12}/></button><button onClick={() => deleteEvent(ev.id)} className="p-2 bg-white/5 hover:bg-red-500 rounded text-white"><Trash2 size={12}/></button></div></div>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] my-4">{ev.date} // {ev.location}</p>
                      <p className="text-sm text-white/30 line-clamp-2 leading-relaxed">{ev.description}</p>
                   </div>
                </div>
             ))}
          </div>
        )}

        <AnimatePresence>
           {(isAddingMember || isEditingMember) && (
              <div className="admin-login-overlay px-4">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="login-card large">
                    <div className="flex items-center gap-4 mb-10 text-primary"><Award size={32}/><div className="flex-grow"><h3 className="text-2xl font-black uppercase">Elite Intelligence</h3><p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">Operative Registry</p></div><button onClick={() => { setIsAddingMember(false); setIsEditingMember(false); }} className="text-3xl text-white/10 hover:text-white">&times;</button></div>
                    {loading && ( <div className="mb-8"><div className="flex justify-between text-[10px] font-black uppercase mb-3 text-primary"><span>Synching Neural Link...</span><span>{Math.round(uploadProgress)}%</span></div><div className="progress-wrap"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div></div> )}
                    <form onSubmit={isEditingMember ? updateBestMember : addBestMember} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div><label className="field-label">Full Cyber Identity</label><input type="text" required placeholder="Full Name" value={isEditingMember ? editingMember.name : newMember.name} onChange={e => isEditingMember ? setEditingMember({...editingMember, name: e.target.value}) : setNewMember({...newMember, name: e.target.value})} className="login-field" /></div>
                          <div><label className="field-label">Operational Role</label><input type="text" required placeholder="Role" value={isEditingMember ? editingMember.role : newMember.role} onChange={e => isEditingMember ? setEditingMember({...editingMember, role: e.target.value}) : setNewMember({...newMember, role: e.target.value})} className="login-field" /></div>
                          <div><label className="field-label">Unit Designation</label><input type="text" required placeholder="Unit Code" value={isEditingMember ? editingMember.unit : newMember.unit} onChange={e => isEditingMember ? setEditingMember({...editingMember, unit: e.target.value}) : setNewMember({...newMember, unit: e.target.value})} className="login-field" /></div>
                          <div><label className="field-label">Rank Level</label><input type="text" required placeholder="Rank" value={isEditingMember ? editingMember.rank : newMember.rank} onChange={e => isEditingMember ? setEditingMember({...editingMember, rank: e.target.value}) : setNewMember({...newMember, rank: e.target.value})} className="login-field" /></div>
                          <div className="md:col-span-2"><label className="field-label">Identity Visual (Photo)</label><div className="relative h-24 bg-white/[0.02] border border-white/5 border-dashed rounded-xl flex items-center justify-center overflow-hidden"><input type="file" onChange={e => isEditingMember ? setEditingMember({...editingMember, imageFile: e.target.files[0]}) : setNewMember({...newMember, imageFile: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer z-20" /><div className="text-center"><Image size={24} className="mx-auto mb-1 text-primary/40"/><p className="text-[10px] font-black text-white/20 uppercase">{(isEditingMember ? editingMember.imageFile?.name : newMember.imageFile?.name) || 'Choose Image'}</p></div></div></div>
                       </div>
                       <button type="submit" className="admin-action-btn w-full justify-center py-5">{loading ? 'Transmitting...' : 'Register Operative'}</button>
                    </form>
                 </motion.div>
              </div>
           )}

           {(isAddingEvent || isEditingEvent) && (
              <div className="admin-login-overlay px-4">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="login-card large max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-4 mb-10 text-primary"><Zap size={32}/><div className="flex-grow"><h3 className="text-2xl font-black uppercase tracking-tighter">Mission Command</h3><p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">Authentication Protocol</p></div><button onClick={() => { setIsAddingEvent(false); setIsEditingEvent(false); }} className="text-3xl text-white/10 hover:text-white">&times;</button></div>
                    {loading && ( <div className="mb-8"><div className="flex justify-between text-[10px] font-black uppercase mb-3 text-primary"><span>Syncing Neural Link...</span><span>{Math.round(uploadProgress)}%</span></div><div className="progress-wrap"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div></div> )}
                    <form onSubmit={isEditingEvent ? updateEvent : addEvent} className="space-y-8">
                       <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl mb-10">
                          <label className="field-label !mb-4">Mission Operational Status</label>
                          <select required value={isEditingEvent ? editingEvent.category : newEvent.category} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, category: e.target.value}) : setNewEvent({...newEvent, category: e.target.value})} className="login-field bg-black text-primary font-black uppercase border-primary/30"><option value="PAST_EVENT">PAST_MISSION (Archives)</option><option value="UPCOMING_ANNOUNCEMENT">UPCOMING_OPERATION (Upcoming)</option></select>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="md:col-span-2"><label className="field-label">Title</label><input type="text" required value={isEditingEvent ? editingEvent.title : newEvent.title} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})} className="login-field"/></div>
                          <div className="md:col-span-2"><label className="field-label">Link / Registration URL</label><div className="relative"><LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40" /><input type="url" value={isEditingEvent ? (editingEvent.external_link || '') : newEvent.external_link} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, external_link: e.target.value}) : setNewEvent({...newEvent, external_link: e.target.value})} className="login-field !pl-14" /></div></div>
                          <div><label className="field-label">Date</label><input type="text" required value={isEditingEvent ? editingEvent.date : newEvent.date} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, date: e.target.value}) : setNewEvent({...newEvent, date: e.target.value})} className="login-field"/></div>
                          <div><label className="field-label">Location</label><input type="text" required value={isEditingEvent ? editingEvent.location : newEvent.location} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, location: e.target.value}) : setNewEvent({...newEvent, location: e.target.value})} className="login-field"/></div>
                          <div className="md:col-span-2"><label className="field-label">Brief Info</label><textarea required value={isEditingEvent ? editingEvent.description : newEvent.description} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})} className="login-field h-24 pt-4" /></div>
                          <div className="md:col-span-2"><label className="field-label">Technical Report</label><textarea required value={isEditingEvent ? editingEvent.full_description : newEvent.full_description} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, full_description: e.target.value}) : setNewEvent({...newEvent, full_description: e.target.value})} className="login-field h-40 pt-4" /></div>
                       </div>
                       <button type="submit" disabled={loading} className="admin-action-btn w-full justify-center py-5 text-sm">{loading ? 'Transmitting...' : 'Authorize Operation'}</button>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
