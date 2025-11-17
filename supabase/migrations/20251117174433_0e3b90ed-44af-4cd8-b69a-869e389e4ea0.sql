-- Add user preferences columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS reading_unit_preference TEXT DEFAULT 'pages' CHECK (reading_unit_preference IN ('pages', 'books', 'hours')),
ADD COLUMN IF NOT EXISTS progress_update_style TEXT DEFAULT 'quick' CHECK (progress_update_style IN ('quick', 'full')),
ADD COLUMN IF NOT EXISTS show_spoiler_warnings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'bookish')),
ADD COLUMN IF NOT EXISTS text_size_preference INTEGER DEFAULT 16 CHECK (text_size_preference >= 12 AND text_size_preference <= 24),
ADD COLUMN IF NOT EXISTS notifications_reading_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_friend_activity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_achievements BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_weekly_summary BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS discoverable_by_friend_code BOOLEAN DEFAULT true;