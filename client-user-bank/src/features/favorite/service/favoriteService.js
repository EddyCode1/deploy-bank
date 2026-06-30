import { bankingClient } from '../../../shared/api/adminClient';

/**
 * Parsea de manera resiliente los errores HTTP y de red del backend bancario.
 * Optimizado para interceptar fallas comunes de conectividad en dispositivos móviles.
 */
function parseBackendError(error, fallback) {
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
    return 'No hay conexión con el servidor bancario. Asegúrate de tener datos o Wi-Fi activo y vuelve a intentarlo.';
  }
  
  const data = error?.response?.data;
  if (!data) return fallback || error?.message || 'Error desconocido';
  
  // Captura y aplana colecciones de mensajes de validaciones de DTOs en el backend
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.values(data.errors).flat();
    if (msgs.length > 0) return msgs.join(' | ');
  }
  
  return data.message || data.error || fallback || error.message;
}

/**
 * Normaliza y mapea la estructura de datos del documento proveniente
 * del backend a la nomenclatura limpia camelCase consumida por la app.
 */
function mapFavorite(raw) {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    alias: raw.alias || '',
    accountNumber: raw.account_number || raw.accountNumber || '',
    accountType: raw.account_type || raw.accountType || '',
    ownerUserId: raw.owner_user_id || raw.ownerUserId || '',
    createdAt: raw.createdAt || raw.created_at,
    raw,
  };
}

export const getFavorites = async () => {
  try {
    const response = await bankingClient.get('/favorites');
    const list = response.data?.favorites ?? response.data?.data ?? response.data ?? [];
    return { success: true, data: list.map(mapFavorite) };
  } catch (error) {
    // Si el endpoint responde con 404 (Not Found), se asume un arreglo sin registros cargados
    if (error?.response?.status === 404) {
      return { success: true, data: [] };
    }
    return { success: false, error: parseBackendError(error, 'No se pudieron cargar tus favoritos') };
  }
};

export const addFavorite = async ({ alias, accountNumber }) => {
  const trimmedAlias = String(alias || '').trim();
  const trimmedAccount = String(accountNumber || '').trim();
  
  if (!trimmedAlias || !trimmedAccount) {
    return { success: false, error: 'Alias y número de cuenta son obligatorios' };
  }
  
  try {
    const response = await bankingClient.post('/favorites', {
      alias: trimmedAlias,
      account_number: trimmedAccount,
    });
    return { success: true, data: mapFavorite(response.data?.favorite ?? response.data) };
  } catch (error) {
    return { success: false, error: parseBackendError(error, 'No se pudo agregar el favorito') };
  }
};

export const updateFavoriteAlias = async (favoriteId, alias) => {
  try {
    // encodeURIComponent asegura que los IDs alfanuméricos u objetos complejos de bases de datos no rompan la URL
    const response = await bankingClient.put(`/favorites/${encodeURIComponent(favoriteId)}`, {
      alias: String(alias || '').trim(),
    });
    return { success: true, data: mapFavorite(response.data?.favorite ?? response.data) };
  } catch (error) {
    return { success: false, error: parseBackendError(error, 'No se pudo actualizar el favorito') };
  }
};

export const removeFavorite = async (favoriteId) => {
  try {
    await bankingClient.delete(`/favorites/${encodeURIComponent(favoriteId)}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseBackendError(error, 'No se pudo eliminar el favorito') };
  }
};