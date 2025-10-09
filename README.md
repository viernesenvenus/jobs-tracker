# 🎯 Jobs Tracker MVP1

> **Organiza tu búsqueda laboral. Destaca en cada postulación.**

Una aplicación moderna para gestionar postulaciones laborales con adaptación de CV por IA, diseñada específicamente para el mercado LATAM.

![Jobs Tracker Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-00C7B7)

## ✨ Características Principales

### 🌐 **Landing Page Profesional**
- Diseño moderno inspirado en Simplify
- Hero section con propuesta de valor clara
- Mockup del dashboard mostrando el producto
- Validación social con logos de empresas LATAM
- CTAs optimizados para conversión

### 🔐 **Sistema de Autenticación Completo**
- Login/Registro con validación en tiempo real
- Formularios con manejo de errores
- Estados de carga y feedback visual
- Redirección inteligente post-login

### 🚀 **Onboarding de 3 Pasos**
- Configuración de rol objetivo
- Número de procesos activos
- Prioridades de organización
- Experiencia guiada para nuevos usuarios

### 📊 **Dashboard Estilo Excel**
- Tabla editable en tiempo real
- Estadísticas dinámicas
- Filtros y búsqueda avanzada
- Acciones rápidas contextuales

### 📝 **Gestión Integral de Postulaciones**
- Modal completo de 5 secciones:
  - Información básica
  - Detalles del proceso
  - Seguimiento y fechas
  - Documentos adjuntos
  - Notas y comentarios
- Validación de formularios
- Manejo de archivos

### 🤖 **Adaptación de CV con IA**
- Análisis de palabras clave
- Sugerencias de personalización
- Múltiples versiones de CV
- Exportación optimizada

### 👤 **Gestión de Perfil**
- Configuración de usuario
- Preferencias de aplicación
- Configuración de notificaciones
- Gestión de datos personales

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Frontend** | Next.js | 14.0.4 |
| **Lenguaje** | TypeScript | 5.0+ |
| **UI Framework** | React | 18.0+ |
| **Styling** | Tailwind CSS | 3.0+ |
| **Componentes** | Headless UI | 1.7+ |
| **Iconos** | Heroicons | 2.0+ |
| **Estado** | React Context API | - |
| **Formularios** | React Hook Form | 7.0+ |
| **Fechas** | date-fns | 2.30+ |
| **IDs** | uuid | 9.0+ |

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0 o superior
- npm 9.0 o superior
- Python 3.8+ (para servidor de desarrollo)

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/viernesenvenus/jobs-tracker.git
cd jobs-tracker

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
python3 server.py
```

### Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
open http://localhost:3000
```

## 📁 Estructura del Proyecto

```
jobs-tracker/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 page.tsx                 # Landing page principal
│   ├── 📄 layout.tsx               # Layout global
│   ├── 📄 globals.css              # Estilos globales
│   ├── 📁 dashboard/               # Dashboard principal
│   ├── 📁 onboarding/              # Wizard de configuración
│   ├── 📁 cvs/                     # Gestión de CVs
│   └── 📁 profile/                 # Perfil de usuario
├── 📁 components/                   # Componentes reutilizables
│   ├── 📁 modals/                  # Modales especializados
│   │   ├── ApplicationModal.tsx    # Modal de postulaciones
│   │   ├── CVAdaptationModal.tsx   # Modal de adaptación IA
│   │   ├── FollowUpModal.tsx       # Modal de seguimiento
│   │   └── ...
│   ├── Header.tsx                  # Header global
│   ├── Footer.tsx                  # Footer global
│   ├── DashboardTable.tsx          # Tabla principal
│   └── ...
├── 📁 contexts/                     # Contextos de React
│   ├── AuthContext.tsx             # Autenticación
│   ├── ToastContext.tsx            # Notificaciones
│   └── ModalContext.tsx            # Gestión de modales
├── 📁 types/                        # Definiciones TypeScript
│   └── index.ts                    # Interfaces principales
├── 📄 package.json                 # Dependencias y scripts
├── 📄 tailwind.config.js           # Configuración Tailwind
├── 📄 next.config.js               # Configuración Next.js
├── 📄 tsconfig.json                # Configuración TypeScript
└── 📄 server.py                    # Servidor de desarrollo Python
```

## 🎨 Características de Diseño

### **Landing Page**
- **Header mínimo**: Logo + tagline + CTAs
- **Hero impactante**: "Organiza tu búsqueda laboral. Destaca en cada postulación."
- **Mockup realista**: Dashboard funcional con datos de ejemplo
- **Validación social**: Logos de empresas LATAM (Rappi, Mercado Libre, etc.)
- **Footer informativo**: Links legales + microcopy regional

### **Dashboard**
- **Tabla Excel-like**: Edición inline, filtros, búsqueda
- **Estadísticas en tiempo real**: Postulaciones, entrevistas, ofertas
- **Estados visuales**: Colores y badges para cada fase
- **Acciones rápidas**: Botones contextuales para tareas comunes

### **Responsive Design**
- **Mobile-first**: Optimizado para dispositivos móviles
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch-friendly**: Botones y elementos táctiles
- **Performance**: Carga rápida en todas las conexiones

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting de código

# Utilidades
python3 server.py    # Servidor completo con auto-instalación
```

## 🌟 Credenciales de Prueba

Para probar la aplicación, usa estas credenciales:

- **Email**: `test@jobstracker.com`
- **Contraseña**: `123456`

## 🚀 Despliegue

### ✅ **Deploy Activo en Producción**

**🌐 Aplicación en vivo:** [jobs-tracker-three.vercel.app](https://jobs-tracker-three.vercel.app)

**📦 Repositorio:** [github.com/viernesenvenus/jobs-tracker](https://github.com/viernesenvenus/jobs-tracker)

### Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desplegar
vercel

# 3. Configurar variables de entorno si es necesario
```

### Netlify
```bash
# 1. Build del proyecto
npm run build

# 2. Subir carpeta 'out' a Netlify
# 3. Configurar redirects para SPA
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

### **MVP2** (Próximas versiones)
- [ ] Integración con APIs de empleo (LinkedIn, Indeed)
- [ ] Notificaciones por email/SMS
- [ ] Dashboard de analytics avanzado
- [ ] Colaboración en equipo
- [ ] Integración con calendarios
- [ ] App móvil nativa

### **Futuro**
- [ ] IA para matching de ofertas
- [ ] Integración con ATS
- [ ] Marketplace de CVs
- [ ] Red social profesional
- [ ] Certificaciones y cursos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollo**: [viernesenvenus](https://github.com/viernesenvenus)
- **Diseño**: Inspirado en Simplify y mejores prácticas UX
- **Mercado objetivo**: Profesionales y estudiantes LATAM

## 📞 Contacto

- **GitHub**: [viernesenvenus/jobs-tracker](https://github.com/viernesenvenus/jobs-tracker)
- **Issues**: [Reportar bugs o sugerencias](https://github.com/viernesenvenus/jobs-tracker/issues)

---

<div align="center">

**⭐ Si te gusta el proyecto, ¡dale una estrella! ⭐**

*Hecho con ❤️ para la comunidad de desarrolladores LATAM*

</div>