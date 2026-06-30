import { Alert } from 'react-native';
import authClient from '../../../shared/api/authClient';

/**
 * Normaliza la estructura del usuario para el store local.
 */
function mapUserForStore(userDetails = {}) {
  return {
    id: userDetails.id || userDetails._id || null,
    nombre:
      [userDetails.name, userDetails.surname].filter(Boolean).join(' ') ||
      userDetails.nombre ||
      userDetails.username ||
      '',
    username: userDetails.username || userDetails.nombre || '',
    email: userDetails.email || '',
    telefono: userDetails.telefono || userDetails.phone || userDetails.contact_phone_number || '',
    direccion: userDetails.direccion || userDetails.address || '',
    trabajo: userDetails.trabajo || userDetails.workName || '',
    ingresoMensual:
      userDetails.ingresoMensual ??
      userDetails.monthlyIncome ??
      null,
    profilePicture: userDetails.profilePicture || null,
    rol: userDetails.role || userDetails.rol || 'USER_ROLE',
  };
}

function resolveLoginErrorMessage(error) {
  const rawMessage =
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    '';

  const normalized = String(rawMessage).toLowerCase();
  if (
    normalized.includes('cuenta pendiente de activación') ||
    normalized.includes('cuenta pendiente de activacion') ||
    normalized.includes('account pending') ||
    normalized.includes('not active')
  ) {
    return 'Tu cuenta aún no ha sido activada. Primero necesitas aprobación de administración.';
  }

  if (normalized.includes('email not verified') || normalized.includes('email no verificado')) {
    return 'Tu correo aún no está verificado. Revisa tu email y confirma tu cuenta.';
  }

  return rawMessage || 'Error al iniciar sesión';
}

function resolveAuthApiError(error, fallbackMessage) {
  const apiErrors = error.response?.data?.errors;
  const validationMessages =
    apiErrors && typeof apiErrors === 'object'
      ? Object.values(apiErrors).flat().filter(Boolean)
      : [];

  return (
    validationMessages[0] ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    fallbackMessage
  );
}

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { emailOrUsername: email, password });
      const data = response.data || {};
      const token = data.token;
      const compactUser = data.userDetails || data.data || data.user || {};

      if (!token) {
        throw new Error('El backend no devolvió un token de autenticación');
      }

      // Al iniciar sesión, solicitamos el perfil completo para evitar mutaciones vacías.
      let fullUser = compactUser;
      try {
        const profileResponse = await authClient.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = profileResponse.data || {};
        fullUser = payload.data ?? payload;
      } catch {
        // Fallback al usuario compacto si falla el endpoint de perfil extendido
      }

      return {
        success: true,
        token,
        refreshToken: data.refreshToken || null,
        user: mapUserForStore(fullUser),
      };
    } catch (error) {
      console.error('Login error:', error);
      const message = resolveLoginErrorMessage(error);
      Alert.alert('Inicio de Sesión', message);
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    try {
      const nameParts = (userData.nombre || '').trim().split(/\s+/);
      const payload = {
        name: nameParts[0] || '',
        surname: nameParts.slice(1).join(' ') || '-',
        username: userData.username,
        email: userData.email,
        phone: userData.telefono || '',
        password: userData.password,
      };
      
      const response = await authClient.post('/register', payload);
      return { success: true, user: response.data };
    } catch (error) {
      const message = resolveAuthApiError(error, 'Error al registrar usuario');
      Alert.alert('Registro', message);
      return { success: false, error: message };
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await authClient.post('/verify-email', { token });
      const message = response.data?.message || 'Correo verificado correctamente';
      // Nota: El Alert de éxito se delega a la UI o se ejecuta de forma inmediata aquí
      return { success: true, data: response.data, message };
    } catch (error) {
      const message = resolveAuthApiError(error, 'No se pudo verificar el correo');
      Alert.alert('Verificación', message);
      return { success: false, error: message };
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await authClient.post('/resend-verification', { email });
      const message = response.data?.message || 'Correo de verificación reenviado';
      return { success: true, data: response.data, message };
    } catch (error) {
      const message = resolveAuthApiError(error, 'No se pudo reenviar el correo de verificación');
      Alert.alert('Reenvío de Verificación', message);
      return { success: false, error: message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await authClient.post('/forgot-password', { email });
      const message = response.data?.message || 'Se enviaron instrucciones de recuperación a tu correo';
      return { success: true, data: response.data, message };
    } catch (error) {
      const message = resolveAuthApiError(error, 'No se pudo iniciar recuperación de contraseña');
      Alert.alert('Recuperación', message);
      return { success: false, error: message };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await authClient.post('/reset-password', { token, newPassword });
      const message = response.data?.message || 'Contraseña restablecida correctamente';
      return { success: true, data: response.data, message };
    } catch (error) {
      const message = resolveAuthApiError(error, 'No se pudo restablecer la contraseña');
      Alert.alert('Error', message);
      return { success: false, error: message };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await authClient.get('/profile');
      const payload = response.data || {} ;
      const user = payload.data ?? payload;
      return { success: true, user: mapUserForStore(user) };
    } catch {
      return { success: false, error: 'Token inválido o expirado' };
    }
  },

  logout: () => {
    return { success: true };
  },
};