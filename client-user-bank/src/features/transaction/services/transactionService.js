import { Alert } from 'react-native';
import { bankingClient } from '../../../shared/api/adminClient';

/** Mensaje cuando el servidor Node (MongoDB) no responde en el entorno Mobile. */
function bankingUnreachableMessage() {
  // Nota: En emuladores Android, 'localhost' debe mapearse a '10.0.2.2' o la IP de tu red Wi-Fi local
  return `No hay conexión con el servidor bancario. Asegúrate de que el API Node esté corriendo en tu máquina de desarrollo, que MongoDB esté activo y que el cliente apunte a la IP correcta de la red local.`;
}

function resolveBankingError(error, fallback) {
  if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
    return bankingUnreachableMessage();
  }
  return error.response?.data?.message || fallback;
}

/**
 * El backend Node pagina con `page`; el store usa offset/limit.
 */
function offsetToPage(offset, limit) {
  const l = limit && limit > 0 ? limit : 10;
  const o = offset ?? 0;
  return Math.floor(o / l) + 1;
}

function normalizeTransaction(raw) {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id || raw._id || raw.transaction_id,
    type: raw.type || raw.transaction_type || raw.transactionType || 'N/A',
    amount: Number(raw.amount ?? raw.transaction_amount ?? 0),
    status: raw.status || (raw.reverted ? 'reverted' : 'completed'),
    currency: raw.currency || raw.currency_to || raw.currency_from || raw.account_id?.currency || 'GTQ',
    createdAt: raw.createdAt || raw.created_at || raw.date || raw.timestamp,
    description: raw.description || raw.transaction_name || raw.concept || raw.reference || '',
  };
}

function normalizePendingDeposit(raw) {
  if (!raw) return null;
  const account = raw.account_id;
  return {
    ...raw,
    id: raw._id || raw.id,
    amount: Number(raw.transaction_amount ?? raw.amount ?? 0),
    accountNumber: account?.account_number || raw.account_number || raw.to_account || raw.from_account || 'N/A',
    currencyFrom: raw.currency_from || raw.currency || 'GTQ',
    currencyTo: raw.currency_to || account?.currency || raw.currency || 'GTQ',
    secondsRemaining: Number(raw.secondsRemaining ?? 0),
    canRevert: Boolean(raw.canRevert ?? raw.revertible),
    createdAt: raw.createdAt || raw.created_at,
  };
}

function mapDepositBody(depositData) {
  if (!depositData) {
    throw new Error('Los datos del depósito no pueden estar vacíos');
  }

  const accountNumber = String(depositData.accountNumber ?? depositData.accountId ?? '').trim();
  if (!accountNumber) {
    throw new Error('El número de cuenta es requerido');
  }

  const rawAmount = depositData.amount;
  const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount));
  
  if (isNaN(amount)) {
    throw new Error('El monto debe ser un número válido');
  }
  
  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }

  const descriptionParts = [depositData.reference, depositData.concept].filter(
    (x) => x != null && String(x).trim() !== ''
  );
  const description = descriptionParts.length ? descriptionParts.join(' — ') : undefined;

  const body = {
    accountNumber,
    amount,
    currency: depositData.currency ?? 'GTQ',
  };
  if (description) body.description = description;
  
  return body;
}

function mapTransferBody(transferData) {
  if (!transferData) {
    throw new Error('Los datos de la transferencia no pueden estar vacíos');
  }

  const fromAccount = String(transferData.fromAccount ?? transferData.sourceAccountNumber ?? transferData.sourceAccountId ?? '').trim();
  if (!fromAccount) {
    throw new Error('La cuenta origen es requerida');
  }

  const toAccount = String(transferData.toAccount ?? transferData.destinationAccountNumber ?? transferData.destinationAccountId ?? '').trim();
  if (!toAccount) {
    throw new Error('La cuenta destino es requerida');
  }

  if (fromAccount === toAccount) {
    throw new Error('La cuenta destino debe ser diferente a la cuenta origen');
  }

  const rawAmount = transferData.amount;
  const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount));
  
  if (isNaN(amount)) {
    throw new Error('El monto debe ser un número válido');
  }
  
  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }

  const descriptionParts = [transferData.reference, transferData.concept].filter(
    (x) => x != null && String(x).trim() !== ''
  );
  const description = descriptionParts.length ? descriptionParts.join(' — ') : undefined;

  const body = {
    fromAccount,
    toAccount,
    amount,
    currency: transferData.currency ?? 'GTQ',
  };
  if (description) body.description = description;
  
  return body;
}

export const transactionService = {
  getMyTransactions: async (filters = {}) => {
    const limit = filters.limit || 50;
    const offset = filters.offset ?? 0;
    try {
      const response = await bankingClient.get('/transactions/my-transactions', {
        params: {
          page: offsetToPage(offset, limit),
          limit,
          ...filters,
        },
      });
      const payload = response.data;
      const transactions = payload.transactions ?? payload.data ?? [];
      const total = payload.pagination?.total ?? payload.total ?? transactions.length ?? 0;
      
      return {
        success: true,
        data: {
          transactions: Array.isArray(transactions) ? transactions.map(normalizeTransaction).filter(Boolean) : [],
          total: total,
          summary: payload.summary,
          pagination: payload.pagination,
        },
      };
    } catch (error) {
      console.error('Error fetching my transactions:', error);
      return {
        success: false,
        error: resolveBankingError(error, 'Error al obtener transacciones'),
      };
    }
  },

  getTransactionById: async (id) => {
    try {
      const response = await bankingClient.get(`/transactions/${id}`);
      const payload = response.data;
      const tx = payload.transaction ?? payload.data?.transaction ?? payload;
      return { success: true, data: normalizeTransaction(tx) };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      const msg = resolveBankingError(error, 'Error al obtener transacción');
      Alert.alert('Error', msg);
      return {
        success: false,
        error: msg,
      };
    }
  },

  getAllTransactions: async (filters = {}) => {
    const limit = filters.limit || 50;
    const offset = filters.offset ?? 0;
    try {
      const response = await bankingClient.get('/transactions/all', {
        params: {
          page: offsetToPage(offset, limit),
          limit,
          ...filters,
        },
      });
      const payload = response.data;
      const transactions = payload.transactions ?? payload.data ?? [];
      const total = payload.pagination?.total ?? payload.total ?? transactions.length ?? 0;
      
      return {
        success: true,
        data: {
          transactions: Array.isArray(transactions) ? transactions.map(normalizeTransaction).filter(Boolean) : [],
          total: total,
          pagination: payload.pagination,
        },
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return {
        success: false,
        error: resolveBankingError(error, 'Error al obtener transacciones'),
      };
    }
  },

  getHistoryMe: async (filters = {}) => {
    try {
      const response = await bankingClient.get('/transactions/history/me', {
        params: { limit: filters.limit || 50, offset: filters.offset || 0, ...filters },
      });
      const payload = response.data;
      const history = payload.history ?? payload.transactions ?? payload.data ?? [];
      const total = payload.total_records ?? payload.total ?? payload.pagination?.total ?? history.length;
      
      return {
        success: true,
        data: {
          transactions: Array.isArray(history) ? history.map(normalizeTransaction).filter(Boolean) : [],
          total: total,
        },
      };
    } catch (error) {
      console.error('Error fetching my history:', error);
      return {
        success: false,
        error: resolveBankingError(error, 'Error al obtener historial'),
      };
    }
  },

  getHistoryByAccountId: async (accountId, filters = {}) => {
    try {
      const response = await bankingClient.get(`/transactions/history/${accountId}`, {
        params: { limit: filters.limit || 50, offset: filters.offset || 0, ...filters },
      });
      const payload = response.data;
      const history = payload.history ?? payload.transactions ?? payload.data ?? [];
      const total = payload.total_records ?? payload.total ?? payload.pagination?.total ?? history.length;
      
      return {
        success: true,
        data: {
          transactions: Array.isArray(history) ? history.map(normalizeTransaction).filter(Boolean) : [],
          total: total,
        },
      };
    } catch (error) {
      console.error('Error fetching account history:', error);
      return {
        success: false,
        error: resolveBankingError(error, 'Error al obtener historial'),
      };
    }
  },

  createDeposit: async (depositData) => {
    try {
      const body = mapDepositBody(depositData);
      const response = await bankingClient.post('/transactions/deposit', body);
      Alert.alert('Éxito', 'Depósito creado exitosamente');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating deposit:', error);
      
      if (error.message && error.message.includes('requerido')) {
        const msg = error.message;
        Alert.alert('Validación', msg);
        return { success: false, error: msg };
      }
      
      const msg = resolveBankingError(error, 'Error al crear depósito');
      Alert.alert('Error', msg);
      return { success: false, error: msg };
    }
  },

  createTransfer: async (transferData) => {
    try {
      const body = mapTransferBody(transferData);
      const response = await bankingClient.post('/accounts/transfer', body);
      Alert.alert('Éxito', 'Transferencia realizada exitosamente');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating transfer:', error);
      
      if (error.message && (error.message.includes('requerido') || error.message.includes('diferente'))) {
        const msg = error.message;
        Alert.alert('Validación', msg);
        return { success: false, error: msg };
      }
      
      const msg = resolveBankingError(error, 'Error al realizar transferencia');
      Alert.alert('Error', msg);
      return { success: false, error: msg };
    }
  },

  getPendingDeposits: async () => {
    try {
      const response = await bankingClient.get('/deposits/pending');
      const payload = response.data || {};
      const rows = Array.isArray(payload.deposits) ? payload.deposits : [];
      return {
        success: true,
        data: {
          deposits: rows.map(normalizePendingDeposit).filter(Boolean),
          count: Number(payload.count ?? rows.length ?? 0),
        },
      };
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
      const msg = resolveBankingError(error, 'Error al obtener depósitos pendientes');
      return { success: false, error: msg };
    }
  },

  revertDeposit: async (transactionId) => {
    try {
      const response = await bankingClient.post('/deposits/revert', { transactionId });
      Alert.alert('Éxito', 'Depósito revertido correctamente');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error reverting deposit:', error);
      const msg = resolveBankingError(error, 'Error al revertir depósito');
      Alert.alert('Error', msg);
      return { success: false, error: msg };
    }
  },

  updateDepositAmount: async (transactionId, amount) => {
    try {
      const response = await bankingClient.put(`/deposits/${transactionId}`, { amount });
      Alert.alert('Éxito', 'Depósito actualizado correctamente');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating deposit:', error);
      const msg = resolveBankingError(error, 'Error al actualizar depósito');
      Alert.alert('Error', msg);
      return { success: false, error: msg };
    }
  },
};