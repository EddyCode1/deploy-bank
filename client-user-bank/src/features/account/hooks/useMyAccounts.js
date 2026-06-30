import { useCallback, useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import { accountService } from '../services/accountService';
import { ACCOUNTS_UPDATED_EVENT } from '../../../shared/events/bankingEvents';

export function useMyAccounts({ autoLoad = true, limit = 50 } = {}) {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [summaryLoading, setSummaryLoading] = useState(autoLoad);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await accountService.getMyAccounts({ limit });
      if (result.success) {
        setAccounts(result.data.items);
      } else {
        Alert.alert('Error', result.error || 'No se pudieron cargar tus cuentas');
      }
    } catch {
      Alert.alert('Error', 'Error al consultar mis cuentas');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const result = await accountService.getMyInfo();
      if (result.success) {
        setSummary(result.data.summary);
      } else {
        Alert.alert('Error', result.error || 'No se pudo cargar tu resumen');
      }
    } catch {
      Alert.alert('Error', 'Error al cargar mi información');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadAccounts();
    await loadSummary();
  }, [loadAccounts, loadSummary]);

  useEffect(() => {
    if (!autoLoad) return undefined;
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [autoLoad, refresh]);

  useEffect(() => {
    if (!autoLoad) return undefined;

    const subscription = DeviceEventEmitter.addListener(ACCOUNTS_UPDATED_EVENT, () => {
      void refresh();
    });

    return () => subscription.remove();
  }, [autoLoad, refresh]);

  return {
    accounts,
    summary,
    loading,
    summaryLoading,
    refresh,
    reloadAccounts: loadAccounts,
    reloadSummary: loadSummary,
  };
}