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
  CloudArrowUpIcon
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
      type: 'base',
      filePath: cvData.filePath || '',
      fileName: cvData.fileName || '',
      fileSize: cvData.fileSize || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCvs(prev => [newCV, ...prev]);
    showSuccess('CV subido', 'El CV se ha subido exitosamente.');
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
      // Simulate export
      showSuccess('CV exportado', 'El CV se ha descargado exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudo exportar el CV.');
    }
  };

  const handleAdaptCV = (cvId: string) => {
    // This would open the CV adaptation modal
    showSuccess('Adaptar CV', 'Redirigiendo a la adaptación de CV...');
  };

  const filteredCVs = cvs.filter(cv => {
    const matchesFilter = filter === 'all' || cv.type === filter;
    const matchesSearch = searchTerm === '' || 
      cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: cvs.length,
    base: cvs.filter(cv => cv.type === 'base').length,
    adapted: cvs.filter(cv => cv.type === 'adapted').length,
    averageCoverage: cvs.filter(cv => cv.type === 'adapted').reduce((sum, cv) => sum + (cv.coverage || 0), 0) / Math.max(cvs.filter(cv => cv.type === 'adapted').length, 1)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
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
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Subir CV base</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total CVs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CVs Base</p>
                <p className="text-2xl font-bold text-gray-900">{stats.base}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CVs Adaptados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.adapted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cobertura Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageCoverage)}%</p>
              </div>
            </div>
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
