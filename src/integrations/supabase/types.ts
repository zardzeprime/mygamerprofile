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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_age_data: {
        Row: {
          age_assurance_method: string
          birth_date: string
          created_at: string
          guardian_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_assurance_method?: string
          birth_date: string
          created_at?: string
          guardian_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_assurance_method?: string
          birth_date?: string
          created_at?: string
          guardian_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      account_age_verifications: {
        Row: {
          created_at: string
          expires_at: string | null
          method: string | null
          provider_name: string | null
          provider_reference: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_over_18: boolean
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          method?: string | null
          provider_name?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_over_18?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          method?: string | null
          provider_name?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_over_18?: boolean
        }
        Relationships: []
      }
      account_demographics: {
        Row: {
          created_at: string
          gender_custom_label: string | null
          gender_identity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gender_custom_label?: string | null
          gender_identity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gender_custom_label?: string | null
          gender_identity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_editorial_drafts: {
        Row: {
          audience_rating: string
          body: string
          created_at: string
          game_id: string
          id: string
          interaction_prompt: string | null
          model_label: string | null
          published_post_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scheduled_for: string | null
          source_label: string | null
          source_published_at: string | null
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience_rating?: string
          body: string
          created_at?: string
          game_id: string
          id?: string
          interaction_prompt?: string | null
          model_label?: string | null
          published_post_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          source_label?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience_rating?: string
          body?: string
          created_at?: string
          game_id?: string
          id?: string
          interaction_prompt?: string | null
          model_label?: string | null
          published_post_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          source_label?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_editorial_drafts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_editorial_drafts_published_post_id_fkey"
            columns: ["published_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          connected_at: string
          disconnected_at: string | null
          display_name: string | null
          granted_scopes: string[]
          id: string
          last_synced_at: string | null
          provider: string
          provider_user_id: string
          public_metadata: Json
          status: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          granted_scopes?: string[]
          id?: string
          last_synced_at?: string | null
          provider: string
          provider_user_id: string
          public_metadata?: Json
          status?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          disconnected_at?: string | null
          display_name?: string | null
          granted_scopes?: string[]
          id?: string
          last_synced_at?: string | null
          provider?: string
          provider_user_id?: string
          public_metadata?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
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
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_modules: {
        Row: {
          created_at: string
          enabled: boolean
          game_id: string
          id: string
          module_key: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          game_id: string
          id?: string
          module_key: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          game_id?: string
          id?: string
          module_key?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_modules_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_profiles: {
        Row: {
          created_at: string
          game_id: string
          id: string
          profile_data: Json
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          profile_data?: Json
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          profile_data?: Json
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_profiles_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          active: boolean
          age_gate_level: string
          age_rating: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          minimum_age: number
          name: string
          platforms: string[] | null
          slug: string
          theme_key: string | null
        }
        Insert: {
          active?: boolean
          age_gate_level?: string
          age_rating?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          minimum_age?: number
          name: string
          platforms?: string[] | null
          slug: string
          theme_key?: string | null
        }
        Update: {
          active?: boolean
          age_gate_level?: string
          age_rating?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          minimum_age?: number
          name?: string
          platforms?: string[] | null
          slug?: string
          theme_key?: string | null
        }
        Relationships: []
      }
      lfg_applications: {
        Row: {
          applicant_user_id: string
          chat_expires_at: string | null
          created_at: string
          id: string
          lfg_post_id: string
          note: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          chat_expires_at?: string | null
          created_at?: string
          id?: string
          lfg_post_id: string
          note?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          chat_expires_at?: string | null
          created_at?: string
          id?: string
          lfg_post_id?: string
          note?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lfg_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lfg_applications_lfg_post_id_fkey"
            columns: ["lfg_post_id"]
            isOneToOne: false
            referencedRelation: "lfg_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      lfg_dm_messages: {
        Row: {
          application_id: string
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_user_id: string
          sender_user_id: string
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_user_id: string
          sender_user_id: string
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_user_id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lfg_dm_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "lfg_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lfg_dm_messages_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lfg_dm_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lfg_posts: {
        Row: {
          chat_ttl_hours: number
          created_at: string
          description: string
          expires_at: string | null
          external_game_id: string | null
          external_game_image_url: string | null
          external_game_name: string | null
          external_game_source: string | null
          game_id: string | null
          group_ttl_hours: number
          id: string
          language: string | null
          max_age: number
          mic_required: boolean
          min_age: number
          mode: string | null
          platform: string
          region: string | null
          scheduled_for: string | null
          slots_open: number
          slots_total: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_ttl_hours?: number
          created_at?: string
          description: string
          expires_at?: string | null
          external_game_id?: string | null
          external_game_image_url?: string | null
          external_game_name?: string | null
          external_game_source?: string | null
          game_id?: string | null
          group_ttl_hours?: number
          id?: string
          language?: string | null
          max_age?: number
          mic_required?: boolean
          min_age?: number
          mode?: string | null
          platform: string
          region?: string | null
          scheduled_for?: string | null
          slots_open?: number
          slots_total?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_ttl_hours?: number
          created_at?: string
          description?: string
          expires_at?: string | null
          external_game_id?: string | null
          external_game_image_url?: string | null
          external_game_name?: string | null
          external_game_source?: string | null
          game_id?: string | null
          group_ttl_hours?: number
          id?: string
          language?: string | null
          max_age?: number
          mic_required?: boolean
          min_age?: number
          mode?: string | null
          platform?: string
          region?: string | null
          scheduled_for?: string | null
          slots_open?: number
          slots_total?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lfg_posts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lfg_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mgp_content_catalog: {
        Row: {
          content_key: string
          description: string
          game_slug: string | null
          id: string
          keywords: string[]
          module_key: string | null
          path: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content_key: string
          description?: string
          game_slug?: string | null
          id?: string
          keywords?: string[]
          module_key?: string | null
          path: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          description?: string
          game_slug?: string | null
          id?: string
          keywords?: string[]
          module_key?: string | null
          path?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nexus_guest_messages: {
        Row: {
          content: string
          core_ids: string[]
          created_at: string
          id: string
          metadata: Json
          model: string | null
          provider: string | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          core_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          provider?: string | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          core_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          provider?: string | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_guest_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "nexus_guest_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_guest_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_message_at: string
          max_responses: number
          responses_used: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id: string
          last_message_at?: string
          max_responses?: number
          responses_used?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_message_at?: string
          max_responses?: number
          responses_used?: number
        }
        Relationships: []
      }
      nexus_messages: {
        Row: {
          content: string
          core_ids: string[]
          created_at: string
          id: string
          metadata: Json
          model: string | null
          provider: string | null
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          core_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          provider?: string | null
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          core_ids?: string[]
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          provider?: string | null
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "nexus_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_runtime_events: {
        Row: {
          created_at: string
          detail: string
          id: string
          kind: string
          metadata: Json
          provider: string | null
        }
        Insert: {
          created_at?: string
          detail: string
          id?: string
          kind: string
          metadata?: Json
          provider?: string | null
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          metadata?: Json
          provider?: string | null
        }
        Relationships: []
      }
      nexus_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          mode: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          audience_rating: string
          author_id: string
          body: string
          content_warning: string | null
          created_at: string
          deleted_at: string | null
          game_id: string | null
          id: string
          image_url: string | null
          source_kind: string
          updated_at: string
        }
        Insert: {
          audience_rating?: string
          author_id: string
          body: string
          content_warning?: string | null
          created_at?: string
          deleted_at?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          source_kind?: string
          updated_at?: string
        }
        Update: {
          audience_rating?: string
          author_id?: string
          body?: string
          content_warning?: string | null
          created_at?: string
          deleted_at?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          source_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_cosmetic_unlocks: {
        Row: {
          cosmetic_slug: string
          is_new: boolean
          unlock_context: Json
          unlocked_at: string
          user_id: string
        }
        Insert: {
          cosmetic_slug: string
          is_new?: boolean
          unlock_context?: Json
          unlocked_at?: string
          user_id: string
        }
        Update: {
          cosmetic_slug?: string
          is_new?: boolean
          unlock_context?: Json
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_cosmetic_unlocks_cosmetic_slug_fkey"
            columns: ["cosmetic_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_cosmetic_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_cosmetics: {
        Row: {
          acquisition_method: string
          active: boolean
          animated: boolean
          asset_url: string | null
          created_at: string
          css_class: string | null
          description: Json
          game_slug: string | null
          kind: string
          name: Json
          rarity: string
          rights_note: string | null
          slug: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          acquisition_method?: string
          active?: boolean
          animated?: boolean
          asset_url?: string | null
          created_at?: string
          css_class?: string | null
          description?: Json
          game_slug?: string | null
          kind: string
          name?: Json
          rarity?: string
          rights_note?: string | null
          slug: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_method?: string
          active?: boolean
          animated?: boolean
          asset_url?: string | null
          created_at?: string
          css_class?: string | null
          description?: Json
          game_slug?: string | null
          kind?: string
          name?: Json
          rarity?: string
          rights_note?: string | null
          slug?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_cosmetics_game_slug_fkey"
            columns: ["game_slug"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["slug"]
          },
        ]
      }
      profile_identity_details: {
        Row: {
          country_code: string | null
          country_visibility: string
          created_at: string
          gender_label: string | null
          gender_visibility: string
          subdivision_code: string | null
          subdivision_visibility: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string | null
          country_visibility?: string
          created_at?: string
          gender_label?: string | null
          gender_visibility?: string
          subdivision_code?: string | null
          subdivision_visibility?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string | null
          country_visibility?: string
          created_at?: string
          gender_label?: string | null
          gender_visibility?: string
          subdivision_code?: string | null
          subdivision_visibility?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_identity_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_inventory: {
        Row: {
          acquired_at: string
          acquisition_source: string
          cosmetic_slug: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          acquisition_source?: string
          cosmetic_slug: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          acquisition_source?: string
          cosmetic_slug?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_inventory_cosmetic_slug_fkey"
            columns: ["cosmetic_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_loadouts: {
        Row: {
          avatar_frame_slug: string | null
          background_slug: string | null
          badge_slugs: string[]
          banner_slug: string | null
          chibi_slug: string | null
          cursor_slug: string | null
          effect_slug: string | null
          nameplate_slug: string | null
          title_slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_frame_slug?: string | null
          background_slug?: string | null
          badge_slugs?: string[]
          banner_slug?: string | null
          chibi_slug?: string | null
          cursor_slug?: string | null
          effect_slug?: string | null
          nameplate_slug?: string | null
          title_slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_frame_slug?: string | null
          background_slug?: string | null
          badge_slugs?: string[]
          banner_slug?: string | null
          chibi_slug?: string | null
          cursor_slug?: string | null
          effect_slug?: string | null
          nameplate_slug?: string | null
          title_slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_loadouts_avatar_frame_slug_fkey"
            columns: ["avatar_frame_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_background_slug_fkey"
            columns: ["background_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_banner_slug_fkey"
            columns: ["banner_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_chibi_slug_fkey"
            columns: ["chibi_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_cursor_slug_fkey"
            columns: ["cursor_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_effect_slug_fkey"
            columns: ["effect_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_nameplate_slug_fkey"
            columns: ["nameplate_slug"]
            isOneToOne: false
            referencedRelation: "profile_cosmetics"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_title_slug_fkey"
            columns: ["title_slug"]
            isOneToOne: false
            referencedRelation: "profile_titles"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_loadouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_title_unlocks: {
        Row: {
          is_new: boolean
          title_slug: string
          unlock_context: Json
          unlocked_at: string
          user_id: string
        }
        Insert: {
          is_new?: boolean
          title_slug: string
          unlock_context?: Json
          unlocked_at?: string
          user_id: string
        }
        Update: {
          is_new?: boolean
          title_slug?: string
          unlock_context?: Json
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_title_unlocks_title_slug_fkey"
            columns: ["title_slug"]
            isOneToOne: false
            referencedRelation: "profile_titles"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "profile_title_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_titles: {
        Row: {
          active: boolean
          created_at: string
          description: Json
          exclusive_to_user_id: string | null
          icon_key: string
          name: Json
          rarity: string
          slug: string
          source: string
          unlock_rule: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: Json
          exclusive_to_user_id?: string | null
          icon_key?: string
          name?: Json
          rarity?: string
          slug: string
          source?: string
          unlock_rule?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: Json
          exclusive_to_user_id?: string | null
          icon_key?: string
          name?: Json
          rarity?: string
          slug?: string
          source?: string
          unlock_rule?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_titles_exclusive_to_user_id_fkey"
            columns: ["exclusive_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_usernames: {
        Row: {
          user_id: string
          username: string
        }
        Insert: {
          user_id: string
          username: string
        }
        Update: {
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          followers_count: number
          following_count: number
          id: string
          language: string
          onboarding_completed_at: string | null
          profile_background: string
          theme_preference: string
          updated_at: string
          username: string
          visibility: string
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          followers_count?: number
          following_count?: number
          id: string
          language?: string
          onboarding_completed_at?: string | null
          profile_background?: string
          theme_preference?: string
          updated_at?: string
          username: string
          visibility?: string
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          followers_count?: number
          following_count?: number
          id?: string
          language?: string
          onboarding_completed_at?: string | null
          profile_background?: string
          theme_preference?: string
          updated_at?: string
          username?: string
          visibility?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_feedback: {
        Row: {
          admin_reply: string | null
          category: string
          created_at: string
          id: string
          message: string
          replied_at: string | null
          replied_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          category: string
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_feedback_replied_by_fkey"
            columns: ["replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_achievements: {
        Row: {
          achieved: boolean
          api_name: string
          app_id: number
          description: string | null
          display_name: string | null
          icon_gray_url: string | null
          icon_url: string | null
          id: string
          last_synced_at: string
          unlock_time: string | null
          user_id: string
        }
        Insert: {
          achieved?: boolean
          api_name: string
          app_id: number
          description?: string | null
          display_name?: string | null
          icon_gray_url?: string | null
          icon_url?: string | null
          id?: string
          last_synced_at?: string
          unlock_time?: string | null
          user_id: string
        }
        Update: {
          achieved?: boolean
          api_name?: string
          app_id?: number
          description?: string | null
          display_name?: string | null
          icon_gray_url?: string | null
          icon_url?: string | null
          id?: string
          last_synced_at?: string
          unlock_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      steam_badges: {
        Row: {
          app_id: number | null
          badge_id: number
          border_color: number | null
          community_item_id: string | null
          completion_time: string | null
          id: string
          last_synced_at: string
          level: number
          scarcity: number | null
          user_id: string
          xp: number
        }
        Insert: {
          app_id?: number | null
          badge_id: number
          border_color?: number | null
          community_item_id?: string | null
          completion_time?: string | null
          id?: string
          last_synced_at?: string
          level?: number
          scarcity?: number | null
          user_id: string
          xp?: number
        }
        Update: {
          app_id?: number | null
          badge_id?: number
          border_color?: number | null
          community_item_id?: string | null
          completion_time?: string | null
          id?: string
          last_synced_at?: string
          level?: number
          scarcity?: number | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      steam_games: {
        Row: {
          achievement_percent: number
          achievements_synced_at: string | null
          achievements_total: number
          achievements_unlocked: number
          app_id: number
          has_community_visible_stats: boolean
          icon_url: string | null
          id: string
          last_played_at: string | null
          last_synced_at: string
          name: string
          owned: boolean
          playtime_2weeks: number
          playtime_forever: number
          recent_rank: number | null
          stats: Json
          user_id: string
        }
        Insert: {
          achievement_percent?: number
          achievements_synced_at?: string | null
          achievements_total?: number
          achievements_unlocked?: number
          app_id: number
          has_community_visible_stats?: boolean
          icon_url?: string | null
          id?: string
          last_played_at?: string | null
          last_synced_at?: string
          name: string
          owned?: boolean
          playtime_2weeks?: number
          playtime_forever?: number
          recent_rank?: number | null
          stats?: Json
          user_id: string
        }
        Update: {
          achievement_percent?: number
          achievements_synced_at?: string | null
          achievements_total?: number
          achievements_unlocked?: number
          app_id?: number
          has_community_visible_stats?: boolean
          icon_url?: string | null
          id?: string
          last_played_at?: string | null
          last_synced_at?: string
          name?: string
          owned?: boolean
          playtime_2weeks?: number
          playtime_forever?: number
          recent_rank?: number | null
          stats?: Json
          user_id?: string
        }
        Relationships: []
      }
      steam_inventory_items: {
        Row: {
          amount: number
          app_id: number
          asset_id: string
          class_id: string | null
          context_id: string
          icon_url: string | null
          id: string
          instance_id: string | null
          last_synced_at: string
          market_hash_name: string | null
          market_name: string | null
          marketable: boolean
          name: string | null
          tags: Json
          tradable: boolean
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          app_id: number
          asset_id: string
          class_id?: string | null
          context_id: string
          icon_url?: string | null
          id?: string
          instance_id?: string | null
          last_synced_at?: string
          market_hash_name?: string | null
          market_name?: string | null
          marketable?: boolean
          name?: string | null
          tags?: Json
          tradable?: boolean
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          app_id?: number
          asset_id?: string
          class_id?: string | null
          context_id?: string
          icon_url?: string | null
          id?: string
          instance_id?: string | null
          last_synced_at?: string
          market_hash_name?: string | null
          market_name?: string | null
          marketable?: boolean
          name?: string | null
          tags?: Json
          tradable?: boolean
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      steam_link_states: {
        Row: {
          created_at: string
          expires_at: string
          state_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          state_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          state_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      steam_profiles: {
        Row: {
          avatar_url: string | null
          badge_count: number
          community_visibility_state: number | null
          country_code: string | null
          favorite_app_id: number | null
          favorite_show_playtime: boolean
          favorite_started_on: string | null
          favorite_started_year: number | null
          inventory_visible: boolean
          last_error: string | null
          last_sync_status: string
          last_synced_at: string | null
          library_visible: boolean
          persona_name: string | null
          profile_url: string | null
          proud_achievement_api_names: string[]
          show_achievements: boolean
          show_badges: boolean
          show_inventory: boolean
          show_library: boolean
          show_playtime: boolean
          steam_id: string
          steam_level: number | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          badge_count?: number
          community_visibility_state?: number | null
          country_code?: string | null
          favorite_app_id?: number | null
          favorite_show_playtime?: boolean
          favorite_started_on?: string | null
          favorite_started_year?: number | null
          inventory_visible?: boolean
          last_error?: string | null
          last_sync_status?: string
          last_synced_at?: string | null
          library_visible?: boolean
          persona_name?: string | null
          profile_url?: string | null
          proud_achievement_api_names?: string[]
          show_achievements?: boolean
          show_badges?: boolean
          show_inventory?: boolean
          show_library?: boolean
          show_playtime?: boolean
          steam_id: string
          steam_level?: number | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          badge_count?: number
          community_visibility_state?: number | null
          country_code?: string | null
          favorite_app_id?: number | null
          favorite_show_playtime?: boolean
          favorite_started_on?: string | null
          favorite_started_year?: number | null
          inventory_visible?: boolean
          last_error?: string | null
          last_sync_status?: string
          last_synced_at?: string | null
          library_visible?: boolean
          persona_name?: string | null
          profile_url?: string | null
          proud_achievement_api_names?: string[]
          show_achievements?: boolean
          show_badges?: boolean
          show_inventory?: boolean
          show_library?: boolean
          show_playtime?: boolean
          steam_id?: string
          steam_level?: number | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_user_id_fkey"
            columns: ["blocker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_builds: {
        Row: {
          build_data: Json
          created_at: string
          game_slug: string
          id: string
          source_context: Json
          subject_key: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          build_data?: Json
          created_at?: string
          game_slug: string
          id?: string
          source_context?: Json
          subject_key?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          build_data?: Json
          created_at?: string
          game_slug?: string
          id?: string
          source_context?: Json
          subject_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_builds_game_slug_fkey"
            columns: ["game_slug"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_lfg_data: { Args: never; Returns: Json }
      complete_mgp_onboarding_v1: {
        Args: {
          p_birth_date: string
          p_display_name: string
          p_favorite_game_slugs?: string[]
          p_gender_custom_label?: string
          p_gender_identity: string
          p_language: string
          p_username: string
        }
        Returns: {
          display_name: string
          username: string
        }[]
      }
      ensure_nexus_guest_session: {
        Args: { p_session_id?: string }
        Returns: {
          expires_at: string
          max_responses: number
          responses_used: number
          session_id: string
        }[]
      }
      ensure_profile_default_loadout: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      evaluate_profile_unlocks: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_public_profile_identity: {
        Args: { p_user_id: string }
        Returns: {
          country_code: string
          gender_label: string
          subdivision_code: string
        }[]
      }
      get_public_profile_loadout: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_public_steam_showcase: {
        Args: { target_user_id: string }
        Returns: Json
      }
      list_nexus_guest_messages: {
        Args: { p_limit?: number; p_session_id: string }
        Returns: {
          content: string
          core_ids: string[]
          created_at: string
          id: string
          model: string
          provider: string
          role: string
        }[]
      }
      record_nexus_guest_assistant: {
        Args: {
          p_content: string
          p_core_ids?: string[]
          p_metadata?: Json
          p_model?: string
          p_provider?: string
          p_session_id: string
        }
        Returns: {
          message_id: string
          remaining_count: number
          used_count: number
        }[]
      }
      record_nexus_guest_exchange: {
        Args: {
          p_assistant_content: string
          p_core_ids?: string[]
          p_metadata?: Json
          p_model?: string
          p_provider?: string
          p_session_id: string
          p_user_content: string
        }
        Returns: {
          message_id: string
          remaining_count: number
          used_count: number
        }[]
      }
      save_user_build_v1: {
        Args: {
          p_build_data: Json
          p_game_slug: string
          p_source_context?: Json
          p_subject_key: string
          p_title: string
          p_visibility?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
