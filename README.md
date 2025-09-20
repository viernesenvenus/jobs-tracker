# Jobs Tracker - MVP1

Una aplicación web completa para organizar y gestionar tu búsqueda laboral, con funcionalidades avanzadas de adaptación de CV y seguimiento de procesos.

## 🌟 Características Principales

### 🔐 Autenticación y Onboarding
- Sistema de login/registro completo
- Wizard de onboarding en 3 pasos
- Personalización inicial basada en preferencias

### 📊 Dashboard Excel-like
- Tabla editable inline para gestión rápida de postulaciones
- Estadísticas en tiempo real
- Filtros y búsqueda avanzada
- Estados de proceso visuales

### 📝 Gestión de Postulaciones
- Modal completo para crear/editar postulaciones
- 5 secciones organizadas: Datos básicos, Proceso & contacto, JD, Seguimiento, CV
- Validaciones inteligentes
- Historial de cambios

### 🤖 Adaptación de CV con IA
- Análisis automático de palabras clave del JD
- Sugerencias inteligentes de mejora
- Indicador de cobertura de keywords
- Preview en tiempo real

### 📁 Gestión de CVs
- Subida de CVs base (PDF, DOC, DOCX)
- Creación de versiones adaptadas
- Sistema de versionado
- Exportación y descarga

### 👤 Perfil y Configuraciones
- Gestión de datos personales
- Preferencias de notificaciones
- Selector de idioma (ES/PT/EN)
- Exportación de datos
- Eliminación segura de cuenta

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form
- **State Management**: React Context
- **Date Handling**: date-fns
- **Animations**: Framer Motion

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd jobs-tracker

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 📁 Estructura del Proyecto

```
jobs-tracker/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Dashboard principal
│   ├── cvs/              # Gestión de CVs
│   ├── profile/          # Perfil de usuario
│   ├── onboarding/       # Wizard de onboarding
│   └── globals.css       # Estilos globales
├── components/            # Componentes reutilizables
│   ├── modals/           # Modales específicos
│   ├── Header.tsx        # Header global
│   ├── Footer.tsx        # Footer global
│   └── ...
├── contexts/             # Contextos de React
│   ├── AuthContext.tsx   # Autenticación
│   ├── ToastContext.tsx  # Notificaciones
│   └── ModalContext.tsx  # Gestión de modales
├── types/                # Definiciones TypeScript
└── ...
```

## 🎨 Diseño y UX

### Principios de Diseño
- **Excel-like**: Tabla editable inline para gestión rápida
- **Modal-first**: Formularios complejos en modales organizados
- **Progressive Disclosure**: Información mostrada por capas
- **Feedback Inmediato**: Toasts y validaciones en tiempo real

### Paleta de Colores
- **Primary**: Azul (#3b82f6)
- **Success**: Verde (#10b981)
- **Warning**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)
- **Gray Scale**: 50-900

### Componentes Clave
- **DashboardTable**: Tabla editable con validaciones
- **ApplicationModal**: Modal de 5 secciones para postulaciones
- **CVAdaptationModal**: Interfaz de adaptación con IA
- **ToastContainer**: Sistema de notificaciones
- **EmptyState**: Estados vacíos con CTAs

## 🔧 Configuración

### Variables de Entorno
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Añadir variables de base de datos y APIs según necesidad
```

### Personalización
- Modifica `tailwind.config.js` para personalizar colores
- Ajusta `types/index.ts` para cambiar modelos de datos
- Configura contextos en `contexts/` para lógica de negocio

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Layout adaptado con navegación colapsable
- **Mobile**: Interfaz simplificada con modales optimizados

## 🚀 Próximas Funcionalidades

### MVP2 (Planificado)
- [ ] Integración con APIs reales
- [ ] Base de datos persistente
- [ ] Notificaciones por email
- [ ] Integración con LinkedIn
- [ ] Analytics avanzados

### MVP3 (Futuro)
- [ ] Colaboración en equipo
- [ ] Templates de CV
- [ ] Integración con ATS
- [ ] Dashboard de métricas avanzadas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte o preguntas:
- Email: soporte@jobstracker.com
- Issues: [GitHub Issues](https://github.com/username/jobs-tracker/issues)

---

**Jobs Tracker** - Organiza tu búsqueda laboral, destaca en cada postulación. 🚀
