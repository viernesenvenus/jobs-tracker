'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { CV } from '@/types';
import { cvService } from '@/lib/cvService';
import { 
  XMarkIcon, 
  CloudArrowUpIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cvData: Partial<CV>) => void;
}

interface FormData {
  name: string;
  file: FileList;
}

export function CVUploadModal({ isOpen, onClose, onConfirm }: CVUploadModalProps) {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'upload' | 'description' | 'adapting' | 'preview'>('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [generatedCV, setGeneratedCV] = useState<Partial<CV> | null>(null);

  const { register, handleSubmit, watch, reset: resetForm, formState: { errors } } = useForm<FormData>();
  const watchedFile = watch('file');

  if (!isOpen) return null;

  const resetModal = () => {
    resetForm();
    setCurrentStep('upload');
    setJobDescription('');
    setKeywords([]);
    setSuggestions([]);
    setCoverage(0);
    setGeneratedCV(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const goToNextStep = () => {
    if (currentStep === 'upload') {
      setCurrentStep('description');
    } else if (currentStep === 'description') {
      analyzeJobDescription();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'description') {
      setCurrentStep('upload');
    } else if (currentStep === 'preview') {
      setCurrentStep('description');
    }
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      showError('Error', 'Por favor ingresa la descripción del trabajo.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setCurrentStep('adapting');
      
      if (generatedCV) {
        setGeneratedCV(null);
        setKeywords([]);
        setSuggestions([]);
        setCoverage(0);
      }
      
      let cvFileData = null;
      if (watchedFile && watchedFile[0]) {
        const file = watchedFile[0];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        cvFileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64
        };
      }

      const cvData = {
        cvName: watch('name'),
        cvFile: cvFileData,
        jobDescription: jobDescription.trim()
      };

      const response = await fetch('/api/adapt-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la adaptación');
      }

      const result = await response.json();
      
      if (result.success) {
        const adaptedDocument = result.adaptedDocument;
        const extractedKeywords = result.keywords || [];
        const coverage = result.coverage || 0;
        
        setKeywords(extractedKeywords);
        setCoverage(coverage);
        
        showSuccess('Análisis completado', 'Se ha generado el CV adaptado exitosamente.');
        
        // Crear CV adaptado con los datos de n8n
        const adaptedCVData: Partial<CV> = {
          name: `${watch('name')}_Adaptado`,
          fileName: result.fileName || `${watch('name')}_Adaptado_${new Date().toISOString().split('T')[0]}.doc`,
          fileSize: adaptedDocument.length || 250000,
          filePath: `/cvs/${result.fileName || `${watch('name')}_Adaptado.doc`}`,
          type: 'adapted',
          keywords: extractedKeywords,
          coverage: coverage,
          adaptedContent: adaptedDocument // Contenido adaptado de n8n
        };

        setGeneratedCV(adaptedCVData);
        setCurrentStep('preview');
      } else {
        throw new Error(result.error || 'Error en el procesamiento');
      }
      
    } catch (error) {
      console.error('Error en adaptación:', error);
      showError('Error', `No se pudo generar el CV adaptado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      // Fallback a simulación si n8n falla
      await simulateAdaptation();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función de fallback para simular adaptación si n8n no está disponible
  const simulateAdaptation = async () => {
    // Simular análisis de IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extraer keywords de la descripción (simulado)
    const extractedKeywords = ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git', 'Agile'];
    setKeywords(extractedKeywords);
    
    // Generar sugerencias (simulado)
    setSuggestions([
      'Destaca tu experiencia con React y JavaScript',
      'Menciona proyectos con TypeScript',
      'Incluye ejemplos de trabajo en equipo',
      'Resalta tu experiencia con metodologías ágiles'
    ]);
    
    // Calcular cobertura (simulado)
    const coverage = Math.floor(Math.random() * 30) + 70; // 70-100%
    setCoverage(coverage);
    
    // Generar CV adaptado (simulado)
    const simulatedCV: Partial<CV> = {
      name: `${watch('name')}_Adaptado`,
      fileName: `${watch('name')}_Adaptado_${new Date().toISOString().split('T')[0]}.doc`,
      fileSize: 250000,
      filePath: `/cvs/${watch('name')}_Adaptado.doc`,
      type: 'adapted',
      keywords: extractedKeywords,
      coverage: coverage,
      adaptedContent: 'CV adaptado usando simulación (n8n no disponible)'
    };
    
    setGeneratedCV(simulatedCV);
    setCurrentStep('preview');
    showSuccess('Análisis completado', 'Se ha generado el CV adaptado usando simulación.');
  };

  const handleDownloadCV = () => {
    if (generatedCV) {
      // Si n8n devolvió contenido adaptado, usarlo directamente
      if (generatedCV.adaptedContent) {
        // Crear y descargar archivo
        const blob = new Blob([generatedCV.adaptedContent], { type: 'application/msword;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = generatedCV.fileName || 'CV_adaptado.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess('Descarga iniciada', 'El CV adaptado se está descargando.');
      } else {
        showError('Error', 'No hay contenido para descargar.');
      }
    }
  };

  const handleSaveCV = async () => {
    if (generatedCV && user) {
      try {
        const newCV: Partial<CV> = {
          ...generatedCV,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const { data, error } = await cvService.createCV(newCV);
        if (error) {
          throw new Error(error.message);
        }
        if (data) {
          // También llamar al callback para actualizar la UI local
          onConfirm(data);
          showSuccess('CV adaptado guardado', 'El CV adaptado se ha guardado exitosamente en tu lista.');
          
          // Reset modal
          resetModal();
        } else {
          showError('Error', 'No se pudo guardar el CV en la base de datos.');
        }
      } catch (error) {
        console.error('Error saving CV:', error);
        showError('Error', `No se pudo guardar el CV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    if (currentStep === 'upload') {
      if (!data.file || data.file.length === 0) {
        showError('Error', 'Por favor selecciona un archivo CV.');
        return;
      }
      goToNextStep();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Adaptar CV con IA</h2>
              <p className="text-sm text-gray-500">
                {currentStep === 'upload' && 'Sube tu CV base para comenzar'}
                {currentStep === 'description' && 'Describe el trabajo al que te postulas'}
                {currentStep === 'adapting' && 'Analizando y adaptando tu CV...'}
                {currentStep === 'preview' && 'Revisa tu CV adaptado'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: 'Subir CV', icon: CloudArrowUpIcon },
              { key: 'description', label: 'Descripción', icon: DocumentTextIcon },
              { key: 'adapting', label: 'Adaptando', icon: SparklesIcon },
              { key: 'preview', label: 'Vista Previa', icon: CheckCircleIcon }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['upload', 'description', 'adapting', 'preview'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-green-500 bg-green-500 text-white' :
                    'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Upload CV */}
            {currentStep === 'upload' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del CV
              </label>
                <input
                    {...register('name', { required: 'El nombre es requerido' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: CV Frontend Developer"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                      </div>

                      <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo CV (PDF, DOC, DOCX)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Arrastra tu CV aquí o haz clic para seleccionar
                        </span>
                        <input
                          {...register('file', { required: 'El archivo es requerido' })}
                          id="file-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, DOC, DOCX hasta 10MB
                        </p>
                      </div>
                  </div>
                  {watchedFile && watchedFile[0] && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        ✓ {watchedFile[0].name} ({(watchedFile[0].size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
              {errors.file && (
                <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
              )}
            </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!watchedFile || !watchedFile[0] || !watch('name')}
                    className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continuar</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 'description' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>
                </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del trabajo
              </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pega aquí la descripción completa del trabajo al que te postulas. Incluye responsabilidades, requisitos, tecnologías, etc."
                  />
              <p className="mt-1 text-sm text-gray-500">
                    {jobDescription.length} caracteres
              </p>
            </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">¿Qué hace la IA?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Analizará tu CV y la descripción del trabajo para identificar palabras clave, 
                        sugerir mejoras y generar una versión adaptada que destaque las habilidades más relevantes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!jobDescription.trim()}
                    className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Adaptar CV</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Adapting */}
            {currentStep === 'adapting' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <SparklesIcon className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Adaptando tu CV con IA
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Analizando la descripción del trabajo y optimizando tu CV...
                  </p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>✓ Extrayendo palabras clave</p>
                    <p>✓ Analizando requisitos</p>
                    <p>⏳ Generando CV adaptado...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 'preview' && generatedCV && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-medium text-green-900">
                        ¡CV Adaptado Exitosamente!
                      </h3>
                      <p className="text-green-700">
                        Tu CV ha sido optimizado para esta posición específica.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cobertura</p>
                        <p className="text-2xl font-bold text-blue-600">{coverage}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DocumentTextIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Keywords</p>
                        <p className="text-2xl font-bold text-green-600">{keywords.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CloudArrowUpIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tamaño</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {((generatedCV.fileSize || 0) / 1024).toFixed(0)}KB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Palabras clave identificadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sugerencias de mejora:</h4>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
              </ul>
                  </div>
                )}

                {/* Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Vista previa del CV adaptado:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {generatedCV.adaptedContent?.substring(0, 500)}...
                    </div>
            </div>
          </div>

          {/* Actions */}
                <div className="flex justify-end space-x-3">
            <button
              type="button"
                    onClick={handleDownloadCV}
                    className="btn-secondary flex items-center space-x-2 px-6 py-3 text-base font-medium"
            >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Descargar CV</span>
            </button>
            <button
                    type="button"
                    onClick={handleSaveCV}
                    className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Guardar CV</span>
            </button>
          </div>
              </div>
            )}
        </form>
        </div>
      </div>
    </div>
  );
}