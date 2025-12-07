export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      avatar_customizations: {
        Row: {
          background_color: string
          body: string
          clothing_color: string
          created_at: string
          eyes: string
          facial_hair: string
          hair: string
          hair_color: string
          id: string
          mouth: string
          nose: string
          skin_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color: string
          body: string
          clothing_color: string
          created_at?: string
          eyes: string
          facial_hair: string
          hair: string
          hair_color: string
          id?: string
          mouth: string
          nose: string
          skin_color: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string
          body?: string
          clothing_color?: string
          created_at?: string
          eyes?: string
          facial_hair?: string
          hair?: string
          hair_color?: string
          id?: string
          mouth?: string
          nose?: string
          skin_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_api_cache: {
        Row: {
          created_at: string
          google_cached_at: string | null
          google_response: Json | null
          id: string
          isbn: string
          openlib_cached_at: string | null
          openlib_response: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_cached_at?: string | null
          google_response?: Json | null
          id?: string
          isbn: string
          openlib_cached_at?: string | null
          openlib_response?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_cached_at?: string | null
          google_response?: Json | null
          id?: string
          isbn?: string
          openlib_cached_at?: string | null
          openlib_response?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      book_clubs: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          is_private: boolean | null
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          completed_at: string | null
          cover_url: string | null
          created_at: string
          current_page: number | null
          genres: string[] | null
          google_books_id: string | null
          id: string
          is_completed: boolean | null
          isbn: string | null
          rating: number | null
          review: string | null
          started_at: string | null
          status: string
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          completed_at?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          genres?: string[] | null
          google_books_id?: string | null
          id?: string
          is_completed?: boolean | null
          isbn?: string | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string
          title: string
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          completed_at?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          genres?: string[] | null
          google_books_id?: string | null
          id?: string
          is_completed?: boolean | null
          isbn?: string | null
          rating?: number | null
          review?: string | null
          started_at?: string | null
          status?: string
          title?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      canonical_books: {
        Row: {
          authors: string | null
          categories: string[] | null
          community_edited: boolean | null
          cover_url: string | null
          created_at: string
          description: string | null
          google_books_id: string | null
          id: string
          isbn: string | null
          last_edited_by: string | null
          missing_fields: string[] | null
          open_library_key: string | null
          page_count: number | null
          published_date: string | null
          source_google: boolean | null
          source_open_library: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          authors?: string | null
          categories?: string[] | null
          community_edited?: boolean | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          last_edited_by?: string | null
          missing_fields?: string[] | null
          open_library_key?: string | null
          page_count?: number | null
          published_date?: string | null
          source_google?: boolean | null
          source_open_library?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          authors?: string | null
          categories?: string[] | null
          community_edited?: boolean | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          last_edited_by?: string | null
          missing_fields?: string[] | null
          open_library_key?: string | null
          page_count?: number | null
          published_date?: string | null
          source_google?: boolean | null
          source_open_library?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["club_achievement_type"]
          club_id: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["club_achievement_type"]
          club_id: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["club_achievement_type"]
          club_id?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_achievements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_books: {
        Row: {
          assigned_by: string
          book_author: string | null
          book_cover_url: string | null
          book_title: string
          club_id: string
          created_at: string
          end_date: string
          google_books_id: string | null
          id: string
          isbn: string | null
          start_date: string
          status: Database["public"]["Enums"]["club_book_status"]
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          book_author?: string | null
          book_cover_url?: string | null
          book_title: string
          club_id: string
          created_at?: string
          end_date: string
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["club_book_status"]
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          book_author?: string | null
          book_cover_url?: string | null
          book_title?: string
          club_id?: string
          created_at?: string
          end_date?: string
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["club_book_status"]
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_books_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "club_books_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_discussions: {
        Row: {
          club_book_id: string | null
          club_id: string
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_spoiler: boolean | null
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          club_book_id?: string | null
          club_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_spoiler?: boolean | null
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          club_book_id?: string | null
          club_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_spoiler?: boolean | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_discussions_club_book_id_fkey"
            columns: ["club_book_id"]
            isOneToOne: false
            referencedRelation: "club_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_discussions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "club_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_events: {
        Row: {
          club_book_id: string | null
          club_id: string
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["club_event_type"]
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          club_book_id?: string | null
          club_id: string
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["club_event_type"]
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          club_book_id?: string | null
          club_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["club_event_type"]
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_book_id_fkey"
            columns: ["club_book_id"]
            isOneToOne: false
            referencedRelation: "club_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_invites: {
        Row: {
          club_id: string
          created_at: string
          expires_at: string
          id: string
          invite_email: string | null
          invited_by: string
          invited_user_id: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["club_invite_status"] | null
        }
        Insert: {
          club_id: string
          created_at?: string
          expires_at: string
          id?: string
          invite_email?: string | null
          invited_by: string
          invited_user_id?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["club_invite_status"] | null
        }
        Update: {
          club_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_email?: string | null
          invited_by?: string
          invited_user_id?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["club_invite_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "club_invites_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "club_invites_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_reading_progress: {
        Row: {
          club_book_id: string
          completed_at: string | null
          current_page: number | null
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["club_reading_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          club_book_id: string
          completed_at?: string | null
          current_page?: number | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["club_reading_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          club_book_id?: string
          completed_at?: string | null
          current_page?: number | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["club_reading_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_reading_progress_club_book_id_fkey"
            columns: ["club_book_id"]
            isOneToOne: false
            referencedRelation: "club_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_roles: {
        Row: {
          club_id: string
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["club_role_type"]
          user_id: string
        }
        Insert: {
          club_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["club_role_type"]
          user_id: string
        }
        Update: {
          club_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["club_role_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_roles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "book_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "club_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_progress: number | null
          current_value: number
          expires_at: string
          id: string
          is_completed: boolean | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_date: string
          challenge_type: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          current_value?: number
          expires_at: string
          id?: string
          is_completed?: boolean | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          current_value?: number
          expires_at?: string
          id?: string
          is_completed?: boolean | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friendships_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notes: {
        Row: {
          book_id: string
          content: string
          created_at: string
          id: string
          page_number: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          content: string
          created_at?: string
          id?: string
          page_number?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string
          id?: string
          page_number?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_seed: string | null
          avatar_type: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_goal_type: string | null
          daily_goal_value: number | null
          discoverable_by_friend_code: boolean | null
          display_name: string | null
          friend_code: string
          id: string
          notifications_achievements: boolean | null
          notifications_friend_activity: boolean | null
          notifications_reading_reminders: boolean | null
          notifications_weekly_summary: boolean | null
          onboarding_completed: boolean | null
          progress_update_style: string | null
          reading_unit_preference: string | null
          show_spoiler_warnings: boolean | null
          text_size_preference: number | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_seed?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal_type?: string | null
          daily_goal_value?: number | null
          discoverable_by_friend_code?: boolean | null
          display_name?: string | null
          friend_code: string
          id?: string
          notifications_achievements?: boolean | null
          notifications_friend_activity?: boolean | null
          notifications_reading_reminders?: boolean | null
          notifications_weekly_summary?: boolean | null
          onboarding_completed?: boolean | null
          progress_update_style?: string | null
          reading_unit_preference?: string | null
          show_spoiler_warnings?: boolean | null
          text_size_preference?: number | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_seed?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal_type?: string | null
          daily_goal_value?: number | null
          discoverable_by_friend_code?: boolean | null
          display_name?: string | null
          friend_code?: string
          id?: string
          notifications_achievements?: boolean | null
          notifications_friend_activity?: boolean | null
          notifications_reading_reminders?: boolean | null
          notifications_weekly_summary?: boolean | null
          onboarding_completed?: boolean | null
          progress_update_style?: string | null
          reading_unit_preference?: string | null
          show_spoiler_warnings?: boolean | null
          text_size_preference?: number | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          book_id: string
          created_at: string
          id: string
          pages_read: number
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          pages_read: number
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          pages_read?: number
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reading_stats: {
        Row: {
          books_completed: number
          created_at: string
          id: string
          total_minutes: number
          total_pages: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          books_completed?: number
          created_at?: string
          id?: string
          total_minutes?: number
          total_pages?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          books_completed?: number
          created_at?: string
          id?: string
          total_minutes?: number
          total_pages?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      snapshots: {
        Row: {
          created_at: string
          id: string
          snapshot: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          snapshot: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          snapshot?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_achievement_type: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      ensure_reading_stats_for_week: { Args: never; Returns: undefined }
      generate_club_invite_code: { Args: never; Returns: string }
      generate_daily_challenge: { Args: { p_user_id: string }; Returns: string }
      generate_friend_code: { Args: never; Returns: string }
      get_club_role_level: {
        Args: { _club_id: string; _user_id: string }
        Returns: number
      }
      has_club_role: {
        Args: {
          _club_id: string
          _role: Database["public"]["Enums"]["club_role_type"]
          _user_id: string
        }
        Returns: boolean
      }
      is_club_member: {
        Args: { _club_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      club_achievement_type:
        | "first_book"
        | "five_books"
        | "ten_books"
        | "discussion_starter"
        | "fast_reader"
        | "consistent_reader"
        | "club_founder"
      club_book_status: "upcoming" | "active" | "completed" | "archived"
      club_event_type: "discussion" | "deadline" | "meetup" | "other"
      club_invite_status: "pending" | "accepted" | "declined" | "expired"
      club_reading_status: "not_started" | "reading" | "completed" | "dropped"
      club_role_type: "owner" | "admin" | "moderator" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      club_achievement_type: [
        "first_book",
        "five_books",
        "ten_books",
        "discussion_starter",
        "fast_reader",
        "consistent_reader",
        "club_founder",
      ],
      club_book_status: ["upcoming", "active", "completed", "archived"],
      club_event_type: ["discussion", "deadline", "meetup", "other"],
      club_invite_status: ["pending", "accepted", "declined", "expired"],
      club_reading_status: ["not_started", "reading", "completed", "dropped"],
      club_role_type: ["owner", "admin", "moderator", "member"],
    },
  },
} as const
