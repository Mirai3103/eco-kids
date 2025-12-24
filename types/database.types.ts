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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          color: Json | null
          id: number
          name: string
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          color?: Json | null
          id?: number
          name: string
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          color?: Json | null
          id?: number
          name?: string
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          content: string | null
          id: string
          image_url: string | null
          is_correct: boolean | null
          question_id: string | null
        }
        Insert: {
          content?: string | null
          id: string
          image_url?: string | null
          is_correct?: boolean | null
          question_id?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          image_url?: string | null
          is_correct?: boolean | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_segments: {
        Row: {
          audio_url: string | null
          created_at: string | null
          gender: string | null
          id: string
          language: string | null
          segment_id: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          language?: string | null
          segment_id?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          language?: string | null
          segment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "story_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          sender: string | null
          session_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id: string
          sender?: string | null
          session_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          sender?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          id: string
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          id: string
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_stories: {
        Row: {
          created_at: string | null
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fix_spelling_logs: {
        Row: {
          confidence_score: number | null
          context: string | null
          corrected_text: string
          created_at: string | null
          id: string
          raw_candidate_top: string
          story_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context?: string | null
          corrected_text: string
          created_at?: string | null
          id: string
          raw_candidate_top: string
          story_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context?: string | null
          corrected_text?: string
          created_at?: string | null
          id?: string
          raw_candidate_top?: string
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_story"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      point_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          points: number | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id: string
          metadata?: Json | null
          points?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          content: string | null
          id: string
          image_url: string | null
          index: number | null
          point: number | null
          story_id: string | null
        }
        Insert: {
          content?: string | null
          id: string
          image_url?: string | null
          index?: number | null
          point?: number | null
          story_id?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          image_url?: string | null
          index?: number | null
          point?: number | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          correct_count: number | null
          id: string
          last_attempt: string | null
          story_id: string | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          correct_count?: number | null
          id: string
          last_attempt?: string | null
          story_id?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          correct_count?: number | null
          id?: string
          last_attempt?: string | null
          story_id?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_history: {
        Row: {
          id: string
          progress: number | null
          read_at: string | null
          segment_id: string | null
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          progress?: number | null
          read_at?: string | null
          segment_id?: string | null
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          progress?: number | null
          read_at?: string | null
          segment_id?: string | null
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "story_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: number | null
          cost: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          category?: number | null
          cost?: number | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Update: {
          category?: number | null
          cost?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: string
          lang: string | null
          model: string | null
          segment_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id: string
          lang?: string | null
          model?: string | null
          segment_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          lang?: string | null
          model?: string | null
          segment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segment_embeddings_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "story_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          embed_text: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          title: string | null
          topic_id: string | null
          views_count: number | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          embed_text?: string | null
          embedding?: string | null
          id: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string | null
          topic_id?: string | null
          views_count?: number | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          embed_text?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string | null
          topic_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      story_segments: {
        Row: {
          en_text: string | null
          id: string
          image_url: string | null
          segment_index: number | null
          story_id: string | null
          vi_text: string | null
        }
        Insert: {
          en_text?: string | null
          id: string
          image_url?: string | null
          segment_index?: number | null
          story_id?: string | null
          vi_text?: string | null
        }
        Update: {
          en_text?: string | null
          id?: string
          image_url?: string | null
          segment_index?: number | null
          story_id?: string | null
          vi_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_segments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          description: string | null
          id: string
          meta_data: Json | null
          name: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          meta_data?: Json | null
          name?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          meta_data?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claimed_at: string | null
          id: string
          reward_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          id: string
          reward_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          id?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          birthdday: string | null
          created_at: string | null
          id: string
          name: string | null
          points: number | null
          recommend_vector: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthdday?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          points?: number | null
          recommend_vector?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthdday?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          points?: number | null
          recommend_vector?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_update_all_user_vectors: {
        Args: { scan_interval: string }
        Returns: string
      }
      get_recommended_stories_for_user: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          cover_image_url: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          similarity: number
          tags: string[]
          title: string
          topic_id: string
        }[]
      }
      get_stories_slim: {
        Args: never
        Returns: {
          cover_image_url: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          tags: string[]
          title: string
          topic_id: string
        }[]
      }
      increment_story_view: { Args: { story_id: string }; Returns: undefined }
      log_reading_progress: {
        Args: { p_segment_id: string; p_story_id: string; p_user_id: string }
        Returns: undefined
      }
      match_stories: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          embed_text: string
          id: string
          similarity: number
          title: string
        }[]
      }
      receive_point_from_question: {
        Args: { p_point: number; p_question_id: string; p_user_id: string }
        Returns: boolean
      }
      update_user_recommend_vector: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
