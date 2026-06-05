// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bids: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          executor_id: string | null
          executor_name: string | null
          id: string
          job_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          executor_id?: string | null
          executor_name?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          executor_id?: string | null
          executor_name?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bids_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          translation_key: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          slug: string
          translation_key?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          translation_key?: string | null
          type?: string
        }
        Relationships: []
      }
      construction_plans: {
        Row: {
          active: boolean | null
          billing_cycle: string
          complexity: string | null
          created_at: string
          currency: string | null
          description: string | null
          early_access_hours: number | null
          features: Json | null
          id: string
          max_projects: number | null
          name: string
          popular: boolean | null
          price: number
          priority_weight: number | null
          push_enabled: boolean | null
          push_lead_time_hours: number | null
          push_message_text: string | null
          skill_matching_rule: string | null
          skill_weight: number | null
          target_audience: string | null
          updated_at: string
          validity_days: number | null
          visibility_boost: number | null
          work_size: string | null
        }
        Insert: {
          active?: boolean | null
          billing_cycle?: string
          complexity?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          early_access_hours?: number | null
          features?: Json | null
          id?: string
          max_projects?: number | null
          name: string
          popular?: boolean | null
          price?: number
          priority_weight?: number | null
          push_enabled?: boolean | null
          push_lead_time_hours?: number | null
          push_message_text?: string | null
          skill_matching_rule?: string | null
          skill_weight?: number | null
          target_audience?: string | null
          updated_at?: string
          validity_days?: number | null
          visibility_boost?: number | null
          work_size?: string | null
        }
        Update: {
          active?: boolean | null
          billing_cycle?: string
          complexity?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          early_access_hours?: number | null
          features?: Json | null
          id?: string
          max_projects?: number | null
          name?: string
          popular?: boolean | null
          price?: number
          priority_weight?: number | null
          push_enabled?: boolean | null
          push_lead_time_hours?: number | null
          push_message_text?: string | null
          skill_matching_rule?: string | null
          skill_weight?: number | null
          target_audience?: string | null
          updated_at?: string
          validity_days?: number | null
          visibility_boost?: number | null
          work_size?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          project_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          project_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          project_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'equipment_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          payer_id: string | null
          payment_date: string | null
          project_id: string | null
          receipt_url: string | null
          receiver_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          task_id: string | null
          type: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          task_id?: string | null
          type?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          task_id?: string | null
          type?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'invoices_payer_id_fkey'
            columns: ['payer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'invoices_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'invoices_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      job_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          job_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          job_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          job_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'job_messages_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'job_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      jobs: {
        Row: {
          accepted_bid_id: string | null
          budget: number | null
          category: string | null
          completion_comments: string | null
          completion_photos: Json | null
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          id: string
          is_demo: boolean
          listing_type: string | null
          location: string | null
          owner_id: string | null
          owner_name: string | null
          photos: Json | null
          progress: number | null
          source: string | null
          status: string | null
          sub_category: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_bid_id?: string | null
          budget?: number | null
          category?: string | null
          completion_comments?: string | null
          completion_photos?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_demo?: boolean
          listing_type?: string | null
          location?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: Json | null
          progress?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_bid_id?: string | null
          budget?: number | null
          category?: string | null
          completion_comments?: string | null
          completion_photos?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          is_demo?: boolean
          listing_type?: string | null
          location?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: Json | null
          progress?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_accepted_bid_id_fkey'
            columns: ['accepted_bid_id']
            isOneToOne: false
            referencedRelation: 'bids'
            referencedColumns: ['id']
          },
        ]
      }
      marketing_content: {
        Row: {
          created_at: string
          features: Json
          id: string
          key: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          key: string
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          key?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          price: number | null
          stock: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          price?: number | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          price?: number | null
          stock?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account: string | null
          agency: string | null
          avatar_url: string | null
          bank: string | null
          city: string | null
          company_name: string | null
          complement: string | null
          country: string | null
          created_at: string | null
          document: string | null
          email: string
          entity_type: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          neighborhood: string | null
          number: string | null
          phone: string | null
          portfolio_photos: Json | null
          priced_services: Json | null
          role: string | null
          state: string | null
          status: string | null
          street: string | null
          tax_id: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          account?: string | null
          agency?: string | null
          avatar_url?: string | null
          bank?: string | null
          city?: string | null
          company_name?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          document?: string | null
          email: string
          entity_type?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          portfolio_photos?: Json | null
          priced_services?: Json | null
          role?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          account?: string | null
          agency?: string | null
          avatar_url?: string | null
          bank?: string | null
          city?: string | null
          company_name?: string | null
          complement?: string | null
          country?: string | null
          created_at?: string | null
          document?: string | null
          email?: string
          entity_type?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          portfolio_photos?: Json | null
          priced_services?: Json | null
          role?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      project_budgets: {
        Row: {
          actual_amount: number
          category: string
          created_at: string
          estimated_amount: number
          id: string
          project_id: string
          status: string
        }
        Insert: {
          actual_amount?: number
          category: string
          created_at?: string
          estimated_amount?: number
          id?: string
          project_id: string
          status?: string
        }
        Update: {
          actual_amount?: number
          category?: string
          created_at?: string
          estimated_amount?: number
          id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_budgets_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      project_compliance: {
        Row: {
          created_at: string
          document_name: string
          expiry_date: string | null
          file_url: string | null
          id: string
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          document_name: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_compliance_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      project_partners: {
        Row: {
          created_at: string
          project_id: string
          role: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          role: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          role?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_partners_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_partners_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      project_stages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          project_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          project_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          project_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'project_stages_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          photos: Json | null
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          photos?: Json | null
          project_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          photos?: Json | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_updates_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_demo: boolean
          name: string
          owner_id: string | null
          photos: Json | null
          progress: number | null
          status: string | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_demo?: boolean
          name: string
          owner_id?: string | null
          photos?: Json | null
          progress?: number | null
          status?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          owner_id?: string | null
          photos?: Json | null
          progress?: number | null
          status?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          job_id: string | null
          rating: number
          reviewer_id: string
          target_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          rating: number
          reviewer_id: string
          target_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          rating?: number
          reviewer_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey'
            columns: ['reviewer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_target_id_fkey'
            columns: ['target_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          slug: string
          translation_key: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id: string
          name: string
          slug: string
          translation_key?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          translation_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'subcategories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      vendors: {
        Row: {
          bank_data: Json | null
          category: string | null
          city: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          owner_id: string | null
          phone: string | null
          pix_key: string | null
          state: string | null
          status: string | null
          street: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          bank_data?: Json | null
          category?: string | null
          city?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          phone?: string | null
          pix_key?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          bank_data?: Json | null
          category?: string | null
          city?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          phone?: string | null
          pix_key?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_job: {
        Args: { bid_id_param: string; job_id_param: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   action: text (not null)
//   entity_type: text (not null)
//   entity_id: uuid (not null)
//   old_data: jsonb (nullable)
//   new_data: jsonb (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: bids
//   id: uuid (not null, default: gen_random_uuid())
//   job_id: uuid (nullable)
//   executor_id: uuid (nullable)
//   executor_name: text (nullable)
//   amount: numeric (nullable, default: 0)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'pending'::text)
//   currency: text (nullable, default: 'USD'::text)
// Table: categories
//   id: text (not null)
//   name: text (not null)
//   slug: text (not null)
//   type: text (not null, default: 'job'::text)
//   translation_key: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: construction_plans
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   price: numeric (not null, default: 0)
//   billing_cycle: text (not null, default: 'monthly'::text)
//   max_projects: integer (nullable)
//   work_size: text (nullable)
//   complexity: text (nullable)
//   features: jsonb (nullable, default: '[]'::jsonb)
//   active: boolean (nullable, default: true)
//   target_audience: text (nullable, default: 'contractor'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   validity_days: integer (nullable, default: 30)
//   push_enabled: boolean (nullable, default: false)
//   push_lead_time_hours: integer (nullable, default: 24)
//   push_message_text: text (nullable, default: ''::text)
//   priority_weight: integer (nullable, default: 1)
//   early_access_hours: integer (nullable, default: 0)
//   visibility_boost: integer (nullable, default: 1)
//   skill_matching_rule: text (nullable, default: 'flexible'::text)
//   skill_weight: integer (nullable, default: 1)
//   popular: boolean (nullable, default: false)
//   currency: text (nullable, default: 'USD'::text)
// Table: equipment
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   type: text (nullable)
//   status: text (nullable, default: 'available'::text)
//   location: text (nullable)
//   project_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: favorites
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   vendor_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: invoices
//   id: uuid (not null, default: gen_random_uuid())
//   job_id: uuid (nullable)
//   project_id: uuid (nullable)
//   task_id: text (nullable)
//   payer_id: uuid (nullable)
//   receiver_id: uuid (nullable)
//   amount: numeric (not null, default: 0)
//   currency: text (nullable, default: 'USD'::text)
//   status: text (nullable, default: 'pending'::text)
//   description: text (nullable)
//   type: text (nullable, default: 'service'::text)
//   due_date: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   vendor_id: uuid (nullable)
//   payment_date: timestamp with time zone (nullable)
//   receipt_url: text (nullable)
//   stripe_session_id: text (nullable)
//   stripe_payment_intent_id: text (nullable)
// Table: job_messages
//   id: uuid (not null, default: gen_random_uuid())
//   job_id: uuid (not null)
//   sender_id: uuid (not null)
//   content: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: jobs
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   type: text (nullable, default: 'fixed'::text)
//   category: text (nullable)
//   sub_category: text (nullable)
//   location: text (nullable)
//   budget: numeric (nullable, default: 0)
//   owner_id: uuid (nullable)
//   owner_name: text (nullable)
//   status: text (nullable, default: 'open'::text)
//   source: text (nullable, default: 'internal'::text)
//   external_id: text (nullable)
//   photos: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   accepted_bid_id: uuid (nullable)
//   progress: numeric (nullable, default: 0)
//   listing_type: text (nullable)
//   completion_photos: jsonb (nullable, default: '[]'::jsonb)
//   completion_comments: text (nullable)
//   is_demo: boolean (not null, default: false)
//   currency: text (nullable, default: 'USD'::text)
// Table: marketing_content
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   title: text (not null)
//   subtitle: text (not null)
//   features: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: materials
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   category: text (nullable)
//   price: numeric (nullable, default: 0)
//   unit: text (nullable)
//   stock: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'contractor'::text)
//   is_admin: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   phone: text (nullable)
//   tax_id: text (nullable)
//   company_name: text (nullable)
//   entity_type: text (nullable, default: 'pf'::text)
//   status: text (nullable, default: 'active'::text)
//   avatar_url: text (nullable)
//   country: text (nullable, default: 'BR'::text)
//   street: text (nullable)
//   number: text (nullable)
//   complement: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip_code: text (nullable)
//   bank: text (nullable)
//   agency: text (nullable)
//   account: text (nullable)
//   document: text (nullable)
//   portfolio_photos: jsonb (nullable, default: '[]'::jsonb)
//   priced_services: jsonb (nullable, default: '[]'::jsonb)
// Table: project_budgets
//   id: uuid (not null, default: gen_random_uuid())
//   project_id: uuid (not null)
//   category: text (not null)
//   estimated_amount: numeric (not null, default: 0)
//   actual_amount: numeric (not null, default: 0)
//   status: text (not null, default: 'pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: project_compliance
//   id: uuid (not null, default: gen_random_uuid())
//   project_id: uuid (not null)
//   document_name: text (not null)
//   status: text (not null, default: 'pending'::text)
//   expiry_date: timestamp with time zone (nullable)
//   file_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: project_partners
//   project_id: uuid (not null)
//   vendor_id: uuid (not null)
//   role: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: project_stages
//   id: uuid (not null, default: gen_random_uuid())
//   project_id: uuid (not null)
//   name: text (not null)
//   description: text (nullable)
//   status: text (nullable, default: 'pending'::text)
//   order_index: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: project_updates
//   id: uuid (not null, default: gen_random_uuid())
//   project_id: uuid (not null)
//   title: text (not null)
//   description: text (nullable)
//   photos: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: projects
//   id: uuid (not null, default: gen_random_uuid())
//   owner_id: uuid (nullable)
//   name: text (not null)
//   description: text (nullable)
//   status: text (nullable, default: 'planning'::text)
//   total_budget: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   progress: numeric (nullable, default: 0)
//   photos: jsonb (nullable, default: '[]'::jsonb)
//   is_demo: boolean (not null, default: false)
// Table: push_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   endpoint: text (not null)
//   auth: text (not null)
//   p256dh: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: reviews
//   id: uuid (not null, default: gen_random_uuid())
//   reviewer_id: uuid (not null)
//   target_id: uuid (not null)
//   rating: numeric (not null)
//   comment: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   job_id: uuid (nullable)
// Table: site_settings
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   value: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: subcategories
//   id: text (not null)
//   category_id: text (not null)
//   name: text (not null)
//   slug: text (not null)
//   translation_key: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: vendors
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   category: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   website: text (nullable)
//   street: text (nullable)
//   number: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip_code: text (nullable)
//   pix_key: text (nullable)
//   bank_data: jsonb (nullable, default: '{}'::jsonb)
//   owner_id: uuid (nullable)

// --- CONSTRAINTS ---
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: bids
//   FOREIGN KEY bids_executor_id_fkey: FOREIGN KEY (executor_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY bids_job_id_fkey: FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
//   PRIMARY KEY bids_pkey: PRIMARY KEY (id)
// Table: categories
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
// Table: construction_plans
//   PRIMARY KEY construction_plans_pkey: PRIMARY KEY (id)
// Table: equipment
//   PRIMARY KEY equipment_pkey: PRIMARY KEY (id)
//   FOREIGN KEY equipment_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
// Table: favorites
//   PRIMARY KEY favorites_pkey: PRIMARY KEY (id)
//   FOREIGN KEY favorites_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE favorites_user_id_vendor_id_key: UNIQUE (user_id, vendor_id)
//   FOREIGN KEY favorites_vendor_id_fkey: FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
// Table: invoices
//   CHECK check_invoice_amount_positive: CHECK ((amount >= (0)::numeric))
//   FOREIGN KEY invoices_payer_id_fkey: FOREIGN KEY (payer_id) REFERENCES profiles(id) ON DELETE CASCADE
//   PRIMARY KEY invoices_pkey: PRIMARY KEY (id)
//   FOREIGN KEY invoices_receiver_id_fkey: FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY invoices_vendor_id_fkey: FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
// Table: job_messages
//   FOREIGN KEY job_messages_job_id_fkey: FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
//   PRIMARY KEY job_messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY job_messages_sender_id_fkey: FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: jobs
//   FOREIGN KEY jobs_accepted_bid_id_fkey: FOREIGN KEY (accepted_bid_id) REFERENCES bids(id) ON DELETE SET NULL
//   UNIQUE jobs_external_id_key: UNIQUE (external_id)
//   FOREIGN KEY jobs_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY jobs_pkey: PRIMARY KEY (id)
//   CHECK jobs_progress_check: CHECK (((progress >= (0)::numeric) AND (progress <= (100)::numeric)))
// Table: marketing_content
//   UNIQUE marketing_content_key_key: UNIQUE (key)
//   PRIMARY KEY marketing_content_pkey: PRIMARY KEY (id)
// Table: materials
//   CHECK check_material_price_positive: CHECK ((price >= (0)::numeric))
//   CHECK check_material_stock_positive: CHECK ((stock >= 0))
//   PRIMARY KEY materials_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: project_budgets
//   PRIMARY KEY project_budgets_pkey: PRIMARY KEY (id)
//   FOREIGN KEY project_budgets_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
// Table: project_compliance
//   PRIMARY KEY project_compliance_pkey: PRIMARY KEY (id)
//   FOREIGN KEY project_compliance_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
// Table: project_partners
//   PRIMARY KEY project_partners_pkey: PRIMARY KEY (project_id, vendor_id)
//   FOREIGN KEY project_partners_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
//   FOREIGN KEY project_partners_vendor_id_fkey: FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
// Table: project_stages
//   PRIMARY KEY project_stages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY project_stages_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
// Table: project_updates
//   PRIMARY KEY project_updates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY project_updates_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
// Table: projects
//   CHECK check_project_budget_positive: CHECK ((total_budget >= (0)::numeric))
//   FOREIGN KEY projects_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)
//   CHECK projects_progress_check: CHECK (((progress >= (0)::numeric) AND (progress <= (100)::numeric)))
// Table: push_subscriptions
//   UNIQUE push_subscriptions_endpoint_key: UNIQUE (endpoint)
//   PRIMARY KEY push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY push_subscriptions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: reviews
//   FOREIGN KEY reviews_job_id_fkey: FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
//   PRIMARY KEY reviews_pkey: PRIMARY KEY (id)
//   CHECK reviews_rating_check: CHECK (((rating >= (1)::numeric) AND (rating <= (5)::numeric)))
//   FOREIGN KEY reviews_reviewer_id_fkey: FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE CASCADE
//   FOREIGN KEY reviews_target_id_fkey: FOREIGN KEY (target_id) REFERENCES profiles(id) ON DELETE CASCADE
//   UNIQUE unique_review_per_job: UNIQUE (job_id, reviewer_id, target_id)
// Table: site_settings
//   UNIQUE site_settings_key_key: UNIQUE (key)
//   PRIMARY KEY site_settings_pkey: PRIMARY KEY (id)
// Table: subcategories
//   FOREIGN KEY subcategories_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//   PRIMARY KEY subcategories_pkey: PRIMARY KEY (id)
// Table: vendors
//   FOREIGN KEY vendors_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id)
//   PRIMARY KEY vendors_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: audit_logs
//   Policy "audit_logs_select" (SELECT, PERMISSIVE) roles={public}
//     USING: is_admin()
// Table: bids
//   Policy "auth_insert_bids" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = executor_id)
//   Policy "authenticated_read_bids" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = executor_id) OR (auth.uid() IN ( SELECT jobs.owner_id    FROM jobs   WHERE (jobs.id = bids.job_id))) OR is_admin())
// Table: categories
//   Policy "admin_all_categories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() = true)
//   Policy "public_read_categories" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: construction_plans
//   Policy "admin_all_cplans" (ALL, PERMISSIVE) roles={public}
//     USING: (is_admin() = true)
//     WITH CHECK: (is_admin() = true)
//   Policy "public_read_cplans" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: equipment
//   Policy "equipment_all_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "equipment_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: favorites
//   Policy "favorites_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "favorites_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "favorites_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: invoices
//   Policy "auth_read_invoices" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = invoices.project_id) AND (projects.owner_id = auth.uid())))) OR is_admin())
//   Policy "invoices_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
// Table: job_messages
//   Policy "job_messages_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((sender_id = auth.uid()) AND (EXISTS ( SELECT 1    FROM jobs j   WHERE ((j.id = job_messages.job_id) AND ((j.owner_id = auth.uid()) OR (j.accepted_bid_id IN ( SELECT bids.id            FROM bids           WHERE (bids.executor_id = auth.uid()))))))))
//   Policy "job_messages_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM jobs j   WHERE ((j.id = job_messages.job_id) AND ((j.owner_id = auth.uid()) OR (j.accepted_bid_id IN ( SELECT bids.id            FROM bids           WHERE (bids.executor_id = auth.uid())))))))
// Table: jobs
//   Policy "auth_delete_jobs" (DELETE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = owner_id) OR is_admin())
//   Policy "auth_insert_jobs" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((auth.uid() = owner_id) OR (owner_id IS NULL))
//   Policy "auth_update_jobs" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = owner_id) OR is_admin())
//   Policy "public_read_jobs" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: marketing_content
//   Policy "admin_all_marketing" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "public_read_marketing" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: materials
//   Policy "materials_all_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "materials_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "profiles_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "profiles_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = id)
//   Policy "profiles_select" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = id) OR is_admin() OR (auth.role() = 'authenticated'::text))
//   Policy "profiles_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = id) OR is_admin())
// Table: project_budgets
//   Policy "auth_read_project_budgets" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "project_budgets_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: project_compliance
//   Policy "auth_read_project_compliance" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "project_compliance_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: project_partners
//   Policy "auth_insert_project_partners" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM projects p   WHERE ((p.id = project_partners.project_id) AND (p.owner_id = auth.uid()))))
//   Policy "auth_read_project_partners" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "auth_update_project_partners" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM projects p   WHERE ((p.id = project_partners.project_id) AND (p.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM vendors v   WHERE ((v.id = project_partners.vendor_id) AND (v.owner_id = auth.uid())))))
//   Policy "project_partners_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: project_stages
//   Policy "auth_read_project_stages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "auth_write_project_stages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM projects p   WHERE ((p.id = project_stages.project_id) AND (p.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM (project_partners pp      JOIN vendors v ON ((pp.vendor_id = v.id)))   WHERE ((pp.project_id = project_stages.project_id) AND (v.owner_id = auth.uid())))))
// Table: project_updates
//   Policy "auth_delete_project_updates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = project_updates.project_id) AND (projects.owner_id = auth.uid())))) OR is_admin())
//   Policy "auth_insert_project_updates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = project_updates.project_id) AND (projects.owner_id = auth.uid())))) OR is_admin())
//   Policy "auth_select_project_updates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM projects p   WHERE ((p.id = project_updates.project_id) AND ((p.owner_id = auth.uid()) OR (EXISTS ( SELECT 1            FROM (project_partners pp              JOIN vendors v ON ((pp.vendor_id = v.id)))           WHERE ((pp.project_id = p.id) AND (v.owner_id = auth.uid())))))))) OR is_admin())
//   Policy "auth_update_project_updates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = project_updates.project_id) AND (projects.owner_id = auth.uid())))) OR is_admin())
// Table: projects
//   Policy "projects_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = owner_id)
//   Policy "projects_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = owner_id)
//   Policy "projects_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = owner_id) OR is_admin() OR (EXISTS ( SELECT 1    FROM (project_partners pp      JOIN vendors v ON ((pp.vendor_id = v.id)))   WHERE ((pp.project_id = projects.id) AND (v.owner_id = auth.uid())))))
//   Policy "projects_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = owner_id)
// Table: push_subscriptions
//   Policy "Users can manage their own push subscriptions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: reviews
//   Policy "auth_delete_reviews" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = reviewer_id)
//   Policy "auth_insert_reviews" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = reviewer_id)
//   Policy "auth_update_reviews" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = reviewer_id)
//   Policy "public_read_reviews" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: site_settings
//   Policy "admin_all_site_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "public_read_site_settings" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: subcategories
//   Policy "admin_all_subcategories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() = true)
//   Policy "public_read_subcategories" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: vendors
//   Policy "vendors_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR is_admin())
//   Policy "vendors_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((owner_id = auth.uid()) OR is_admin())
//   Policy "vendors_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR is_admin())
//   Policy "vendors_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR is_admin())

// --- DATABASE FUNCTIONS ---
// FUNCTION award_job(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.award_job(job_id_param uuid, bid_id_param uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_job_status text;
//     v_job_owner uuid;
//   BEGIN
//     -- Lock job row
//     SELECT status, owner_id INTO v_job_status, v_job_owner
//     FROM public.jobs
//     WHERE id = job_id_param
//     FOR UPDATE;
//
//     IF NOT FOUND THEN
//       RAISE EXCEPTION 'Job not found';
//     END IF;
//
//     IF v_job_owner != auth.uid() AND NOT public.is_admin() THEN
//       RAISE EXCEPTION 'Not authorized';
//     END IF;
//
//     IF v_job_status != 'open' THEN
//       RAISE EXCEPTION 'Job is not open';
//     END IF;
//
//     -- Atomically reject others and accept the selected bid
//     UPDATE public.bids
//     SET status = CASE WHEN id = bid_id_param THEN 'accepted' ELSE 'rejected' END
//     WHERE job_id = job_id_param;
//
//     -- Update job status and link accepted bid
//     UPDATE public.jobs
//     SET status = 'in_progress',
//         accepted_bid_id = bid_id_param
//     WHERE id = job_id_param;
//
//     RETURN true;
//   END;
//   $function$
//
// FUNCTION handle_job_completion()
//   CREATE OR REPLACE FUNCTION public.handle_job_completion()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_bid RECORD;
//   BEGIN
//     IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.accepted_bid_id IS NOT NULL THEN
//
//       SELECT amount, executor_id INTO v_bid
//       FROM public.bids
//       WHERE id = NEW.accepted_bid_id;
//
//       IF FOUND THEN
//         INSERT INTO public.invoices (
//           job_id,
//           payer_id,
//           receiver_id,
//           amount,
//           status,
//           type,
//           currency,
//           description
//         ) VALUES (
//           NEW.id,
//           NEW.owner_id,
//           v_bid.executor_id,
//           v_bid.amount,
//           'pending',
//           'service',
//           'USD',
//           'Invoice for completed job: ' || NEW.title
//         );
//       END IF;
//
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (
//       id, email, name, role, entity_type, phone, country, street, "number", complement, neighborhood, city, state, zip_code, bank, agency, account, document
//     )
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', ''),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'contractor'),
//       COALESCE(NEW.raw_user_meta_data->>'entityType', 'individual'),
//       NEW.raw_user_meta_data->>'phone',
//       COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
//       NEW.raw_user_meta_data->>'street',
//       NEW.raw_user_meta_data->>'number',
//       NEW.raw_user_meta_data->>'complement',
//       NEW.raw_user_meta_data->>'neighborhood',
//       NEW.raw_user_meta_data->>'city',
//       NEW.raw_user_meta_data->>'state',
//       NEW.raw_user_meta_data->>'zipCode',
//       NEW.raw_user_meta_data->>'bank',
//       NEW.raw_user_meta_data->>'agency',
//       NEW.raw_user_meta_data->>'account',
//       NEW.raw_user_meta_data->>'document'
//     );
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     RETURN EXISTS (
//       SELECT 1 FROM public.profiles
//       WHERE id = auth.uid() AND is_admin = true
//     );
//   END;
//   $function$
//
// FUNCTION lock_paid_invoices()
//   CREATE OR REPLACE FUNCTION public.lock_paid_invoices()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       IF OLD.status = 'paid' THEN
//         IF NEW.amount != OLD.amount OR NEW.vendor_id IS DISTINCT FROM OLD.vendor_id OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
//           RAISE EXCEPTION 'Cannot modify critical fields (amount, vendor, project) of a paid invoice.';
//         END IF;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_audit_event()
//   CREATE OR REPLACE FUNCTION public.log_audit_event()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     old_data JSONB := NULL;
//     new_data JSONB := NULL;
//     user_id UUID := auth.uid();
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       old_data := to_jsonb(OLD);
//       new_data := to_jsonb(NEW);
//     ELSIF TG_OP = 'DELETE' THEN
//       old_data := to_jsonb(OLD);
//     ELSIF TG_OP = 'INSERT' THEN
//       new_data := to_jsonb(NEW);
//     END IF;
//
//     INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
//     VALUES (
//       user_id,
//       TG_OP,
//       TG_TABLE_NAME,
//       COALESCE(NEW.id, OLD.id),
//       old_data,
//       new_data
//     );
//
//     IF TG_OP = 'DELETE' THEN
//       RETURN OLD;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: bids
//   audit_bids: CREATE TRIGGER audit_bids AFTER INSERT OR DELETE OR UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION log_audit_event()
// Table: invoices
//   audit_invoices: CREATE TRIGGER audit_invoices AFTER INSERT OR DELETE OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION log_audit_event()
//   enforce_paid_invoice_lock: CREATE TRIGGER enforce_paid_invoice_lock BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION lock_paid_invoices()
// Table: jobs
//   on_job_completed: CREATE TRIGGER on_job_completed AFTER UPDATE OF status ON public.jobs FOR EACH ROW EXECUTE FUNCTION handle_job_completion()
// Table: profiles
//   audit_profiles: CREATE TRIGGER audit_profiles AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event()
// Table: projects
//   audit_projects: CREATE TRIGGER audit_projects AFTER INSERT OR DELETE OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION log_audit_event()

// --- INDEXES ---
// Table: favorites
//   CREATE UNIQUE INDEX favorites_user_id_vendor_id_key ON public.favorites USING btree (user_id, vendor_id)
// Table: invoices
//   CREATE INDEX idx_invoices_subscription_status ON public.invoices USING btree (payer_id, type, status)
// Table: jobs
//   CREATE UNIQUE INDEX jobs_external_id_key ON public.jobs USING btree (external_id)
// Table: marketing_content
//   CREATE UNIQUE INDEX marketing_content_key_key ON public.marketing_content USING btree (key)
// Table: push_subscriptions
//   CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint)
// Table: reviews
//   CREATE INDEX idx_reviews_reviewer_id ON public.reviews USING btree (reviewer_id)
//   CREATE INDEX idx_reviews_target_id ON public.reviews USING btree (target_id)
//   CREATE UNIQUE INDEX unique_review_per_job ON public.reviews USING btree (job_id, reviewer_id, target_id)
// Table: site_settings
//   CREATE UNIQUE INDEX site_settings_key_key ON public.site_settings USING btree (key)
