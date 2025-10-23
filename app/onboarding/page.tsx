'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useModal } from '@/contexts/ModalContext';
import { OnboardingData } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const priorityFeatures = [
  { id: 'organization', label: 'Organización', description: 'Mantener todo organizado' },
  { id: 'cv_adaptation', label: 'Adaptar CV', description: 'Personalizar para cada puesto' },
  { id: 'deadlines', label: 'Recordar deadlines', description: 'No perder fechas importantes' },
  { id: 'feedback', label: 'Guardar feedback', description: 'Aprender de cada proceso' }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    desiredRole: '',
    activeProcesses: 'none',
    priorityFeatures: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const { user, completeOnboarding } = useAuth();
  const { showError, showSuccess } = useToast();
  const { openApplicationModal } = useModal();
  const router = useRouter();

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const success = await completeOnboarding(data);
      
      if (success) {
        showSuccess(
          '¡Onboarding completado!',
          'Tu espacio está preparado. Comienza registrando tus primeras postulaciones.'
        );
        router.push('/dashboard');
      } else {
        showError('Error', 'No se pudo completar el onboarding. Intenta nuevamente.');
      }
    } catch (error) {
      showError('Error inesperado', 'Algo salió mal. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApplication = () => {
    openApplicationModal();
  };

  const handleFeatureToggle = (featureId: string) => {
    setData(prev => ({
      ...prev,
      priorityFeatures: prev.priorityFeatures.includes(featureId)
        ? prev.priorityFeatures.filter(id => id !== featureId)
        : [...prev.priorityFeatures, featureId]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.desiredRole.trim().length > 0;
      case 1:
        return true; // activeProcesses always has a value (defaults to 'none')
      case 2:
        return data.priorityFeatures.length > 0; // Must select at least one feature
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Comencemos a potenciar tu búsqueda
              </h2>
              <p className="text-gray-600">
                Esto nos ayuda a personalizar tu tablero inicial.
              </p>
            </div>
            
            <div>
              <label htmlFor="desiredRole" className="block text-sm font-medium text-gray-700 mb-2">
                ¿A qué rol aspiras?
              </label>
              <input
                id="desiredRole"
                type="text"
                value={data.desiredRole}
                onChange={(e) => setData(prev => ({ ...prev, desiredRole: e.target.value }))}
                className="input-field"
                placeholder="Ej: Desarrolladora Frontend, Product Manager, UX Designer..."
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                ¿Cuántos procesos activos manejas?
              </h2>
              <p className="text-gray-600">
                Tranquila, puedes agregar o quitar procesos más adelante.
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'none', label: 'Ninguno', description: 'Estoy comenzando mi búsqueda' },
                { value: '1-2', label: '1-2 procesos', description: 'Algunos procesos en curso' },
                { value: '3+', label: '3 o más', description: 'Múltiples procesos activos' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    data.activeProcesses === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activeProcesses"
                    value={option.value}
                    checked={data.activeProcesses === option.value}
                    onChange={(e) => setData(prev => ({ ...prev, activeProcesses: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                ¿Qué necesitas priorizar ahora?
              </h2>
              <p className="text-gray-600">
                Selecciona al menos una opción para continuar. Puedes cambiar estas preferencias cuando quieras.
              </p>
            </div>
            
            {data.priorityFeatures.length === 0 && (
              <div className="text-center py-2">
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ Debes seleccionar al menos una opción para continuar
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priorityFeatures.map((feature) => (
                <label
                  key={feature.id}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    data.priorityFeatures.includes(feature.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.priorityFeatures.includes(feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{feature.label}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep + 1} de 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="btn-ghost flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentStep === 2 ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleAddApplication}
                  className="btn-secondary"
                >
                  + Añadir postulación
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!canProceed() || isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ir al Dashboard</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Siguiente</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {currentStep === 2 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¡Listo, {user.name}! Tu espacio está preparado. Comienza registrando tus 
              primeras postulaciones o carga un CV adaptado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
