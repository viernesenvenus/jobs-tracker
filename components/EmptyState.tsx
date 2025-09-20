'use client';

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon: Icon = PlusIcon 
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      <button
        onClick={onAction}
        className="btn-primary flex items-center space-x-2 mx-auto"
      >
        <Icon className="w-5 h-5" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
