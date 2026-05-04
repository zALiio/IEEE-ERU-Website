# IEEE ERU Member Portal - Database Setup Guide

## Quick Summary

The member portal is now functioning with:
- ✅ First name display (fixed "Welcome Ahmed Mohamed" → "Welcome Ahmed")
- ✅ Admin controls for adding tasks and editing scores
- ✅ Mobile light-mode styling fixed
- ⚠️ **NEXT STEPS**: Disable RLS on members table so login works, then replace test data with real members

---

## Step 1: Disable Row Level Security (RLS) on Members Table

The login is failing because the `members` table has Row Level Security (RLS) enabled, which blocks the anonymous Supabase key from querying it.

**In Supabase SQL Editor, run:**

```sql
-- Disable RLS on members table so login queries work
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
```

⏸️ **Wait 5 seconds after running** to let the database propagate the change.

---

## Step 2: Clear Test Data & Load Real Members

If you have test members (ERU001-ERU004) that should be replaced:

```sql
-- Delete all existing members to start fresh
DELETE FROM public.members;

-- Reset ID sequence
ALTER SEQUENCE members_id_seq RESTART WITH 1;
```

---

## Step 3: Insert Your Real Members

If you're migrating from a different table or have CSV data, insert here:

```sql
-- Example: Insert real members with auto-generated IDs
INSERT INTO public.members 
(member_id, name, email, password_hash, committee, points, is_active, role)
VALUES
  ('ERU001', 'Ahmed Mohamed', 'ahmed@ieee.edu', '123456', 'IT Committee', 0, true, 'member'),
  ('ERU002', 'Fatima Hassan', 'fatima@ieee.edu', '123456', 'IT Committee', 0, true, 'member'),
  ('ERU003', 'Mohammed Ali', 'ali@ieee.edu', '123456', 'HR Committee', 0, true, 'member'),
  ('ERU004', 'Sarah Ahmed', 'sarah@ieee.edu', '123456', 'Marketing Committee', 0, true, 'member'),
  ('ERU005', 'Admin User', 'admin@ieee.edu', '123456', 'Admin', 0, true, 'admin');
```

### Alternative: If you have members without credentials

If your `members` table already has data but missing `member_id` and `password_hash`:

```sql
-- Auto-assign member IDs and default password to existing members
UPDATE public.members
SET 
  member_id = COALESCE(member_id, 'ERU' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 3, '0')),
  password_hash = COALESCE(password_hash, '123456'),
  committee = COALESCE(committee, 'General'),
  is_active = true
WHERE member_id IS NULL OR password_hash IS NULL;
```

---

## Step 4: Verify Member Data

```sql
-- Check all members are properly set up
SELECT member_id, name, email, committee, is_active FROM public.members ORDER BY created_at;
```

**Expected output:**
```
member_id | name           | email              | committee           | is_active
-----------|---------------|--------------------|---------------------|----------
ERU001    | Ahmed Mohamed  | ahmed@ieee.edu     | IT Committee        | true
ERU002    | Fatima Hassan  | fatima@ieee.edu    | IT Committee        | true
ERU003    | Mohammed Ali   | ali@ieee.edu       | HR Committee        | true
ERU004    | Sarah Ahmed    | sarah@ieee.edu     | Marketing Committee | true
```

---

## Step 5: Test Login

**In browser:** Navigate to `http://localhost:5175/member`

**Login with:**
- Member ID: `ERU001`
- Password: `123456`

✅ **Expected result:** Dashboard loads showing "Welcome, Ahmed" with task stats

---

## Step 6: Create Sample Tasks (Optional)

For testing the task dashboard:

```sql
-- Insert sample tasks for members
INSERT INTO public.member_tasks 
(assigned_to, title, description, category, points, status, due_at, created_at)
VALUES
  (1, 'Complete IEEE Induction', 'Mandatory orientation program', 'General', 10, 'open', NOW() + INTERVAL '7 days', NOW()),
  (1, 'Review IEEE Code of Conduct', 'Read and acknowledge IEEE CoC', 'General', 5, 'open', NOW() + INTERVAL '3 days', NOW()),
  (1, 'Submit Portfolio', 'Share your technical portfolio', 'Development', 25, 'in_progress', NOW() + INTERVAL '14 days', NOW()),
  (2, 'Event Planning Meeting', 'Attend committee meeting', 'Planning', 15, 'open', NOW() + INTERVAL '2 days', NOW());
```

---

## Step 8: (Optional) Log Portal Accesses

To record when volunteers click the Hub button, create a small table to store access events.

```sql
CREATE TABLE public.portal_access_logs (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.portal_access_logs (accessed_at);
```

Your frontend automatically attempts to insert a row into `portal_access_logs` when someone clicks the fixed "IEEEIANS Hub" button. If the table is missing, the insert will fail silently.

---

## Step 9: (Recommended) Add Admin Action Logging

If you want to audit who creates tasks or adjusts points, add a small log table:

```sql
CREATE TABLE public.admin_actions_log (
  id bigserial PRIMARY KEY,
  action_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.admin_actions_log (created_at DESC);
```

---

## Step 10: (Recommended) Use an Atomic RPC for Score Changes

The frontend currently updates points in two steps. For stronger consistency, move the write into a Postgres function:

```sql
CREATE OR REPLACE FUNCTION public.adjust_member_points(p_member_id bigint, p_delta integer, p_reason text DEFAULT 'Admin adjustment')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.member_points_log (member_id, task_id, points, reason, created_at)
  VALUES (p_member_id, NULL, p_delta, p_reason, now());

  UPDATE public.members
  SET points = COALESCE(points, 0) + p_delta
  WHERE id = p_member_id;
END;
$$;

-- optional: allow the frontend to call it via Supabase RPC
GRANT EXECUTE ON FUNCTION public.adjust_member_points(bigint, integer, text) TO anon, authenticated;
```

You can then replace the direct score update flow with a single RPC call from the portal UI.


---

## Step 7: (Optional) Set Up Proper RLS Policies

For production security, you can enable RLS back with policies:

```sql
-- Re-enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to query by member_id (for login)
CREATE POLICY "Allow login query" ON public.members
  FOR SELECT
  USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Allow user read own data" ON public.members
  FOR SELECT
  USING (id = auth.uid());
```

---

## Troubleshooting

### ❌ Still seeing "Member ID not found"
- Clear browser cache (Ctrl+Shift+Delete)
- Verify RLS is disabled: `SELECT * FROM pg_tables WHERE tablename = 'members' AND schemaname = 'public';`
- Check member data exists: `SELECT COUNT(*) FROM members;`

### ❌ Login button shows "Signing in..." forever
- Check browser console (F12) for errors
- Verify Supabase credentials in [src/lib/supabaseClient.js](src/lib/supabaseClient.js)
- Ensure database connection is active in Supabase dashboard

### ❌ Points not updating after tasks
- Verify `member_points_log` table exists
- Check that `member_rankings` view is created
- Verify `points` column on members table is not NULL

---

## Admin Controls

**If you login with a member that has `role = 'admin'`, you'll see:**
- "Add Task" button → Opens modal to create new member tasks
- "Edit Scores" button → Opens modal to adjust member points manually

**Example admin member SQL:**
```sql
INSERT INTO public.members 
(member_id, name, email, password_hash, committee, role, is_active)
VALUES ('ADMIN01', 'Admin User', 'admin@ieee.edu', '123456', 'Admin', 'admin', true);
```

---

## Enhanced Scoring System (All 12 Suggestions Implemented)

The admin dashboard now includes advanced scoring features:

### New Database Fields

#### 1. **Task Difficulty Level** (Suggestion #8)
Add difficulty multiplier to `member_tasks` table:
```sql
ALTER TABLE public.member_tasks ADD COLUMN IF NOT EXISTS difficulty DECIMAL(3,1) DEFAULT 1.0;
-- Easy = 1x (default), Medium = 1.5x, Hard = 2x
```

#### 2. **Adjustment Reason** (Suggestion #11)
Add justification field to `member_points_log` table:
```sql
ALTER TABLE public.member_points_log ADD COLUMN IF NOT EXISTS adjustment_reason TEXT;
-- Example: "Late submission - excused due to hospital admission"
```

### Enhanced Scoring Logic

**Automatic Point Calculation Based on Submission Timing:**

| Timing | Multiplier | Notes |
|--------|------------|-------|
| **4+ days early** | 125% | Bonus for early submission |
| **1-3 days early** | 110% | Encourages proactive work |
| **On-time or within 6-hour grace** | 100% | Full points |
| **1-3 days late** | 70% | Soft penalty |
| **4-7 days late** | 50% | Medium penalty |
| **8+ days late** | 25% | Heavy penalty |

**Total Points = Base Points × Difficulty × Timing Multiplier**

### New Admin Features Implemented

1. ✅ **Preview Confirmation** - See calculated points before confirming
2. ✅ **Bulk Confirm Tasks** - Confirm all filtered tasks in one click
3. ✅ **Undo/Revert** - Revert task confirmation and return points
4. ✅ **Difficulty Multiplier** - Easy (1x), Medium (1.5x), Hard (2x)
5. ✅ **Adjustment Justification** - Store reason for overrides
6. ✅ **Committee Custom Rules** - Override penalties per committee
7. ✅ **Yearly Reset** - Reset all points at season start
8. ✅ **Grace Period** - 6-hour grace before penalties apply
9. ✅ **Enhanced Audit Log** - Log all actions with full details
10. ✅ **Early Submission Bonus** - Reward early work (110%-125%)
11. ✅ **Softer Late Penalties** - Sliding scale (70%, 50%, 25%)
12. ✅ **Better UX** - Difficulty field in task creation modal

---

## References

- Member Portal Component: [src/pages/MemberPortal.jsx](src/pages/MemberPortal.jsx)
- Admin Dashboard: [src/pages/AdminDashboard.jsx](src/pages/AdminDashboard.jsx)
- Styling: [src/styles/Admin.css](src/styles/Admin.css)
- Supabase Client: [src/lib/supabaseClient.js](src/lib/supabaseClient.js)
