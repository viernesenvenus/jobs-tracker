'use client';

import React, { useState } from 'react';
import { JobApplication, TableColumn, ApplicationStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DashboardTableProps {
  applications: JobApplication[];
  columns: TableColumn[];
  onEdit: (id: string) => void;
  onFollowUp: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
}

export function DashboardTable({
  applications,
  columns,
  onEdit,
  onFollowUp,
  onDelete,
  onUpdate
}: DashboardTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Postulado',
    interview: 'Entrevista',
    feedback: 'Feedback',
    closed: 'Cerrado',
    rejected: 'Rechazado',
    offer: 'Oferta'
  };

  const statusColors: Record<ApplicationStatus, string> = {
    applied: 'bg-blue-100 text-blue-800',
    interview: 'bg-yellow-100 text-yellow-800',
    feedback: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    offer: 'bg-green-100 text-green-800'
  };

  const handleCellClick = (rowId: string, columnKey: string, currentValue: any) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.editable) return;

    setEditingCell({ rowId, columnKey });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const updates: Partial<JobApplication> = {};
    const { rowId, columnKey } = editingCell;

    if (columnKey === 'applicationDate' || columnKey === 'firstInterviewDate') {
      if (columnKey === 'applicationDate') {
        updates.applicationDate = new Date(editValue);
      } else if (columnKey === 'firstInterviewDate') {
        updates.firstInterviewDate = new Date(editValue);
      }
    } else {
      (updates as any)[columnKey] = editValue;
    }

    onUpdate(rowId, updates);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) return '';

    switch (column.type) {
      case 'date':
        return value instanceof Date ? format(value, 'dd/MM/yyyy', { locale: es }) : '';
      case 'url':
        return value ? 'Ver enlace' : '';
      default:
        return value.toString();
    }
  };

  const renderCellContent = (application: JobApplication, column: TableColumn) => {
    const value = application[column.key as keyof JobApplication];
    const isEditing = editingCell?.rowId === application.id && editingCell?.columnKey === column.key;

    // Render actions column with icons
    if (column.key === 'actions') {
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(application.id)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (isEditing) {
      if (column.type === 'select') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          >
            {column.options?.map(option => (
              <option key={option} value={option}>
                {statusLabels[option as ApplicationStatus] || option}
              </option>
            ))}
          </select>
        );
      } else if (column.type === 'date') {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        );
      } else {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        );
      }
    }

    if (column.key === 'status') {
      const status = value as ApplicationStatus;
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      );
    }

    if (column.key === 'jobLink' && value) {
      return (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-500 text-sm"
        >
          Ver enlace
        </a>
      );
    }

    return (
      <span className="text-sm text-gray-900">
        {formatCellValue(value, column)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr
                key={application.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`table-cell ${column.editable ? 'editable' : ''} ${
                      editingCell?.rowId === application.id && editingCell?.columnKey === column.key ? 'editing' : ''
                    }`}
                    onClick={() => handleCellClick(application.id, column.key, application[column.key as keyof JobApplication])}
                    style={{ width: column.width }}
                  >
                    {renderCellContent(application, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Editing controls */}
      {editingCell && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={handleCellSave}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            title="Guardar"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCellCancel}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Cancelar"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
