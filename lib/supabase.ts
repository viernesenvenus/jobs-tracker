import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgqkegvsdmildcauvfip.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncWtlZ3ZzZG1pbGRjYXV2ZmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzIzNzIsImV4cCI6MjA3NTEwODM3Mn0.qqvRtJegxwhHb_EIx9Diady1AUjNu64e8DXmpECKhGs'

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
          file_name: string | null
          file_url: string | null
          file_type: string | null
          coverage: number | null
          file_size: string | null
          status: string | null
          created_at: string
          updated_at: string
          adapted_content: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name?: string | null
          file_url?: string | null
          file_type?: string | null
          coverage?: number | null
          file_size?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          adapted_content?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string | null
          file_url?: string | null
          file_type?: string | null
          coverage?: number | null
          file_size?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          adapted_content?: string | null
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
          response_time: string | null
          contact_name: string | null
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
          response_time?: string | null
          contact_name?: string | null
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
          response_time?: string | null
          contact_name?: string | null
          job_link?: string | null
          status?: string | null
          created_at?: string
        }
      }
    }
  }
}