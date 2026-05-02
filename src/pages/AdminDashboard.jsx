import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { ensureSettingsDefaults, getSettingValue } from '../lib/supabaseSettings';
import { 
  Users, Power, Search, ExternalLink, 
  Trash2, RefreshCw, ChevronRight, LayoutDashboard, Settings,
  Plus, Image, Edit, Award, LayoutGrid, Zap, CheckCircle, Shield, Link as LinkIcon, MessageSquare, Eye, Paperclip
} from 'lucide-react';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [isSavingApplicant, setIsSavingApplicant] = useState(false);
  const [updatingApplicantId, setUpdatingApplicantId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [applications, setApplications] = useState([]);
  const [communityMemberCount, setCommunityMemberCount] = useState(75);
  const [bestMembers, setBestMembers] = useState([]);
  const [highBoardMembers, setHighBoardMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantDraft, setApplicantDraft] = useState(null);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', role: '', unit: '', rank: '', imageFile: null });

  const [isAddingHighBoard, setIsAddingHighBoard] = useState(false);
  const [isEditingHighBoard, setIsEditingHighBoard] = useState(false);
  const [editingHighBoard, setEditingHighBoard] = useState(null);
  const [newHighBoard, setNewHighBoard] = useState({ name: '', role: '', bio: '', display_order: 0, imageFile: null });

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
  const [liveSheetUrl, setLiveSheetUrl] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const tabMeta = {
    applications: {
      label: 'Applications',
      description: 'Review join requests, export records, and manage recruitment status.',
    },
    best_members: {
      label: 'Best Members',
      description: 'Add, edit, or remove featured members from the branch spotlight.',
    },
    high_board: {
      label: 'High Board',
      description: 'Manage high board members shown on the board page.',
    },
    events: {
      label: 'Events',
      description: 'Create and update events, links, and event descriptions.',
    },
    suggestions: {
      label: 'Messages',
      description: 'Read messages submitted from the footer contact form.',
    },
    settings: {
      label: 'Settings',
      description: 'Update the public contact details shown across the website.',
    },
  };

  const dashboardStats = [
    { label: 'Applications', value: applications.length, icon: Users, tone: 'text-primary' },
    { label: 'Best Members', value: communityMemberCount, icon: Award, tone: 'text-yellow-500' },
    { label: 'Events', value: events.length, icon: LayoutGrid, tone: 'text-green-500' },
    { label: 'Messages', value: suggestions.length, icon: MessageSquare, tone: 'text-pink-500' },
  ];

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await ensureSettingsDefaults();
        fetchApplications();
        fetchBestMembers();
        fetchHighBoardMembers();
        fetchEvents();
        fetchSuggestions();
        fetchSettings();
      } catch (error) {
        console.error('Admin settings bootstrap failed:', error);
        fetchApplications();
        fetchBestMembers();
        fetchHighBoardMembers();
        fetchEvents();
        fetchSuggestions();
        fetchSettings();
      }
    };

    bootstrap();
  }, []);

  const fetchApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (data) setApplications(data);
  };

  const fetchSuggestions = async () => {
    const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (data) setSuggestions(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const openRecruit = getSettingValue(data, 'is_recruitment_open', true);
      setIsFormOpen(Boolean(openRecruit));

      const communityCount = getSettingValue(data, 'community_member_count', 77);
      setCommunityMemberCount(Number(communityCount) || 77);

      const sheetUrl = getSettingValue(data, 'live_sheet_url', '');
      setLiveSheetUrl(typeof sheetUrl === 'string' ? sheetUrl : '');
      
      const footerData = data.find(s => s.key === 'footer_settings');
      if (footerData) {
         try {
           const parsed = typeof footerData.value === 'string' ? JSON.parse(footerData.value) : footerData.value;
           setWebsiteSettings(prev => ({ ...prev, ...parsed }));
         } catch (error) {
           console.error('Footer settings parse failed:', error);
         }
      }
    }
  };

  const saveCommunityMemberCount = async (nextCount) => {
    setCommunityMemberCount(nextCount);

    const { data: existingRows, error: selectError } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'community_member_count');

    if (selectError) throw selectError;

    if (existingRows && existingRows.length > 0) {
      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: String(nextCount) })
        .eq('key', 'community_member_count');

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('settings')
        .insert([{ key: 'community_member_count', value: String(nextCount) }]);

      if (insertError) throw insertError;
    }
  };

  const saveWebsiteSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const upsertSetting = async (key, value) => {
        const { data, error: selectError } = await supabase.from('settings').select('id').eq('key', key);
        if (selectError) throw selectError;

        if (data && data.length > 0) {
          const { error: updateError } = await supabase.from('settings').update({ value }).eq('key', key);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from('settings').insert([{ key, value }]);
          if (insertError) throw insertError;
        }
      };

      await upsertSetting('footer_settings', JSON.stringify(websiteSettings));
      await upsertSetting('live_sheet_url', liveSheetUrl.trim());
      alert('Settings Saved Successfully!');
    } catch (err) {
      alert("Error saving: " + err.message);
    }
    setIsSavingSettings(false);
  };

  const openLiveSpreadsheet = () => {
    if (!liveSheetUrl) {
      alert('Please set your Live Spreadsheet URL in Settings first.');
      return;
    }

    window.open(liveSheetUrl, '_blank', 'noopener,noreferrer');
  };

  const updateApplicantField = async (applicantId, updates) => {
    setUpdatingApplicantId(applicantId);

    try {
      const { error } = await supabase.from('applications').update(updates).eq('id', applicantId);
      if (error) throw error;

      setApplications(prev => prev.map(app => (
        app.id === applicantId ? { ...app, ...updates } : app
      )));
    } catch (error) {
      alert('Could not update applicant: ' + error.message);
    }

    setUpdatingApplicantId(null);
  };

  const openApplicantReview = (app) => {
    setSelectedApplicant(app);
    setApplicantDraft({
      status: app.status || 'pending',
      email_sent: app.email_sent ?? false,
    });
  };

  const saveApplicantReview = async () => {
    if (!selectedApplicant || !applicantDraft) return;

    setIsSavingApplicant(true);
    const updates = { status: applicantDraft.status };

    if (typeof applicantDraft.email_sent === 'boolean') {
      updates.email_sent = applicantDraft.email_sent;
    }

    try {
      const { error } = await supabase.from('applications').update(updates).eq('id', selectedApplicant.id);

      if (error) {
        if (Object.prototype.hasOwnProperty.call(updates, 'email_sent')) {
          const { error: statusOnlyError } = await supabase
            .from('applications')
            .update({ status: applicantDraft.status })
            .eq('id', selectedApplicant.id);

          if (statusOnlyError) throw statusOnlyError;
          alert('Status saved. If you want email tracking to persist, add an email_sent column to the applications table in Supabase.');
        } else {
          throw error;
        }
      } else {
        alert('Applicant updated successfully.');
      }

      // If status changed to 'accepted', auto-add to members table
      if (applicantDraft.status === 'accepted' && selectedApplicant.status !== 'accepted') {
        try {
          const { data: existingMember } = await supabase
            .from('members')
            .select('id')
            .eq('email', selectedApplicant.email)
            .single();

          if (!existingMember) {
            const { error: memberError } = await supabase.from('members').insert([
              {
                name: selectedApplicant.name || selectedApplicant.full_name || 'Unknown',
                email: selectedApplicant.email,
                phone: selectedApplicant.phone || null,
                role: 'Member',
                joined_at: new Date().toISOString(),
              },
            ]);

            if (memberError) {
              console.error('Error adding member:', memberError);
            } else {
              await saveCommunityMemberCount(communityMemberCount + 1);
              alert('Applicant added to members list.');
            }
          }
        } catch (memberErr) {
          console.error('Error checking/adding member:', memberErr);
        }
      }

      await fetchApplications();
      setSelectedApplicant(null);
      setApplicantDraft(null);
    } catch (err) {
      alert('Could not save applicant review: ' + err.message);
    }

    setIsSavingApplicant(false);
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

  const fetchHighBoardMembers = async () => {
    const { data } = await supabase
      .from('high_board')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (data) setHighBoardMembers(data);
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

  const deleteMember = async (id) => { if(confirm("Erase best member?")) { await supabase.from('best_members').delete().eq('id', id); fetchBestMembers(); } };

  const addHighBoardMember = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setUploadProgress(20);

      let imageUrl = '';
      if (newHighBoard.imageFile) {
        const webp = await convertToWebP(newHighBoard.imageFile);
        const name = `${Date.now()}_high_board.webp`;
        const { error } = await supabase.storage.from('member-avatars').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('member-avatars').getPublicUrl(name);
        imageUrl = publicUrl;
      }

      setUploadProgress(70);

      const { error: insertError } = await supabase.from('high_board').insert([
        {
          name: newHighBoard.name,
          role: newHighBoard.role,
          bio: newHighBoard.bio,
          display_order: Number(newHighBoard.display_order) || 0,
          image_url: imageUrl,
        }
      ]);

      if (insertError) throw insertError;

      setUploadProgress(100);
      setTimeout(() => {
        setIsAddingHighBoard(false);
        setNewHighBoard({ name: '', role: '', bio: '', display_order: 0, imageFile: null });
        fetchHighBoardMembers();
        setLoading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const updateHighBoardMember = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setUploadProgress(30);

      let img = editingHighBoard.image_url;
      if (editingHighBoard.imageFile) {
        const webp = await convertToWebP(editingHighBoard.imageFile);
        const name = `${Date.now()}_high_board_upd.webp`;
        const { error } = await supabase.storage.from('member-avatars').upload(name, webp, { contentType: 'image/webp' });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('member-avatars').getPublicUrl(name);
        img = publicUrl;
      }

      setUploadProgress(80);
      const { error: updateError } = await supabase
        .from('high_board')
        .update({
          name: editingHighBoard.name,
          role: editingHighBoard.role,
          bio: editingHighBoard.bio,
          display_order: Number(editingHighBoard.display_order) || 0,
          image_url: img,
        })
        .eq('id', editingHighBoard.id);

      if (updateError) throw updateError;

      setUploadProgress(100);
      setTimeout(() => {
        setIsEditingHighBoard(false);
        setEditingHighBoard(null);
        fetchHighBoardMembers();
        setLoading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const deleteHighBoardMember = async (id) => {
    if (confirm("Erase high board member?")) {
      await supabase.from('high_board').delete().eq('id', id);
      fetchHighBoardMembers();
    }
  };

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
           <div className="flex items-center gap-3 text-primary"><LayoutDashboard size={20} /><span className="text-[10px] font-black tracking-[0.4em] uppercase">Admin Dashboard</span></div>
             <h1 className="text-4xl font-black uppercase tracking-tighter">Command <span className="text-primary">Center</span></h1>
           <p className="max-w-2xl text-sm text-white/35 leading-relaxed">
             Manage applications, events, members, messages, and site contact details from one place.
           </p>
          </div>
          <div className="flex flex-wrap gap-4">
           {activeTab === 'applications' && (
             <>
               <button onClick={openLiveSpreadsheet} className="admin-action-btn secondary"><ExternalLink size={14} /> Open Live Spreadsheet</button>
             </>
           )}
           {activeTab === 'best_members' && <button onClick={() => setIsAddingMember(true)} className="admin-action-btn"><Plus size={14} /> Add Best Member</button>}
           {activeTab === 'high_board' && <button onClick={() => setIsAddingHighBoard(true)} className="admin-action-btn"><Plus size={14} /> Add High Board Member</button>}
           {activeTab === 'events' && <button onClick={() => setIsAddingEvent(true)} className="admin-action-btn"><Plus size={14} /> Add Event</button>}
           <button onClick={() => { fetchApplications(); fetchBestMembers(); fetchHighBoardMembers(); fetchEvents(); fetchSuggestions(); fetchSettings(); }} className="admin-action-btn secondary"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
         {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-stat-card flex items-center justify-between gap-4">
             <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">{stat.label}</p>
              <h2 className="text-4xl font-black">{stat.value}</h2>
             </div>
             <Icon className={stat.tone} size={20} />
            </div>
          );
         })}

         <div className="admin-stat-card xl:col-span-1 md:col-span-2 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Recruitment</p>
            <h3 className={`text-lg font-bold uppercase ${isFormOpen ? 'text-primary' : 'text-red-500'}`}>{isFormOpen ? 'Portal Active' : 'Portal Locked'}</h3>
          </div>
          <button onClick={toggleForm} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFormOpen ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
            {isFormOpen ? 'Lock' : 'Open'}
          </button>
         </div>
        </div>

          <div className="flex flex-wrap gap-4 mb-10 p-2 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
            {['applications', 'best_members', 'high_board', 'events', 'suggestions', 'settings'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}>
             {tabMeta[tab].label}
             </button>
           ))}
        </div>

        <p className="text-white/35 text-sm mb-8 max-w-2xl">
         {tabMeta[activeTab].description}
        </p>

        {activeTab === 'applications' ? (
           <div className="admin-card">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Join Requests</p>
                <h2 className="text-2xl md:text-3xl font-black uppercase">{applications.length} Applications</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">Recruitment</p>
                <span className={`text-sm font-black uppercase ${isFormOpen ? 'text-primary' : 'text-red-500'}`}>{isFormOpen ? 'Active' : 'Locked'}</span>
                {liveSheetUrl ? (
                  <button onClick={openLiveSpreadsheet} className="block mt-3 text-[10px] uppercase tracking-[0.3em] text-primary hover:text-white transition-colors">Open Sheet</button>
                ) : (
                  <span className="block mt-3 text-[10px] uppercase tracking-[0.3em] text-yellow-500/70">No live sheet URL set</span>
                )}
              </div>
            </div>
                 <div className="admin-table-container"><table className="admin-table"><thead><tr><th>Identity</th><th>Contact</th><th>Position</th><th>Status</th><th>Credentials</th><th>Actions</th></tr></thead><tbody>{applications.map(app=>(<tr key={app.id}><td><div className="font-bold text-white uppercase">{app.first_name} {app.last_name}</div></td><td><div className="text-[10px] opacity-40 mb-1">{app.email}</div><div className="text-[10px] text-primary tracking-widest font-black">{app.phone}</div></td><td><span className="admin-badge badge-accepted">{app.position}</span></td><td><div className="flex flex-col gap-2 min-w-[150px]"><select value={app.status || 'pending'} onChange={(e) => updateApplicantField(app.id, { status: e.target.value })} disabled={updatingApplicantId === app.id} className="admin-inline-select"><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select><select value={app.email_sent ? 'sent' : 'not_sent'} onChange={(e) => updateApplicantField(app.id, { email_sent: e.target.value === 'sent' })} disabled={updatingApplicantId === app.id} className="admin-inline-select"><option value="not_sent">Email not sent</option><option value="sent">Email sent</option></select></div></td><td className="text-xs uppercase opacity-30">{app.faculty} / YEAR_{app.year_of_study}</td><td><div className="flex flex-wrap gap-2"><button onClick={() => openApplicantReview(app)} className="text-primary hover:text-white flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/10 transition-colors"><Eye size={12}/> Review</button><a href={app.cv_url} target="_blank" rel="noreferrer" className="text-primary hover:text-white flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><span className="border-b border-primary/20">CV</span><ExternalLink size={12}/></a></div></td></tr>))}</tbody></table></div>
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
            ) : activeTab === 'high_board' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highBoardMembers.map(m => (
                 <div key={m.id} className="admin-card group">
                   <div className="flex items-center gap-4">
                     <img src={m.image_url} className="w-16 h-16 rounded-xl object-cover object-top border border-white/10" />
                     <div className="flex-grow">
                      <h4 className="font-bold text-white uppercase tracking-tighter">{m.name}</h4>
                      <p className="text-[10px] text-primary/60 font-black uppercase">{m.role}</p>
                      <p className="text-[10px] text-white/30 mt-1">ORDER: {m.display_order ?? 0}</p>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingHighBoard({...m, imageFile: null}); setIsEditingHighBoard(true); }} className="p-3 bg-white/5 rounded-lg text-white hover:bg-primary"><Edit size={14}/></button><button onClick={() => deleteHighBoardMember(m.id)} className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button></div>
                   </div>
                 </div>
                ))}
              </div>
        ) : activeTab === 'settings' ? (
           <div className="admin-card max-w-2xl">
              <div className="flex items-center gap-3 mb-8 text-primary">
                 <Settings size={24} />
                <h3 className="text-2xl font-black uppercase">Contact Details</h3>
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
                  <div>
                    <label className="field-label">Live Spreadsheet URL</label>
                    <input type="url" placeholder="https://docs.google.com/spreadsheets/d/.../edit" value={liveSheetUrl} onChange={e => setLiveSheetUrl(e.target.value)} className="login-field" />
                  </div>
                  <button type="submit" disabled={isSavingSettings} className="admin-action-btn w-full justify-center py-4 mt-6">
                    {isSavingSettings ? 'Saving...' : 'Save Changes'}
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
          {selectedApplicant && applicantDraft && (
            <div className="admin-login-overlay px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }} className="login-card large max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/60 mb-2">Applicant Review</p>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{selectedApplicant.first_name} {selectedApplicant.last_name}</h3>
                    <p className="text-xs text-white/30 uppercase tracking-[0.3em] mt-2">{selectedApplicant.position} // {selectedApplicant.faculty}</p>
                  </div>
                  <button onClick={() => setSelectedApplicant(null)} className="text-3xl text-white/10 hover:text-white">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    ['Email', selectedApplicant.email],
                    ['Phone', selectedApplicant.phone],
                    ['University ID', selectedApplicant.university_id],
                    ['Year of Study', selectedApplicant.year_of_study],
                    ['Faculty', selectedApplicant.faculty],
                    ['Status', selectedApplicant.status],
                    ['LinkedIn', selectedApplicant.linkedin || 'N/A'],
                    ['CV', selectedApplicant.cv_url || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-white/25 mb-2">{label}</p>
                      {label === 'CV' && value !== 'N/A' ? (
                        <a href={value} target="_blank" rel="noreferrer" className="text-primary text-sm break-all hover:underline">Open CV</a>
                      ) : label === 'LinkedIn' && value !== 'N/A' ? (
                        <a href={value} target="_blank" rel="noreferrer" className="text-primary text-sm break-all hover:underline">{value}</a>
                      ) : (
                        <p className="text-sm text-white/70 break-words">{value || '—'}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <label className="field-label !mb-2">Decision</label>
                    <select
                      value={applicantDraft.status}
                      onChange={(e) => setApplicantDraft(prev => ({ ...prev, status: e.target.value }))}
                      className="login-field"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <label className="field-label !mb-2">Email Tracking</label>
                    <select
                      value={applicantDraft.email_sent ? 'sent' : 'not_sent'}
                      onChange={(e) => setApplicantDraft(prev => ({ ...prev, email_sent: e.target.value === 'sent' }))}
                      className="login-field"
                    >
                      <option value="not_sent">Not sent</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    ['Non-ERU Info', selectedApplicant.non_eru_info],
                    ['Why Join', selectedApplicant.why_join],
                    ['Why This Position', selectedApplicant.why_position],
                    ['Previous Activities', selectedApplicant.previous_activities],
                    ['Comments', selectedApplicant.comments],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-white/25 mb-3">{label}</p>
                      <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedApplicant, null, 2))}
                    className="admin-action-btn secondary justify-center"
                  >
                    Copy Applicant JSON
                  </button>
                  <button
                    onClick={saveApplicantReview}
                    disabled={isSavingApplicant}
                    className="admin-action-btn justify-center"
                  >
                    {isSavingApplicant ? 'Saving...' : 'Save Review'}
                  </button>
                  {selectedApplicant.cv_url && (
                    <a href={selectedApplicant.cv_url} target="_blank" rel="noreferrer" className="admin-action-btn justify-center">
                      Open CV
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )}

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
                          <div className="md:col-span-2"><label className="field-label">Cover Image</label><div className="relative h-24 bg-white/[0.02] border border-white/5 border-dashed rounded-xl flex items-center justify-center overflow-hidden"><input type="file" accept="image/*" onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, imageFile: e.target.files[0] || null}) : setNewEvent({...newEvent, imageFile: e.target.files[0] || null})} className="absolute inset-0 opacity-0 cursor-pointer z-20" /><div className="text-center"><Image size={24} className="mx-auto mb-1 text-primary/40"/><p className="text-[10px] font-black text-white/20 uppercase">{(isEditingEvent ? editingEvent.imageFile?.name : newEvent.imageFile?.name) || 'Choose Cover Image'}</p></div></div></div>
                          <div className="md:col-span-2"><label className="field-label">Gallery Images {((isEditingEvent ? editingEvent.category : newEvent.category) === 'PAST_EVENT') ? '(Past Event Only)' : '(Optional)'}</label><div className="relative h-24 bg-white/[0.02] border border-white/5 border-dashed rounded-xl flex items-center justify-center overflow-hidden"><input type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files || []); if (isEditingEvent) { setEditingEvent({...editingEvent, galleryFiles: files}); } else { setNewEvent({...newEvent, galleryFiles: files}); } }} className="absolute inset-0 opacity-0 cursor-pointer z-20" /><div className="text-center"><Paperclip size={24} className="mx-auto mb-1 text-primary/40"/><p className="text-[10px] font-black text-white/20 uppercase">{(isEditingEvent ? editingEvent.galleryFiles?.length : newEvent.galleryFiles?.length) ? `${(isEditingEvent ? editingEvent.galleryFiles.length : newEvent.galleryFiles.length)} File(s) Selected` : 'Choose Gallery Images'}</p></div></div></div>
                          <div className="md:col-span-2"><label className="field-label">Brief Info</label><textarea required value={isEditingEvent ? editingEvent.description : newEvent.description} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})} className="login-field h-24 pt-4" /></div>
                          <div className="md:col-span-2"><label className="field-label">Technical Report</label><textarea required value={isEditingEvent ? editingEvent.full_description : newEvent.full_description} onChange={e => isEditingEvent ? setEditingEvent({...editingEvent, full_description: e.target.value}) : setNewEvent({...newEvent, full_description: e.target.value})} className="login-field h-40 pt-4" /></div>
                       </div>
                       <button type="submit" disabled={loading} className="admin-action-btn w-full justify-center py-5 text-sm">{loading ? 'Transmitting...' : 'Authorize Operation'}</button>
                    </form>
                 </motion.div>
              </div>
           )}

            {(isAddingHighBoard || isEditingHighBoard) && (
              <div className="admin-login-overlay px-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="login-card large">
                  <div className="flex items-center gap-4 mb-10 text-primary"><Shield size={32}/><div className="flex-grow"><h3 className="text-2xl font-black uppercase">High Board Registry</h3><p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">Leadership Layer</p></div><button onClick={() => { setIsAddingHighBoard(false); setIsEditingHighBoard(false); }} className="text-3xl text-white/10 hover:text-white">&times;</button></div>
                  {loading && ( <div className="mb-8"><div className="flex justify-between text-[10px] font-black uppercase mb-3 text-primary"><span>Syncing Leadership Node...</span><span>{Math.round(uploadProgress)}%</span></div><div className="progress-wrap"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div></div> )}
                  <form onSubmit={isEditingHighBoard ? updateHighBoardMember : addHighBoardMember} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><label className="field-label">Name</label><input type="text" required placeholder="Full Name" value={isEditingHighBoard ? editingHighBoard.name : newHighBoard.name} onChange={e => isEditingHighBoard ? setEditingHighBoard({...editingHighBoard, name: e.target.value}) : setNewHighBoard({...newHighBoard, name: e.target.value})} className="login-field" /></div>
                      <div><label className="field-label">Role</label><input type="text" required placeholder="Role" value={isEditingHighBoard ? editingHighBoard.role : newHighBoard.role} onChange={e => isEditingHighBoard ? setEditingHighBoard({...editingHighBoard, role: e.target.value}) : setNewHighBoard({...newHighBoard, role: e.target.value})} className="login-field" /></div>
                      <div><label className="field-label">Display Order</label><input type="number" required value={isEditingHighBoard ? (editingHighBoard.display_order ?? 0) : newHighBoard.display_order} onChange={e => isEditingHighBoard ? setEditingHighBoard({...editingHighBoard, display_order: e.target.value}) : setNewHighBoard({...newHighBoard, display_order: e.target.value})} className="login-field" /></div>
                      <div className="md:col-span-2"><label className="field-label">Bio</label><textarea placeholder="Short bio" value={isEditingHighBoard ? (editingHighBoard.bio || '') : newHighBoard.bio} onChange={e => isEditingHighBoard ? setEditingHighBoard({...editingHighBoard, bio: e.target.value}) : setNewHighBoard({...newHighBoard, bio: e.target.value})} className="login-field h-24 pt-4" /></div>
                      <div className="md:col-span-2"><label className="field-label">Photo</label><div className="relative h-24 bg-white/[0.02] border border-white/5 border-dashed rounded-xl flex items-center justify-center overflow-hidden"><input type="file" accept="image/*" onChange={e => isEditingHighBoard ? setEditingHighBoard({...editingHighBoard, imageFile: e.target.files[0] || null}) : setNewHighBoard({...newHighBoard, imageFile: e.target.files[0] || null})} className="absolute inset-0 opacity-0 cursor-pointer z-20" /><div className="text-center"><Image size={24} className="mx-auto mb-1 text-primary/40"/><p className="text-[10px] font-black text-white/20 uppercase">{(isEditingHighBoard ? editingHighBoard.imageFile?.name : newHighBoard.imageFile?.name) || 'Choose Image'}</p></div></div></div>
                    </div>
                    <button type="submit" className="admin-action-btn w-full justify-center py-5">{loading ? 'Transmitting...' : 'Save High Board Member'}</button>
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
