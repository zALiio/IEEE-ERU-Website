import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import Meta from '../components/Meta';
import {
  LogIn, LogOut, Award, CheckCircle, Clock, TrendingUp, Users, Target,
  Calendar, Zap, Eye, EyeOff
} from 'lucide-react';
import '../styles/MemberPortal.css';

const MemberPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form
  const [loginForm, setLoginForm] = useState({ memberId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', points: 0, assigned_to: '' });
  const [scoreEdit, setScoreEdit] = useState({ memberId: '', delta: 0, reason: '' });

  // Dashboard data
  const [activeTab, setActiveTab] = useState('tasks');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [committeeRank, setCommitteeRank] = useState(null);
  const [committeeTotal, setCommitteeTotal] = useState(null);

  // Check for existing session
  useEffect(() => {
    const savedMember = localStorage.getItem('member-session');
    if (savedMember) {
      try {
        const parsedMember = JSON.parse(savedMember);
        setMember(parsedMember);
        setIsLoggedIn(true);
        setNewTask(prev => ({ ...prev, assigned_to: parsedMember.id }));
        loadMemberData(parsedMember.id);
      } catch (err) {
        console.error('Session parse error:', err);
        localStorage.removeItem('member-session');
      }
    }
  }, []);

  const firstName = member?.name ? member.name.split(' ')[0] : (member?.member_id || 'Member');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For demo: simple validation. In production, hash passwords server-side
      const { data: members, error: queryError } = await supabase
        .from('members')
        .select('*')
        .eq('member_id', loginForm.memberId.trim())
        .single();

      if (queryError || !members) {
        throw new Error('Member ID not found');
      }

      // Simple password check (in production, use hashed comparison)
      if (members.password_hash !== loginForm.password) {
        throw new Error('Invalid password');
      }

      // Store session
      const sessionData = {
        id: members.id,
        member_id: members.member_id,
        name: members.name,
        email: members.email,
        committee: members.committee,
        points: members.points || 0,
        role: members.role
      };

      localStorage.setItem('member-session', JSON.stringify(sessionData));
      setMember(sessionData);
      setLoginForm({ memberId: '', password: '' });
      setIsLoggedIn(true);

      await loadMemberData(members.id);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberData = async (memberId) => {
    try {
      // Fetch assigned tasks (open, in progress, submitted)
      const { data: assigned } = await supabase
        .from('member_tasks')
        .select('*')
        .eq('assigned_to', memberId)
        .in('status', ['open', 'in_progress', 'submitted'])
        .order('due_at', { ascending: true });

      // Fetch completed tasks
      const { data: completed } = await supabase
        .from('member_tasks')
        .select('*')
        .eq('assigned_to', memberId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      // Fetch points history
      const { data: points } = await supabase
        .from('member_points_log')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch rankings
      const { data: rankings } = await supabase
        .from('member_rankings')
        .select('*')
        .eq('member_id', memberId)
        .single();

      setAssignedTasks(assigned || []);
      setCompletedTasks(completed || []);
      setPointsHistory(points || []);
      if (rankings) {
        setCommitteeRank(rankings.committee_rank);
        setCommitteeTotal(rankings.committee_total);
      }
    } catch (err) {
      console.error('Error loading member data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('member-session');
    setMember(null);
    setIsLoggedIn(false);
    setAssignedTasks([]);
    setCompletedTasks([]);
    setPointsHistory([]);
  };

  // Admin: create a new task
  const handleCreateTask = async () => {
    try {
      const payload = {
        assigned_to: newTask.assigned_to || member.id,
        title: newTask.title,
        description: newTask.description,
        category: newTask.category || 'General',
        points: newTask.points || 0,
        status: 'open',
        due_at: newTask.due_at || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('member_tasks').insert([payload]);
      if (error) throw error;
      // refresh data
      await loadMemberData(member.id);
      setShowAddTask(false);
      setNewTask({ title: '', description: '', points: 0, assigned_to: member.id });
    } catch (err) {
      console.error('Create task error', err);
      alert('Failed to create task');
    }
  };

  // Admin: update member score manually
  const handleUpdateScore = async () => {
    try {
      if (!scoreEdit.memberId) throw new Error('Member ID required');
      // insert into points log
      const entry = {
        member_id: scoreEdit.memberId,
        task_id: null,
        points: scoreEdit.delta,
        reason: scoreEdit.reason || 'Manual adjustment',
        category: 'admin_adjustment',
        created_at: new Date().toISOString()
      };
      const { error: insertError } = await supabase.from('member_points_log').insert([entry]);
      if (insertError) throw insertError;

      // update members points
      const { data: memberRow, error: memberError } = await supabase.from('members').select('id, points').eq('member_id', scoreEdit.memberId).single();
      if (memberError || !memberRow) throw memberError || new Error('Member not found');

      const newPoints = (memberRow.points || 0) + (scoreEdit.delta || 0);
      const { error: updateError } = await supabase.from('members').update({ points: newPoints }).eq('id', memberRow.id);
      if (updateError) throw updateError;

      // refresh if current member affected
      if (memberRow.id === member.id) await loadMemberData(member.id);
      setShowEditScore(false);
      setScoreEdit({ memberId: '', delta: 0, reason: '' });
    } catch (err) {
      console.error('Update score error', err);
      alert('Failed to update score');
    }
  };

  // Admin: confirm task submission and award points
  const handleConfirmTask = async (task) => {
    try {
      // mark task completed
      const { error: taskErr } = await supabase.from('member_tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', task.id);
      if (taskErr) throw taskErr;

      // award points
      const logEntry = {
        member_id: task.assigned_to,
        task_id: task.id,
        points: task.points || 0,
        reason: 'Task completion',
        category: task.category || 'task',
        created_at: new Date().toISOString()
      };
      const { error: logErr } = await supabase.from('member_points_log').insert([logEntry]);
      if (logErr) throw logErr;

      // update member points
      const { data: mRow } = await supabase.from('members').select('id, points').eq('id', task.assigned_to).single();
      const updatedPoints = (mRow.points || 0) + (task.points || 0);
      await supabase.from('members').update({ points: updatedPoints }).eq('id', mRow.id);

      // refresh
      await loadMemberData(member.id);
    } catch (err) {
      console.error('Confirm task error', err);
      alert('Failed to confirm task');
    }
  };

  // Member: submit task for review
  const handleSubmitTask = async (task) => {
    try {
      const { error } = await supabase
        .from('member_tasks')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', task.id);
      
      if (error) throw error;
      
      await loadMemberData(member.id);
      alert('Task submitted! Admin will review and confirm.');
    } catch (err) {
      console.error('Submit task error', err);
      alert('Failed to submit task');
    }
  };

  const getPointColor = (points) => {
    if (points > 0) return 'text-green-400';
    if (points < 0) return 'text-red-400';
    return 'text-white/60';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'open':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default:
        return 'bg-white/5 text-white/50 border border-white/5';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="member-portal-page">
        <Meta
          title="Member Login Portal"
          description="Log in to view your tasks, score history, and community rankings"
          keywords="IEEE ERU member portal, task tracking, performance"
        />

        <div className="member-portal-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="login-section"
          >
            <div className="login-header">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="login-icon-box"
              >
                <Users size={32} />
              </motion.div>
              <h1 className="login-title">Member Portal</h1>
              <p className="login-subtitle">Access your tasks & performance</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">Member ID</label>
                <input
                  type="text"
                  placeholder="e.g., ERU001"
                  value={loginForm.memberId}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, memberId: e.target.value });
                    setError('');
                  }}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      setError('');
                    }}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="error-box"
                >
                  {error}
                </motion.div>
              )}

              <button type="submit" disabled={loading} className="login-button">
                <LogIn size={14} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Only accessible to registered community members
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="member-portal-page">
      <Meta
        title={`${firstName} - Member Portal`}
        description="Your task dashboard and performance metrics"
      />

      <div className="member-portal-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div className="header-left">
            <div className="member-info">
              <h1 className="member-welcome">Welcome, <span className="text-primary">{firstName}</span></h1>
              <p className="member-meta">
                {member.committee} • {member.points} Points
              </p>
            </div>
          </div>
          <div className="header-actions">
            {member?.role === 'admin' && (
              <>
                <button className="btn secondary" onClick={() => setShowAddTask(true)}>Add Task</button>
                <button className="btn secondary ml-2" onClick={() => setShowEditScore(true)}>Edit Scores</button>
              </>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={14} /> Sign Out
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="stat-icon blue">
              <Target size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Assigned Tasks</p>
              <p className="stat-value">{assignedTasks.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Completed Tasks</p>
              <p className="stat-value">{completedTasks.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="stat-icon yellow">
              <Award size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Points</p>
              <p className="stat-value">{member.points}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card"
          >
            <div className="stat-icon purple">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Committee Rank</p>
              <p className="stat-value">#{committeeRank || '—'}</p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              <Clock size={14} /> My Tasks
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            >
              <CheckCircle size={14} /> Completed
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`tab-button ${activeTab === 'scores' ? 'active' : ''}`}
            >
              <TrendingUp size={14} /> Score History
            </button>
          </div>

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tab-content"
            >
              {assignedTasks.length === 0 ? (
                <div className="empty-state">
                  <Zap size={32} />
                  <p>No active tasks assigned yet</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {assignedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="task-card"
                    >
                      <div className="task-header">
                        <h3 className="task-title">{task.title}</h3>
                        <span className={`task-badge ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && <p className="task-description">{task.description}</p>}
                          <div className="task-meta">
                            {task.due_at && (
                              <div className="meta-item">
                                <Calendar size={12} />
                                <span>Due: {new Date(task.due_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            {task.points && (
                              <div className="meta-item">
                                <Award size={12} />
                                <span>+{task.points} points</span>
                              </div>
                            )}
                          </div>
                          {member?.role === 'admin' && (
                            <div className="task-actions mt-3 flex gap-2">
                              {task.status !== 'completed' && (
                                <button className="btn secondary" onClick={() => handleConfirmTask(task)}>Confirm Submission</button>
                              )}
                            </div>
                          )}
                          {member?.role !== 'admin' && (
                            <div className="task-actions mt-3 flex gap-2">
                              {(task.status === 'open' || task.status === 'in_progress') && (
                                <button className="btn" onClick={() => handleSubmitTask(task)}>Submit Task</button>
                              )}
                              {task.status === 'submitted' && (
                                <div className="text-sm text-yellow-400">Awaiting admin confirmation...</div>
                              )}
                            </div>
                          )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tab-content"
            >
              {completedTasks.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={32} />
                  <p>No completed tasks yet</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {completedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="task-card completed"
                    >
                      <div className="task-header">
                        <h3 className="task-title">{task.title}</h3>
                        <span className={`task-badge ${getStatusBadgeClass('completed')}`}>
                          ✓ Completed
                        </span>
                      </div>
                      {task.description && <p className="task-description">{task.description}</p>}
                      <div className="task-meta">
                        {task.completed_at && (
                          <div className="meta-item">
                            <Calendar size={12} />
                            <span>Completed: {new Date(task.completed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.points && (
                          <div className="meta-item green">
                            <Award size={12} />
                            <span>+{task.points} points earned</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Score History Tab */}
          {activeTab === 'scores' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tab-content"
            >
              {/* Committee Ranking Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ranking-card"
              >
                <div className="ranking-icon">🏆</div>
                <div className="ranking-content">
                  <p className="ranking-label">Your Committee Rank</p>
                  <p className="ranking-value">#{committeeRank || '—'} of {committeeTotal || '?'}</p>
                  <p className="ranking-meta">{member.committee}</p>
                </div>
              </motion.div>

              {/* Points History */}
              <div className="points-history">
                <h3 className="history-title">Points History</h3>
                {pointsHistory.length === 0 ? (
                  <div className="empty-state">
                    <Zap size={24} />
                    <p>No points history yet</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {pointsHistory.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="history-item"
                      >
                        <div className="history-left">
                          <p className="history-reason">{entry.reason || 'Point Update'}</p>
                          <p className="history-date">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`history-points ${getPointColor(entry.points)}`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="modal-title">Create New Task</h2>
                <div className="modal-form">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="form-input"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="form-input"
                    rows="3"
                  />
                  <input
                    type="number"
                    placeholder="Points"
                    value={newTask.points}
                    onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                  <div className="modal-actions">
                    <button className="btn secondary" onClick={() => setShowAddTask(false)}>Cancel</button>
                    <button className="btn primary">Save Task</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Score Modal */}
        <AnimatePresence>
          {showEditScore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowEditScore(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="modal-title">Edit Member Score</h2>
                <div className="modal-form">
                  <input
                    type="text"
                    placeholder="Member ID (e.g., ERU001)"
                    value={scoreEdit.memberId}
                    onChange={(e) => setScoreEdit({ ...scoreEdit, memberId: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="Points to add/subtract"
                    value={scoreEdit.delta}
                    onChange={(e) => setScoreEdit({ ...scoreEdit, delta: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                  <textarea
                    placeholder="Reason for points change"
                    value={scoreEdit.reason}
                    onChange={(e) => setScoreEdit({ ...scoreEdit, reason: e.target.value })}
                    className="form-input"
                    rows="2"
                  />
                  <div className="modal-actions">
                    <button className="btn secondary" onClick={() => setShowEditScore(false)}>Cancel</button>
                    <button className="btn primary">Update Score</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemberPortal;
