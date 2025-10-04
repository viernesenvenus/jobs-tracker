import { supabase } from './supabase';
import { CV } from '@/types';

export const cvService = {
  async getCVsByUserId(userId: string): Promise<{ data: CV[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching CVs:', error);
        return { data: null, error };
      }

      // Convert Supabase data to our CV type
      const cvs = data?.map(cv => ({
        id: cv.id,
        userId: cv.userId,
        name: cv.name,
        type: cv.type,
        filePath: cv.filePath,
        fileName: cv.fileName,
        fileSize: cv.fileSize || 0,
        keywords: cv.keywords || [],
        coverage: cv.coverage || 0,
        adaptedContent: cv.adaptedContent,
        createdAt: new Date(cv.createdAt),
        updatedAt: new Date(cv.updatedAt)
      })) || [];

      return { data: cvs, error: null };
    } catch (error) {
      console.error('Error in getCVsByUserId:', error);
      return { data: null, error };
    }
  },

  async createCV(cvData: Partial<CV>): Promise<{ data: CV | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .insert([cvData])
        .select()
        .single();

      if (error) {
        console.error('Error creating CV:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createCV:', error);
      return { data: null, error };
    }
  },

  async updateCV(cvId: string, updates: Partial<CV>): Promise<{ data: CV | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .update(updates)
        .eq('id', cvId)
        .select()
        .single();

      if (error) {
        console.error('Error updating CV:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateCV:', error);
      return { data: null, error };
    }
  },

  async deleteCV(cvId: string): Promise<{ data: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) {
        console.error('Error deleting CV:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error in deleteCV:', error);
      return { data: false, error };
    }
  }
};
