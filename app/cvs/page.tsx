'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
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
      const { data: userCVs, error } = await cvService.getCVsByUserId(user.id);
      if (error) {
        throw new Error(error.message);
      }
      setCvs(userCVs || []);
    } catch (error) {
      console.error('Error loading CVs:', error);
      showError('Error', 'No se pudieron cargar los CVs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVUploaded = async (cvData: Partial<CV>) => {
    if (!user) return;

    try {
      // Save to Supabase
      const { data, error } = await cvService.createCV({
        ...cvData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const success = !error;
      
      if (success) {
        // Update local state
        const newCV: CV = {
          id: Date.now().toString(),
          userId: user.id,
          name: cvData.name || 'Nuevo CV',
          type: cvData.type || 'base',
          filePath: cvData.filePath || '',
          fileName: cvData.fileName || '',
          fileSize: cvData.fileSize || 0,
          keywords: cvData.keywords || [],
          coverage: cvData.coverage || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setCvs(prev => [newCV, ...prev]);
        
        if (cvData.type === 'adapted') {
          showSuccess('CV adaptado guardado', 'El CV adaptado se ha guardado exitosamente en tu lista.');
        } else {
          showSuccess('CV subido', 'El CV se ha subido exitosamente.');
        }
        
        setShowUploadModal(false);
      } else {
        showError('Error', 'No se pudo guardar el CV.');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      showError('Error', 'Error al guardar el CV.');
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    try {
      const { data: success, error } = await cvService.deleteCV(cvId);
      
      if (success) {
        setCvs(prev => prev.filter(cv => cv.id !== cvId));
        showSuccess('CV eliminado', 'El CV ha sido eliminado correctamente.');
      } else {
        showError('Error', 'No se pudo eliminar el CV.');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      showError('Error', 'Error al eliminar el CV.');
    }
  };

  const handleExportCV = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    if (!cv) return;

    // If it's an adapted CV with content, download it
    if (cv.type === 'adapted' && cv.adaptedContent) {
      const blob = new Blob([cv.adaptedContent], { type: 'application/msword;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cv.fileName || 'CV_adaptado.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Descarga iniciada', 'El CV se está descargando.');
    } else {
      // For base CVs or adapted CVs without content, show a message
      showError('Error', 'No hay contenido disponible para descargar este CV.');
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