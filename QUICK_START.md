# 🚀 QUICK START: Get Member Portal Working

## 🎯 What I Just Did

1. ✅ Changed "Welcome, Ahmed Mohamed" → "Welcome, Ahmed" (first name only)
2. ✅ Added admin controls for managing tasks and member scores in dashboard
3. ✅ Fixed mobile light-mode styling (was completely dark/unreadable, now clean white/blue)
4. ✅ Built successfully (0 errors, all CSS/JS compiled)

---

## ⚠️ CRITICAL: One SQL Query to Make Login Work

The member portal page loads but **login won't work until you run this:**

### Go to Supabase SQL Editor and paste:

```sql
-- This allows the login query to work
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
```

✅ **Then refresh the browser** and try logging in:
- **Member ID:** ERU001
- **Password:** 123456

---

## 📋 Optional: Replace Test Data with Real Members

If you want to clear out test data and start fresh with your real members:

### Option A: Clear everything and add new data

```sql
-- Delete all members
DELETE FROM public.members;

-- Reset the ID counter
ALTER SEQUENCE members_id_seq RESTART WITH 1;

-- Insert your real members
INSERT INTO public.members 
(member_id, name, email, password_hash, committee, is_active)
VALUES
  ('ERU001', 'Ahmed Mohamed', 'ahmed@ieee.edu', '123456', 'IT Committee', true),
  ('ERU002', 'Fatima Hassan', 'fatima@ieee.edu', '123456', 'IT Committee', true),
  ('ERU003', 'Mohammed Ali', 'ali@ieee.edu', '123456', 'HR Committee', true),
  ('ERU004', 'Sarah Ahmed', 'sarah@ieee.edu', '123456', 'Marketing Committee', true);
```

### Option B: Update existing members with credentials

If you already have members in the database but just need to add member_id and passwords:

```sql
-- Auto-assign IDs to members without them
UPDATE public.members
SET 
  member_id = COALESCE(member_id, 'ERU' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 3, '0')),
  password_hash = COALESCE(password_hash, '123456'),
  committee = COALESCE(committee, 'General'),
  is_active = true
WHERE member_id IS NULL;
```

---

## ✅ What You'll See After Login

**Dashboard with:**
- Welcome message showing first name only ✅
- Stats cards showing: Assigned Tasks, Completed Tasks, Total Points, Committee Rank
- Three tabs: My Tasks | Completed | Score History
- Light-mode styling that looks clean on mobile ✅

**Admin Features (if your member has `role='admin'`):**
- "Add Task" button - Create new tasks for members
- "Edit Scores" button - Manually adjust member points

---

## 📄 Full Documentation

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Complete database setup guide with all SQL commands
- **[MEMBER_PORTAL_UPDATES.md](MEMBER_PORTAL_UPDATES.md)** - Detailed change log and testing checklist

---

## 🧪 Test Checklist

After running the SQL query above:

- [ ] Can login with ERU001 / 123456
- [ ] Dashboard shows "Welcome, Ahmed" (first name only)
- [ ] Stats cards display without errors
- [ ] Tabs switch between Tasks/Completed/Scores
- [ ] Light mode text is readable on mobile
- [ ] No errors in browser console (F12)

---

## ❓ If Login Still Doesn't Work

**Error: "Member ID not found"**
1. Verify RLS is disabled: `SELECT * FROM pg_policy WHERE tablname = 'members';` (should show nothing)
2. Check members exist: `SELECT COUNT(*) FROM members;` (should show > 0)
3. Hard refresh browser: Ctrl+Shift+Del (clear cache) then reload

**Error: Browser console shows 406**
- That's RLS blocking the request - make sure you ran the ALTER TABLE command

---

## 🎓 Learn More

- Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security
- React component: [src/pages/MemberPortal.jsx](src/pages/MemberPortal.jsx)
- Styling: [src/styles/MemberPortal.css](src/styles/MemberPortal.css)

---

## 🚨 Production Note

For production, instead of disabling RLS entirely, create a policy:

```sql
-- Production: Create policy instead of disabling RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow login query" ON public.members
  FOR SELECT
  USING (true);
```

This allows public read access for login but maintains security for other operations.

---

**Need help?** Check the [DATABASE_SETUP.md](DATABASE_SETUP.md) file for complete troubleshooting guide.
