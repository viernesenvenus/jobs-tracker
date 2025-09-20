'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { 
  XMarkIcon, 
  SparklesIcon, 
  CheckIcon, 
  XMarkIcon as RejectIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface CVAdaptationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  data?: { cvId: string; jobApplicationId: string };
}

interface CVSuggestion {
  id: string;
  type: 'add' | 'modify' | 'remove';
  section: string;
  originalText?: string;
  suggestedText: string;
  reason: string;
  confidence: number;
  accepted?: boolean;
}

export function CVAdaptationModal({ isOpen, onClose, onConfirm, data }: CVAdaptationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CVSuggestion[]>([]);
  const [coverage, setCoverage] = useState(75);
  const [keywords] = useState(['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git', 'Agile']);
  
  const { showSuccess, showError } = useToast();

  // Mock suggestions data
  React.useEffect(() => {
    if (isOpen) {
      setSuggestions([
        {
          id: '1',
          type: 'add',
          section: 'Experiencia',
          suggestedText: 'Desarrollé aplicaciones web responsivas usando React y TypeScript',
          reason: 'Menciona tecnologías específicas del JD',
          confidence: 95
        },
        {
          id: '2',
          type: 'modify',
          section: 'Habilidades',
          originalText: 'Conocimientos en JavaScript',
          suggestedText: 'Experiencia avanzada en JavaScript ES6+, TypeScript y frameworks modernos',
          reason: 'Más específico y alineado con el puesto',
          confidence: 88
        },
        {
          id: '3',
          type: 'add',
          section: 'Proyectos',
          suggestedText: 'Proyecto de e-commerce con React, Redux y Node.js',
          reason: 'Demuestra experiencia con el stack tecnológico requerido',
          confidence: 92
        }
      ]);
    }
  }, [isOpen]);

  const handleAcceptSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, accepted: true } : s)
    );
    setCoverage(prev => Math.min(100, prev + 5));
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, accepted: false } : s)
    );
  };

  const handleSaveAdaptedCV = async () => {
    try {
      setIsLoading(true);
      
      const acceptedSuggestions = suggestions.filter(s => s.accepted);
      const adaptedCVData = {
        cvId: data?.cvId,
        jobApplicationId: data?.jobApplicationId,
        suggestions: acceptedSuggestions,
        coverage,
        keywords
      };

      onConfirm(adaptedCVData);
      showSuccess('CV adaptado guardado', 'El CV adaptado se ha guardado exitosamente.');
    } catch (error) {
      showError('Error', 'No se pudo guardar el CV adaptado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Adaptación de CV con IA
              </h2>
              <p className="text-sm text-gray-600">
                Personaliza tu CV para destacar en esta postulación
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
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* JD Keywords Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Palabras clave del JD</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                <div className="mt-3 text-sm text-blue-700">
                  <strong>Total:</strong> {keywords.length} palabras clave identificadas
                </div>
              </div>
            </div>

            {/* CV Base Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">CV Base</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Nombre del archivo:</strong> CV_Maria_Garcia.pdf
                  </div>
                  <div className="text-sm">
                    <strong>Última actualización:</strong> 15/01/2024
                  </div>
                  <div className="text-sm">
                    <strong>Procesos asociados:</strong> 3
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="btn-ghost text-sm flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button className="btn-ghost text-sm flex items-center space-x-1">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CV Adaptado Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">CV Adaptado</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-900">Cobertura de keywords</span>
                  <span className="text-lg font-bold text-green-700">{coverage}%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${coverage}%` }}
                  />
                </div>
                <div className="text-sm text-green-700">
                  {coverage >= 80 ? 'Excelente cobertura' : coverage >= 60 ? 'Buena cobertura' : 'Cobertura mejorable'}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sugerencias de mejora</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`border rounded-lg p-4 ${
                    suggestion.accepted === true
                      ? 'border-green-200 bg-green-50'
                      : suggestion.accepted === false
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          suggestion.type === 'add' 
                            ? 'bg-green-100 text-green-800'
                            : suggestion.type === 'modify'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {suggestion.type === 'add' ? 'Añadir' : suggestion.type === 'modify' ? 'Modificar' : 'Eliminar'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {suggestion.section}
                        </span>
                        <span className="text-xs text-gray-500">
                          {suggestion.confidence}% confianza
                        </span>
                      </div>
                      
                      {suggestion.originalText && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Texto original:</p>
                          <p className="text-sm bg-gray-100 p-2 rounded text-gray-800">
                            {suggestion.originalText}
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Sugerencia:</p>
                        <p className="text-sm bg-blue-50 p-2 rounded text-blue-900">
                          {suggestion.suggestedText}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        <strong>Razón:</strong> {suggestion.reason}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {suggestion.accepted === undefined && (
                        <>
                          <button
                            onClick={() => handleAcceptSuggestion(suggestion.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Aceptar"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Rechazar"
                          >
                            <RejectIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {suggestion.accepted === true && (
                        <span className="text-green-600 text-sm font-medium">✓ Aceptada</span>
                      )}
                      {suggestion.accepted === false && (
                        <span className="text-red-600 text-sm font-medium">✗ Rechazada</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAdaptedCV}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>Guardar CV adaptado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
