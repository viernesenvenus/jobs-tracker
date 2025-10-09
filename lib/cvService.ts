import { supabase } from './supabase';
import { CV } from '@/types';

export const cvService = {
  async getCVsByUserId(userId: string): Promise<{ data: CV[] | null; error: any }> {
    try {
      console.log('🔍 cvService.getCVsByUserId called with userId:', userId);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching CVs:', error);
        return { data: null, error };
      }

      console.log('📝 Raw CVs data from Supabase:', data);

      // Convert Supabase data to our CV type
      const cvs = data?.map(cv => ({
        id: cv.id,
        userId: cv.user_id,
        name: cv.file_name || 'CV sin nombre',
        type: cv.file_type || 'base',
        filePath: cv.file_url || '',
        fileName: cv.file_name || '',
        fileSize: parseInt(cv.file_size) || 0,
        keywords: [], // Not in current schema
        coverage: cv.coverage || 0,
        adaptedContent: cv.adapted_content || '', // Contenido adaptado de la base de datos
        createdAt: new Date(cv.created_at),
        updatedAt: new Date(cv.updated_at)
      })) || [];

      console.log('✅ Converted CVs:', cvs);

      return { data: cvs, error: null };
    } catch (error) {
      console.error('Error in getCVsByUserId:', error);
      return { data: null, error };
    }
  },

  async createCV(cvData: Partial<CV>): Promise<{ data: CV | null; error: any }> {
    try {
      console.log('🔍 cvService.createCV called with:', cvData);
      
      // Map CV data to Supabase schema
      const insertData = {
        user_id: cvData.userId,
        file_name: cvData.fileName || cvData.name,
        file_url: cvData.filePath,
        file_type: cvData.type || 'base',
        file_size: cvData.fileSize?.toString() || '0',
        coverage: cvData.coverage || 0,
        status: 'Adaptado',
        adapted_content: cvData.adaptedContent || null, // Guardar el contenido adaptado
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting CV data:', insertData);
      
      const { data, error } = await supabase
        .from('cvs')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating CV:', error);
        return { data: null, error };
      }

      console.log('✅ CV created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createCV:', error);
      return { data: null, error };
    }
  },

  async updateCV(cvId: string, updates: Partial<CV>): Promise<{ data: CV | null; error: any }> {
    try {
      console.log('🔍 cvService.updateCV called with:', { cvId, updates });
      
      // Map CV updates to Supabase schema
      const updateData: any = {};
      if (updates.fileName || updates.name) updateData.file_name = updates.fileName || updates.name;
      if (updates.filePath) updateData.file_url = updates.filePath;
      if (updates.type) updateData.file_type = updates.type;
      if (updates.fileSize) updateData.file_size = updates.fileSize.toString();
      if (updates.coverage !== undefined) updateData.coverage = updates.coverage;
      updateData.updated_at = new Date().toISOString();
      
      console.log('📝 Updating CV with data:', updateData);
      
      const { data, error } = await supabase
        .from('cvs')
        .update(updateData)
        .eq('id', cvId)
        .select()
        .single();

      if (error) {
        console.error('Error updating CV:', error);
        return { data: null, error };
      }

      console.log('✅ CV updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateCV:', error);
      return { data: null, error };
    }
  },

  async deleteCV(cvId: string): Promise<{ data: boolean; error: any }> {
    try {
      console.log('🔍 cvService.deleteCV called with cvId:', cvId);
      
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) {
        console.error('Error deleting CV:', error);
        return { data: false, error };
      }

      console.log('✅ CV deleted successfully');
      return { data: true, error: null };
    } catch (error) {
      console.error('Error in deleteCV:', error);
      return { data: false, error };
    }
  }
};
