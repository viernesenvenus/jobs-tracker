import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgqkegvsdmildcauvfip.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wckhlTdWJ24fJ_91INC9MQ_efLDAkHm'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: string
          created_at?: string
        }
      }
      cvs: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          coverage: number
          file_size: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          coverage?: number
          file_size: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          coverage?: number
          file_size?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          applied_at: string
          first_call: string | null
          response_tim: string | null
          contact_nam: string | null
          job_link: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          applied_at: string
          first_call?: string | null
          response_tim?: string | null
          contact_nam?: string | null
          job_link?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          applied_at?: string
          first_call?: string | null
          response_tim?: string | null
          contact_nam?: string | null
          job_link?: string | null
          status?: string | null
          created_at?: string
        }
      }
    }
  }
}