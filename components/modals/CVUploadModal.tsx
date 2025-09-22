'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { CV } from '@/types';
import { 
  XMarkIcon, 
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon
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
  
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>();

  const watchedFile = watch('file');

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
      if (isValidFile(file)) {
        setValue('file', e.dataTransfer.files);
        setValue('name', file.name.replace(/\.[^/.]+$/, ''));
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
    console.log('📂 Cambio de archivo detectado:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('📄 Archivo seleccionado:', file.name, file.size, file.type);
      if (isValidFile(file)) {
        setValue('name', file.name.replace(/\.[^/.]+$/, ''));
        console.log('✅ Archivo válido, nombre establecido');
      } else {
        console.log('❌ Archivo inválido');
      }
    }
  };

  const simulateUpload = async (file: File): Promise<void> => {
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
      console.log('🚀 Iniciando subida de CV:', formData);
      setIsUploading(true);
      setUploadProgress(0);

      const file = formData.file[0];
      console.log('📁 Archivo seleccionado:', file);
      
      // Simulate upload progress
      await simulateUpload(file);

      const cvData: Partial<CV> = {
        name: formData.name,
        fileName: file.name,
        fileSize: file.size,
        filePath: `/cvs/${file.name}`,
        type: 'base'
      };

      console.log('✅ Datos del CV preparados:', cvData);
      onConfirm(cvData);
      showSuccess('CV subido exitosamente', 'El CV se ha subido y está listo para usar.');
      reset();
      setUploadProgress(0);
    } catch (error) {
      console.error('❌ Error al subir CV:', error);
      showError('Error al subir', 'No se pudo subir el CV. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Subir CV base
              </h2>
              <p className="text-sm text-gray-600">
                Sube tu CV principal para crear versiones adaptadas
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

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
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
                  {...register('file', { required: 'El archivo es requerido' })}
                  onChange={handleFileChange}
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
                          PDF, DOC o DOCX (máx. 10MB)
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
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
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
              disabled={isUploading || !watchedFile || !watchedFile[0]}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span>Subir CV</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
