import { bankingClient } from '../../../shared/api/adminClient';

function parseError(error, fallback) {
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
    return 'No hay conexión con el servidor bancario';
  }
  return error?.response?.data?.message || fallback || error?.message || 'Error desconocido';
}

function normalizeHistory(payload) {
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.transactions)
    ? data.transactions
    : Array.isArray(data?.history)
    ? data.history
    : Array.isArray(data?.items)
    ? data.items
    : [];
  return items.map((item) => ({
    id: item.id || item._id,
    date: item.date || item.createdAt?.split('T')[0] || '',
    description: item.description || item.transaction_name || item.concept || '',
    type: item.type || item.transaction_type || '',
    amount: Number(item.amount ?? item.transaction_amount ?? 0),
    currency: item.currency || item.currency_from || 'GTQ',
    status: item.status || 'Completado',
    category: item.category || '',
  }));
}

export const financialService = {
  getCreditCards: async () => {
    try {
      const response = await bankingClient.get('/credit-cards/me');
      const cards = response.data?.cards ?? response.data?.items ?? [];
      return { success: true, data: cards };
    } catch (error) {
      return { success: false, error: parseError(error, 'No se pudieron cargar las tarjetas'), data: [] };
    }
  },

  getLoans: async () => {
    try {
      const response = await bankingClient.get('/loans/me');
      const loans = response.data?.loans ?? response.data?.items ?? [];
      return { success: true, data: loans };
    } catch (error) {
      return { success: false, error: parseError(error, 'No se pudieron cargar los préstamos'), data: [] };
    }
  },

  getFinancialHistory: async (filters = {}) => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type && filters.type !== 'Todos') params.type = filters.type;
      if (filters.search) params.search = filters.search;

      const response = await bankingClient.get('/transactions/history/me', { params });
      return { success: true, data: normalizeHistory(response.data) };
    } catch (error) {
      if (error?.response?.status === 404) {
        return { success: true, data: [] };
      }
      return { success: false, error: parseError(error, 'No se pudo cargar el historial'), data: [] };
    }
  },
};