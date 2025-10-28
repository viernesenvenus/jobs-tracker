/**
 * Configuración centralizada de URLs y constantes de la aplicación
 */

export const config = {
  // URLs de la aplicación
  urls: {
    production: 'https://talenia.vercel.app',
    development: 'http://localhost:3000',
    // URL actual basada en el entorno
    current: typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NODE_ENV === 'production' 
        ? 'https://talenia.vercel.app' 
        : 'http://localhost:3000'
  },
  
  // Configuración de OAuth
  oauth: {
    google: {
      redirectTo: '/dashboard'
    }
  },
  
  // Configuración de la aplicación
  app: {
    name: 'Talenia',
    description: 'Organiza tu búsqueda laboral. Destaca en cada postulación.',
    tagline: 'Tu buscador laboral organizado'
  }
} as const;

/**
 * Obtiene la URL base de la aplicación
 */
export function getBaseUrl(): string {
  return config.urls.current;
}

/**
 * Obtiene la URL completa para una ruta específica
 */
export function getAppUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Verifica si estamos en producción
 */
export function isProduction(): boolean {
  return config.urls.current === config.urls.production;
}

/**
 * Verifica si estamos en desarrollo
 */
export function isDevelopment(): boolean {
  return config.urls.current === config.urls.development;
}
