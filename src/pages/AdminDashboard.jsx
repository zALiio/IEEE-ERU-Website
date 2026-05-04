import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { ensureSettingsDefaults, getSettingValue } from '../lib/supabaseSettings';
import { 
  Users, Search, ExternalLink, 
  Trash2, RefreshCw, ChevronRight, LayoutDashboard, Settings,
  Plus, Image, Edit, Award, LayoutGrid, Zap, CheckCircle, Link as LinkIcon, MessageSquare, Eye, Paperclip
} from 'lucide-react';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [isSavingApplicant, setIsSavingApplicant] = useState(false);
  const [updatingApplicantId, setUpdatingApplicantId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [applications, setApplications] = useState([]);
  const [communityMemberCount, setCommunityMemberCount] = useState(77);
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

  // Portal management states
  const [portalMembers, setPortalMembers] = useState([]);
  const [portalTasks, setPortalTasks] = useState([]);
  const [portalLogs, setPortalLogs] = useState([]);
  const [portalActionLogs, setPortalActionLogs] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState('All');
  const [portalRankings, setPortalRankings] = useState([]);
  const [portalTaskStatusFilter, setPortalTaskStatusFilter] = useState('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({ title: '', description: '', assigned_to: '', points: 0, due_at: '', committee: '', difficulty: 1 });
  const [scoreDraft, setScoreDraft] = useState({ memberId: '', delta: 0, reason: '', adjustment_reason: '' });
  
  // New state for all 12 suggestions
  const [previewTask, setPreviewTask] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [bulkSelectFilter, setBulkSelectFilter] = useState({ status: 'submitted', committee: 'All' });
  const [selectedTasksForBulk, setSelectedTasksForBulk] = useState(new Set());
  const [undoStack, setUndoStack] = useState([]);
  const [committeeCustomRules, setCommitteeCustomRules] = useState({});
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedRuleCommittee, setSelectedRuleCommittee] = useState('All');
  const [customRuleDraft, setCustomRuleDraft] = useState({ late1to3: 0.7, late4to7: 0.5, late8plus: 0.25, early1to3: 1.1, early4plus: 1.25 });
  const [yearlyResetEnabled, setYearlyResetEnabled] = useState(false);
  const [showYearlyResetPrompt, setShowYearlyResetPrompt] = useState(false);

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
    portal: {
      label: 'Portal',
      description: 'Manage member tasks, scores, and per-committee rankings.',
    },
  };

  const dashboardStats = [
    { label: 'Applications', value: applications.length, icon: Users, tone: 'text-primary' },
    { label: 'Best Members', value: portalMembers.length || communityMemberCount, icon: Award, tone: 'text-yellow-500' },
    { label: 'Events', value: events.length, icon: LayoutGrid, tone: 'text-green-500' },
    { label: 'Messages', value: suggestions.length, icon: MessageSquare, tone: 'text-pink-500' },
  ];

  /* ======= Calculate points based on submission timing with grace period, bonuses, sliding scale, and difficulty ======= */
  const calculateTaskPoints = (basePoints, dueDate, submissionDate = new Date(), difficulty = 1, customPenalty = null) => {
    if (!dueDate) return Math.ceil(basePoints * difficulty);
    const due = new Date(dueDate);
    const submission = new Date(submissionDate);
    const graceHours = 6; // 6-hour grace period
    const gracePeriod = graceHours * 60 * 60 * 1000;
    const diffMs = submission - due - gracePeriod;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    let multiplier = 1;
    
    // Early bonus
    if (diffDays < -3) multiplier = 1.25; // 4+ days early: 125%
    else if (diffDays < 0) multiplier = 1.1; // 1-3 days early: 110%
    // On-time (within grace period)
    else if (diffDays <= 0) multiplier = 1.0; // on-time: 100%
    // Apply custom penalty if provided, otherwise use default sliding scale
    else if (customPenalty !== null) multiplier = customPenalty;
    else {
      if (diffDays <= 3) multiplier = 0.7; // 1-3 days late: 70%
      else if (diffDays <= 7) multiplier = 0.5; // 4-7 days late: 50%
      else multiplier = 0.25; // 8+ days late: 25%
    }
    
    return Math.ceil(basePoints * difficulty * multiplier);
  };

  /* ======= Portal management API calls ======= */
  const fetchPortalData = async () => {
    try {
      const { data: members } = await supabase.from('members').select('id, member_id, name, committee, points, role').order('name', { ascending: true });
      const { data: tasks } = await supabase.from('member_tasks').select('*').order('created_at', { ascending: false });
      const { data: logs } = await supabase.from('member_points_log').select('*').order('created_at', { ascending: false }).limit(200);
      const { data: actionLogs } = await supabase.from('admin_actions_log').select('*').order('created_at', { ascending: false }).limit(100);
      setPortalMembers(members || []);
      setPortalTasks(tasks || []);
      setPortalLogs(logs || []);
      setPortalActionLogs(actionLogs || []);
      setCommunityMemberCount(members?.length || 0); // update member count from DB

      // derive committees list
      const uniq = Array.from(new Set((members || []).map(m => m.committee).filter(Boolean)));
      setCommittees(['All', ...uniq]);
    } catch (err) {
      console.error('Failed to fetch portal data', err);
      // keep the portal usable even if the optional admin log table is missing
      try {
        const { data: members } = await supabase.from('members').select('id, member_id, name, committee, points, role').order('name', { ascending: true });
        const { data: tasks } = await supabase.from('member_tasks').select('*').order('created_at', { ascending: false });
        const { data: logs } = await supabase.from('member_points_log').select('*').order('created_at', { ascending: false }).limit(200);
        setPortalMembers(members || []);
        setPortalTasks(tasks || []);
        setPortalLogs(logs || []);
        const uniq = Array.from(new Set((members || []).map(m => m.committee).filter(Boolean)));
        setCommittees(['All', ...uniq]);
      } catch (fallbackErr) {
        alert('Could not fetch portal data: ' + (fallbackErr.message || fallbackErr));
      }
    }
  };

  const logAdminAction = async (actionType, payload) => {
    try {
      await supabase.from('admin_actions_log').insert([{ action_type: actionType, payload, created_at: new Date().toISOString() }]);
    } catch (error) {
      console.debug('Admin action log unavailable', error);
    }
  };

  /* ======= SUGGESTION #4: Preview Points Before Confirming ======= */
  const previewConfirmation = (task) => {
    const assignee = portalMembers.find(m => m.id === task.assigned_to);
    const customRules = committeeCustomRules[task.committee] || customRuleDraft;
    const customPenalty = getCustomPenaltyForTask(task, customRules);
    const difficulty = task.difficulty || 1;
    const previewPoints = calculateTaskPoints(task.points, task.due_at, new Date(), difficulty, customPenalty);
    const daysLate = Math.max(0, Math.ceil((new Date() - new Date(task.due_at)) / (1000 * 60 * 60 * 24)) - 0.25);
    setPreviewTask({ ...task, previewPoints, daysLate, difficultyMultiplier: difficulty, assigneeName: assignee?.name });
    setIsPreviewModalOpen(true);
  };

  /* ======= SUGGESTION #7 & #9: Get Custom Penalty Based on Committee Rules ======= */
  const getCustomPenaltyForTask = (task, rules) => {
    if (!rules) return null;
    const due = new Date(task.due_at);
    const now = new Date();
    const daysLate = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    if (daysLate <= 0) return 1.1;
    if (daysLate <= 3) return rules.late1to3 || 0.7;
    if (daysLate <= 7) return rules.late4to7 || 0.5;
    return rules.late8plus || 0.25;
  };

  /* ======= SUGGESTION #5: Bulk Confirm Tasks ======= */
  const confirmBulkTasks = async () => {
    const tasksToConfirm = (portalTasks || []).filter(t => {
      if (bulkSelectFilter.status !== 'all' && t.status !== bulkSelectFilter.status) return false;
      if (bulkSelectFilter.committee !== 'All') {
        const assignee = portalMembers.find(m => m.id === t.assigned_to);
        return assignee && assignee.committee === bulkSelectFilter.committee;
      }
      return true;
    });
    
    if (tasksToConfirm.length === 0) {
      alert('No tasks matching filter');
      return;
    }
    
    if (!window.confirm(`Confirm ${tasksToConfirm.length} tasks?`)) return;
    
    for (const task of tasksToConfirm) {
      try {
        await adminConfirmTask(task.id);
      } catch (err) {
        console.error('Bulk confirm error:', err);
      }
    }
    alert(`${tasksToConfirm.length} tasks confirmed`);
  };

  /* ======= SUGGESTION #6: Undo/Revert Confirmation ======= */
  const revertTaskConfirmation = async (taskId) => {
    try {
      const { data: task } = await supabase.from('member_tasks').select('*').eq('id', taskId).single();
      if (!task) throw new Error('Task not found');
      
      await supabase.from('member_tasks').update({ status: 'submitted', completed_at: null }).eq('id', taskId);
      
      const { data: logs } = await supabase.from('member_points_log').select('*').eq('task_id', taskId);
      if (logs && logs.length > 0) {
        for (const log of logs) {
          await supabase.from('member_points_log').delete().eq('id', log.id);
          const { data: m } = await supabase.from('members').select('points').eq('id', task.assigned_to).single();
          if (m) {
            await supabase.from('members').update({ points: Math.max(0, (m.points || 0) - log.points) }).eq('id', task.assigned_to);
          }
        }
      }
      
      await logAdminAction('revert_confirmation', { task_id: taskId, task_title: task.title });
      await fetchPortalData();
      alert('Confirmation reverted');
    } catch (err) {
      alert('Could not revert: ' + err.message);
    }
  };

  /* ======= SUGGESTION #10: Yearly Reset ======= */
  const performYearlyReset = async () => {
    if (!window.confirm('Reset all member points to 0? This cannot be undone.')) return;
    try {
      await supabase.from('members').update({ points: 0 }).gt('points', -1);
      await logAdminAction('yearly_reset', { timestamp: new Date().toISOString(), reason: 'Yearly reset' });
      await fetchPortalData();
      alert('All points reset to 0');
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  const openTaskModal = () => {
    setTaskDraft({ title: '', description: '', assigned_to: '', points: 0, due_at: '', committee: '', difficulty: 1, category: 'work' });
    setIsTaskModalOpen(true);
  };

  const submitTaskDraft = async (event) => {
    event.preventDefault();
    try {
      const targetMember = portalMembers.find(member => member.member_id === taskDraft.assigned_to || String(member.id) === String(taskDraft.assigned_to));
      
      // Auto-calculate points based on difficulty
      const basePoints = 10;
      const calculatedPoints = basePoints * (Number(taskDraft.difficulty) || 1);
      
      const payload = {
        title: taskDraft.title,
        description: taskDraft.description,
        assigned_to: targetMember ? targetMember.id : null,
        points: calculatedPoints,
        difficulty: Number(taskDraft.difficulty) || 1,
        status: 'open',
        due_at: taskDraft.due_at || null,
        category: taskDraft.category || 'work',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('member_tasks').insert([payload]);
      if (error) throw error;

      await logAdminAction('create_task', payload);
      setIsTaskModalOpen(false);
      await fetchPortalData();
    } catch (error) {
      alert('Could not create task: ' + error.message);
    }
  };

  const getAutoPoints = (difficulty) => {
    const basePoints = 10;
    return basePoints * difficulty;
  };

  const submitScoreDraft = async (event) => {
    event.preventDefault();
    try {
      const targetMember = portalMembers.find(member => member.member_id === scoreDraft.memberId || String(member.id) === String(scoreDraft.memberId));
      if (!targetMember) throw new Error('Member not found');

      const delta = Number(scoreDraft.delta) || 0;
      const logReason = scoreDraft.adjustment_reason || scoreDraft.reason || 'Admin adjustment';
      await supabase.from('member_points_log').insert([{ 
        member_id: targetMember.id, 
        task_id: null, 
        points: delta, 
        reason: logReason,
        adjustment_reason: scoreDraft.adjustment_reason || null,
        created_at: new Date().toISOString() 
      }]);
      const nextPoints = (targetMember.points || 0) + delta;
      await supabase.from('members').update({ points: nextPoints }).eq('id', targetMember.id);

      await logAdminAction('adjust_score', { member_id: targetMember.id, member_name: targetMember.name, delta, reason: logReason, adjustment_reason: scoreDraft.adjustment_reason });
      setIsScoreModalOpen(false);
      await fetchPortalData();
    } catch (error) {
      alert('Could not adjust score: ' + error.message);
    }
  };

  const adminConfirmTask = async (taskId) => {
    try {
      const { data: task } = await supabase.from('member_tasks').select('*').eq('id', taskId).single();
      if (!task) throw new Error('Task not found');

      const completionDate = new Date();
      await supabase.from('member_tasks').update({ status: 'completed', completed_at: completionDate.toISOString() }).eq('id', taskId);

      // award points based on timing, difficulty, and custom rules
      if (task.points && task.assigned_to) {
        const customRules = committeeCustomRules[task.committee] || customRuleDraft;
        const customPenalty = getCustomPenaltyForTask(task, customRules);
        const difficulty = task.difficulty || 1;
        const awardedPoints = calculateTaskPoints(task.points, task.due_at, completionDate, difficulty, customPenalty);
        const daysLate = Math.ceil((completionDate - new Date(task.due_at)) / (1000*60*60*24));
        const timingReason = task.due_at ? 
          (daysLate <= 0 ? `Task completion (on time, ${difficulty}x difficulty)` : `Task completion (${daysLate} days late - ${Math.round(customPenalty * 100)}%, ${difficulty}x difficulty)`) 
          : 'Task completion';
        
        const { data: assignee } = await supabase.from('members').select('name').eq('id', task.assigned_to).single();
        await supabase.from('member_points_log').insert([{ member_id: task.assigned_to, task_id: task.id, points: awardedPoints, reason: timingReason, created_at: completionDate.toISOString() }]);
        const { data: m } = await supabase.from('members').select('id, points').eq('id', task.assigned_to).single();
        if (m) {
          await supabase.from('members').update({ points: (m.points || 0) + awardedPoints }).eq('id', m.id);
        }
        
        await logAdminAction('confirm_task', { task_id: task.id, task_title: task.title, member_id: task.assigned_to, member_name: assignee?.name, awarded_points: awardedPoints, reason: timingReason });
      }

      await fetchPortalData();
    } catch (err) {
      console.error('Confirm task failed', err);
      alert('Could not confirm task: ' + (err.message || err));
    }
  };

  const adminToggleTaskComplete = async (taskId, nextStatus) => {
    try {
      await supabase.from('member_tasks').update({ status: nextStatus, completed_at: nextStatus === 'completed' ? new Date().toISOString() : null }).eq('id', taskId);
      await fetchPortalData();
    } catch (err) {
      console.error('Toggle task status failed', err);
      alert('Could not update task status');
    }
  };

  const adminAdjustScore = async (memberId, delta, reason = 'Admin adjustment') => {
    try {
      await supabase.from('member_points_log').insert([{ member_id: memberId, task_id: null, points: delta, reason, created_at: new Date().toISOString() }]);
      const { data: m } = await supabase.from('members').select('id, points').eq('id', memberId).single();
      if (m) {
        await supabase.from('members').update({ points: (m.points || 0) + delta }).eq('id', m.id);
      }
      await fetchPortalData();
    } catch (err) {
      console.error('Adjust score failed', err);
      alert('Could not adjust score: ' + (err.message || err));
    }
  };

  const fetchRankingsByCommittee = async (committee) => {
    try {
      // if there's a member_rankings view, use it; otherwise compute from members
      if (committee && committee !== 'All') {
        const { data } = await supabase.from('member_rankings').select('*').eq('committee', committee).order('rank', { ascending: true }).limit(200);
        return data || [];
      }
      const { data } = await supabase.from('member_rankings').select('*').order('committee', { ascending: true }).order('rank', { ascending: true }).limit(200);
      return data || [];
    } catch (err) {
      console.error('Fetch rankings failed', err);
      return [];
    }
  };

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
      <>
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
           <button onClick={() => { fetchApplications(); fetchBestMembers(); fetchHighBoardMembers(); fetchEvents(); fetchSuggestions(); fetchSettings(); fetchPortalData(); }} className="admin-action-btn secondary"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data</button>
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
            {['applications', 'best_members', 'high_board', 'events', 'suggestions', 'settings', 'portal'].map(tab => (
           <button key={tab} onClick={async () => { setActiveTab(tab); if (tab === 'portal') await fetchPortalData(); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/30 hover:text-white'}`}>
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
        ) : activeTab === 'portal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="admin-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Portal Tasks</p>
                  <h3 className="text-2xl font-black uppercase">Member Tasks</h3>
                </div>
                <div className="flex items-center gap-3">
                  <select value={portalTaskStatusFilter} onChange={(e) => setPortalTaskStatusFilter(e.target.value)} className="admin-inline-select">
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="submitted">Submitted</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select value={selectedCommittee} onChange={(e) => setSelectedCommittee(e.target.value)} className="admin-inline-select">
                    {(committees || ['All']).map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <button onClick={confirmBulkTasks} className="admin-action-btn" title="Confirm all submitted tasks matching filter"><CheckCircle size={14} /> Confirm All</button>
                  <button onClick={openTaskModal} className="admin-action-btn"><Plus size={14} /> New Task</button>
                  <button onClick={fetchPortalData} className="admin-action-btn secondary"><RefreshCw size={14} /> Refresh</button>
                </div>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Title</th><th>Assigned</th><th>Points</th><th>Diff</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {(portalTasks || []).filter(t => {
                      if (portalTaskStatusFilter !== 'all' && t.status !== portalTaskStatusFilter) return false;
                      if (!selectedCommittee || selectedCommittee === 'All') return true;
                      const assignee = portalMembers.find(m => m.id === t.assigned_to);
                      return assignee && assignee.committee === selectedCommittee;
                    }).map(t => (
                      <tr key={t.id}>
                        <td className="font-bold text-white uppercase">{t.title}</td>
                        <td className="text-sm text-white/60">{(portalMembers.find(m => m.id === t.assigned_to) || {}).name || t.assigned_to}</td>
                        <td className="text-center">{t.points || 0}</td>
                        <td className="text-center text-xs bg-white/[0.03] px-2 py-1 rounded">{t.difficulty ? `${t.difficulty}x` : '1x'}</td>
                        <td className="text-sm uppercase tracking-[0.2em]">{t.status}</td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            {t.status === 'submitted' && <button onClick={() => previewConfirmation(t)} className="admin-action-btn text-xs" title="Preview points and confirm"><Eye size={12} /> Preview</button>}
                            {t.status === 'completed' && <button onClick={() => adminToggleTaskComplete(t.id, 'open')} className="admin-action-btn secondary text-xs">Reopen</button>}
                            <button onClick={async () => {
                              if (!confirm('Delete this task?')) return;
                              await supabase.from('member_tasks').delete().eq('id', t.id);
                              await logAdminAction('delete_task', { task_id: t.id });
                              await fetchPortalData();
                            }} className="admin-action-btn secondary text-xs text-red-400 border-red-400/20">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Members</p>
                  <h3 className="text-xl font-black uppercase">Members & Scores</h3>
                </div>
              </div>

              <div className="space-y-3 max-h-[52vh] overflow-y-auto p-2">
                {(portalMembers || []).filter(m => !selectedCommittee || selectedCommittee === 'All' || m.committee === selectedCommittee).map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-white/[0.02] p-3 rounded-lg">
                    <div>
                      <div className="font-bold uppercase text-sm">{m.name}</div>
                      <div className="text-[10px] text-white/40">{m.member_id || ''} • {m.committee || '—'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-black text-lg">{m.points || 0}</div>
                      <button onClick={() => openScoreModal(m)} className="admin-action-btn small"><Edit size={12} /> Adjust</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-black uppercase text-white/30 mb-2">Committee Rankings</p>
                <div className="flex items-center gap-3 mb-3">
                  <select value={selectedCommittee} onChange={async (e) => { const c = e.target.value; setSelectedCommittee(c); const ranks = await fetchRankingsByCommittee(c); setPortalRankings(ranks || []); }} className="admin-inline-select">
                    {(committees || ['All']).map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <button onClick={async () => { const ranks = await fetchRankingsByCommittee(selectedCommittee); setPortalRankings(ranks || []); }} className="admin-action-btn secondary"><RefreshCw size={14}/> Load</button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(portalRankings || []).slice(0, 30).map(r => (
                    <div key={r.member_id || r.id} className="flex items-center justify-between bg-white/[0.02] p-2 rounded">
                      <div>
                        <div className="text-sm font-bold">{r.name || r.member_id}</div>
                        <div className="text-[10px] text-white/40">Rank #{r.rank} • {r.committee}</div>
                      </div>
                      <div className="font-black">{r.points || 0}</div>
                    </div>
                  ))}
                  {(!portalRankings || portalRankings.length === 0) && <div className="text-[10px] text-white/30">No rankings loaded.</div>}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-black uppercase text-white/30 mb-2">Admin Action Log</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(portalActionLogs || []).slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-center justify-between bg-white/[0.02] p-2 rounded">
                      <div>
                        <div className="text-sm font-bold uppercase">{log.action_type}</div>
                        <div className="text-[10px] text-white/40">{new Date(log.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-[10px] text-white/50 max-w-[220px] truncate">{JSON.stringify(log.payload || {})}</div>
                    </div>
                  ))}
                  {(!portalActionLogs || portalActionLogs.length === 0) && <div className="text-[10px] text-white/30">No admin actions logged yet.</div>}
                </div>
              </div>
            </div>
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
           <div className="space-y-6">
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
           <div className="admin-card max-w-2xl">
              <div className="flex items-center gap-3 mb-6 text-yellow-500">
                 <Award size={24} />
                <h3 className="text-xl font-black uppercase">Yearly Reset</h3>
              </div>
              <p className="text-sm text-white/50 mb-6">Reset all member points to 0 at the start of a new season. This action cannot be undone.</p>
              <button onClick={performYearlyReset} className="admin-action-btn bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white w-full justify-center py-4">Reset All Points to 0</button>
           </div>
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

          {isTaskModalOpen && (
            <div className="admin-login-overlay px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }} className="login-card large max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/60 mb-2">Portal Task</p>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Create New Task</h3>
                  </div>
                  <button onClick={() => setIsTaskModalOpen(false)} className="text-3xl text-white/10 hover:text-white">&times;</button>
                </div>
                <form onSubmit={submitTaskDraft} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="field-label !mb-2">Task Title</label>
                      <input className="login-field" required value={taskDraft.title} onChange={(e) => setTaskDraft(prev => ({ ...prev, title: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label !mb-2">Description</label>
                      <textarea className="login-field h-28 pt-4" required value={taskDraft.description} onChange={(e) => setTaskDraft(prev => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="field-label !mb-2">Committee (Filter Members)</label>
                      <select className="login-field" value={taskDraft.committee} onChange={(e) => {
                        setTaskDraft(prev => ({ ...prev, committee: e.target.value, assigned_to: '' }));
                      }}>
                        <option value="">All Committees</option>
                        {(committees || []).filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label !mb-2">Assign To Member</label>
                      <select className="login-field" value={taskDraft.assigned_to} onChange={(e) => {
                        const selected = portalMembers.find(m => (m.member_id || m.id) === e.target.value);
                        setTaskDraft(prev => ({ ...prev, assigned_to: e.target.value, committee: selected?.committee || '' }));
                      }}>
                        <option value="">Select member</option>
                        {(portalMembers || []).filter(member => !taskDraft.committee || member.committee === taskDraft.committee).map(member => (
                          <option key={member.id} value={member.member_id || member.id}>{member.name} ({member.committee})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label !mb-2">Difficulty</label>
                      <select className="login-field" value={taskDraft.difficulty} onChange={(e) => setTaskDraft(prev => ({ ...prev, difficulty: parseFloat(e.target.value) }))}>
                        <option value="1">Easy (1x) - 10 pts</option>
                        <option value="1.5">Medium (1.5x) - 15 pts</option>
                        <option value="2">Hard (2x) - 20 pts</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label !mb-2">Points (Auto)</label>
                      <input type="text" className="login-field bg-white/5" value={getAutoPoints(taskDraft.difficulty || 1)} disabled />
                    </div>
                    <div>
                      <label className="field-label !mb-2">Due Date</label>
                      <input type="date" className="login-field" value={taskDraft.due_at} onChange={(e) => setTaskDraft(prev => ({ ...prev, due_at: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setIsTaskModalOpen(false)} className="admin-action-btn secondary">Cancel</button>
                    <button type="submit" className="admin-action-btn"><Plus size={14} /> Create Task</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {isScoreModalOpen && (
            <div className="admin-login-overlay px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }} className="login-card large">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/60 mb-2">Portal Score</p>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Adjust Member Score</h3>
                  </div>
                  <button onClick={() => setIsScoreModalOpen(false)} className="text-3xl text-white/10 hover:text-white">&times;</button>
                </div>
                <form onSubmit={submitScoreDraft} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="field-label !mb-2">Member</label>
                      <select className="login-field" value={scoreDraft.memberId} onChange={(e) => setScoreDraft(prev => ({ ...prev, memberId: e.target.value }))}>
                        <option value="">Select member</option>
                        {(portalMembers || []).map(member => <option key={member.id} value={member.member_id || member.id}>{member.name} - {member.member_id}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label !mb-2">Points Delta</label>
                      <input type="number" className="login-field" value={scoreDraft.delta} onChange={(e) => setScoreDraft(prev => ({ ...prev, delta: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label !mb-2">Reason</label>
                      <textarea className="login-field h-20 pt-4" value={scoreDraft.reason} onChange={(e) => setScoreDraft(prev => ({ ...prev, reason: e.target.value }))} placeholder="e.g., Bonus for early submission" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label !mb-2">Justification (e.g., Late work - excused due to illness)</label>
                      <textarea className="login-field h-20 pt-4" value={scoreDraft.adjustment_reason} onChange={(e) => setScoreDraft(prev => ({ ...prev, adjustment_reason: e.target.value }))} placeholder="Optional: Add justification for override" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setIsScoreModalOpen(false)} className="admin-action-btn secondary">Cancel</button>
                    <button type="submit" className="admin-action-btn"><Award size={14} /> Save Score</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {isPreviewModalOpen && previewTask && (
            <div className="admin-login-overlay px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 12 }} className="login-card">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/60 mb-2">Preview Confirmation</p>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">Points Calculation</h3>
                  </div>
                  <button onClick={() => setIsPreviewModalOpen(false)} className="text-3xl text-white/10 hover:text-white">&times;</button>
                </div>
                <div className="space-y-4 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Task</p>
                      <p className="text-sm font-bold text-white">{previewTask.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Assigned To</p>
                      <p className="text-sm font-bold text-white">{previewTask.assigneeName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Base Points</p>
                      <p className="text-sm font-bold text-white">{previewTask.points}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Difficulty</p>
                      <p className="text-sm font-bold text-white">{previewTask.difficultyMultiplier}x</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Days Late</p>
                      <p className="text-sm font-bold text-white">{previewTask.daysLate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Status</p>
                      <p className="text-sm font-bold text-yellow-400">{previewTask.status}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-[10px] font-black uppercase text-primary mb-2">Points to Award</p>
                    <p className="text-3xl font-black text-primary">{previewTask.previewPoints}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setIsPreviewModalOpen(false)} className="admin-action-btn secondary">Cancel</button>
                  <button type="button" onClick={() => { setIsPreviewModalOpen(false); adminConfirmTask(previewTask.id); }} className="admin-action-btn"><CheckCircle size={14} /> Confirm & Award</button>
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
        </>
    </div>
  );
};

export default AdminDashboard;
