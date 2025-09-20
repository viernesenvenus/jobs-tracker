'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DocumentTextIcon, 
  QuestionMarkCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

export function Footer() {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  if (!user) {
    return null; // Don't show footer on login/register pages
  }

  const languages = [
    { code: 'es', name: 'ES' },
    { code: 'pt', name: 'PT' },
    { code: 'en', name: 'EN' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Términos de servicio</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Política de privacidad</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  <span>Centro de ayuda</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Language Selector */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Idioma</h3>
            <div className="flex items-center space-x-2">
              <LanguageIcon className="w-4 h-4 text-gray-600" />
              <div className="flex space-x-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-2 py-1 text-sm rounded transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 Jobs Tracker. Todos los derechos reservados.
            </p>
            <p className="text-sm text-gray-600 mt-2 md:mt-0">
              Organiza tu búsqueda laboral, destaca en cada postulación.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
