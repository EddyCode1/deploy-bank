import { useCallback } from 'react';
// Rutas actualizadas a la arquitectura del proyecto en React Native
import useUserStore from '../store/useUserStore';
import userService from '../service/userService';

/**
 * Hook para gestionar el listado general de usuarios
 */
export function useUsers() {
  const { setUsers, setLoading, setError } = useUserStore();

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await userService.getUsers(params);
      setUsers(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setUsers, setLoading, setError]);

  return { fetchUsers };
}

/**
 * Hook para gestionar el detalle individual de un usuario
 */
export function useUserDetail() {
  const { setUserDetail, setLoading, setError } = useUserStore();

  const fetchUserDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await userService.getUserById(id);
      setUserDetail(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [setUserDetail, setLoading, setError]);

  return { fetchUserDetail };
}