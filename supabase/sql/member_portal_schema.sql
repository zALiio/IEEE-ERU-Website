-- Member Portal Database Schema
-- Run this in Supabase SQL editor

-- =============== MEMBERS TABLE UPDATES ===============
-- Add authentication fields to members table
ALTER TABLE IF EXISTS public.members
  ADD COLUMN IF NOT EXISTS member_id text unique,
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS committee text,
  ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members (member_id);
CREATE INDEX IF NOT EXISTS idx_members_committee ON public.members (committee);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members (is_active);

-- =============== MEMBER TASKS TABLE ===============
CREATE TABLE IF NOT EXISTS public.member_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  points integer DEFAULT 0,
  status text NOT NULL DEFAULT 'open', -- open, in_progress, completed, cancelled
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_tasks_assigned_to ON public.member_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_member_tasks_status ON public.member_tasks (status);
CREATE INDEX IF NOT EXISTS idx_member_tasks_due_at ON public.member_tasks (due_at);

-- =============== MEMBER POINTS LOG TABLE ===============
CREATE TABLE IF NOT EXISTS public.member_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.member_tasks(id) ON DELETE SET NULL,
  points integer NOT NULL DEFAULT 0,
  reason text, -- e.g., "Task Delivery", "Meeting Adherence", "Bonus"
  category text, -- e.g., "task", "meeting", "support", "bonus"
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_points_log_member_id ON public.member_points_log (member_id);
CREATE INDEX IF NOT EXISTS idx_member_points_log_created_at ON public.member_points_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_points_log_category ON public.member_points_log (category);

-- =============== MEMBER RANKINGS VIEW (COMMITTEE ONLY) ===============
-- Get committee rank for each member
CREATE OR REPLACE VIEW public.member_rankings AS
SELECT
  m.id,
  m.member_id,
  m.name,
  m.committee,
  m.points,
  ROW_NUMBER() OVER (
    PARTITION BY m.committee
    ORDER BY m.points DESC NULLS LAST
  ) AS committee_rank,
  (SELECT COUNT(*) FROM public.members WHERE committee = m.committee AND is_active = true) AS committee_total
FROM public.members m
WHERE m.is_active = true AND m.committee IS NOT NULL;

-- =============== HELPER FUNCTIONS ===============

-- Verify member login credentials
CREATE OR REPLACE FUNCTION public.verify_member_login(p_member_id text, p_password text)
RETURNS TABLE (
  id uuid,
  member_id text,
  name text,
  email text,
  committee text,
  points integer,
  role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.member_id,
    m.name,
    m.email,
    m.committee,
    COALESCE(m.points, 0),
    m.role
  FROM public.members m
  WHERE m.member_id = p_member_id
    AND m.password_hash = p_password  -- Note: in production, use proper hash comparison
    AND m.is_active = true
  LIMIT 1;
$$;

-- Award points to member
CREATE OR REPLACE FUNCTION public.award_member_points(
  p_member_id uuid,
  p_points integer,
  p_reason text,
  p_category text DEFAULT 'general',
  p_task_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add to points log
  INSERT INTO public.member_points_log (member_id, task_id, points, reason, category)
  VALUES (p_member_id, p_task_id, p_points, p_reason, p_category);

  -- Update member total points
  UPDATE public.members
  SET points = COALESCE(points, 0) + p_points
  WHERE id = p_member_id;
END;
$$;

-- Mark task as completed
CREATE OR REPLACE FUNCTION public.complete_member_task(
  p_task_id uuid,
  p_award_points boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assigned_to uuid;
  v_points integer;
BEGIN
  -- Get task details
  SELECT assigned_to, points INTO v_assigned_to, v_points
  FROM public.member_tasks
  WHERE id = p_task_id;

  -- Mark task as completed
  UPDATE public.member_tasks
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = p_task_id;

  -- Award points if enabled
  IF p_award_points AND v_points > 0 THEN
    PERFORM public.award_member_points(
      v_assigned_to,
      v_points,
      'Task Completed',
      'task',
      p_task_id
    );
  END IF;
END;
$$;

-- =============== ROW LEVEL SECURITY ===============

ALTER TABLE public.member_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_points_log ENABLE ROW LEVEL SECURITY;

-- Note: You can add specific RLS policies if needed
-- For now, these tables are read-only from the frontend

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_member_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_member_points(uuid, integer, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_member_task(uuid, boolean) TO authenticated;
