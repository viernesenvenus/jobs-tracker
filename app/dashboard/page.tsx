'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext';
import { useToast } from '@/contexts/ToastContext';
import { JobApplication, ApplicationStatus, TableColumn } from '@/types';
import { DashboardTable } from '@/components/DashboardTable';
import { DashboardStats } from '@/components/DashboardStats';
import { EmptyState } from '@/components/EmptyState';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Mock data for development
const mockApplications: JobApplication[] = [
  {
    id: '1',
    userId: '1',
    role: 'Frontend Developer',
    company: 'TechCorp',
    position: 'Senior Frontend Developer',
    source: 'linkedin',
    applicationDate: new Date('2024-01-15'),
    firstInterviewDate: new Date('2024-01-20'),
    responseTime: '5 días',
    contactPerson: 'María García',
    contactEmail: 'maria@techcorp.com',
    jobLink: 'https://techcorp.com/jobs/frontend-dev',
    status: 'interview',
    nextAction: new Date('2024-01-25'),
    notes: 'Primera entrevista técnica programada',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    userId: '1',
    role: 'Product Manager',
    company: 'StartupXYZ',
    position: 'Product Manager',
    source: 'portal',
    applicationDate: new Date('2024-01-10'),
    responseTime: '3 días',
    contactPerson: 'Carlos López',
    jobLink: 'https://startupxyz.com/careers',
    status: 'applied',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    userId: '1',
    role: 'UX Designer',
    company: 'DesignStudio',
    position: 'Senior UX Designer',
    source: 'referral',
    applicationDate: new Date('2024-01-05'),
    firstInterviewDate: new Date('2024-01-12'),
    responseTime: '7 días',
    contactPerson: 'Ana Martínez',
    status: 'feedback',
    notes: 'Esperando feedback de la segunda entrevista',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18')
  }
];

const tableColumns: TableColumn[] = [
  { key: 'role', label: 'Rol', editable: true, type: 'text', required: true, width: '200px' },
  { key: 'company', label: 'Empresa', editable: true, type: 'text', required: true, width: '150px' },
  { key: 'applicationDate', label: 'Fecha de postulación', editable: true, type: 'date', width: '150px' },
  { key: 'firstInterviewDate', label: 'Primera convocatoria', editable: true, type: 'date', width: '150px' },
  { key: 'responseTime', label: 'Tiempo de respuesta', editable: true, type: 'text', width: '130px' },
  { key: 'contactPerson', label: 'Persona de contacto', editable: true, type: 'text', width: '150px' },
  { key: 'jobLink', label: 'Link', editable: true, type: 'url', width: '120px' },
  { 
    key: 'status', 
    label: 'Status', 
    editable: true, 
    type: 'select', 
    options: ['applied', 'interview', 'feedback', 'closed', 'rejected', 'offer'],
    width: '120px' 
  },
  { key: 'actions', label: 'Seguimiento', editable: false, type: 'text', width: '100px' }
];

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { openApplicationModal, openFollowUpModal } = useModal();
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
      setApplications(mockApplications);
      setIsLoading(false);
    };

    loadData();
  }, [user, router]);

  const handleAddApplication = () => {
    openApplicationModal();
  };

  const handleEditApplication = (applicationId: string) => {
    openApplicationModal(applicationId);
  };

  const handleFollowUp = (applicationId: string) => {
    openFollowUpModal(applicationId);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      showSuccess('Postulación eliminada', 'La postulación ha sido eliminada exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudo eliminar la postulación.');
    }
  };

  const handleUpdateApplication = async (applicationId: string, updates: Partial<JobApplication>) => {
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, ...updates, updatedAt: new Date() }
            : app
        )
      );
      showSuccess('Actualizado', 'Los cambios se han guardado exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = searchTerm === '' || 
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
                {[1, 2, 3, 4, 5].map((i) => (
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
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona todas tus postulaciones en un solo lugar
              </p>
            </div>
            <button
              onClick={handleAddApplication}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Añadir postulación</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats applications={applications} />

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por rol, empresa o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ApplicationStatus | 'all')}
                className="input-field w-40"
              >
                <option value="all">Todos los estados</option>
                <option value="applied">Postulado</option>
                <option value="interview">Entrevista</option>
                <option value="feedback">Feedback</option>
                <option value="closed">Cerrado</option>
                <option value="rejected">Rechazado</option>
                <option value="offer">Oferta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredApplications.length === 0 ? (
          <EmptyState
            title="Aún no has registrado procesos"
            description="Haz clic en 'Añadir postulación' para comenzar a organizar tu búsqueda laboral."
            actionLabel="Añadir postulación"
            onAction={handleAddApplication}
          />
        ) : (
          <DashboardTable
            applications={filteredApplications}
            columns={tableColumns}
            onEdit={handleEditApplication}
            onFollowUp={handleFollowUp}
            onDelete={handleDeleteApplication}
            onUpdate={handleUpdateApplication}
          />
        )}
      </div>
    </div>
  );
}
