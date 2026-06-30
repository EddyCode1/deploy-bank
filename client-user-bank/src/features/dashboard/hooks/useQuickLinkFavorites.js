import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUICK_LINK_FAVORITES_KEY = 'dashboard_quick_link_favorites_v1';
const QUICK_LINK_FAVORITES_EVENT = 'dashboard:quick-link-favorites:updated';

export function useQuickLinkFavorites() {
  // Inicializamos en vacío debido a la naturaleza asíncrona de AsyncStorage
  const [favorites, setFavoritesState] = useState([]);

  // Carga inicial de datos desde el almacenamiento nativo
  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUICK_LINK_FAVORITES_KEY);
      if (raw) {
        setFavoritesState(JSON.parse(raw));
      }
    } catch (error) {
      console.warn('[Favorites] Error al leer favoritos:', error);
    }
  }, []);

  // Persistir cambios en el dispositivo
  const saveFavorites = async (updatedFavs) => {
    try {
      await AsyncStorage.setItem(QUICK_LINK_FAVORITES_KEY, JSON.stringify(updatedFavs));
    } catch (error) {
      console.warn('[Favorites] No se pudo persistir el estado:', error);
    }
  };

  useEffect(() => {
    // Hidratar el estado al montar el hook
    loadFavorites();

    // Escuchar actualizaciones emitidas desde otras pantallas o componentes nativos
    const subscription = DeviceEventEmitter.addListener(QUICK_LINK_FAVORITES_EVENT, () => {
      loadFavorites();
    });

    return () => {
      subscription.remove();
    };
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id) => {
    setFavoritesState((current) => {
      const updated = current.includes(id)
        ? current.filter((f) => f !== id)
        : [...current, id];
      
      // Guardar de forma asíncrona en background
      saveFavorites(updated);
      
      // Emitir el evento de sincronización para el resto de la app de inmediato
      DeviceEventEmitter.emit(QUICK_LINK_FAVORITES_EVENT);
      
      return updated;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}