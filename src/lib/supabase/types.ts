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
      advertising_campaigns: {
        Row: {
          advertiser_id: string | null
          created_at: string
          end_date: string | null
          id: string
          media_url: string | null
          price: number | null
          specifications: Json | null
          start_date: string | null
          status: string | null
          target_url: string | null
          tier: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          media_url?: string | null
          price?: number | null
          specifications?: Json | null
          start_date?: string | null
          status?: string | null
          target_url?: string | null
          tier?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          media_url?: string | null
          price?: number | null
          specifications?: Json | null
          start_date?: string | null
          status?: string | null
          target_url?: string | null
          tier?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'advertising_campaigns_advertiser_id_fkey'
            columns: ['advertiser_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
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
          image_url: string | null
          name: string
          slug: string
          translation_key: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          image_url?: string | null
          name: string
          slug: string
          translation_key?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
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
          entity_type: string | null
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
          entity_type?: string | null
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
          entity_type?: string | null
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
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
          subject?: string
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
          is_retention_release: boolean | null
          job_id: string | null
          payer_id: string | null
          payment_date: string | null
          project_id: string | null
          receipt_url: string | null
          receiver_id: string | null
          retention_amount: number | null
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
          is_retention_release?: boolean | null
          job_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          retention_amount?: number | null
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
          is_retention_release?: boolean | null
          job_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          project_id?: string | null
          receipt_url?: string | null
          receiver_id?: string | null
          retention_amount?: number | null
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
          early_access_hours: number | null
          external_id: string | null
          id: string
          impressions_count: number
          is_demo: boolean
          listing_type: string | null
          location: string | null
          owner_id: string | null
          owner_name: string | null
          photos: Json | null
          priority_weight: number | null
          progress: number | null
          source: string | null
          status: string | null
          sub_category: string | null
          title: string
          type: string | null
          updated_at: string | null
          views_count: number
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
          early_access_hours?: number | null
          external_id?: string | null
          id?: string
          impressions_count?: number
          is_demo?: boolean
          listing_type?: string | null
          location?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: Json | null
          priority_weight?: number | null
          progress?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          views_count?: number
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
          early_access_hours?: number | null
          external_id?: string | null
          id?: string
          impressions_count?: number
          is_demo?: boolean
          listing_type?: string | null
          location?: string | null
          owner_id?: string | null
          owner_name?: string | null
          photos?: Json | null
          priority_weight?: number | null
          progress?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          views_count?: number
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
      permissions: {
        Row: {
          access_level: Json
          created_at: string
          id: string
          role_name: string
        }
        Insert: {
          access_level?: Json
          created_at?: string
          id?: string
          role_name: string
        }
        Update: {
          access_level?: Json
          created_at?: string
          id?: string
          role_name?: string
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
          plan_id: string | null
          portfolio_photos: Json | null
          priced_services: Json | null
          role: string | null
          state: string | null
          state_registration: string | null
          status: string | null
          street: string | null
          subscription_end_date: string | null
          subscription_status: string | null
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
          plan_id?: string | null
          portfolio_photos?: Json | null
          priced_services?: Json | null
          role?: string | null
          state?: string | null
          state_registration?: string | null
          status?: string | null
          street?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
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
          plan_id?: string | null
          portfolio_photos?: Json | null
          priced_services?: Json | null
          role?: string | null
          state?: string | null
          state_registration?: string | null
          status?: string | null
          street?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'construction_plans'
            referencedColumns: ['id']
          },
        ]
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
          approval_status: string | null
          created_at: string | null
          dependency_id: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          project_id: string
          status: string | null
        }
        Insert: {
          approval_status?: string | null
          created_at?: string | null
          dependency_id?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          project_id: string
          status?: string | null
        }
        Update: {
          approval_status?: string | null
          created_at?: string | null
          dependency_id?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          project_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'project_stages_dependency_id_fkey'
            columns: ['dependency_id']
            isOneToOne: false
            referencedRelation: 'project_stages'
            referencedColumns: ['id']
          },
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
          retention_percentage: number | null
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
          retention_percentage?: number | null
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
          retention_percentage?: number | null
          status?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          material_id: string | null
          material_name: string
          purchase_order_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          material_id?: string | null
          material_name: string
          purchase_order_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          material_id?: string | null
          material_name?: string
          purchase_order_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'purchase_order_items_purchase_order_id_fkey'
            columns: ['purchase_order_id']
            isOneToOne: false
            referencedRelation: 'purchase_orders'
            referencedColumns: ['id']
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          finance_id: string | null
          id: string
          manager_id: string | null
          project_id: string | null
          receipt_url: string | null
          requester_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          finance_id?: string | null
          id?: string
          manager_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          requester_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          finance_id?: string | null
          id?: string
          manager_id?: string | null
          project_id?: string | null
          receipt_url?: string | null
          requester_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'purchase_orders_finance_id_fkey'
            columns: ['finance_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_orders_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_orders_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_orders_requester_id_fkey'
            columns: ['requester_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_orders_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
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
      vendor_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vendor_contacts_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendors'
            referencedColumns: ['id']
          },
        ]
      }
      vendors: {
        Row: {
          bank_data: Json | null
          category: string | null
          city: string | null
          company_name: string | null
          complement: string | null
          created_at: string
          document: string | null
          email: string | null
          entity_type: string | null
          financial_email: string | null
          id: string
          job_title: string | null
          name: string
          neighborhood: string | null
          number: string | null
          owner_id: string | null
          phone: string | null
          pix_key: string | null
          state: string | null
          status: string | null
          street: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          bank_data?: Json | null
          category?: string | null
          city?: string | null
          company_name?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          entity_type?: string | null
          financial_email?: string | null
          id?: string
          job_title?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          phone?: string | null
          pix_key?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          bank_data?: Json | null
          category?: string | null
          city?: string | null
          company_name?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          entity_type?: string | null
          financial_email?: string | null
          id?: string
          job_title?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          phone?: string | null
          pix_key?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
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
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_get_jobs_with_metrics: {
        Args: never
        Returns: {
          budget: number
          category: string
          created_at: string
          description: string
          id: string
          owner_id: string
          owner_name: string
          owner_rating: number
          status: string
          title: string
        }[]
      }
      admin_get_users_with_metrics: {
        Args: never
        Returns: {
          city: string
          created_at: string
          email: string
          id: string
          is_admin: boolean
          jobs_executed: number
          name: string
          rating: number
          role: string
          state: string
          status: string
        }[]
      }
      award_job: {
        Args: { bid_id_param: string; job_id_param: string }
        Returns: boolean
      }
      confirm_purchase_delivery: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      get_bayesian_rating: { Args: { p_target_id: string }; Returns: number }
      get_global_rating_average: { Args: never; Returns: number }
      increment_job_impressions: {
        Args: { job_ids_param: string[] }
        Returns: undefined
      }
      increment_job_view: { Args: { job_id_param: string }; Returns: undefined }
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
