export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Journal {
  id: string
  user_id: string
  title: string
  description?: string
  category: "fitness" | "skincare" | "hair" | "weight" | "other"
  target_area?: string
  created_at: string
  updated_at: string
}

export interface PhotoEntry {
  id: string
  journal_id: string
  user_id: string
  photo_url: string
  thumbnail_url?: string
  notes?: string
  metadata?: Record<string, any>
  taken_at: string
  created_at: string
}

export interface Reminder {
  id: string
  journal_id: string
  user_id: string
  frequency: "daily" | "weekly" | "monthly"
  time_of_day?: string
  is_active: boolean
  created_at: string
}
