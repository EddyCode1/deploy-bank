import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  success: '#22C55E', // Ingresos
  danger: '#EF4444',  // Egresos
};

export default function FinancialHistoryList({ items }) {
  
  // Estado vacío estructurado para entorno móvil
  if (!items || !items.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay movimientos en el rango seleccionado.
        </Text>
      </View>
    );
  }

  // Renderizador de cada tarjeta (antigua fila de la tabla)
  const renderItem = ({ item }) => {
    const isNegative = item.amount < 0;
    const formattedAmount = Math.abs(item.amount).toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <View style={styles.historyCard}>
        {/* Fila Superior: Descripción y Monto */}
        <View style={styles.cardRow}>
          <Text style={styles.description} numberOfLines={1}>
            {item.description || 'Transacción'}
          </Text>
          <Text style={[styles.amount, isNegative ? styles.textDanger : styles.textSuccess]}>
            {isNegative ? '-' : '+'}{item.currency === 'GTQ' ? 'Q' : '$'}{formattedAmount}
          </Text>
        </View>

        {/* Fila Inferior: Detalles del movimiento */}
        <View style={styles.cardFooter}>
          <View style={styles.metaGroup}>
            <Text style={styles.metaText}>{item.date}</Text>
            <Text style={styles.divider}>•</Text>
            <Text style={styles.metaText}>{item.type}</Text>
            <Text style={styles.divider}>•</Text>
            <Text style={styles.metaText}>{item.currency}</Text>
          </View>
          
          {/* Badge del Estado */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false} // Se desactiva si se va a embeber dentro de un ScrollView global de la pantalla financial
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 10,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  textSuccess: {
    color: colors.success,
  },
  textDanger: {
    color: colors.danger,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.muted,
  },
  divider: {
    fontSize: 12,
    color: colors.border,
    marginHorizontal: 6,
  },
  statusBadge: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'capitalize',
  },
});