'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { EyeIcon, EyeSlashIcon, SparklesIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, login, register } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin && !name) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, name);
      }

      if (success) {
        showSuccess(
          isLogin ? '¡Bienvenida de vuelta!' : '¡Cuenta creada exitosamente!',
          isLogin 
            ? 'Redirigiendo a tu dashboard...' 
            : 'Completa el onboarding para comenzar.'
        );
      } else {
        showError(
          'Error de autenticación',
          isLogin 
            ? 'Verifica tus credenciales e intenta nuevamente.'
            : 'No se pudo crear la cuenta. Intenta nuevamente.'
        );
      }
    } catch (error) {
      showError('Error inesperado', 'Algo salió mal. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthClick = (action: 'login' | 'register') => {
    setIsLogin(action === 'login');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Organiza tu búsqueda laboral.
                  <span className="text-primary-600"> Destaca en cada postulación.</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Bienvenida a tu espacio de organización profesional. Centraliza oportunidades, 
                  versiones de CV y tu avance—todo en un solo lugar.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Ingresar
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    ¿No tienes cuenta? Regístrate gratis
                  </button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    Miles de candidatos ya organizan sus postulaciones aquí
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Header */}
                <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-500">
                    jobs-tracker.com/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mi Tablero de Postulaciones</h3>
                    <p className="text-sm text-gray-600">Gestiona todas tus oportunidades en un solo lugar</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-800">Postulaciones</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-green-800">Entrevistas</div>
                    </div>
                  </div>

                  {/* Table Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">T</div>
                        <div>
                          <div className="font-medium text-gray-900">TechCorp</div>
                          <div className="text-sm text-gray-600">Frontend Developer</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Entrevista</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>
                        <div>
                          <div className="font-medium text-gray-900">StartupXYZ</div>
                          <div className="text-sm text-gray-600">Product Manager</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Postulado</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">D</div>
                        <div>
                          <div className="font-medium text-gray-900">DesignStudio</div>
                          <div className="text-sm text-gray-600">UX Designer</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Feedback</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating CV Adaptation Card */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Adaptar CV con IA</h4>
                    <p className="text-xs text-gray-600">Personaliza para cada puesto</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Cobertura: 85%</div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof - Company Logos */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm">Candidatos de estas empresas ya usan Jobs Tracker</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {['Rappi', 'Mercado Libre', 'Globant', 'Platzi', 'BCP', 'Falabella'].map((company) => (
                <div key={company} className="text-gray-400 font-semibold text-sm">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Ayuda</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Términos</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacidad</a>
            </div>
            <p className="text-gray-500 text-sm">
              Hecho para LATAM, con foco en estudiantes y profesionales
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isLogin 
                    ? 'Accede a tu espacio de organización profesional'
                    : 'Comienza a centralizar tus oportunidades laborales'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`input-field ${errors.name ? 'error' : ''}`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isLogin ? 'Ingresar' : 'Crear cuenta'}</span>
                )}
              </button>
            </form>

            <div className="px-6 pb-6">
              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-600 hover:text-primary-500 font-medium transition-colors text-sm"
                >
                  {isLogin 
                    ? '¿No tienes cuenta? Regístrate gratis'
                    : '¿Ya tienes cuenta? Inicia sesión'
                  }
                </button>
              </div>

              {isLogin && (
                <div className="text-center mt-4">
                  <button className="text-gray-600 hover:text-gray-500 font-medium transition-colors text-sm">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
