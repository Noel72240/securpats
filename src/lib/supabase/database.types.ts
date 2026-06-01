/**
 * Types générés manuellement — alignés sur supabase/migrations/001_initial_schema.sql
 * Après connexion : npx supabase gen types typescript --project-id XXX > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'owner' | 'petsitter' | 'admin'
export type DocumentCategory = 'carnet_sante' | 'ordonnance' | 'facture' | 'assurance' | 'divers'
export type SubscriptionPlan = 'monthly' | 'yearly' | 'petsitter_vip'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'
export type MissionStatus = 'pending' | 'accepted' | 'declined' | 'completed'
export type MissionType = 'urgence' | 'garde'
export type InvoiceStatus = 'paid' | 'pending' | 'failed'

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          role: UserRole
          avatar_url: string | null
          two_factor_enabled: boolean
          consent_accepted_at: string | null
          consent_version: string | null
          marketing_opt_in: boolean | null
          created_at: string
        },
        {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string
          role?: UserRole
          avatar_url?: string | null
          two_factor_enabled?: boolean
          consent_accepted_at?: string | null
          consent_version?: string | null
          marketing_opt_in?: boolean | null
          created_at?: string
        }
      >
      pets: TableDef<
        {
          id: string
          owner_id: string
          photo: string | null
          name: string
          species: string
          breed: string
          sex: string
          birth_date: string
          weight: number
          color: string
          identification_number: string
          treatments: string
          allergies: string
          diet: string
          special_instructions: string
          vet_name: string
          vet_phone: string
          vet_address: string
          qr_token: string
          created_at: string
        },
        {
          id?: string
          owner_id: string
          photo?: string | null
          name: string
          species: string
          breed: string
          sex: string
          birth_date: string
          weight: number
          color: string
          identification_number: string
          treatments: string
          allergies: string
          diet: string
          special_instructions: string
          vet_name: string
          vet_phone: string
          vet_address: string
          qr_token?: string
          created_at?: string
        }
      >
      referents: TableDef<
        {
          id: string
          owner_id: string
          first_name: string
          last_name: string
          phone: string
          email: string
          address: string
          priority: number
        },
        {
          id?: string
          owner_id: string
          first_name: string
          last_name: string
          phone: string
          email: string
          address: string
          priority: number
        }
      >
      documents: TableDef<
        {
          id: string
          owner_id: string
          pet_id: string | null
          name: string
          category: DocumentCategory
          file_name: string
          file_size: number
          storage_path: string | null
          uploaded_at: string
        },
        {
          id?: string
          owner_id: string
          pet_id?: string | null
          name: string
          category: DocumentCategory
          file_name: string
          file_size: number
          storage_path?: string | null
          uploaded_at?: string
        }
      >
      subscriptions: TableDef<
        {
          id: string
          owner_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          price: number
          start_date: string
          renewal_date: string
          auto_renew: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        },
        {
          id?: string
          owner_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          price: number
          start_date: string
          renewal_date: string
          auto_renew: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      >
      invoices: TableDef<
        {
          id: string
          owner_id: string
          amount: number
          date: string
          status: InvoiceStatus
          plan: SubscriptionPlan
          stripe_invoice_id: string | null
        },
        {
          id?: string
          owner_id: string
          amount: number
          date: string
          status: InvoiceStatus
          plan: SubscriptionPlan
          stripe_invoice_id?: string | null
        }
      >
      missions: TableDef<
        {
          id: string
          pet_id: string
          pet_name: string
          owner_id: string
          owner_name: string
          petsitter_id: string | null
          type: MissionType
          status: MissionStatus
          description: string
          address: string
          created_at: string
        },
        {
          id?: string
          pet_id: string
          pet_name: string
          owner_id: string
          owner_name: string
          petsitter_id?: string | null
          type: MissionType
          status: MissionStatus
          description: string
          address: string
          created_at?: string
        }
      >
      petsitter_profiles: TableDef<
        {
          id: string
          user_id: string
          photo: string | null
          bio: string
          phone: string
          email: string
          address: string
          id_document_path: string | null
          proof_of_address_path: string | null
          available_days: string[]
          available_hours: string
          service_area: string
          verified: boolean
          id_consent_at: string | null
          id_consent_version: string | null
        },
        {
          id?: string
          user_id: string
          photo?: string | null
          bio?: string
          phone?: string
          email?: string
          address?: string
          id_document_path?: string | null
          proof_of_address_path?: string | null
          available_days?: string[]
          available_hours?: string
          service_area?: string
          verified?: boolean
          id_consent_at?: string | null
          id_consent_version?: string | null
        }
      >
      activities: TableDef<
        {
          id: string
          owner_id: string
          type: string
          message: string
          created_at: string
        },
        {
          id?: string
          owner_id: string
          type: string
          message: string
          created_at?: string
        }
      >
      site_settings: TableDef<
        {
          id: string
          settings: Json
          updated_at: string
        },
        {
          id?: string
          settings: Json
          updated_at?: string
        }
      >
      contact_messages: TableDef<
        {
          id: string
          name: string
          email: string
          subject: string
          message: string
          consent_given: boolean
          consent_at: string | null
          created_at: string
        },
        {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          consent_given?: boolean
          consent_at?: string | null
          created_at?: string
        }
      >
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_pet_by_qr_token: {
        Args: { token: string }
        Returns: Database['public']['Tables']['pets']['Row'][]
      }
      get_referents_by_qr_token: {
        Args: { token: string }
        Returns: Database['public']['Tables']['referents']['Row'][]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      accept_mission: {
        Args: { p_mission_id: string }
        Returns: Database['public']['Tables']['missions']['Row']
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
