'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ApplicationSource, ApplicationStatus } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  data?: { applicationId?: string };
}

interface FormData {
  role: string;
  company: string;
  position: string;
  source: ApplicationSource;
  applicationDate: string;
  firstInterviewDate?: string;
  responseTime?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  jobLink?: string;
  jobDescription?: string;
  status: ApplicationStatus;
  nextAction?: string;
  notes?: string;
  cvFile?: FileList;
}

const sourceOptions = [
  { value: 'portal', label: 'Portal de empleo' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referido' },
  { value: 'company_website', label: 'Sitio web de la empresa' },
  { value: 'recruiter', label: 'Reclutador' },
  { value: 'other', label: 'Otro' }
];

const statusOptions = [
  { value: 'applied', label: 'Postulado' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'offer', label: 'Oferta' }
];

export function ApplicationModal({ isOpen, onClose, onConfirm, data }: ApplicationModalProps) {
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();

  // Load existing data when editing
  useEffect(() => {
    if (isOpen && data?.applicationId && data?.applicationData) {
      // Load existing application data
      const app = data.applicationData;
      setValue('role', app.role || '');
      setValue('company', app.company || '');
      setValue('applicationDate', app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : '');
      setValue('status', app.status || 'applied');
      setValue('firstInterviewDate', app.firstInterviewDate ? new Date(app.firstInterviewDate).toISOString().split('T')[0] : '');
      setValue('responseTime', app.responseTime || '');
      setValue('contactPerson', app.contactPerson || '');
      setValue('jobLink', app.jobLink || '');
    } else if (isOpen && !data?.applicationId) {
      // New application - set default values
      reset();
      setValue('applicationDate', new Date().toISOString().split('T')[0]);
      setValue('status', 'applied');
    }
  }, [isOpen, data?.applicationId, data?.applicationData, reset, setValue]);

  const onSubmit = async (formData: FormData) => {
    try {
      const applicationData = {
        ...formData,
        applicationDate: new Date(formData.applicationDate),
        position: formData.role, // Map role to position for the database
        source: 'other' as const, // Default source
        firstInterviewDate: formData.firstInterviewDate ? new Date(formData.firstInterviewDate) : undefined,
        responseTime: formData.responseTime || undefined,
        contactPerson: formData.contactPerson || undefined,
        jobLink: formData.jobLink || undefined,
        isEdit: !!data?.applicationId, // Flag to indicate if this is an edit
        applicationId: data?.applicationId // Pass the ID for updates
      };

      onConfirm(applicationData);
      showSuccess(
        data?.applicationId ? 'Postulación actualizada' : 'Postulación guardada', 
        data?.applicationId ? 'La postulación se ha actualizado exitosamente.' : 'La postulación se ha guardado exitosamente.'
      );
      reset();
    } catch (error) {
      showError('Error', 'No se pudo guardar la postulación.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {data?.applicationId ? 'Editar postulación' : 'Nueva postulación'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Completa la información del proceso de selección
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>


        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Datos básicos
            </h3>
            <p className="text-sm text-gray-600">
              Información principal del proceso
            </p>
          </div>

          {/* Section 1: Basic Data - Simplified */}
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <input
                    {...register('role', { required: 'El rol es requerido' })}
                    className={`input-field ${errors.role ? 'error' : ''}`}
                    placeholder="Ej: Desarrolladora Frontend"
                  />
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <input
                    {...register('company', { required: 'La empresa es requerida' })}
                    className={`input-field ${errors.company ? 'error' : ''}`}
                    placeholder="Nombre de la empresa"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de postulación *
                  </label>
                  <input
                    type="date"
                    {...register('applicationDate', { required: 'La fecha es requerida' })}
                    className={`input-field ${errors.applicationDate ? 'error' : ''}`}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                  {errors.applicationDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.applicationDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    {...register('status')}
                    className="input-field"
                    defaultValue="applied"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de la oferta (opcional)
                </label>
                <input
                  type="url"
                  {...register('jobLink')}
                  className="input-field"
                  placeholder="https://empresa.com/oferta"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primera convocatoria (opcional)
                  </label>
                  <input
                    type="date"
                    {...register('firstInterviewDate')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de respuesta (opcional)
                  </label>
                  <input
                    {...register('responseTime')}
                    className="input-field"
                    placeholder="Ej: 3 días, 1 semana"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona de contacto (opcional)
                </label>
                <input
                  {...register('contactPerson')}
                  className="input-field"
                  placeholder="Nombre completo del contacto"
                />
              </div>
            </div>


          {/* Navigation - Simplified */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Guardar postulación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
