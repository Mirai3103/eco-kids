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
      answers: {
        Row: {
          content: string | null
          id: string
          is_correct: boolean | null
          question_id: string | null
        }
        Insert: {
          content?: string | null
          id: string
          is_correct?: boolean | null
          question_id?: string | null
        }
        Update: {
          content?: string | null
          id?: string
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
          story_id: string | null
        }
        Insert: {
          content?: string | null
          id: string
          story_id?: string | null
        }
        Update: {
          content?: string | null
          id?: string
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
          category: string | null
          cost: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Relationships: []
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
          id: string
          is_active: boolean | null
          title: string | null
          topic_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          title?: string | null
          topic_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          topic_id?: string | null
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
        }
        Insert: {
          avatar_url?: string | null
          birthdday?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          points?: number | null
        }
        Update: {
          avatar_url?: string | null
          birthdday?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          points?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      receive_point_from_question: {
        Args: { p_point: number; p_question_id: string; p_user_id: string }
        Returns: boolean
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
