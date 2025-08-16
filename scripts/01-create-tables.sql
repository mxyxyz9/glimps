-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journals table for different tracking categories
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'skincare', 'hair', 'weight', 'other')),
  target_area TEXT, -- face, body, specific body part
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photo_entries table for individual photos
CREATE TABLE IF NOT EXISTS public.photo_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  notes TEXT,
  metadata JSONB, -- store pose guides, lighting conditions, etc.
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  time_of_day TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for journals
CREATE POLICY "Users can view own journals" ON public.journals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journals" ON public.journals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals" ON public.journals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals" ON public.journals
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for photo_entries
CREATE POLICY "Users can view own photo entries" ON public.photo_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own photo entries" ON public.photo_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photo entries" ON public.photo_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photo entries" ON public.photo_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for reminders
CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON public.reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON public.journals(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_entries_journal_id ON public.photo_entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_photo_entries_user_id ON public.photo_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_entries_taken_at ON public.photo_entries(taken_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
