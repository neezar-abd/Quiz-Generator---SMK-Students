-- Manual patch for Supabase: add missing columns to quizzes
-- Safe-guard: only add if not exists

-- Add column topic (text, NOT NULL) with default '' then set NOT NULL
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS topic text;
-- backfill topic from title if empty
UPDATE public.quizzes SET topic = COALESCE(topic, title, '') WHERE topic IS NULL;
ALTER TABLE public.quizzes ALTER COLUMN topic SET NOT NULL;

-- Ensure enum type exists for status (check in 'public' schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'QuizStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END$$;

-- Add column status (QuizStatus, NOT NULL default 'DRAFT')
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS status "QuizStatus";
UPDATE public.quizzes SET status = 'DRAFT' WHERE status IS NULL;
ALTER TABLE public.quizzes ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.quizzes ALTER COLUMN status SET DEFAULT 'DRAFT';
