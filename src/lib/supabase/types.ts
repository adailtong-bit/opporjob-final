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
      construction_plans: {
        Row: {
          active: boolean | null
          billing_cycle: string
          complexity: string | null
          created_at: string
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
          project_id: string | null
          receiver_id: string | null
          status: string | null
          task_id: string | null
          type: string | null
          updated_at: string
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
          project_id?: string | null
          receiver_id?: string | null
          status?: string | null
          task_id?: string | null
          type?: string | null
          updated_at?: string
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
          project_id?: string | null
          receiver_id?: string | null
          status?: string | null
          task_id?: string | null
          type?: string | null
          updated_at?: string
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
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          status: string | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          status?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
// Table: equipment
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   type: text (nullable)
//   status: text (nullable, default: 'available'::text)
//   location: text (nullable)
//   project_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
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
// Table: projects
//   id: uuid (not null, default: gen_random_uuid())
//   owner_id: uuid (nullable)
//   name: text (not null)
//   description: text (nullable)
//   status: text (nullable, default: 'planning'::text)
//   total_budget: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: push_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   endpoint: text (not null)
//   auth: text (not null)
//   p256dh: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: construction_plans
//   PRIMARY KEY construction_plans_pkey: PRIMARY KEY (id)
// Table: equipment
//   PRIMARY KEY equipment_pkey: PRIMARY KEY (id)
//   FOREIGN KEY equipment_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
// Table: invoices
//   FOREIGN KEY invoices_payer_id_fkey: FOREIGN KEY (payer_id) REFERENCES profiles(id) ON DELETE CASCADE
//   PRIMARY KEY invoices_pkey: PRIMARY KEY (id)
//   FOREIGN KEY invoices_receiver_id_fkey: FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: marketing_content
//   UNIQUE marketing_content_key_key: UNIQUE (key)
//   PRIMARY KEY marketing_content_pkey: PRIMARY KEY (id)
// Table: materials
//   PRIMARY KEY materials_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: projects
//   FOREIGN KEY projects_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)
// Table: push_subscriptions
//   UNIQUE push_subscriptions_endpoint_key: UNIQUE (endpoint)
//   PRIMARY KEY push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY push_subscriptions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: audit_logs
//   Policy "audit_logs_select" (SELECT, PERMISSIVE) roles={public}
//     USING: is_admin()
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
// Table: invoices
//   Policy "invoices_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_select" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
//   Policy "invoices_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = payer_id) OR (auth.uid() = receiver_id) OR (is_admin() = true))
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
// Table: projects
//   Policy "projects_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = owner_id)
//   Policy "projects_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = owner_id)
//   Policy "projects_select" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = owner_id) OR is_admin())
//   Policy "projects_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = owner_id)
// Table: push_subscriptions
//   Policy "Users can manage their own push subscriptions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)

// --- DATABASE FUNCTIONS ---
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
// Table: profiles
//   audit_profiles: CREATE TRIGGER audit_profiles AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event()
// Table: projects
//   audit_projects: CREATE TRIGGER audit_projects AFTER INSERT OR DELETE OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION log_audit_event()

// --- INDEXES ---
// Table: marketing_content
//   CREATE UNIQUE INDEX marketing_content_key_key ON public.marketing_content USING btree (key)
// Table: push_subscriptions
//   CREATE UNIQUE INDEX push_subscriptions_endpoint_key ON public.push_subscriptions USING btree (endpoint)
