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

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: advertising_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   advertiser_id: uuid (nullable)
//   title: text (not null)
//   media_url: text (nullable)
//   target_url: text (nullable)
//   status: text (nullable, default: 'draft'::text)
//   tier: text (nullable)
//   specifications: jsonb (nullable, default: '{}'::jsonb)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   price: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   image_url: text (nullable)
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
//   entity_type: text (nullable, default: 'both'::text)
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
//   retention_amount: numeric (nullable, default: 0)
//   is_retention_release: boolean (nullable, default: false)
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
//   views_count: integer (not null, default: 0)
//   impressions_count: integer (not null, default: 0)
//   priority_weight: integer (nullable, default: 1)
//   early_access_hours: integer (nullable, default: 0)
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
// Table: permissions
//   id: uuid (not null, default: gen_random_uuid())
//   role_name: text (not null)
//   access_level: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
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
//   plan_id: uuid (nullable)
//   subscription_status: text (nullable, default: 'inactive'::text)
//   subscription_end_date: timestamp with time zone (nullable)
//   state_registration: text (nullable)
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
//   dependency_id: uuid (nullable)
//   approval_status: text (nullable, default: 'pending'::text)
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
//   retention_percentage: numeric (nullable, default: 0)
// Table: purchase_order_items
//   id: uuid (not null, default: gen_random_uuid())
//   purchase_order_id: uuid (nullable)
//   material_id: text (nullable)
//   material_name: text (not null)
//   quantity: numeric (not null)
//   unit_price: numeric (not null)
//   total_price: numeric (not null)
// Table: purchase_orders
//   id: uuid (not null, default: gen_random_uuid())
//   project_id: uuid (nullable)
//   requester_id: uuid (nullable)
//   manager_id: uuid (nullable)
//   finance_id: uuid (nullable)
//   vendor_id: uuid (nullable)
//   status: text (nullable, default: 'pending_manager'::text)
//   total_amount: numeric (nullable, default: 0)
//   receipt_url: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
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
// Table: vendor_contacts
//   id: uuid (not null, default: gen_random_uuid())
//   vendor_id: uuid (not null)
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   role: text (not null, default: 'Others'::text)
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
//   financial_email: text (nullable)
//   company_name: text (nullable)
//   tax_id: text (nullable)
//   job_title: text (nullable)
//   complement: text (nullable)
//   entity_type: text (nullable, default: 'pj'::text)

// --- CONSTRAINTS ---
// Table: advertising_campaigns
//   FOREIGN KEY advertising_campaigns_advertiser_id_fkey: FOREIGN KEY (advertiser_id) REFERENCES vendors(id) ON DELETE CASCADE
//   PRIMARY KEY advertising_campaigns_pkey: PRIMARY KEY (id)
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
// Table: permissions
//   PRIMARY KEY permissions_pkey: PRIMARY KEY (id)
//   UNIQUE permissions_role_name_key: UNIQUE (role_name)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   FOREIGN KEY profiles_plan_id_fkey: FOREIGN KEY (plan_id) REFERENCES construction_plans(id) ON DELETE SET NULL
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
//   CHECK project_stages_approval_status_check: CHECK ((approval_status = ANY (ARRAY['pending'::text, 'tech_approved'::text, 'finance_approved'::text, 'completed'::text])))
//   FOREIGN KEY project_stages_dependency_id_fkey: FOREIGN KEY (dependency_id) REFERENCES project_stages(id)
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
// Table: purchase_order_items
//   PRIMARY KEY purchase_order_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY purchase_order_items_purchase_order_id_fkey: FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
// Table: purchase_orders
//   FOREIGN KEY purchase_orders_finance_id_fkey: FOREIGN KEY (finance_id) REFERENCES profiles(id)
//   FOREIGN KEY purchase_orders_manager_id_fkey: FOREIGN KEY (manager_id) REFERENCES profiles(id)
//   PRIMARY KEY purchase_orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY purchase_orders_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
//   FOREIGN KEY purchase_orders_requester_id_fkey: FOREIGN KEY (requester_id) REFERENCES profiles(id)
//   CHECK purchase_orders_status_check: CHECK ((status = ANY (ARRAY['pending_manager'::text, 'pending_finance'::text, 'ordered'::text, 'delivered'::text, 'cancelled'::text, 'rejected'::text])))
//   FOREIGN KEY purchase_orders_vendor_id_fkey: FOREIGN KEY (vendor_id) REFERENCES vendors(id)
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
// Table: vendor_contacts
//   PRIMARY KEY vendor_contacts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendor_contacts_vendor_id_fkey: FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
// Table: vendors
//   FOREIGN KEY vendors_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id)
//   PRIMARY KEY vendors_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: advertising_campaigns
//   Policy "admin_all_advertising_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "public_read_advertising_campaigns" (SELECT, PERMISSIVE) roles={public}
//     USING: (status = 'active'::text)
// Table: audit_logs
//   Policy "audit_logs_select" (SELECT, PERMISSIVE) roles={authenticated}
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
//   Policy "admin_all_cplans" (ALL, PERMISSIVE) roles={authenticated}
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
//   Policy "admin_all_invoices" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() = true)
//   Policy "auth_read_invoices" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_update" (UPDATE, PERMISSIVE) roles={authenticated}
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
//     WITH CHECK: ((auth.uid() = owner_id) OR (owner_id IS NULL) OR is_admin())
//   Policy "auth_update_jobs" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = owner_id) OR is_admin())
//   Policy "public_read_jobs" (SELECT, PERMISSIVE) roles={public}
//     USING: ((status <> 'suspended'::text) OR (auth.uid() = owner_id) OR is_admin())
// Table: marketing_content
//   Policy "admin_all_marketing" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "public_read_marketing" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: materials
//   Policy "admin_all_materials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() = true)
//   Policy "anon_select_materials" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_select_materials" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "materials_all_admin" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//   Policy "materials_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "public_select_materials" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: permissions
//   Policy "permissions_read_all" (SELECT, PERMISSIVE) roles={public}
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
// Table: purchase_order_items
//   Policy "auth_insert_purchase_order_items" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM purchase_orders   WHERE ((purchase_orders.id = purchase_order_items.purchase_order_id) AND (purchase_orders.requester_id = auth.uid()))))
//   Policy "auth_select_purchase_order_items" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM purchase_orders   WHERE ((purchase_orders.id = purchase_order_items.purchase_order_id) AND ((purchase_orders.requester_id = auth.uid()) OR (EXISTS ( SELECT 1            FROM projects           WHERE ((projects.id = purchase_orders.project_id) AND (projects.owner_id = auth.uid()))))))))
// Table: purchase_orders
//   Policy "auth_insert_purchase_orders" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = requester_id)
//   Policy "auth_select_purchase_orders" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = requester_id) OR (EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = purchase_orders.project_id) AND (projects.owner_id = auth.uid())))))
//   Policy "auth_update_purchase_orders" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = requester_id) OR (EXISTS ( SELECT 1    FROM projects   WHERE ((projects.id = purchase_orders.project_id) AND (projects.owner_id = auth.uid())))))
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
// Table: vendor_contacts
//   Policy "vendors_contacts_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM vendors v   WHERE ((v.id = vendor_contacts.vendor_id) AND ((v.owner_id = auth.uid()) OR is_admin()))))
//   Policy "vendors_contacts_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM vendors v   WHERE ((v.id = vendor_contacts.vendor_id) AND ((v.owner_id = auth.uid()) OR is_admin()))))
//   Policy "vendors_contacts_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM vendors v   WHERE ((v.id = vendor_contacts.vendor_id) AND ((v.owner_id = auth.uid()) OR is_admin()))))
//   Policy "vendors_contacts_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM vendors v   WHERE ((v.id = vendor_contacts.vendor_id) AND ((v.owner_id = auth.uid()) OR is_admin()))))
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
// FUNCTION admin_delete_user(uuid)
//   CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NOT public.is_admin() THEN
//       RAISE EXCEPTION 'Not authorized';
//     END IF;
//
//     DELETE FROM auth.users WHERE id = target_user_id;
//   END;
//   $function$
//
// FUNCTION admin_get_jobs_with_metrics()
//   CREATE OR REPLACE FUNCTION public.admin_get_jobs_with_metrics()
//    RETURNS TABLE(id uuid, title text, description text, category text, budget numeric, status text, created_at timestamp with time zone, owner_id uuid, owner_name text, owner_rating numeric)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NOT public.is_admin() THEN
//       RAISE EXCEPTION 'Not authorized';
//     END IF;
//
//     RETURN QUERY
//     SELECT
//       j.id,
//       j.title,
//       j.description,
//       j.category,
//       j.budget,
//       j.status,
//       j.created_at,
//       j.owner_id,
//       COALESCE(p.name, 'Unknown') as owner_name,
//       public.get_bayesian_rating(j.owner_id) as owner_rating
//     FROM public.jobs j
//     LEFT JOIN public.profiles p ON j.owner_id = p.id
//     ORDER BY j.created_at DESC;
//   END;
//   $function$
//
// FUNCTION admin_get_users_with_metrics()
//   CREATE OR REPLACE FUNCTION public.admin_get_users_with_metrics()
//    RETURNS TABLE(id uuid, name text, email text, role text, is_admin boolean, created_at timestamp with time zone, city text, state text, status text, rating numeric, jobs_executed bigint)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NOT public.is_admin() THEN
//       RAISE EXCEPTION 'Not authorized';
//     END IF;
//
//     RETURN QUERY
//     SELECT
//       p.id,
//       p.name,
//       p.email,
//       p.role,
//       p.is_admin,
//       p.created_at,
//       p.city,
//       p.state,
//       p.status,
//       public.get_bayesian_rating(p.id) as rating,
//       (SELECT count(j.id) FROM public.jobs j JOIN public.bids b ON j.accepted_bid_id = b.id WHERE b.executor_id = p.id AND j.status = 'completed')::bigint as jobs_executed
//     FROM public.profiles p
//     ORDER BY p.created_at DESC;
//   END;
//   $function$
//
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
// FUNCTION confirm_purchase_delivery(uuid)
//   CREATE OR REPLACE FUNCTION public.confirm_purchase_delivery(p_order_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_order RECORD;
//     v_item RECORD;
//   BEGIN
//     -- Get order
//     SELECT * INTO v_order FROM public.purchase_orders WHERE id = p_order_id;
//
//     IF NOT FOUND THEN
//       RAISE EXCEPTION 'Order not found';
//     END IF;
//
//     IF v_order.status = 'delivered' THEN
//       RETURN; -- Already delivered
//     END IF;
//
//     -- Update status
//     UPDATE public.purchase_orders SET status = 'delivered' WHERE id = p_order_id;
//
//     -- Insert invoice
//     INSERT INTO public.invoices (
//       project_id,
//       payer_id,
//       vendor_id,
//       amount,
//       status,
//       type,
//       currency,
//       description,
//       due_date
//     ) VALUES (
//       v_order.project_id,
//       v_order.requester_id,
//       v_order.vendor_id,
//       v_order.total_amount,
//       'paid',
//       'material_purchase',
//       'USD',
//       'Material purchase delivery - Order #' || substring(p_order_id::text from 1 for 8),
//       NOW()
//     );
//
//     -- Decrease material stock
//     FOR v_item IN SELECT * FROM public.purchase_order_items WHERE purchase_order_id = p_order_id LOOP
//       IF v_item.material_id IS NOT NULL AND v_item.material_id != '' THEN
//         BEGIN
//           UPDATE public.materials
//           SET stock = GREATEST(stock - v_item.quantity, 0)
//           WHERE id = v_item.material_id::uuid;
//         EXCEPTION WHEN invalid_text_representation THEN
//           -- ignore invalid uuid
//         END;
//       END IF;
//     END LOOP;
//
//   END;
//   $function$
//
// FUNCTION get_bayesian_rating(uuid)
//   CREATE OR REPLACE FUNCTION public.get_bayesian_rating(p_target_id uuid)
//    RETURNS numeric
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_k numeric := 10.0;
//       v_v numeric;
//       v_s_base numeric;
//       v_s_global numeric;
//       v_final numeric;
//   BEGIN
//       -- Get global average
//       SELECT COALESCE(AVG(rating), 5.0) INTO v_s_global FROM public.reviews;
//
//       -- Get user reviews count and average
//       SELECT COUNT(*), COALESCE(AVG(rating), 5.0)
//       INTO v_v, v_s_base
//       FROM public.reviews
//       WHERE target_id = p_target_id;
//
//       IF v_v = 0 THEN
//           RETURN ROUND(v_s_global, 1);
//       END IF;
//
//       v_final := ((v_v * v_s_base) + (v_k * v_s_global)) / (v_v + v_k);
//
//       RETURN ROUND(v_final, 1);
//   END;
//   $function$
//
// FUNCTION get_global_rating_average()
//   CREATE OR REPLACE FUNCTION public.get_global_rating_average()
//    RETURNS numeric
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_s_global numeric;
//   BEGIN
//       SELECT COALESCE(AVG(rating), 5.0) INTO v_s_global FROM public.reviews;
//       RETURN ROUND(v_s_global, 2);
//   END;
//   $function$
//
// FUNCTION handle_ad_completion()
//   CREATE OR REPLACE FUNCTION public.handle_ad_completion()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_vendor RECORD;
//     v_admin_id UUID;
//     v_region TEXT;
//     v_tier TEXT;
//     v_category TEXT;
//   BEGIN
//     IF OLD.status NOT IN ('completed', 'expired') AND NEW.status IN ('completed', 'expired') THEN
//
//       SELECT * INTO v_vendor FROM public.vendors WHERE id = NEW.advertiser_id;
//
//       SELECT id INTO v_admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;
//
//       v_region := COALESCE(NEW.specifications->>'region', 'Global');
//       v_category := COALESCE(NEW.specifications->>'category', 'General');
//       v_tier := COALESCE(NEW.tier, 'N/A');
//
//       IF v_vendor.owner_id IS NOT NULL THEN
//         INSERT INTO public.invoices (
//           job_id,
//           project_id,
//           payer_id,
//           receiver_id,
//           vendor_id,
//           amount,
//           status,
//           type,
//           currency,
//           description,
//           due_date
//         ) VALUES (
//           NULL,
//           NULL,
//           v_vendor.owner_id,
//           v_admin_id,
//           NEW.advertiser_id,
//           NEW.price,
//           'review',
//           'advertising',
//           'USD',
//           'Campaign: ' || NEW.title || ' | Period: ' || COALESCE(NEW.start_date::date::text, 'N/A') || ' to ' || COALESCE(NEW.end_date::date::text, 'N/A') || ' | Tier: ' || v_tier || ' | Category: ' || v_category,
//           NOW() + INTERVAL '15 days'
//         );
//       END IF;
//     END IF;
//     RETURN NEW;
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
// FUNCTION handle_subscription_payment()
//   CREATE OR REPLACE FUNCTION public.handle_subscription_payment()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.status = 'paid' AND NEW.type = 'subscription' THEN
//       UPDATE public.profiles
//       SET subscription_status = 'active',
//           subscription_end_date = NOW() + INTERVAL '30 days'
//       WHERE id = NEW.payer_id;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION increment_job_impressions(uuid[])
//   CREATE OR REPLACE FUNCTION public.increment_job_impressions(job_ids_param uuid[])
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.jobs
//     SET impressions_count = impressions_count + 1
//     WHERE id = ANY(job_ids_param);
//   END;
//   $function$
//
// FUNCTION increment_job_view(uuid)
//   CREATE OR REPLACE FUNCTION public.increment_job_view(job_id_param uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.jobs
//     SET views_count = views_count + 1
//     WHERE id = job_id_param;
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
// FUNCTION set_current_timestamp_updated_at()
//   CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_invoice_email_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_invoice_email_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_url TEXT := 'https://yhyiwrerqojrqjvlumov.supabase.co/functions/v1/send-invoice-email';
//     v_payload JSONB;
//     v_req_id BIGINT;
//   BEGIN
//     IF NEW.type = 'advertising' THEN
//       RETURN NEW;
//     END IF;
//
//     v_payload := jsonb_build_object(
//       'record', to_jsonb(NEW),
//       'type', TG_OP
//     );
//
//     IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
//       BEGIN
//         SELECT net.http_post(
//           url := v_url,
//           headers := '{"Content-Type": "application/json"}'::jsonb,
//           body := v_payload
//         ) INTO v_req_id;
//       EXCEPTION WHEN OTHERS THEN
//         RAISE NOTICE 'Failed to invoke webhook for email';
//       END;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: advertising_campaigns
//   on_ad_completed: CREATE TRIGGER on_ad_completed AFTER UPDATE OF status ON public.advertising_campaigns FOR EACH ROW EXECUTE FUNCTION handle_ad_completion()
//   set_advertising_campaigns_updated_at: CREATE TRIGGER set_advertising_campaigns_updated_at BEFORE UPDATE ON public.advertising_campaigns FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at()
// Table: bids
//   audit_bids: CREATE TRIGGER audit_bids AFTER INSERT OR DELETE OR UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION log_audit_event()
// Table: invoices
//   audit_invoices: CREATE TRIGGER audit_invoices AFTER INSERT OR DELETE OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION log_audit_event()
//   enforce_paid_invoice_lock: CREATE TRIGGER enforce_paid_invoice_lock BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION lock_paid_invoices()
//   on_invoice_created_email: CREATE TRIGGER on_invoice_created_email AFTER INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION trigger_invoice_email_webhook()
//   on_subscription_paid: CREATE TRIGGER on_subscription_paid AFTER UPDATE OF status ON public.invoices FOR EACH ROW EXECUTE FUNCTION handle_subscription_payment()
// Table: jobs
//   on_job_completed: CREATE TRIGGER on_job_completed AFTER UPDATE OF status ON public.jobs FOR EACH ROW EXECUTE FUNCTION handle_job_completion()
// Table: profiles
//   audit_profiles: CREATE TRIGGER audit_profiles AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event()
// Table: projects
//   audit_projects: CREATE TRIGGER audit_projects AFTER INSERT OR DELETE OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION log_audit_event()

// --- INDEXES ---
// Table: categories
//   CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug)
// Table: favorites
//   CREATE UNIQUE INDEX favorites_user_id_vendor_id_key ON public.favorites USING btree (user_id, vendor_id)
// Table: invoices
//   CREATE INDEX idx_invoices_subscription_status ON public.invoices USING btree (payer_id, type, status)
// Table: jobs
//   CREATE INDEX idx_jobs_is_demo ON public.jobs USING btree (is_demo)
//   CREATE UNIQUE INDEX jobs_external_id_key ON public.jobs USING btree (external_id)
// Table: marketing_content
//   CREATE UNIQUE INDEX marketing_content_key_key ON public.marketing_content USING btree (key)
// Table: permissions
//   CREATE UNIQUE INDEX permissions_role_name_key ON public.permissions USING btree (role_name)
// Table: push_subscriptions
//   CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint)
// Table: reviews
//   CREATE INDEX idx_reviews_reviewer_id ON public.reviews USING btree (reviewer_id)
//   CREATE INDEX idx_reviews_target_id ON public.reviews USING btree (target_id)
//   CREATE UNIQUE INDEX unique_review_per_job ON public.reviews USING btree (job_id, reviewer_id, target_id)
// Table: site_settings
//   CREATE UNIQUE INDEX site_settings_key_key ON public.site_settings USING btree (key)
