'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { CV } from '@/types';
import { CVTable } from '@/components/CVTable';
import { EmptyState } from '@/components/EmptyState';
import { CVUploadModal } from '@/components/modals/CVUploadModal';
import { 
  PlusIcon, 
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Mock data for development
const mockCVs: CV[] = [
  {
    id: '1',
    userId: '1',
    name: 'CV_Maria_Garcia_Base.pdf',
    type: 'base',
    filePath: '/cvs/CV_Maria_Garcia_Base.pdf',
    fileName: 'CV_Maria_Garcia_Base.pdf',
    fileSize: 245760,
    keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    coverage: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    userId: '1',
    name: 'CV_Maria_Garcia_Frontend.pdf',
    type: 'adapted',
    originalCvId: '1',
    jobApplicationId: '1',
    filePath: '/cvs/CV_Maria_Garcia_Frontend.pdf',
    fileName: 'CV_Maria_Garcia_Frontend.pdf',
    fileSize: 267890,
    keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git'],
    coverage: 85,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    userId: '1',
    name: 'CV_Maria_Garcia_Product.pdf',
    type: 'adapted',
    originalCvId: '1',
    jobApplicationId: '2',
    filePath: '/cvs/CV_Maria_Garcia_Product.pdf',
    fileName: 'CV_Maria_Garcia_Product.pdf',
    fileSize: 289340,
    keywords: ['Product Management', 'Agile', 'Scrum', 'User Research', 'Figma'],
    coverage: 78,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

export default function CVsPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'base' | 'adapted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!user.onboardingCompleted) {
      router.push('/onboarding');
      return;
    }

    // Simulate loading
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCvs(mockCVs);
      setIsLoading(false);
    };

    loadData();
  }, [user, router]);

  const handleUploadCV = () => {
    setShowUploadModal(true);
  };

  const handleCVUploaded = (cvData: Partial<CV>) => {
    const newCV: CV = {
      id: Date.now().toString(),
      userId: user?.id || '1',
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
  };

  const handleDeleteCV = async (cvId: string) => {
    try {
      setCvs(prev => prev.filter(cv => cv.id !== cvId));
      showSuccess('CV eliminado', 'El CV ha sido eliminado exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudo eliminar el CV.');
    }
  };

  const handleExportCV = async (cvId: string) => {
    try {
      const cv = cvs.find(c => c.id === cvId);
      if (!cv) {
        showError('Error', 'CV no encontrado.');
        return;
      }

      // Crear contenido del CV para descarga
      const cvContent = `
CV - ${cv.name}
=====================================

INFORMACIÓN DEL ARCHIVO
Nombre: ${cv.fileName}
Tipo: ${cv.type === 'base' ? 'CV Base' : 'CV Adaptado'}
Tamaño: ${(cv.fileSize / 1024 / 1024).toFixed(2)} MB
Fecha de creación: ${cv.createdAt.toLocaleDateString()}
Última actualización: ${cv.updatedAt.toLocaleDateString()}

${cv.type === 'adapted' ? `
MÉTRICAS DE ADAPTACIÓN
Cobertura de keywords: ${cv.coverage}%
Keywords identificadas: ${cv.keywords?.length || 0}

PALABRAS CLAVE
${cv.keywords?.map((keyword: string) => `• ${keyword}`).join('\n') || 'No se identificaron keywords'}
` : ''}

=====================================
Generado por Jobs Tracker
${new Date().toLocaleString()}
      `;

      // Crear y descargar archivo
      const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('CV descargado', 'El CV se ha descargado exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudo descargar el CV.');
    }
  };

  const handleAdaptCV = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    if (cv && cv.type === 'base') {
      setShowUploadModal(true);
    } else {
      showError('Error', 'Solo se pueden adaptar CVs base.');
    }
  };

  const handleCVAdapted = (adaptedData: any) => {
    // Crear nuevo CV adaptado
    const newAdaptedCV: CV = {
      id: Date.now().toString(),
      userId: user?.id || '1',
      name: adaptedData.name || adaptedData.fileName || 'CV_Adaptado',
      type: 'adapted',
      filePath: adaptedData.filePath || `/cvs/${adaptedData.fileName}`,
      fileName: adaptedData.fileName,
      fileSize: adaptedData.fileSize || 250000,
      keywords: adaptedData.keywords || [],
      coverage: adaptedData.coverage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCvs(prev => [newAdaptedCV, ...prev]);
    showSuccess('CV adaptado generado', 'El CV adaptado se ha generado exitosamente.');
  };

  const filteredCVs = cvs.filter(cv => {
    const matchesFilter = filter === 'all' || cv.type === filter;
    const matchesSearch = searchTerm === '' || 
      cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="h-12 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CVs
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tus CVs base y adaptados para cada postulación
              </p>
            </div>
            <button
              onClick={handleUploadCV}
              className="btn-primary flex items-center space-x-2"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Adaptar CV</span>
            </button>
          </div>
        </div>


        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'base' | 'adapted')}
                className="input-field w-40"
              >
                <option value="all">Todos los tipos</option>
                <option value="base">CVs Base</option>
                <option value="adapted">CVs Adaptados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredCVs.length === 0 ? (
          <EmptyState
            title="Aún no has subido CVs"
            description="Sube tu primer CV base para comenzar a crear versiones adaptadas para cada postulación."
            actionLabel="Subir CV base"
            onAction={handleUploadCV}
            icon={DocumentTextIcon}
          />
        ) : (
          <CVTable
            cvs={filteredCVs}
            onDelete={handleDeleteCV}
            onExport={handleExportCV}
            onAdapt={handleAdaptCV}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <CVUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onConfirm={handleCVUploaded}
          />
        )}

      </div>
    </div>
  );
}
