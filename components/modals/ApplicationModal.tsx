'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { JobApplication, ApplicationSource, ApplicationStatus } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { 
  XMarkIcon, 
  DocumentTextIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

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
  const [currentSection, setCurrentSection] = useState(0);
  const [showCVAdaptation, setShowCVAdaptation] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [coverage, setCoverage] = useState(0);

  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>();

  const watchedJobDescription = watch('jobDescription');
  const watchedCvFile = watch('cvFile');

  useEffect(() => {
    if (watchedJobDescription && cvFile) {
      setShowCVAdaptation(true);
      analyzeKeywords();
    }
  }, [watchedJobDescription, cvFile]);

  const analyzeKeywords = () => {
    // Mock keyword analysis
    const mockKeywords = ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js'];
    setKeywords(mockKeywords);
    setCoverage(75);
  };

  const sections = [
    { id: 'basic', title: 'Datos básicos', description: 'Información principal del proceso' },
    { id: 'process', title: 'Proceso & contacto', description: 'Detalles del proceso y contacto' },
    { id: 'description', title: 'Descripción del puesto', description: 'Job description y análisis' },
    { id: 'followup', title: 'Seguimiento', description: 'Próximas acciones y notas' },
    { id: 'cv', title: 'CV', description: 'Gestión de CV y adaptación' }
  ];

  const onSubmit = async (formData: FormData) => {
    try {
      const applicationData = {
        ...formData,
        applicationDate: new Date(formData.applicationDate),
        firstInterviewDate: formData.firstInterviewDate ? new Date(formData.firstInterviewDate) : undefined,
        nextAction: formData.nextAction ? new Date(formData.nextAction) : undefined,
        cvFile: cvFile,
        keywords,
        coverage
      };

      onConfirm(applicationData);
      showSuccess('Postulación guardada', 'La postulación se ha guardado exitosamente.');
      reset();
      setCurrentSection(0);
      setShowCVAdaptation(false);
      setCvFile(null);
    } catch (error) {
      showError('Error', 'No se pudo guardar la postulación.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
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

        {/* Progress */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === index
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="hidden sm:block">{section.title}</span>
                </button>
                {index < sections.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sections[currentSection].title}
            </h3>
            <p className="text-sm text-gray-600">
              {sections[currentSection].description}
            </p>
          </div>

          {/* Section 1: Basic Data */}
          {currentSection === 0 && (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puesto *
                </label>
                <input
                  {...register('position', { required: 'El puesto es requerido' })}
                  className={`input-field ${errors.position ? 'error' : ''}`}
                  placeholder="Título exacto del puesto"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente
                  </label>
                  <select
                    {...register('source')}
                    className="input-field"
                  >
                    {sourceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de postulación *
                  </label>
                  <input
                    type="date"
                    {...register('applicationDate', { required: 'La fecha es requerida' })}
                    className={`input-field ${errors.applicationDate ? 'error' : ''}`}
                  />
                  {errors.applicationDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.applicationDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  {...register('status')}
                  className="input-field"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 2: Process & Contact */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de primera convocatoria
                  </label>
                  <input
                    type="date"
                    {...register('firstInterviewDate')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de respuesta
                  </label>
                  <input
                    {...register('responseTime')}
                    className="input-field"
                    placeholder="Ej: 3 días, 1 semana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de contacto
                  </label>
                  <input
                    {...register('contactPerson')}
                    className="input-field"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    {...register('contactEmail')}
                    className="input-field"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de contacto
                  </label>
                  <input
                    {...register('contactPhone')}
                    className="input-field"
                    placeholder="+34 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de la oferta
                  </label>
                  <input
                    type="url"
                    {...register('jobLink')}
                    className="input-field"
                    placeholder="https://empresa.com/oferta"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Job Description */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del puesto (JD)
                </label>
                <textarea
                  {...register('jobDescription')}
                  rows={8}
                  className="input-field"
                  placeholder="Pega aquí el texto completo de la oferta..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  La descripción del puesto es opcional para guardar el proceso, pero obligatoria si quieres adaptar tu CV.
                </p>
              </div>

              {watchedJobDescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Análisis de palabras clave
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={analyzeKeywords}
                    className="btn-secondary text-sm"
                  >
                    Analizar palabras clave
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Follow-up */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima acción
                </label>
                <input
                  type="datetime-local"
                  {...register('nextAction')}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas personales
                </label>
                <textarea
                  {...register('notes')}
                  rows={6}
                  className="input-field"
                  placeholder="Feedback recibido, aprendizajes, observaciones..."
                />
              </div>
            </div>
          )}

          {/* Section 5: CV */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir CV
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    {...register('cvFile')}
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {cvFile ? cvFile.name : 'Haz clic para subir CV'}
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, DOC o DOCX (máx. 10MB)
                    </span>
                  </label>
                </div>
              </div>

              {/* CV Adaptation Block */}
              {showCVAdaptation && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                    <h4 className="text-lg font-semibold text-purple-900">
                      Adaptación de CV con IA
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* JD Keywords */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Palabras clave del JD</h5>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CV Preview */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">CV Base</h5>
                      <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-600">
                        {cvFile ? `CV: ${cvFile.name}` : 'No hay CV seleccionado'}
                      </div>
                    </div>

                    {/* Adapted CV */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">CV Adaptado</h5>
                      <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span>Cobertura: {coverage}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                        </div>
                        <button className="btn-primary text-xs w-full">
                          Ver sugerencias
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="btn-primary flex items-center space-x-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Aceptar sugerencias</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              {currentSection === sections.length - 1 ? (
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Guardar postulación
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                  className="btn-primary"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
