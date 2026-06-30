/**
 * Ubicación: src/features/account/services/accountService.js
 * Servicio de gestión de cuentas bancarias adaptado para React Native.
 */

import { bankingClient } from '../../../shared/api/adminClient';
import { Platform } from 'react-native';

// Fallback dinámico para desarrollo en dispositivos móviles/emuladores
const getLocalhostFallback = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/SistemaBancarioAdmin/v1';
  return 'http://localhost:3000/SistemaBancarioAdmin/v1';
};

const defaultBankingBase = process.env.EXPO_PUBLIC_BANKING_API_BASE || 
                           process.env.VITE_BANKING_API_BASE || 
                           getLocalhostFallback();

function resolveBankingError(error, fallback) {
  if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
    return `No hay conexión con el servidor bancario (${defaultBankingBase}). Asegúrate de que el API de Node está corriendo y tu dispositivo tiene acceso a la red de desarrollo.`;
  }
  if (error.response?.status === 429) {
    return 'Demasiadas solicitudes al servidor bancario. Espera unos segundos y vuelve a intentarlo.';
  }
  return error.response?.data?.message || error.response?.data?.error || fallback || error.message;
}

function mapAccount(raw) {
  if (!raw) return null;
  const rawStatus = raw.status || raw.estado;
  const normalizedStatus =
    rawStatus === 'ACTIVA' || rawStatus === 'active' || raw?.isActive === true
      ? 'active'
      : rawStatus === 'PENDIENTE'
      ? 'pending'
      : rawStatus === 'BLOQUEADA' || rawStatus === 'CERRADA' || rawStatus === 'inactive' || raw?.isActive === false
      ? 'inactive'
      : 'active';

  return {
    id: raw.id || raw._id || raw.accountId,
    accountNumber: raw.accountNumber || raw.numeroCuenta || raw.numero || raw.account_number,
    type: raw.type || raw.accountType || raw.tipo || raw.account_type || 'CORRIENTE',
    currency: raw.currency || raw.moneda || raw.currencyCode || 'GTQ',
    status: normalizedStatus,
    balance: Number(raw.balance ?? raw.saldo ?? raw.amount ?? 0),
    ownerId: raw.userId || raw.ownerId || raw.usuarioId || raw.customerId,
    ownerName: raw.owner?.nombre || raw.owner?.name || raw.owner?.username || raw.ownerName || raw.username || raw.email || '',
    dailyLimit: Number(raw.dailyLimit ?? raw.limiteDiario ?? raw.daily_transfer_limit ?? raw.daily_limit ?? 0),
    monthlyLimit: Number(raw.monthlyLimit ?? raw.limiteMensual ?? raw.single_transfer_limit ?? raw.monthly_limit ?? 0),
    dailyTransferredAmount: Number(raw.dailyTransferredAmount ?? raw.montoTransferidoHoy ?? raw.daily_transferred_amount ?? 0),
    lastTransferDate: raw.lastTransferDate ?? raw.ultimaTransferencia ?? raw.last_transfer_date ?? null,
    createdAt: raw.createdAt || raw.created_at || raw.createdOn,
    raw,
  };
}

function normalizeListing(payload) {
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.accounts)
    ? data.accounts
    : Array.isArray(data?.rows)
    ? data.rows
    : [];
  const total = Number(data?.pagination?.total ?? data?.total ?? items.length);
  return { items: items.map(mapAccount), total, pagination: data?.pagination ?? null };
}

function buildParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });
  return params;
}

function unwrapAccountPayload(payload) {
  const data = payload?.data ?? payload;
  return data?.account ?? data?.data?.account ?? data;
}

export const accountService = {
  getMyAccounts: async (filters = {}) => {
    try {
      const response = await bankingClient.get('/accounts/me', {
        params: buildParams(filters),
      });
      return { success: true, data: normalizeListing(response.data) };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            items: [],
            total: 0,
            pagination: null,
          },
        };
      }
      console.error('Error fetching my accounts:', error);
      return { success: false, error: resolveBankingError(error, 'Error al obtener mis cuentas') };
    }
  },

  getMyInfo: async () => {
    try {
      const response = await bankingClient.get('/accounts/my-info');
      const payload = response.data;
      return {
        success: true,
        data: {
          summary: payload.summary || {
            totalAccounts: payload.totalAccounts ?? payload.accounts?.length ?? 0,
            totalBalance: Number(payload.totalBalance ?? payload.balance ?? 0),
          },
          profile: payload.profile ?? payload.user ?? payload.accountHolder,
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        const result = await accountService.getMyAccounts({ limit: 50 });
        if (!result.success) return result;
        const totalBalance = result.data.items.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);
        return {
          success: true,
          data: {
            summary: {
              totalAccounts: result.data.items.length,
              totalBalance,
            },
            profile: null,
          },
        };
      }
      console.error('Error fetching my account info:', error);
      return { success: false, error: resolveBankingError(error, 'Error al obtener mi información de cuentas') };
    }
  },

  getAccounts: async (filters = {}) => {
    try {
      const response = await bankingClient.get('/accounts/all', {
        params: buildParams(filters),
      });
      return { success: true, data: normalizeListing(response.data) };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return { success: false, error: resolveBankingError(error, 'Error al obtener cuentas') };
    }
  },

  getAccountById: async (accountId) => {
    try {
      const response = await bankingClient.get(`/accounts/${encodeURIComponent(accountId)}`);
      return { success: true, data: mapAccount(unwrapAccountPayload(response.data)) };
    } catch (error) {
      console.error('Error fetching account by id:', error);
      return { success: false, error: resolveBankingError(error, 'Error al obtener cuenta') };
    }
  },

  createAccount: async (accountData, { isAdmin } = {}) => {
    try {
      const basePayload = {
        account_type: accountData.type,
        currency: accountData.currency,
      };
      const payload = isAdmin
        ? {
            ...basePayload,
            balance: accountData.balance !== undefined ? Number(accountData.balance) : 0,
            userId: accountData.ownerId || undefined,
          }
        : basePayload;

      const route = isAdmin ? '/accounts' : '/accounts/my-account';
      const response = await bankingClient.post(route, payload);
      return { success: true, data: mapAccount(unwrapAccountPayload(response.data)) };
    } catch (error) {
      console.error('Error creating account:', error);
      return { success: false, error: resolveBankingError(error, 'Error al crear la cuenta') };
    }
  },

  updateAccount: async (accountId, accountData) => {
    try {
      const mapStatusToEstado = (status) => {
        if (status === 'active') return 'ACTIVA';
        if (status === 'inactive') return 'BLOQUEADA';
        return status;
      };

      const payload = {
        account_type: accountData.type,
        currency: accountData.currency,
        estado: accountData.status ? mapStatusToEstado(accountData.status) : undefined,
        daily_transfer_limit: accountData.dailyLimit !== undefined ? Number(accountData.dailyLimit) : undefined,
        single_transfer_limit: accountData.monthlyLimit !== undefined ? Number(accountData.monthlyLimit) : undefined,
        account_number: accountData.accountNumber || undefined,
      };
      const response = await bankingClient.put(`/accounts/${encodeURIComponent(accountId)}`, payload);
      return { success: true, data: mapAccount(unwrapAccountPayload(response.data)) };
    } catch (error) {
      console.error('Error updating account:', error);
      return { success: false, error: resolveBankingError(error, 'Error al actualizar la cuenta') };
    }
  },

  changeAccountStatus: async (accountId, newStatus) => {
    try {
      if (newStatus === 'active') {
        const response = await bankingClient.post(`/accounts/${encodeURIComponent(accountId)}/activate`);
        return { success: true, data: mapAccount(unwrapAccountPayload(response.data)) };
      }
      const response = await bankingClient.put(`/accounts/${encodeURIComponent(accountId)}`, {
        estado: 'BLOQUEADA',
      });
      return { success: true, data: mapAccount(unwrapAccountPayload(response.data)) };
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        return accountService.updateAccount(accountId, { status: newStatus });
      }
      console.error('Error changing account status:', error);
      return { success: false, error: resolveBankingError(error, 'Error al cambiar el estado de la cuenta') };
    }
  },

  getAccountTransactions: async (accountId, filters = {}) => {
    try {
      const response = await bankingClient.get(`/accounts/${encodeURIComponent(accountId)}/movements`, {
        params: buildParams(filters),
      });
      const payload = response.data;
      const transactions = payload.history ?? payload.transactions ?? payload.data?.transactions ?? payload.movements ?? [];
      return { success: true, data: { transactions, total: Number(payload.total_records ?? payload.total ?? transactions.length) } };
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const response = await bankingClient.get(`/transactions/history/${encodeURIComponent(accountId)}`, {
            params: buildParams(filters),
          });
          const payload = response.data;
          const transactions = payload.history ?? payload.transactions ?? payload.data?.transactions ?? [];
          return { success: true, data: { transactions, total: Number(payload.total_records ?? payload.total ?? transactions.length) } };
        } catch (innerError) {
          console.error('Error fetching account transactions fallback:', innerError);
        }
      }
      console.error('Error fetching account transactions:', error);
      return { success: false, error: resolveBankingError(error, 'Error al obtener movimientos de la cuenta') };
    }
  },
};