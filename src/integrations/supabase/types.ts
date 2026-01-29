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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      flashcard_lists: {
        Row: {
          auto_index: number | null
          created_at: string
          id: string
          is_auto: boolean
          name: string
        }
        Insert: {
          auto_index?: number | null
          created_at?: string
          id?: string
          is_auto?: boolean
          name: string
        }
        Update: {
          auto_index?: number | null
          created_at?: string
          id?: string
          is_auto?: boolean
          name?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          created_at: string
          created_by: string | null
          definition: string
          example: string | null
          id: string
          status: string
          tags: string[] | null
          updated_at: string
          word: string
          part_of_speech: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          definition: string
          example?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          word: string
          part_of_speech?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          definition?: string
          example?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          word?: string
          part_of_speech?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          created_at: string
          sentence_practice_enabled: boolean
        }
        Insert: {
          id: string
          display_name: string
          created_at?: string
          sentence_practice_enabled?: boolean
        }
        Update: {
          id?: string
          display_name?: string
          created_at?: string
          sentence_practice_enabled?: boolean
        }
        Relationships: []
      }
      user_word_progress: {
        Row: {
          id: string
          user_id: string
          flashcard_id: string
          status: string
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
          next_review_at: string | null
          interval: number
          ease_factor: number
          repetitions: number
        }
        Insert: {
          id?: string
          user_id: string
          flashcard_id: string
          status?: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
          next_review_at?: string | null
          interval?: number
          ease_factor?: number
          repetitions?: number
        }
        Update: {
          id?: string
          user_id?: string
          flashcard_id?: string
          status?: string
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
          next_review_at?: string | null
          interval?: number
          ease_factor?: number
          repetitions?: number
        }
        Relationships: []
      }
      tests: {
        Row: {
          id: string
          title: string
          category: string
          description: string | null
          time_limit_minutes: number
          question_count: number
          difficulty: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          description?: string | null
          time_limit_minutes: number
          question_count: number
          difficulty: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          description?: string | null
          time_limit_minutes?: number
          question_count?: number
          difficulty?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id: string
        }
        Relationships: []
      }
      user_test_attempts: {
        Row: {
          id: string
          user_id: string
          test_id: string
          score: number
          total_questions: number
          time_taken_seconds: number
          answers: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_id: string
          score: number
          total_questions: number
          time_taken_seconds: number
          answers: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_id?: string
          score?: number
          total_questions?: number
          time_taken_seconds?: number
          answers?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
