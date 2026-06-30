import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles, colors } from './TransactionTable.styles';

export default function TransactionTable({
  transactions,
  loading,
  onTransactionClick,
  emptyMessage = 'No hay transacciones disponibles'
}) {

  // Formateadores de fecha y dinero unificados (es-GT)
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // prueba de commit ft/zeta nuevo 
  const formatCurrency = (amount, currency = 'GTQ') => {
    const validAmount = typeof amount === 'number' ? amount : 0;
    const prefix = currency === 'GTQ' ? 'Q' : '$';
    return `${prefix} ${validAmount.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Render en estado de Carga
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Render en estado de Arreglo Vacío
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  // Renderizador de filas individuales iteradas por el FlatList
  const renderItem = ({ item }) => {
    const txId = item._id || item.id;
    const txType = item.type || item.transactionType || item.transaction_type || 'N/A';
    const txAmount = Number(item.amount ?? item.transaction_amount ?? 0);
    const txCurrency = item.currency || item.currency_to || item.currency_from || item.account_id?.currency || 'GTQ';
    const txStatus = (item.status || 'completed').toLowerCase();
    const txDate = item.createdAt || item.date;

    // Lógica dinámica de colores del badge de estado
    const isCompleted = txStatus === 'completed' || txStatus === 'completada';
    const isPending = txStatus === 'pending';
    const statusBg = isCompleted ? 'rgba(31, 161, 135, 0.12)' : (isPending ? colors.warningBg : colors.dangerBg);
    const statusTextColor = isCompleted ? colors.success : (isPending ? colors.warning : colors.danger);

    return (
      <View style={styles.txItem}>
        {/* COLUMNA IZQUIERDA: Tipo, ID, Fecha */}
        <View style={styles.leftColumn}>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{txType}</Text>
            </View>
            <Text style={styles.idText}>...{String(txId).slice(-8).toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(txDate)}</Text>
        </View>

        {/* COLUMNA DERECHA: Montos, Status badge y botón interactivo */}
        <View style={styles.rightColumn}>
          <Text style={[styles.amountText, { color: txAmount >= 0 ? colors.primary : colors.danger }]}>
            {formatCurrency(txAmount, txCurrency)}
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
              {txStatus}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.btnView} 
            onPress={() => onTransactionClick?.(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnViewText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => String(item._id || item.id)}
      renderItem={renderItem}
      style={styles.listContainer}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
    />
  );
}