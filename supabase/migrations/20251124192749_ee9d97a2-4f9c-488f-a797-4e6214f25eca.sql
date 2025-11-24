-- Create enums for book clubs
CREATE TYPE public.club_role_type AS ENUM ('owner', 'admin', 'moderator', 'member');
CREATE TYPE public.club_book_status AS ENUM ('upcoming', 'active', 'completed', 'archived');
CREATE TYPE public.club_reading_status AS ENUM ('not_started', 'reading', 'completed', 'dropped');
CREATE TYPE public.club_event_type AS ENUM ('discussion', 'deadline', 'meetup', 'other');
CREATE TYPE public.club_achievement_type AS ENUM ('first_book', 'five_books', 'ten_books', 'discussion_starter', 'fast_reader', 'consistent_reader', 'club_founder');
CREATE TYPE public.club_invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create book_clubs table
CREATE TABLE public.book_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 1000),
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE NOT NULL,
  max_members INTEGER DEFAULT 50 CHECK (max_members > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create club_members table
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(club_id, user_id)
);

-- Create club_roles table (following security pattern)
CREATE TABLE public.club_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role club_role_type NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  granted_by UUID REFERENCES profiles(user_id),
  UNIQUE(club_id, user_id, role)
);

-- Create club_books table
CREATE TABLE public.club_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  book_author TEXT,
  book_cover_url TEXT,
  google_books_id TEXT,
  isbn TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status club_book_status DEFAULT 'upcoming' NOT NULL,
  assigned_by UUID NOT NULL REFERENCES profiles(user_id),
  total_pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK (end_date > start_date)
);

-- Create club_reading_progress table
CREATE TABLE public.club_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_book_id UUID NOT NULL REFERENCES club_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 0,
  status club_reading_status DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(club_book_id, user_id)
);

-- Create club_discussions table
CREATE TABLE public.club_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  club_book_id UUID REFERENCES club_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  is_spoiler BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES club_discussions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create club_events table
CREATE TABLE public.club_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  club_book_id UUID REFERENCES club_books(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 2000),
  event_type club_event_type NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create club_achievements table
CREATE TABLE public.club_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  achievement_type club_achievement_type NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Create club_invites table
CREATE TABLE public.club_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(user_id),
  invited_user_id UUID REFERENCES profiles(user_id),
  invite_email TEXT,
  status club_invite_status DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.has_club_role(_club_id uuid, _user_id uuid, _role club_role_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_roles
    WHERE club_id = _club_id
      AND user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_club_member(_club_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = _club_id
      AND user_id = _user_id
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_club_role_level(_club_id uuid, _user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN has_club_role(_club_id, _user_id, 'owner') THEN 4
    WHEN has_club_role(_club_id, _user_id, 'admin') THEN 3
    WHEN has_club_role(_club_id, _user_id, 'moderator') THEN 2
    WHEN is_club_member(_club_id, _user_id) THEN 1
    ELSE 0
  END
$$;

-- Function to generate unique club invite code
CREATE OR REPLACE FUNCTION public.generate_club_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.book_clubs WHERE invite_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_clubs
CREATE POLICY "Anyone can view public clubs"
ON book_clubs FOR SELECT
USING (is_private = false);

CREATE POLICY "Members can view their clubs"
ON book_clubs FOR SELECT
USING (is_private = true AND is_club_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create clubs"
ON book_clubs FOR INSERT
WITH CHECK (auth.uid() = created_by AND auth.role() = 'authenticated');

CREATE POLICY "Owners and admins can update clubs"
ON book_clubs FOR UPDATE
USING (get_club_role_level(id, auth.uid()) >= 3);

CREATE POLICY "Only owner can delete club"
ON book_clubs FOR DELETE
USING (has_club_role(id, auth.uid(), 'owner'));

-- RLS Policies for club_members
CREATE POLICY "Members can view club members"
ON club_members FOR SELECT
USING (is_club_member(club_id, auth.uid()));

CREATE POLICY "Users can join clubs"
ON club_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership"
ON club_members FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can remove members"
ON club_members FOR DELETE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

-- RLS Policies for club_roles
CREATE POLICY "Members can view club roles"
ON club_roles FOR SELECT
USING (is_club_member(club_id, auth.uid()));

CREATE POLICY "System can insert roles"
ON club_roles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update roles"
ON club_roles FOR UPDATE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

CREATE POLICY "Owners can delete roles"
ON club_roles FOR DELETE
USING (has_club_role(club_id, auth.uid(), 'owner'));

-- RLS Policies for club_books
CREATE POLICY "Members can view club books"
ON club_books FOR SELECT
USING (is_club_member(club_id, auth.uid()));

CREATE POLICY "Admins can assign books"
ON club_books FOR INSERT
WITH CHECK (get_club_role_level(club_id, auth.uid()) >= 3);

CREATE POLICY "Admins can update books"
ON club_books FOR UPDATE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

CREATE POLICY "Admins can delete books"
ON club_books FOR DELETE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

-- RLS Policies for club_reading_progress
CREATE POLICY "Members can view progress"
ON club_reading_progress FOR SELECT
USING (is_club_member((SELECT club_id FROM club_books WHERE id = club_book_id), auth.uid()));

CREATE POLICY "Members can insert their progress"
ON club_reading_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their progress"
ON club_reading_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for club_discussions
CREATE POLICY "Members can view discussions"
ON club_discussions FOR SELECT
USING (is_club_member(club_id, auth.uid()) AND deleted_at IS NULL);

CREATE POLICY "Members can create discussions"
ON club_discussions FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_club_member(club_id, auth.uid()));

CREATE POLICY "Users can update their discussions"
ON club_discussions FOR UPDATE
USING (auth.uid() = user_id OR get_club_role_level(club_id, auth.uid()) >= 2);

-- RLS Policies for club_events
CREATE POLICY "Members can view events"
ON club_events FOR SELECT
USING (is_club_member(club_id, auth.uid()));

CREATE POLICY "Admins can create events"
ON club_events FOR INSERT
WITH CHECK (get_club_role_level(club_id, auth.uid()) >= 3);

CREATE POLICY "Admins can update events"
ON club_events FOR UPDATE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

CREATE POLICY "Admins can delete events"
ON club_events FOR DELETE
USING (get_club_role_level(club_id, auth.uid()) >= 3);

-- RLS Policies for club_achievements
CREATE POLICY "Members can view club achievements"
ON club_achievements FOR SELECT
USING (is_club_member(club_id, auth.uid()));

CREATE POLICY "System can insert achievements"
ON club_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for club_invites
CREATE POLICY "Users can view their invites"
ON club_invites FOR SELECT
USING (auth.uid() = invited_user_id OR is_club_member(club_id, auth.uid()));

CREATE POLICY "Members can create invites"
ON club_invites FOR INSERT
WITH CHECK (is_club_member(club_id, auth.uid()));

CREATE POLICY "Users can update their invites"
ON club_invites FOR UPDATE
USING (auth.uid() = invited_user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_book_clubs_updated_at
BEFORE UPDATE ON book_clubs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_books_updated_at
BEFORE UPDATE ON club_books
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_reading_progress_updated_at
BEFORE UPDATE ON club_reading_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_discussions_updated_at
BEFORE UPDATE ON club_discussions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_events_updated_at
BEFORE UPDATE ON club_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_roles_club_id ON club_roles(club_id);
CREATE INDEX idx_club_roles_user_id ON club_roles(user_id);
CREATE INDEX idx_club_books_club_id ON club_books(club_id);
CREATE INDEX idx_club_books_status ON club_books(status);
CREATE INDEX idx_club_reading_progress_club_book_id ON club_reading_progress(club_book_id);
CREATE INDEX idx_club_reading_progress_user_id ON club_reading_progress(user_id);
CREATE INDEX idx_club_discussions_club_id ON club_discussions(club_id);
CREATE INDEX idx_club_discussions_parent_id ON club_discussions(parent_id);
CREATE INDEX idx_club_events_club_id ON club_events(club_id);
CREATE INDEX idx_club_events_event_date ON club_events(event_date);
CREATE INDEX idx_club_achievements_club_id ON club_achievements(club_id);
CREATE INDEX idx_club_achievements_user_id ON club_achievements(user_id);