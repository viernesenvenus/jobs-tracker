'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  data?: { applicationId: string };
}

interface FormData {
  nextAction: string;
  notes: string;
}

export function FollowUpModal({ isOpen, onClose, onConfirm, data }: FollowUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const followUpData = {
        ...formData,
        nextAction: new Date(formData.nextAction),
        applicationId: data?.applicationId
      };

      onConfirm(followUpData);
      showSuccess('Seguimiento guardado', 'El seguimiento se ha actualizado exitosamente.');
      reset();
    } catch (error) {
      showError('Error', 'No se pudo guardar el seguimiento.');
    } finally {
      setIsLoading(false);
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
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Seguimiento del proceso
              </h2>
              <p className="text-sm text-gray-600">
                Programa recordatorios y añade notas importantes
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próxima acción
              </label>
              <input
                type="datetime-local"
                {...register('nextAction', { required: 'La próxima acción es requerida' })}
                className={`input-field ${errors.nextAction ? 'error' : ''}`}
              />
              {errors.nextAction && (
                <p className="mt-1 text-sm text-red-600">{errors.nextAction.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Te enviaremos un recordatorio antes de esta fecha
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas ampliadas
              </label>
              <textarea
                {...register('notes')}
                rows={8}
                className="input-field"
                placeholder="Feedback recibido, aprendizajes, observaciones importantes, próximos pasos..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Estas notas te ayudarán a recordar detalles importantes del proceso
              </p>
            </div>

            {/* Timeline Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Historial de recordatorios</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">15/01/2024 - Recordatorio enviado</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">20/01/2024 - Entrevista programada</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">25/01/2024 - Próximo recordatorio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ClockIcon className="w-4 h-4" />
                  <span>Guardar seguimiento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
