'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log('🚪 Header: Starting logout...');
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      console.log('✅ Header: Logout completed, redirecting to home...');
      
      // Redirect to home page after logout using window.location for immediate redirect
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Header: Logout error:', error);
      // Even if there's an error, redirect to home
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {user ? (
              // Si el usuario está autenticado, el logo no es un enlace
              <div className="flex items-center space-x-3 cursor-default">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Jobs Tracker</span>
                  <p className="text-xs text-gray-500">Tu buscador laboral organizado</p>
                </div>
              </div>
            ) : (
              // Si el usuario NO está autenticado, el logo redirige a la página de inicio
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Jobs Tracker</span>
                  <p className="text-xs text-gray-500">Tu buscador laboral organizado</p>
                </div>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/cvs"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  CVs
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Perfil
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        Configuración
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  Ingresar
                </Link>
                <Link
                  href="/login"
                  className="btn-primary px-4 py-2 text-sm font-medium"
                >
                  Regístrate gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/cvs"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CVs
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                </>
              )}
            </nav>

            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoading}
                  className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors ${
                    isLoggingOut || isLoading
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 mr-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  )}
                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ingresar
                </Link>
                <Link
                  href="/login"
                  className="btn-primary px-4 py-2 text-sm font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Regístrate gratis
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}