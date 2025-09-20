'use client';

import React, { useState } from 'react';
import { CV } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  EyeIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CVTableProps {
  cvs: CV[];
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onAdapt: (id: string) => void;
}

export function CVTable({ cvs, onDelete, onExport, onAdapt }: CVTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: 'base' | 'adapted') => {
    return type === 'base' 
      ? 'bg-green-100 text-green-800'
      : 'bg-purple-100 text-purple-800';
  };

  const getTypeLabel = (type: 'base' | 'adapted') => {
    return type === 'base' ? 'Base' : 'Adaptado';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Procesos asociados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cobertura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tamaño
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última actualización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cvs.map((cv) => (
              <tr
                key={cv.id}
                className="hover:bg-gray-50 transition-colors relative"
                onMouseEnter={() => setHoveredRow(cv.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cv.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cv.fileName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(cv.type)}`}>
                    {getTypeLabel(cv.type)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cv.type === 'adapted' && cv.jobApplicationId ? '1 proceso' : '0 procesos'}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {cv.type === 'adapted' && cv.coverage ? (
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            cv.coverage >= 80 ? 'bg-green-500' : 
                            cv.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cv.coverage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{cv.coverage}%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatFileSize(cv.fileSize)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(cv.updatedAt, 'dd/MM/yyyy', { locale: es })}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* View CV */}}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Ver"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onExport(cv.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Exportar"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                    
                    {cv.type === 'base' && (
                      <button
                        onClick={() => onAdapt(cv.id)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Adaptar"
                      >
                        <SparklesIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDelete(cv.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
