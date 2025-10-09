'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useModal } from '@/contexts/ModalContext';
import { CV } from '@/types';
import { CVTable } from '@/components/CVTable';
import { EmptyState } from '@/components/EmptyState';
import { CVUploadModal } from '@/components/modals/CVUploadModal';
import { cvService } from '@/lib/cvService';
import { 
  PlusIcon, 
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function CVsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const { openConfirmationModal } = useModal();
  const router = useRouter();
  
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'base' | 'adapted'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load CVs from Supabase
  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('🔍 loadCVs called with user:', user);
      console.log('👤 User ID:', user.id);
      console.log('👤 User email:', user.email);
      
      const { data: userCVs, error } = await cvService.getCVsByUserId(user.id);
      console.log('📝 CVs loaded from service:', userCVs);
      console.log('❌ Error from service:', error);
      
      if (error) {
        throw new Error(error.message);
      }
      setCvs(userCVs || []);
      console.log('✅ CVs set in state:', userCVs);
    } catch (error) {
      console.error('Error loading CVs:', error);
      showError('Error', 'No se pudieron cargar los CVs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVUploaded = async (cvData: Partial<CV>) => {
    if (!user) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    try {
      console.log('🔍 handleCVUploaded llamado con:', cvData);
      console.log('👤 Usuario autenticado:', user);
      console.log('👤 User ID:', user.id);
      
      // Save to Supabase
      // Verificar que tenemos el contenido adaptado
      if (!cvData.adaptedContent) {
        console.error('❌ No hay contenido adaptado para guardar');
        showError('Error', 'No hay contenido adaptado para guardar');
        return;
      }

      const cvToSave = {
        ...cvData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('📝 CV a guardar:', {
        ...cvToSave,
        adaptedContent: cvToSave.adaptedContent ? `${cvToSave.adaptedContent.length} caracteres` : 'null'
      });
      
      console.log('📝 Guardando CV en Supabase:', cvToSave);
      console.log('📄 Contenido adaptado disponible:', !!cvToSave.adaptedContent);
      console.log('📄 Tamaño del contenido:', cvToSave.adaptedContent?.length || 0);
      
      const { data, error } = await cvService.createCV(cvToSave);
      
      if (error) {
        console.error('❌ Error guardando CV:', error);
        showError('Error', `No se pudo guardar el CV: ${error.message || 'Error desconocido'}`);
        return;
      }
      
      console.log('✅ CV guardado exitosamente:', data);
      
      if (!data) {
        console.error('❌ No se recibió data del servidor');
        showError('Error', 'No se pudo obtener la información del CV guardado.');
        return;
      }
      
      // Update local state with real Supabase data
      const newCV: CV = {
        id: data.id, // Usar el ID real de Supabase
        userId: data.userId,
        name: data.name || 'Nuevo CV',
        type: data.type || 'base',
        filePath: data.filePath || '',
        fileName: data.fileName || '',
        fileSize: data.fileSize || 0,
        keywords: data.keywords || [],
        coverage: data.coverage || 0,
        adaptedContent: data.adaptedContent || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      setCvs(prev => [newCV, ...prev]);
      
      if (cvData.type === 'adapted') {
        showSuccess('CV adaptado guardado', 'El CV adaptado se ha guardado exitosamente en tu lista.');
      } else {
        showSuccess('CV subido', 'El CV se ha subido exitosamente.');
      }
      
      setShowUploadModal(false);
      
    } catch (error) {
      console.error('❌ Error en handleCVUploaded:', error);
      showError('Error', `Error al guardar el CV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleDeleteCV = (cvId: string) => {
    console.log('🗑️ handleDeleteCV called with cvId:', cvId);
    const cv = cvs.find(c => c.id === cvId);
    const cvName = cv?.name || 'este CV';
    
    console.log('📝 CV encontrado:', cv);
    console.log('📝 Nombre del CV:', cvName);
    console.log('🔄 Abriendo modal de confirmación...');
    
    openConfirmationModal(
      'Eliminar CV',
      `¿Estás seguro de que quieres eliminar "${cvName}"? Esta acción no se puede deshacer.`,
      async () => {
        console.log('✅ Usuario confirmó eliminación, ejecutando deleteCV...');
        try {
          const { data: success, error } = await cvService.deleteCV(cvId);
          
          console.log('📊 Resultado de deleteCV:', { success, error });
          
          if (success) {
            console.log('✅ Eliminación exitosa, actualizando estado local...');
            setCvs(prev => prev.filter(cv => cv.id !== cvId));
            showSuccess('CV eliminado', 'El CV ha sido eliminado correctamente.');
          } else {
            console.error('❌ Error en eliminación:', error);
            showError('Error', `No se pudo eliminar el CV: ${error?.message || 'Error desconocido'}`);
          }
        } catch (error) {
          console.error('❌ Error en handleDeleteCV:', error);
          showError('Error', 'Error al eliminar el CV.');
        }
      }
    );
  };

  const handleAdaptCV = (cvId: string) => {
    // Abrir el modal de adaptación de CV
    setShowUploadModal(true);
  };

  const handleExportCV = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    if (!cv) {
      showError('Error', 'CV no encontrado.');
      return;
    }

    try {
      console.log('🔍 Intentando descargar CV:', cv);
      console.log('📄 CV type:', cv.type);
      console.log('📄 CV adaptedContent length:', cv.adaptedContent?.length || 0);
      console.log('📄 CV filePath:', cv.filePath);
      
      // If it's an adapted CV with content, download it
      if (cv.type === 'adapted' && cv.adaptedContent && cv.adaptedContent.length > 0) {
        console.log('✅ Descargando CV adaptado con contenido');
        const blob = new Blob([cv.adaptedContent], { type: 'application/msword;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cv.name}_Adaptado_${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess('CV descargado', 'El CV adaptado se ha descargado correctamente.');
      } else if (cv.type === 'base' && cv.filePath && !cv.filePath.startsWith('blob:')) {
        // For base CVs, try to download from the file path (but not blob URLs)
        console.log('✅ Descargando CV base');
        const link = document.createElement('a');
        link.href = cv.filePath;
        link.download = cv.fileName || `${cv.name}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('CV descargado', 'El CV base se ha descargado correctamente.');
      } else {
        console.log('❌ No se puede descargar:', {
          type: cv.type,
          hasContent: !!cv.adaptedContent,
          contentLength: cv.adaptedContent?.length || 0,
          filePath: cv.filePath,
          isBlob: cv.filePath?.startsWith('blob:')
        });
        showError('Error', 'No se puede descargar este CV. El archivo no está disponible o el contenido está vacío.');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      showError('Error', 'Error al descargar el CV.');
    }
  };

  const filteredCVs = cvs.filter(cv => {
    if (filter === 'all') return true;
    return cv.type === filter;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando CVs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis CVs</h1>
              <p className="mt-2 text-gray-600">
                Gestiona y adapta tus CVs con inteligencia artificial
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Adaptar CV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos ({cvs.length})
            </button>
            <button
              onClick={() => setFilter('base')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'base'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Base ({cvs.filter(cv => cv.type === 'base').length})
            </button>
            <button
              onClick={() => setFilter('adapted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'adapted'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Adaptados ({cvs.filter(cv => cv.type === 'adapted').length})
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredCVs.length === 0 ? (
          <EmptyState
            icon={DocumentTextIcon}
            title="No tienes CVs aún"
            description={
              filter === 'all' 
                ? "Comienza subiendo tu primer CV y adaptándolo con IA para diferentes posiciones."
                : filter === 'base'
                ? "Sube tu CV base para comenzar a crear versiones adaptadas."
                : "Crea tu primer CV adaptado usando nuestro generador de IA."
            }
            actionLabel="Adaptar CV"
            onAction={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="bg-white shadow rounded-lg">
            <CVTable
              cvs={filteredCVs}
              onDelete={handleDeleteCV}
              onExport={handleExportCV}
              onAdapt={handleAdaptCV}
            />
          </div>
        )}

        {/* Upload Modal */}
        <CVUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onConfirm={handleCVUploaded}
        />
      </div>
    </div>
  );
}