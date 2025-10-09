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
      const cvs = data?.map(cv => {
        // Mapear el tipo correcto: si tiene adapted_content, es 'adapted', sino es 'base'
        const cvType = (cv.adapted_content && cv.adapted_content.length > 0) ? 'adapted' : 'base';
        
        return {
          id: cv.id,
          userId: cv.user_id,
          name: cv.file_name || 'CV sin nombre',
          type: cvType as 'base' | 'adapted',
          filePath: cv.file_url || '',
          fileName: cv.file_name || '',
          fileSize: parseInt(cv.file_size) || 0,
          keywords: [], // Not in current schema
          coverage: cv.coverage || 0,
          adaptedContent: cv.adapted_content || '', // Contenido adaptado de la base de datos
          createdAt: new Date(cv.created_at),
          updatedAt: new Date(cv.updated_at)
        };
      }) || [];

      console.log('✅ Converted CVs:', cvs);
      console.log('📊 CVs summary:', cvs.map(cv => ({
        id: cv.id,
        name: cv.name,
        type: cv.type,
        hasContent: !!cv.adaptedContent,
        contentLength: cv.adaptedContent?.length || 0
      })));

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
      // Verificar que tenemos el contenido adaptado
      if (!cvData.adaptedContent) {
        console.error('❌ No hay contenido adaptado para guardar');
        return { data: null, error: new Error('No hay contenido adaptado') };
      }

      // Preparar los datos para guardar
      const insertData = {
        user_id: cvData.userId,
        file_name: cvData.fileName,
        file_url: cvData.filePath,
        file_type: 'doc', // Siempre es un documento Word
        file_size: cvData.fileSize?.toString() || '0',
        coverage: cvData.coverage || 0,
        status: 'Adaptado',
        adapted_content: cvData.adaptedContent, // El contenido HTML del CV
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Datos a insertar:', {
        ...insertData,
        adapted_content: insertData.adapted_content ? `${insertData.adapted_content.length} caracteres` : 'null'
      });
      
      console.log('📝 Inserting CV data:', insertData);
      console.log('📄 Contenido adaptado a guardar:', insertData.adapted_content ? `${insertData.adapted_content.length} caracteres` : 'null');
      console.log('👤 User ID:', insertData.user_id);
      console.log('📁 File name:', insertData.file_name);
      
      const { data, error } = await supabase
        .from('cvs')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating CV:', error);
        console.error('❌ Error details:', error.message, error.details, error.hint);
        return { data: null, error };
      }

      console.log('✅ CV created successfully:', data);
      console.log('✅ CV ID:', data.id);
      console.log('✅ CV content saved:', data.adapted_content ? `${data.adapted_content.length} caracteres` : 'null');
      
      // Mapear los datos de Supabase al tipo CV del frontend
      const cv: CV = {
        id: data.id,
        userId: data.user_id,
        name: data.file_name || 'CV sin nombre',
        type: data.file_type as 'base' | 'adapted',
        filePath: data.file_url || '',
        fileName: data.file_name || '',
        fileSize: parseInt(data.file_size) || 0,
        keywords: [],
        coverage: data.coverage || 0,
        adaptedContent: data.adapted_content || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      console.log('✅ CV mapeado:', cv);
      
      return { data: cv, error: null };
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
