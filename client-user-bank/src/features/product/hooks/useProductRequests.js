import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { bankingClient } from '../../../shared/api/adminClient';

/**
 * Resuelve mensajes de error provenientes del backend de manera segura.
 */
function resolveApiError(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

/**
 * Hook personalizado para centralizar la carga de solicitudes de producto en mobile.
 * Maneja de forma segura las consultas dependiendo del rol de usuario (Admin o Cliente).
 */
export function useProductRequests({ isAdmin = false, autoLoad = true } = {}) {
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(autoLoad);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        bankingClient.get('/products/requests/me'),
        isAdmin ? bankingClient.get('/products/requests') : Promise.resolve(null),
      ]);
      
      setMyRequests(myRes?.data?.requests ?? []);
      setAllRequests(isAdmin ? (allRes?.data?.requests ?? []) : []);
    } catch (error) {
      const errorMessage = resolveApiError(error, 'No se pudieron cargar las solicitudes de productos');
      
      // Alerta nativa ideal para flujos asíncronos en dispositivos móviles
      Alert.alert('Error de Solicitud', errorMessage, [{ text: 'Entendido' }]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (autoLoad) {
      // Temporizador nativo sin prefijo 'window.' para prevenir fallas en entornos mobile
      const timer = setTimeout(() => {
        void load();
      }, 0);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoLoad, load]);

  return {
    myRequests,
    allRequests,
    loading,
    refresh: load,
  };
}