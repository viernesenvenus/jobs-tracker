import { supabase } from './supabase'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export const profileService = {
  // Crear un nuevo perfil
  async createProfile(profile: Omit<Profile, 'created_at'>): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Obtener perfil por ID de usuario
  async getProfileByUserId(userId: string): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Obtener perfil por email
  async getProfileByEmail(email: string): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Actualizar perfil
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Eliminar perfil
  async deleteProfile(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  }
}
