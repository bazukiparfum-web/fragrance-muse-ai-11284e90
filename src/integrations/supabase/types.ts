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
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_image: string
          product_name: string
          quantity: number
          size: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_image: string
          product_name: string
          quantity?: number
          size: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_image?: string
          product_name?: string
          quantity?: number
          size?: string
          user_id?: string
        }
        Relationships: []
      }
      formulation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fragrance_notes: {
        Row: {
          age_ranges: Json | null
          category: string
          climates: Json | null
          created_at: string | null
          description: string | null
          family: string
          id: string
          intensity: number
          is_active: boolean | null
          longevity: number
          name: string
          occasions: Json | null
          personality_matches: Json | null
          updated_at: string | null
        }
        Insert: {
          age_ranges?: Json | null
          category: string
          climates?: Json | null
          created_at?: string | null
          description?: string | null
          family: string
          id?: string
          intensity: number
          is_active?: boolean | null
          longevity: number
          name: string
          occasions?: Json | null
          personality_matches?: Json | null
          updated_at?: string | null
        }
        Update: {
          age_ranges?: Json | null
          category?: string
          climates?: Json | null
          created_at?: string | null
          description?: string | null
          family?: string
          id?: string
          intensity?: number
          is_active?: boolean | null
          longevity?: number
          name?: string
          occasions?: Json | null
          personality_matches?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_image: string
          product_name: string
          quantity: number
          size: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_image: string
          product_name: string
          quantity: number
          size: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_image?: string
          product_name?: string
          quantity?: number
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_fee: number
          delivery_type: string
          discount_applied: number | null
          discount_code: string | null
          estimated_delivery: string | null
          id: string
          order_number: string
          referral_reward_id: string | null
          shipping_address: Json
          status: string
          subtotal: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_fee?: number
          delivery_type: string
          discount_applied?: number | null
          discount_code?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number: string
          referral_reward_id?: string | null
          shipping_address: Json
          status?: string
          subtotal: number
          total: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_fee?: number
          delivery_type?: string
          discount_applied?: number | null
          discount_code?: string | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string
          referral_reward_id?: string | null
          shipping_address?: Json
          status?: string
          subtotal?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_referral_reward_id_fkey"
            columns: ["referral_reward_id"]
            isOneToOne: false
            referencedRelation: "referral_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          helper_text: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          max_value: number | null
          min_value: number | null
          options: Json | null
          order_index: number
          question_key: string
          question_text: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index: number
          question_key: string
          question_text: string
          question_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          question_key?: string
          question_text?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          answers: Json
          completed: boolean | null
          created_at: string
          id: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed?: boolean | null
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed?: boolean | null
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referee_discount_amount: number | null
          referee_discount_used: boolean | null
          referee_email: string | null
          referee_id: string | null
          referee_order_id: string | null
          referral_id: string
          referrer_discount_amount: number | null
          referrer_discount_used: boolean | null
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_discount_amount?: number | null
          referee_discount_used?: boolean | null
          referee_email?: string | null
          referee_id?: string | null
          referee_order_id?: string | null
          referral_id: string
          referrer_discount_amount?: number | null
          referrer_discount_used?: boolean | null
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_discount_amount?: number | null
          referee_discount_used?: boolean | null
          referee_email?: string | null
          referee_id?: string | null
          referee_order_id?: string | null
          referral_id?: string
          referrer_discount_amount?: number | null
          referrer_discount_used?: boolean | null
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referee_order_id_fkey"
            columns: ["referee_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          expires_at: string | null
          fragrance_id: string | null
          id: string
          max_uses: number | null
          referral_code: string
          referrer_id: string
          uses_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          fragrance_id?: string | null
          id?: string
          max_uses?: number | null
          referral_code: string
          referrer_id: string
          uses_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          fragrance_id?: string | null
          id?: string
          max_uses?: number | null
          referral_code?: string
          referrer_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_fragrance_id_fkey"
            columns: ["fragrance_id"]
            isOneToOne: false
            referencedRelation: "saved_scents"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_scents: {
        Row: {
          created_at: string | null
          formula: Json
          formulation_notes: string | null
          fragrance_code: string | null
          id: string
          intensity: number | null
          is_public: boolean | null
          last_shared_at: string | null
          longevity: number | null
          match_score: number | null
          name: string
          prices: Json | null
          quiz_answers: Json | null
          share_count: number | null
          share_token: string | null
          user_id: string
          visual_data: Json | null
        }
        Insert: {
          created_at?: string | null
          formula: Json
          formulation_notes?: string | null
          fragrance_code?: string | null
          id?: string
          intensity?: number | null
          is_public?: boolean | null
          last_shared_at?: string | null
          longevity?: number | null
          match_score?: number | null
          name: string
          prices?: Json | null
          quiz_answers?: Json | null
          share_count?: number | null
          share_token?: string | null
          user_id: string
          visual_data?: Json | null
        }
        Update: {
          created_at?: string | null
          formula?: Json
          formulation_notes?: string | null
          fragrance_code?: string | null
          id?: string
          intensity?: number | null
          is_public?: boolean | null
          last_shared_at?: string | null
          longevity?: number | null
          match_score?: number | null
          name?: string
          prices?: Json | null
          quiz_answers?: Json | null
          share_count?: number | null
          share_token?: string | null
          user_id?: string
          visual_data?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          frequency: string
          id: string
          next_delivery: string
          price: number
          product_name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency: string
          id?: string
          next_delivery: string
          price: number
          product_name: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string
          id?: string
          next_delivery?: string
          price?: number
          product_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
