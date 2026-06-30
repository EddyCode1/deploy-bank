import { create } from 'zustand';
import { bankingClient } from '../../../shared/api/adminClient';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,
  filters: { type: '', is_active: '' },

  /**
   * Obtiene la lista de activos del backend basándose en los filtros actuales.
   */
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const { type, is_active } = get().filters;
      const params = {};
      
      if (type) params.type = type;
      if (is_active !== '') params.is_active = is_active;

      const response = await bankingClient.get('/products', { params });
      set({ products: response.data?.products || [], loading: false });
    } catch (err) {
      // Si el backend responde con 404 significa que la consulta no arrojó registros con esos filtros
      if (err.response?.status === 404) {
        set({ products: [], loading: false, error: null });
        return;
      }
      set({ 
        error: err.response?.data?.message || 'Error al cargar productos', 
        loading: false 
      });
    }
  },

  /**
   * Registra un nuevo producto/servicio y actualiza de forma reactiva el catálogo local.
   */
  createProduct: async (formData) => {
    try {
      set({ loading: true, error: null });
      const response = await bankingClient.post('/products', formData);
      const newProduct = response.data.product;

      set((state) => ({
        products: [newProduct, ...state.products],
        loading: false,
      }));
      
      // Sincroniza el catálogo para asegurar que coincida con los filtros vigentes en pantalla
      get().fetchProducts();
      return newProduct;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Error al crear producto', 
        loading: false 
      });
      return null;
    }
  },

  /**
   * Modifica un activo existente por su ID.
   */
  updateProduct: async (id, formData) => {
    try {
      set({ loading: true, error: null });
      const response = await bankingClient.put(`/products/${id}`, formData);
      const updatedProduct = response.data.product;

      set((state) => ({
        products: state.products.map((p) => (p._id === id ? updatedProduct : p)),
        loading: false,
      }));
      
      get().fetchProducts();
      return updatedProduct;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Error al actualizar producto', 
        loading: false 
      });
      return null;
    }
  },

  /**
   * Remueve definitivamente un registro del catálogo de la aplicación.
   */
  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null });
      await bankingClient.delete(`/products/${id}`);
      
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Error al eliminar producto', 
        loading: false 
      });
      return false;
    }
  },

  /**
   * Setea filtros de búsqueda y dispara inmediatamente la recarga limpia de productos.
   */
  setFilters: (newFilters) => {
    set({ filters: newFilters });
    get().fetchProducts();
  },

  /**
   * Limpia el estado de error para liberar alertas en UI.
   */
  clearError: () => set({ error: null }),
}));

export default useProductStore;