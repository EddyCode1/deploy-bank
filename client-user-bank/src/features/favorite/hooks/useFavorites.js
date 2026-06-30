import { useCallback, useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import {
  getFavorites,
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService,
  updateFavoriteAlias as updateFavoriteAliasService,
} from '../service/favoriteService';

const FAVORITES_UPDATED_EVENT = 'favorites:updated';

export function useFavorites({ autoLoad = true } = {}) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(autoLoad);

  // Cargar favoritos del backend de forma asíncrona
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFavorites();
      if (result.success) {
        setFavorites(result.data || []);
      } else if (result.error) {
        // Reemplazo nativo para notificar al usuario de un fallo de red o negocio
        Alert.alert('Error', result.error);
      }
    } catch (err) {
      console.error('[useFavorites] Error al consultar servidor:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Notificar cambios mediante el bus de eventos nativo en memoria
  const broadcast = useCallback(() => {
    DeviceEventEmitter.emit(FAVORITES_UPDATED_EVENT);
  }, []);

  const add = useCallback(async ({ alias, accountNumber }) => {
    const result = await addFavoriteService({ alias, accountNumber });
    if (result.success) {
      await load();
      broadcast();
    }
    return result;
  }, [load, broadcast]);

  const remove = useCallback(async (favoriteId) => {
    const result = await removeFavoriteService(favoriteId);
    if (result.success) {
      await load();
      broadcast();
    }
    return result;
  }, [load, broadcast]);

  const updateAlias = useCallback(async (favoriteId, alias) => {
    const result = await updateFavoriteAliasService(favoriteId, alias);
    if (result.success) {
      await load();
      broadcast();
    }
    return result;
  }, [load, broadcast]);

  // Carga inicial automatizada al montar el hook
  useEffect(() => {
    if (!autoLoad) return;
    load();
  }, [autoLoad, load]);

  // Sincronización reactiva entre pantallas del flujo móvil (ej. Dashboard <-> Transferencias)
  useEffect(() => {
    if (!autoLoad) return;

    const subscription = DeviceEventEmitter.addListener(FAVORITES_UPDATED_EVENT, () => {
      load();
    });

    return () => {
      subscription.remove();
    };
  }, [autoLoad, load]);

  return {
    favorites,
    loading,
    refresh: load,
    addFavorite: add,
    removeFavorite: remove,
    updateFavoriteAlias: updateAlias,
  };
}