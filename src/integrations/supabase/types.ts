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
      admin_actions: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_documents: {
        Row: {
          doc_id: number | null
          file_type: string | null
          file_url: string | null
          id: string
          name: string
          owner_id: string | null
          size: string | null
          status: string | null
          tags: string[] | null
          uploaded_at: string | null
        }
        Insert: {
          doc_id?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name: string
          owner_id?: string | null
          size?: string | null
          status?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
        }
        Update: {
          doc_id?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          size?: string | null
          status?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      ai_index: {
        Row: {
          chunk_text: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_text: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_text?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_index_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ai_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          ai_reply: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          message: string | null
          owner_id: string | null
          platform: string
          post_link: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          ai_reply?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          owner_id?: string | null
          platform: string
          post_link?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          ai_reply?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          owner_id?: string | null
          platform?: string
          post_link?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      facebook_pages: {
        Row: {
          access_token: string
          category: string | null
          created_at: string | null
          id: string
          instagram_business_account_id: string | null
          is_connected: boolean | null
          is_instagram_connected: boolean | null
          owner_id: string
          page_id: string
          page_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          category?: string | null
          created_at?: string | null
          id?: string
          instagram_business_account_id?: string | null
          is_connected?: boolean | null
          is_instagram_connected?: boolean | null
          owner_id?: string
          page_id: string
          page_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          category?: string | null
          created_at?: string | null
          id?: string
          instagram_business_account_id?: string | null
          is_connected?: boolean | null
          is_instagram_connected?: boolean | null
          owner_id?: string
          page_id?: string
          page_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      instagram_dm_chat_history: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          document_type: string
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: string
          document_type: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          document_type?: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          ai_dm_reply: string | null
          created_at: string | null
          direction: string | null
          id: string
          message: string | null
          owner_id: string | null
          platform: string
          platform_message_id: string | null
          recipient_id: string | null
          sender_id: string | null
          sender_name: string | null
          thread_id: string | null
        }
        Insert: {
          ai_dm_reply?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          message?: string | null
          owner_id?: string | null
          platform: string
          platform_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sender_name?: string | null
          thread_id?: string | null
        }
        Update: {
          ai_dm_reply?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          message?: string | null
          owner_id?: string | null
          platform?: string
          platform_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sender_name?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["thread_id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          fb_cmnt_reply_webhook: string | null
          fb_page_token: string | null
          id: string
          ig_cmnt_reply_webhook: string | null
          ig_dm_reply_webhook: string | null
          ig_page_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fb_cmnt_reply_webhook?: string | null
          fb_page_token?: string | null
          id?: string
          ig_cmnt_reply_webhook?: string | null
          ig_dm_reply_webhook?: string | null
          ig_page_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fb_cmnt_reply_webhook?: string | null
          fb_page_token?: string | null
          id?: string
          ig_cmnt_reply_webhook?: string | null
          ig_dm_reply_webhook?: string | null
          ig_page_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          account_id: string
          account_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          ai_control: boolean | null
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          owner_id: string | null
          platform: string
          profile_picture_url: string | null
          thread_id: string | null
          unread_count: number | null
          user_name: string | null
        }
        Insert: {
          ai_control?: boolean | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          owner_id?: string | null
          platform: string
          profile_picture_url?: string | null
          thread_id?: string | null
          unread_count?: number | null
          user_name?: string | null
        }
        Update: {
          ai_control?: boolean | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          owner_id?: string | null
          platform?: string
          profile_picture_url?: string | null
          thread_id?: string | null
          unread_count?: number | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string | null
          event: string
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks_config: {
        Row: {
          description: string | null
          endpoint: string
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          endpoint: string
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          endpoint?: string
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_superadmin_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "superadmin"
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
      app_role: ["admin", "moderator", "user", "superadmin"],
    },
  },
} as const
