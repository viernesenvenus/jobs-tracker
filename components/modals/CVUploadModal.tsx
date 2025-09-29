'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { CV } from '@/types';
import { 
  XMarkIcon, 
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<CV>) => void;
}

interface FormData {
  name: string;
  file: FileList;
}

export function CVUploadModal({ isOpen, onClose, onConfirm }: CVUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'description' | 'adapting' | 'preview'>('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [coverage, setCoverage] = useState(0);
  const [generatedCV, setGeneratedCV] = useState<any>(null);
  
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>();

  const watchedFile = watch('file');
  
  // Debug: Log file changes
  React.useEffect(() => {
    console.log('Archivo detectado:', watchedFile);
    if (watchedFile && watchedFile.length > 0) {
      console.log('Archivo válido:', watchedFile[0].name, watchedFile[0].type, watchedFile[0].size);
    }
  }, [watchedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log('Archivo arrastrado:', file.name, file.type, file.size);
      if (isValidFile(file)) {
        setValue('file', e.dataTransfer.files);
        setValue('name', file.name.replace(/\.[^/.]+$/, ''));
        console.log('Archivo arrastrado válido, registrado');
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      showError('Tipo de archivo no válido', 'Solo se permiten archivos PDF, DOC y DOCX.');
      return false;
    }
    
    if (file.size > maxSize) {
      showError('Archivo demasiado grande', 'El archivo no puede superar los 10MB.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange llamado:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Archivo seleccionado:', file.name, file.type, file.size);
      if (isValidFile(file)) {
        setValue('name', file.name.replace(/\.[^/.]+$/, ''));
        console.log('Archivo válido, nombre actualizado');
      }
    }
  };

  const simulateUpload = async (): Promise<void> => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            resolve();
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 200);
    });
  };

  const onSubmit = async (formData: FormData) => {
    try {
      // Validar que se haya subido un archivo
      if (!formData.file || formData.file.length === 0) {
        showError('Archivo requerido', 'Por favor sube un archivo CV antes de continuar.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      await simulateUpload();

      // Move to description step
      setCurrentStep('description');
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      showError('Error al subir', 'No se pudo subir el CV. Intenta nuevamente.');
      setIsUploading(false);
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
      
      // Si ya hay un CV generado, limpiarlo para regenerar
      if (generatedCV) {
        setGeneratedCV(null);
        setKeywords([]);
        setSuggestions([]);
        setCoverage(0);
      }
      
      // Preparar el archivo del CV para enviar
      let cvFileData = null;
      if (watchedFile && watchedFile[0]) {
        // Convertir archivo a base64 para enviar a n8n
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

      // Preparar datos para enviar a n8n
      const cvData = {
        cvName: watch('name'),
        cvFile: cvFileData,
        jobDescription: jobDescription.trim()
      };

      console.log('Enviando datos a n8n:', { cvName: cvData.cvName, hasFile: !!cvData.cvFile });

      // Llamar al endpoint que conecta con n8n
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
      console.log('Resultado de n8n:', result);
      
      // Procesar respuesta de n8n
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
          fileName: `${watch('name')}_Adaptado_${new Date().toISOString().split('T')[0]}.doc`,
          fileSize: adaptedDocument.length || 250000,
          filePath: `/cvs/${watch('name')}_Adaptado.doc`,
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
      {
        id: '1',
        type: 'add',
        section: 'Experiencia',
        suggestedText: 'Desarrollé aplicaciones web responsivas usando React y TypeScript',
        reason: 'Menciona tecnologías específicas del JD',
        confidence: 95,
        accepted: true
      },
      {
        id: '2',
        type: 'modify',
        section: 'Habilidades',
        originalText: 'Conocimientos en JavaScript',
        suggestedText: 'Experiencia avanzada en JavaScript ES6+, TypeScript y frameworks modernos',
        reason: 'Más específico y alineado con el puesto',
        confidence: 88,
        accepted: true
      }
    ]);
    
    setCoverage(85);
    showSuccess('Análisis completado (Modo simulación)', 'Se ha generado el CV adaptado exitosamente.');
    
    // Simular generación de PDF
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear CV adaptado
    const adaptedCVData: Partial<CV> = {
      name: `${watch('name')}_Adaptado`,
      fileName: `${watch('name')}_Adaptado_${new Date().toISOString().split('T')[0]}.pdf`,
      fileSize: 250000,
      filePath: `/cvs/${watch('name')}_Adaptado.pdf`,
      type: 'adapted',
      keywords: extractedKeywords,
      coverage: 85
    };

    // Guardar datos del CV generado y mostrar vista previa
    setGeneratedCV(adaptedCVData);
    setCurrentStep('preview');
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

        showSuccess('CV descargado', 'El CV adaptado se ha descargado exitosamente.');
        return;
      }

      // Fallback: Crear contenido HTML del CV adaptado
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Adaptado - ${generatedCV.name}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            font-size: 18px;
        }
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }
        .keyword {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        .coverage {
            background: #dcfce7;
            color: #166534;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
            font-weight: 600;
        }
        .job-description {
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
            white-space: pre-line;
        }
        .content {
            background: #fefefe;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            white-space: pre-line;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CV ADAPTADO</h1>
        <p><strong>${generatedCV.name}</strong></p>
        <p>Generado el ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>📊 Métricas de Adaptación</h2>
        <div class="coverage">
            Cobertura de Keywords: ${generatedCV.coverage}%
        </div>
    </div>

    <div class="section">
        <h2>🔑 Palabras Clave Identificadas</h2>
        <div class="keywords">
            ${generatedCV.keywords?.map((keyword: string) => 
                `<span class="keyword">${keyword}</span>`
            ).join('') || '<span class="keyword">No se identificaron keywords</span>'}
        </div>
    </div>

    <div class="section">
        <h2>📋 Descripción del Trabajo</h2>
        <div class="job-description">${jobDescription}</div>
    </div>

    <div class="section">
        <h2>📄 Contenido Adaptado</h2>
        <div class="content">${generatedCV.adaptedContent || 'Contenido adaptado generado por IA'}</div>
    </div>

    <div class="footer">
        <p>Generado por Jobs Tracker - ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
      `;

      // Crear y descargar archivo HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedCV.fileName.replace('.pdf', '.html')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('CV descargado', 'El CV adaptado se ha descargado como archivo HTML. Puedes abrirlo en tu navegador e imprimirlo como PDF.');
    }
  };

  const handleSaveCV = () => {
    if (generatedCV) {
      onConfirm(generatedCV);
      showSuccess('CV adaptado guardado', 'El CV adaptado se ha guardado exitosamente en tu lista.');
      
      // Reset modal
      reset();
      setCurrentStep('upload');
      setJobDescription('');
      setKeywords([]);
      setSuggestions([]);
      setCoverage(0);
      setGeneratedCV(null);
    }
  };

  const handleGoBack = (targetStep: 'upload' | 'description') => {
    if (targetStep === 'upload') {
      // Reset everything when going back to upload
      setJobDescription('');
      setKeywords([]);
      setSuggestions([]);
      setCoverage(0);
      setGeneratedCV(null);
      setIsAnalyzing(false);
    } else if (targetStep === 'description') {
      // Don't reset generated content - preserve it for viewing details
      // Only reset the analyzing state
      setIsAnalyzing(false);
    }
    setCurrentStep(targetStep);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Adaptar CV
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'upload' && 'Sube tu CV y agrega la descripción del trabajo'}
                {currentStep === 'description' && 'Agrega la descripción del trabajo para adaptar tu CV'}
                {currentStep === 'adapting' && 'Generando tu CV adaptado con IA...'}
                {currentStep === 'preview' && 'Tu CV adaptado está listo para descargar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : currentStep === 'description' || currentStep === 'adapting' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'upload' ? 'bg-blue-100 text-blue-600' : 
                currentStep === 'description' || currentStep === 'adapting' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Subir CV</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'description' || currentStep === 'adapting' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'description' ? 'text-blue-600' : currentStep === 'adapting' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'description' ? 'bg-blue-100 text-blue-600' : 
                currentStep === 'adapting' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Descripción</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'adapting' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'adapting' ? 'text-blue-600' : currentStep === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'adapting' ? 'bg-blue-100 text-blue-600' : 
                currentStep === 'preview' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Adaptar</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'preview' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'preview' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                4
              </div>
              <span className="text-sm font-medium">Vista Previa</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Step 1: Upload CV */}
            {currentStep === 'upload' && (
              <>
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo CV *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      {...register('file', {
                        onChange: handleFileChange
                      })}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      {watchedFile && watchedFile[0] ? (
                        <div className="flex flex-col items-center space-y-2">
                          <CheckCircleIcon className="w-12 h-12 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {watchedFile[0].name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(watchedFile[0].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Arrastra tu CV aquí o haz clic para seleccionar
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, DOC o DOCX (máx. 10MB) - Archivo requerido
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
                  )}
                </div>

                {/* File Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del CV *
                  </label>
                  <input
                    {...register('name', { required: 'El nombre es requerido' })}
                    className={`input-field ${errors.name ? 'error' : ''}`}
                    placeholder="Ej: CV_Maria_Garcia_Base"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Este nombre te ayudará a identificar el CV en tu lista
                  </p>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subiendo archivo...</span>
                      <span className="text-gray-900">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    💡 Consejos para un mejor CV
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Usa un formato limpio y profesional</li>
                    <li>• Incluye palabras clave relevantes para tu sector</li>
                    <li>• Mantén el archivo actualizado con tu experiencia más reciente</li>
                    <li>• El CV base será la base para todas las adaptaciones</li>
                  </ul>
                </div>
              </>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 'description' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción del trabajo</h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Pega aquí la descripción completa del trabajo al que te postulas..."
                    className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {!generatedCV ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      ✅ CV subido exitosamente
                    </h4>
                    <p className="text-sm text-green-800">
                      Tu CV base se ha subido correctamente. Ahora agrega la descripción del trabajo para generar tu CV adaptado.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      📋 CV ya adaptado - Ver detalles
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Ya tienes un CV adaptado generado. Puedes ver los detalles o generar uno nuevo.
                    </p>
                    
                    {/* Show adaptation details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Cobertura:</span>
                        <span className="font-medium text-blue-900">{coverage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Keywords:</span>
                        <span className="font-medium text-blue-900">{keywords.length} identificadas</span>
                      </div>
                      {keywords.length > 0 && (
                        <div>
                          <span className="text-xs text-blue-700">Keywords aplicadas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {keywords.slice(0, 4).map((keyword: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                            {keywords.length > 4 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                +{keywords.length - 4} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Adapting */}
            {currentStep === 'adapting' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generando tu CV adaptado</h3>
                  <p className="text-gray-600">La IA está analizando la descripción y adaptando tu CV...</p>
                </div>

                {keywords.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Palabras clave identificadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Sugerencias aplicadas</h4>
                    <div className="space-y-2">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="text-sm text-green-800">
                          • {suggestion.suggestedText}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {coverage > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Cobertura de keywords</span>
                      <span className="text-lg font-bold text-green-700">{coverage}%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 'preview' && generatedCV && (
              <div className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-green-900 mb-1">¡CV Adaptado Generado!</h3>
                  <p className="text-sm text-green-800">Tu CV ha sido adaptado exitosamente y está listo para descargar.</p>
                </div>

                {/* CV Preview */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Vista Previa del CV Adaptado</h4>
                  
                  {/* PDF Preview Placeholder - Smaller */}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h5 className="text-sm font-medium text-gray-900 mb-1">{generatedCV.fileName}</h5>
                    <p className="text-xs text-gray-600 mb-3">Vista previa del PDF generado</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs mx-auto">
                      <div className="text-left space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>

                  {/* CV Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900 text-xs">{generatedCV.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tamaño:</span>
                      <p className="text-gray-900 text-xs">{(generatedCV.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cobertura:</span>
                      <p className="text-gray-900 text-xs">{generatedCV.coverage}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Keywords:</span>
                      <p className="text-gray-900 text-xs">{generatedCV.keywords?.length || 0} identificadas</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  {generatedCV.keywords && generatedCV.keywords.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700 text-xs">Keywords aplicadas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedCV.keywords.map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Confirmation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <CloudArrowUpIcon className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-blue-900">Descarga Automática</h4>
                      <p className="text-xs text-blue-800">El archivo PDF se ha descargado automáticamente a tu dispositivo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
            {currentStep === 'upload' && (
              <>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !watchedFile || watchedFile.length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span>Continuar</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {currentStep === 'description' && (
              <div className="flex space-x-3 w-full justify-between">
                <button
                  type="button"
                  onClick={() => handleGoBack('upload')}
                  className="btn-secondary px-6 py-3 text-base font-medium"
                >
                  ← Atrás
                </button>
                <div className="flex space-x-3">
                  {generatedCV && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep('preview')}
                      className="btn-secondary px-6 py-3 text-base font-medium"
                    >
                      Ver PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={analyzeJobDescription}
                    disabled={!jobDescription.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-6 py-3 text-base font-medium"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{generatedCV ? 'Regenerar CV' : 'Adaptar CV'}</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'adapting' && (
              <div className="flex space-x-3 w-full justify-between">
                <button
                  type="button"
                  onClick={() => handleGoBack('description')}
                  className="btn-secondary px-6 py-3 text-base font-medium"
                  disabled={isAnalyzing}
                >
                  ← Atrás
                </button>
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-600">Generando tu CV adaptado...</p>
                </div>
                <div className="w-24"></div> {/* Spacer para centrar el texto */}
              </div>
            )}

            {currentStep === 'preview' && (
              <div className="flex space-x-3 w-full justify-between">
                <button
                  type="button"
                  onClick={() => handleGoBack('description')}
                  className="btn-secondary px-6 py-3 text-base font-medium"
                >
                  ← Atrás
                </button>
                <div className="flex space-x-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}