export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_config: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      daily_bonus_claims: {
        Row: {
          created_at: string
          days_claimed: number
          id: string
          is_eligible: boolean
          last_claimed_at: string
          next_claim_at: string
          user_id: string | null
          welcome_bonus_active: boolean | null
          welcome_bonus_start_date: string | null
        }
        Insert: {
          created_at?: string
          days_claimed?: number
          id?: string
          is_eligible?: boolean
          last_claimed_at?: string
          next_claim_at?: string
          user_id?: string | null
          welcome_bonus_active?: boolean | null
          welcome_bonus_start_date?: string | null
        }
        Update: {
          created_at?: string
          days_claimed?: number
          id?: string
          is_eligible?: boolean
          last_claimed_at?: string
          next_claim_at?: string
          user_id?: string | null
          welcome_bonus_active?: boolean | null
          welcome_bonus_start_date?: string | null
        }
        Relationships: []
      }
      data_usage: {
        Row: {
          app_name: string
          created_at: string
          data_saved: number
          data_used: number
          date: string
          id: string
          user_id: string | null
        }
        Insert: {
          app_name: string
          created_at?: string
          data_saved: number
          data_used: number
          date?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          app_name?: string
          created_at?: string
          data_saved?: number
          data_used?: number
          date?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plan_history: {
        Row: {
          from_plan: string | null
          id: string
          notes: string | null
          switch_date: string
          to_plan: string
          user_id: string | null
        }
        Insert: {
          from_plan?: string | null
          id?: string
          notes?: string | null
          switch_date?: string
          to_plan: string
          user_id?: string | null
        }
        Update: {
          from_plan?: string | null
          id?: string
          notes?: string | null
          switch_date?: string
          to_plan?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          device_id: string | null
          full_name: string | null
          id: string
          is_suspended: boolean | null
          phone: string | null
          profile_image_url: string | null
          updated_at: string
          user_id: string | null
          vpn_key_id: string | null
          vpn_key_url: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
          vpn_key_id?: string | null
          vpn_key_url?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
          vpn_key_id?: string | null
          vpn_key_url?: string | null
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          commission_amount: number
          commission_rate: number | null
          created_at: string | null
          id: string
          purchase_amount: number
          referee_id: string | null
          referrer_id: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          purchase_amount: number
          referee_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          purchase_amount?: number
          referee_id?: string | null
          referrer_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_id: string | null
          referral_code: string
          referrer_id: string | null
          reward_amount: number | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code: string
          referrer_id?: string | null
          reward_amount?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string | null
          reward_amount?: number | null
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          id: string
          plan_type: string
          start_date: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          id?: string
          plan_type: string
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          id?: string
          plan_type?: string
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          created_at: string | null
          id: string
          timestamp: string | null
          used_bytes: number
          used_naira: number
          user_id: string | null
          vpn_key_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          timestamp?: string | null
          used_bytes: number
          used_naira: number
          user_id?: string | null
          vpn_key_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          timestamp?: string | null
          used_bytes?: number
          used_naira?: number
          user_id?: string | null
          vpn_key_id?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          daily_reset_at: string | null
          data_allocated: number | null
          data_used: number | null
          expires_at: string | null
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_reset_at?: string | null
          data_allocated?: number | null
          data_used?: number | null
          expires_at?: string | null
          id?: string
          plan_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_reset_at?: string | null
          data_allocated?: number | null
          data_used?: number | null
          expires_at?: string | null
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_referral_codes: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wallet: {
        Row: {
          balance: number
          created_at: string
          id: string
          referral_bonus: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          referral_bonus?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          referral_bonus?: number | null
          updated_at?: string
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
