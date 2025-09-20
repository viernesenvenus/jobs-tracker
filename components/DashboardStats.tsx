'use client';

import React from 'react';
import { JobApplication, DashboardStats as Stats } from '@/types';
import { 
  BriefcaseIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  applications: JobApplication[];
}

export function DashboardStats({ applications }: DashboardStatsProps) {
  const stats: Stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(app => 
      ['applied', 'interview', 'feedback'].includes(app.status)
    ).length,
    interviewsScheduled: applications.filter(app => 
      app.firstInterviewDate && app.status === 'interview'
    ).length,
    responsesReceived: applications.filter(app => 
      app.responseTime && app.status !== 'applied'
    ).length,
    averageResponseTime: calculateAverageResponseTime(applications),
    successRate: calculateSuccessRate(applications)
  };

  function calculateAverageResponseTime(apps: JobApplication[]): number {
    const appsWithResponseTime = apps.filter(app => app.responseTime);
    if (appsWithResponseTime.length === 0) return 0;
    
    const totalDays = appsWithResponseTime.reduce((sum, app) => {
      const days = parseInt(app.responseTime?.replace(/\D/g, '') || '0');
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / appsWithResponseTime.length);
  }

  function calculateSuccessRate(apps: JobApplication[]): number {
    if (apps.length === 0) return 0;
    const successfulApps = apps.filter(app => 
      ['offer', 'interview', 'feedback'].includes(app.status)
    ).length;
    return Math.round((successfulApps / apps.length) * 100);
  }

  const statCards = [
    {
      title: 'Total Postulaciones',
      value: stats.totalApplications,
      icon: BriefcaseIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Procesos Activos',
      value: stats.activeApplications,
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Entrevistas Programadas',
      value: stats.interviewsScheduled,
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Tasa de Éxito',
      value: `${stats.successRate}%`,
      icon: CheckCircleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
