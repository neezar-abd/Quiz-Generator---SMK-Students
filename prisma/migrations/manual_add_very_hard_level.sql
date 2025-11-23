-- Manual Migration: Add VERY_HARD to QuizLevel enum
-- Run this SQL directly in your Supabase database when you're ready

-- Step 1: Add VERY_HARD to the QuizLevel enum
ALTER TYPE "QuizLevel" ADD VALUE IF NOT EXISTS 'VERY_HARD';

-- Step 2: Verify the enum values
-- You can check with: SELECT enum_range(NULL::QuizLevel);

-- Note: This is a safe operation that doesn't affect existing data
-- Existing quizzes will retain their current levels (X, XI, XII, GENERAL)
-- New quizzes can now use VERY_HARD level
