'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useModal } from '@/contexts/ModalContext';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  BellIcon,
  LanguageIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const { openConfirmationModal } = useModal();
  const router = useRouter();

  const handleUpdateProfile = async (updates: any) => {
    try {
      await updateUser(updates);
      showSuccess('Perfil actualizado', 'Los cambios se han guardado exitosamente.');
      setIsEditing(false);
    } catch (error) {
      showError('Error', 'No se pudo actualizar el perfil.');
    }
  };

  const handleChangePassword = async (passwordData: any) => {
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Contraseña cambiada', 'Tu contraseña se ha actualizado exitosamente.');
      setIsChangingPassword(false);
    } catch (error) {
      showError('Error', 'No se pudo cambiar la contraseña.');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Datos exportados', 'Se ha descargado un archivo CSV con todos tus datos.');
    } catch (error) {
      showError('Error', 'No se pudieron exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    openConfirmationModal(
      'Eliminar cuenta',
      'Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, postulaciones y CVs. ¿Estás segura de que quieres continuar?',
      () => {
        // Simulate account deletion
        logout();
        showSuccess('Cuenta eliminada', 'Tu cuenta ha sido eliminada exitosamente.');
        router.push('/');
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Información de cuenta
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-ghost text-sm"
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    onChange={(e) => updateUser({ name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field bg-gray-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    El email no se puede cambiar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol objetivo
                  </label>
                  <input
                    type="text"
                    value={user.role || ''}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: Desarrolladora Frontend"
                    onChange={(e) => updateUser({ role: e.target.value })}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateProfile({})}
                      className="btn-primary"
                    >
                      Guardar cambios
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <KeyIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Seguridad
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Contraseña</h3>
                    <p className="text-sm text-gray-500">Última actualización: Hace 30 días</p>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="btn-ghost text-sm"
                  >
                    Cambiar
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsChangingPassword(false)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleChangePassword({})}
                        className="btn-primary"
                      >
                        Cambiar contraseña
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BellIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Recordatorios de seguimiento</span>
                  <input
                    type="checkbox"
                    checked={user.preferences.notifications}
                    onChange={(e) => updateUser({ 
                      preferences: { 
                        ...user.preferences, 
                        notifications: e.target.checked 
                      } 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Actualizaciones de estado</span>
                  <input
                    type="checkbox"
                    checked={user.preferences.notifications}
                    onChange={(e) => updateUser({ 
                      preferences: { 
                        ...user.preferences, 
                        notifications: e.target.checked 
                      } 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Nuevas funcionalidades</span>
                  <input
                    type="checkbox"
                    checked={user.preferences.notifications}
                    onChange={(e) => updateUser({ 
                      preferences: { 
                        ...user.preferences, 
                        notifications: e.target.checked 
                      } 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LanguageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Idioma
                </h3>
              </div>

              <select
                value={user.preferences.language}
                onChange={(e) => updateUser({ 
                  preferences: { 
                    ...user.preferences, 
                    language: e.target.value as 'es' | 'pt' | 'en' 
                  } 
                })}
                className="input-field"
              >
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowDownTrayIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Datos
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  )}
                  <span>{isExporting ? 'Exportando...' : 'Exportar datos (CSV)'}</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  Zona de peligro
                </h3>
              </div>

              <p className="text-sm text-red-700 mb-4">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Ten cuidado.
              </p>

              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
