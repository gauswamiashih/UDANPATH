-- ====================================================================
-- Migration: 02_user_notifications.sql
-- Description: Creates the user_notifications table for storing 
--              personalized alerts and exam updates for each user.
-- ====================================================================

-- 1. Create the user_notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'date', 'match'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g. marking as read)
CREATE POLICY "Users can update own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.user_notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can insert notifications for any user
CREATE POLICY "Enable insert access for service role on user_notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (true);

-- 4. Create an index for faster querying by user
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
