import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import useTransactionStore from '../store/useTransactionStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { isAdminUser } from '../../../shared/auth/roles';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

// Subcomponentes del módulo migrados previamente
import TransactionTable from '../components/TransactionTable';
import TransferForm from '../components/TransferForm';
// Notas de desarrollo: Reemplazar los placeholders por tus componentes móviles cuando se completen sus migraciones
import DepositForm from '../components/DepositForm'; 
import TransactionDetail from '../components/TransactionDetail';
import AdminDepositsScreen from './AdminDepositsScreen';

import { styles, colors } from './TransactionScreen.styles';

export default function TransactionScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('my-transactions'); 
  const [lastListTab, setLastListTab] = useState('my-transactions');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transferDestination, setTransferDestination] = useState('');

  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    type: '',
    user_id: '',
    from_date: '',
    to_date: '',
    transactionId: '',
    accountId: ''
  });

  const [filterDraft, setFilterDraft] = useState({
    type: '',
    user_id: '',
    from_date: '',
    to_date: '',
    transactionId: '',
    accountId: ''
  });

  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminUser(user);

  // Escucha parámetros iniciales simulando el comportamiento de useSearchParams
  useEffect(() => {
    if (route.params?.tab === 'transfer') {
      setActiveTab('transfer');
    }
    if (route.params?.dest) {
      setTransferDestination(route.params.dest.trim());
    }
  }, [route.params]);

  const {
    transactions,
    history,
    loading,
    error,
    pagination,
    fetchMyTransactions,
    fetchAllTransactions,
    fetchHistoryMe,
    fetchHistoryByAccountId,
    clearTransactionState
  } = useTransactionStore();

  useEffect(() => {
    return () => {
      clearTransactionState();
    };
  }, [clearTransactionState]);

  const apiFilters = useMemo(() => ({
    limit: filters.limit,
    offset: filters.offset,
    type: filters.type || undefined,
    user_id: filters.user_id || undefined,
    from_date: filters.from_date || undefined,
    to_date: filters.to_date || undefined
  }), [filters]);

  // Ejecución y fetch centralizado de datos
  useEffect(() => {
    if (activeTab === 'my-transactions') {
      if (isAdmin) {
        fetchAllTransactions(apiFilters);
      } else {
        fetchMyTransactions(apiFilters);
      }
    } else if (activeTab === 'history') {
      if (isAdmin) {
        if (filters.accountId?.trim()) {
          fetchHistoryByAccountId(filters.accountId.trim(), apiFilters);
        } else {
          fetchAllTransactions(apiFilters);
        }
      } else {
        fetchHistoryMe(apiFilters);
      }
    }
  }, [activeTab, apiFilters, isAdmin, fetchAllTransactions, fetchHistoryByAccountId, fetchHistoryMe, fetchMyTransactions, filters.accountId]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction._id || transaction.id);
  };

  const handleRefresh = () => {
    if (activeTab === 'my-transactions') {
      if (isAdmin) fetchAllTransactions(apiFilters);
      else fetchMyTransactions(apiFilters);
    } else if (activeTab === 'history') {
      if (isAdmin) {
        if (filters.accountId?.trim()) {
          fetchHistoryByAccountId(filters.accountId.trim(), apiFilters);
        } else {
          fetchAllTransactions(apiFilters);
        }
      } else {
        fetchHistoryMe(apiFilters);
      }
    }
  };

  const handleOperationSuccess = () => {
    const targetTab = lastListTab === 'history' ? 'history' : 'my-transactions';
    setFilters((prev) => ({ ...prev, offset: 0 }));
    setActiveTab(targetTab);
  };

  const handlePageChange = (newOffset) => {
    if (newOffset < 0 || (newOffset + filters.limit > pagination.total && pagination.total > 0)) {
      return;
    }
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      ...filterDraft,
      offset: 0
    }));
  };

  const handleClearFilters = () => {
    const clean = { type: '', user_id: '', from_date: '', to_date: '', transactionId: '', accountId: '' };
    setFilterDraft(clean);
    setFilters((prev) => ({ ...prev, ...clean, offset: 0 }));
  };

  // Filtrado reactivo en memoria local
  const rawRows = activeTab === 'history'
    ? (isAdmin && !filters.accountId?.trim() ? transactions : history)
    : transactions;

  const rows = filters.transactionId?.trim()
    ? rawRows.filter((tx) => String(tx.id || tx._id || '').toLowerCase().includes(filters.transactionId.trim().toLowerCase()))
    : rawRows;

  const showPagination = !filters.transactionId?.trim() && pagination.total > filters.limit;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Transacciones</Text>
          <Text style={styles.subtitle}>Historial, depósitos y transferencias.</Text>
        </View>
        <TouchableOpacity 
          style={styles.btnFavorites} 
          onPress={() => navigateToMainTab(navigation, 'Favorites')}
        >
          <Text>⭐</Text>
          <Text style={styles.btnFavoritesText}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR CARD */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* TABS SELECTOR (Horizontal Scroll) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'my-transactions' && styles.tabButtonActive]}
          onPress={() => { setLastListTab('my-transactions'); setActiveTab('my-transactions'); setFilters(p => ({...p, offset: 0})); }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'my-transactions' && styles.tabButtonTextActive]}>
            {isAdmin ? 'Transacciones Sistema' : 'Mis Movimientos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => { setLastListTab('history'); setActiveTab('history'); setFilters(p => ({...p, offset: 0})); }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>Historial</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'deposit' && styles.tabButtonActive]}
            onPress={() => setActiveTab('deposit')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'deposit' && styles.tabButtonTextActive]}>Crear Depósito</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'transfer' && styles.tabButtonActive]}
          onPress={() => setActiveTab('transfer')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'transfer' && styles.tabButtonTextActive]}>Transferir</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'admin-deposits' && styles.tabButtonActive]}
            onPress={() => setActiveTab('admin-deposits')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'admin-deposits' && styles.tabButtonTextActive]}>Depósitos Admin</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FILTROS AVANZADOS (Solo Admin en vistas de lista) */}
      {(activeTab === 'my-transactions' || activeTab === 'history') && isAdmin && (
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.filterInput}
            value={filterDraft.transactionId}
            onChangeText={(val) => setFilterDraft(p => ({ ...p, transactionId: val }))}
            placeholder="Filtrar por ID de transacción"
            placeholderTextColor={colors.muted}
          />
          <TextInput
            style={styles.filterInput}
            value={filterDraft.user_id}
            onChangeText={(val) => setFilterDraft(p => ({ ...p, user_id: val }))}
            placeholder="Filtrar por user_id"
            placeholderTextColor={colors.muted}
          />
          {activeTab === 'history' && (
            <TextInput
              style={styles.filterInput}
              value={filterDraft.accountId}
              onChangeText={(val) => setFilterDraft(p => ({ ...p, accountId: val }))}
              placeholder="Historial por ID de cuenta"
              placeholderTextColor={colors.muted}
            />
          )}
          {/* Input alternativo simple de tipo para Mobile */}
          <TextInput
            style={styles.filterInput}
            value={filterDraft.type}
            onChangeText={(val) => setFilterDraft(p => ({ ...p, type: val }))}
            placeholder="Tipo (TRANSFERENCIA, DEPOSITO...)"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
          />

          <View style={styles.filterActionsRow}>
            <TouchableOpacity style={styles.btnApply} onPress={handleApplyFilters}>
              <Text style={styles.btnApplyText}>Filtrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnClear} onPress={handleClearFilters}>
              <Text style={styles.btnClearText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CONTENEDOR DINÁMICO DE SECCIÓN */}
      <View style={styles.sectionCard}>
        
        {/* Pestaña: Mis Transacciones */}
        {activeTab === 'my-transactions' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{isAdmin ? 'Panel de Sistema' : 'Mis Transacciones'}</Text>
              <TouchableOpacity style={styles.btnRefresh} onPress={handleRefresh} disabled={loading}>
                <Text style={styles.btnRefreshText}>{loading ? '...' : 'Actualizar'}</Text>
              </TouchableOpacity>
            </View>
            
            <TransactionTable
              transactions={rows}
              loading={loading}
              onTransactionClick={handleTransactionClick}
            />
          </View>
        )}

        {/* Pestaña: Historial */}
        {activeTab === 'history' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Historial General</Text>
              <TouchableOpacity style={styles.btnRefresh} onPress={handleRefresh} disabled={loading}>
                <Text style={styles.btnRefreshText}>{loading ? '...' : 'Actualizar'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.infoText}>
              {isAdmin ? 'Historial consolidado global de auditoría.' : 'Registros y movimientos cronológicos de tu cuenta.'}
            </Text>

            <TransactionTable
              transactions={rows}
              loading={loading}
              onTransactionClick={handleTransactionClick}
              emptyMessage="No hay movimientos para los filtros seleccionados"
            />
          </View>
        )}

        {/* Pestaña: Crear Depósito (Ventanilla Admin) */}
        {activeTab === 'deposit' && isAdmin && <DepositForm onSuccess={handleOperationSuccess} />}

        {/* Pestaña: Realizar Transferencia */}
        {activeTab === 'transfer' && (
          <TransferForm
            onSuccess={handleOperationSuccess}
            initialDestinationAccountId={transferDestination}
          />
        )}

        {/* Pestaña: Depósitos Admin */}
        {activeTab === 'admin-deposits' && isAdmin && <AdminDepositsScreen />}

        {/* COMPONENTE DE PAGINACIÓN */}
        {showPagination && (activeTab === 'my-transactions' || activeTab === 'history') && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.btnPage, filters.offset === 0 && styles.btnPageDisabled]}
              disabled={filters.offset === 0}
              onPress={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
            >
              <Text style={styles.btnPageText}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              Pág. {Math.floor(filters.offset / filters.limit) + 1}
            </Text>

            <TouchableOpacity
              style={[styles.btnPage, filters.offset + filters.limit >= pagination.total && styles.btnPageDisabled]}
              disabled={filters.offset + filters.limit >= pagination.total}
              onPress={() => handlePageChange(filters.offset + filters.limit)}
            >
              <Text style={styles.btnPageText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL DETALLE DE TRANSACCIÓN */}
      {selectedTransaction && (
        <TransactionDetail
          transactionId={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </ScrollView>
  );
}