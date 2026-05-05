import { createClient } from '@supabase/supabase-js';

// Use environment variables only (production-safe)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Simple in-memory mock used during local development when Supabase is not configured
const createMockSupabase = () => {
  const db = {
    applications: [
      { id: 1, name: 'Alice Example', email: 'alice@example.com', position: 'Member', status: 'pending', created_at: new Date().toISOString() },
      { id: 2, name: 'Bob Example', email: 'bob@example.com', position: 'Volunteer', status: 'approved', created_at: new Date().toISOString() }
    ],
    best_members: [],
    high_board: [],
    events: [],
    suggestions: [],
    settings: [],
    members: [
      { id: 1, member_id: 'M001', name: 'Alice Example', committee: 'Robotics', points: 120, role: 'Member', created_at: new Date().toISOString() },
      { id: 2, member_id: 'M002', name: 'Bob Example', committee: 'Media', points: 80, role: 'Volunteer', created_at: new Date().toISOString() }
    ],
    member_tasks: [],
    member_points_log: [],
    admin_actions_log: []
  };

  const tableProxy = (table) => {
    const select = function () {
      this._op = 'select';
      // return a thenable query object so `await supabase.from(...).select(...).order(...)` works
      const query = {};
      query._filter = null;
      query.eq = function (col, val) { query._filter = { col, val }; return query; };
      query.order = function () { return query; };
      query.limit = function () { return query; };
      query.single = async function () {
        let rows = db[table] || [];
        if (query._filter) rows = rows.filter(r => String(r[query._filter.col]) === String(query._filter.val));
        return { data: rows[0] || null, error: null };
      };
      query.then = async (onFulfilled, onRejected) => {
        try {
          let rows = db[table] || [];
          if (query._filter) rows = rows.filter(r => String(r[query._filter.col]) === String(query._filter.val));
          const result = { data: rows.slice(), error: null };
          if (onFulfilled) onFulfilled(result);
          return result;
        } catch (err) {
          if (onRejected) onRejected(err);
          return { data: null, error: err };
        }
      };
      return query;
    };
    const eq = function (col, val) { this._filter = { col, val }; return this; };
    const order = function () { return this; };
    const limit = function () { return this; };
    const single = async function () {
      let rows = db[table] || [];
      if (this._filter) rows = rows.filter(r => String(r[this._filter.col]) === String(this._filter.val));
      return { data: rows[0] || null, error: null };
    };
    const insert = async function (rows) {
      const arr = Array.isArray(rows) ? rows : [rows];
      arr.forEach(r => { r.id = (db[table].length ? (db[table][db[table].length-1].id || db[table].length) + 1 : 1); r.created_at = new Date().toISOString(); db[table].push(r); });
      return { data: arr, error: null };
    };
    const update = async function (payload) {
      if (!this._filter) return { data: null, error: new Error('mock update requires eq filter') };
      const rows = db[table].filter(r => String(r[this._filter.col]) === String(this._filter.val));
      rows.forEach(r => Object.assign(r, payload));
      return { data: rows, error: null };
    };
    const del = async function () {
      if (!this._filter) return { data: null, error: new Error('mock delete requires eq filter') };
      const before = db[table].length;
      const keep = db[table].filter(r => String(r[this._filter.col]) !== String(this._filter.val));
      db[table].length = 0; db[table].push(...keep);
      return { data: null, error: null };
    };
    return { select, eq, single, insert, update, delete: del, order, limit };
  };

  return {
    from: (table) => tableProxy(table),
    storage: {
      from: (bucket) => ({
        upload: async (name, file) => {
          // pretend upload succeeded
          return { error: null };
        },
        getPublicUrl: (name) => ({ data: { publicUrl: `/src/assets/${name}` } })
      })
    }
  };
};

let supabaseClient = null;

// Treat obvious placeholder values as "not configured" so local dev falls back to mock
const looksLikePlaceholder = (url, key) => {
  if (!url || !key) return true;
  const lowerUrl = String(url).toLowerCase();
  const lowerKey = String(key).toLowerCase();
  if (lowerUrl.includes('example') || lowerKey.includes('placeholder') || lowerKey.includes('anon-key')) return true;
  return false;
};

if (looksLikePlaceholder(supabaseUrl, supabaseAnonKey)) {
  if (import.meta.env.DEV) {
    console.warn('Supabase env appears placeholder or missing — using in-memory mock for development');
    supabaseClient = createMockSupabase();
  } else {
    throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Failed to create Supabase client — falling back to mock in development', e.message);
      supabaseClient = createMockSupabase();
    } else {
      throw e;
    }
  }
}

export const supabase = supabaseClient;
