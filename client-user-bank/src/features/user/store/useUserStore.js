import { create } from 'zustand';
import userService from '../service/userService';

const useUserStore = create((set, get) => ({
  users: [],
  totalUsers: 0,
  pagination: { page: 1, limit: 10, total: 0 },
  userDetail: null,
  loading: false,
  actionLoading: false, // Estado secundario para cargas de botones/modales
  error: null,

  // --- Sincronizadores de Estado Manual ---
  setUsers: (users) => set({ users }),
  setUserDetail: (userDetail) => set({ userDetail }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // --- Acciones de Flujo Asíncrono Centralizadas ---
  
  /**
   * Carga la lista de usuarios desde el backend aplicando los filtros de búsqueda y paginación
   */
  fetchUsers: async ({ search, page = 1, limit = 10 } = {}) => {
    set({ loading: true, error: null });
    const result = await userService.getUsers({ search, page, limit });
    
    if (result.success) {
      set({ 
        users: result.data.items, 
        totalUsers: result.data.total,
        pagination: result.data.pagination,
        loading: false 
      });
    } else {
      set({ error: result.error, loading: false });
    }
    return result;
  },

  /**
   * Obtiene la información detallada de un usuario por ID
   */
  fetchUserById: async (userId) => {
    set({ loading: true, error: null });
    const result = await userService.getUserById(userId);
    
    if (result.success) {
      set({ userDetail: result.data, loading: false });
    } else {
      set({ error: result.error, loading: false });
    }
    return result;
  },

  /**
   * Registra un nuevo usuario en la base de datos
   */
  createUser: async (userData) => {
    set({ actionLoading: true, error: null });
    const result = await userService.createUser(userData);
    set({ actionLoading: false });
    return result;
  },

  /**
   * Actualiza el perfil de un usuario existente
   */
  updateUser: async (userId, userData) => {
    set({ actionLoading: true, error: null });
    const result = await userService.updateUser(userId, userData);
    
    if (result.success) {
      // Si el usuario editado es el que se está visualizando en detalle, actualiza su estado mutado
      if (get().userDetail?.id === userId || get().userDetail?._id === userId) {
        set({ userDetail: { ...get().userDetail, ...userData } });
      }
    }
    set({ actionLoading: false });
    return result;
  },

  /**
   * Modifica el rol administrativo de un usuario específico
   */
  updateUserRole: async (userId, newRole) => {
    set({ actionLoading: true });
    const result = await userService.updateUserRole(userId, newRole);
    set({ actionLoading: false });
    return result;
  },

  /**
   * Alterna dinámicamente el estado del usuario o procesa su activación/desactivación explícita
   */
  changeUserStatus: async (user, actionType) => {
    set({ actionLoading: true });
    const userId = user.id || user._id;
    let result;

    if (actionType === 'activate') {
      result = await userService.activateUser(userId);
    } else {
      result = await userService.deactivateUser(userId);
    }

    if (result.success) {
      const nextStatus = actionType === 'activate' ? 'active' : 'inactive';
      
      // Actualización reactiva optimista de la lista en memoria (evita llamadas pesadas innecesarias al backend)
      const updatedUsers = get().users.map((u) => {
        if ((u.id || u._id) === userId) {
          return { ...u, status: nextStatus };
        }
        return u;
      });

      set({ users: updatedUsers });

      // Si el usuario modificado estaba abierto en el detalle, actualízalo también
      if (get().userDetail?.id === userId || get().userDetail?._id === userId) {
        set({ userDetail: { ...get().userDetail, status: nextStatus } });
      }
    }
    
    set({ actionLoading: false });
    return result;
  },
}));

export default useUserStore;