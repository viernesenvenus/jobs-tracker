'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  showLoading?: boolean;
}

/**
 * Hook para manejar redirecciones automáticas basadas en el estado de autenticación
 * @param options - Opciones de configuración
 * @param options.redirectTo - Ruta a la que redirigir (default: '/dashboard')
 * @param options.requireAuth - Si requiere autenticación para mostrar la página (default: true)
 * @param options.showLoading - Si mostrar el loading global durante la redirección (default: true)
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const {
    redirectTo = '/dashboard',
    requireAuth = true,
    showLoading = true
  } = options;

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (isLoading) return;

    // Si requiere autenticación y no hay usuario, redirigir al login
    if (requireAuth && !user) {
      console.log('🔒 No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Si hay usuario y no requiere autenticación (página pública), redirigir al dashboard
    if (!requireAuth && user) {
      console.log('👤 User found on public page, redirecting to dashboard');
      
      if (showLoading) {
        const loader = document.getElementById('global-loading');
        if (loader) {
          loader.style.opacity = '1';
          loader.style.pointerEvents = 'auto';
        }
      }
      
      router.push(redirectTo);
      return;
    }

    // Si hay usuario y requiere autenticación, verificar si necesita redirección específica
    if (requireAuth && user && redirectTo !== '/dashboard') {
      console.log(`👤 User authenticated, redirecting to ${redirectTo}`);
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo, requireAuth, showLoading]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
}
