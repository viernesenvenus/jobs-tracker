'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { TaleniaLogo } from './TaleniaLogo';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {user ? (
              // Si el usuario está autenticado, el logo no es un enlace
              <div className="cursor-default">
                <TaleniaLogo size="md" showText={true} className="text-blue-600" />
              </div>
            ) : (
              // Si el usuario NO está autenticado, el logo redirige a la página de inicio
              <Link href="/">
                <TaleniaLogo size="md" showText={true} className="text-blue-600" />
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
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Cerrar Sesión
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