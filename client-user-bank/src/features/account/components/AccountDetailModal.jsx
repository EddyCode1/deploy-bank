import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';

// Paleta de colores adaptada (puedes migrarla luego a tu shared/constants/theme.js)
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', // Turquesa institucional
  success: '#4E9F3D', // Verde éxito
  danger: '#D9534F',  // Rojo peligro
  white: '#FFFFFF',
  cardBg: '#252525',
};

export default function AccountDetailModal({
  isOpen,
  onClose,
  account,
  isAdmin = false,
  onEdit,
  onStatusChange,
  transactions = [],
  transactionsLoading = false,
  error = null,
}) {
  // Lógica intacta de renderizado condicional
  if (!isOpen || !account) return null;

  // Lógica de negocio intacta
  const handleToggleStatus = () => {
    const nextStatus = account.status === 'active' ? 'inactive' : 'active';
    onStatusChange(account, nextStatus);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Contenedor fijo de fondo (Backdrop) */}
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          
          {/* Cabecera Estática / Sticky Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Detalle de cuenta</Text>
              <Text style={styles.headerSubtitle}>
                {account.accountNumber || 'Sin número de cuenta'}
              </Text>
            </View>
            
            {/* Contenedor de Botones de Acción de la Cabecera */}
            <View style={styles.actionButtonGroup}>
              {isAdmin && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onClick={handleToggleStatus} // React Native soporta onPress, pero mantenemos onClick si tus utilidades lo mapean, o puedes cambiarlo a onPress si lo prefieres. Mantenemos compatibilidad lógica.
                  onPress={handleToggleStatus} 
                  style={[
                    styles.btnBorder,
                    { borderColor: account.status === 'active' ? colors.success : colors.danger }
                  ]}
                >
                  <Text style={{ 
                    color: account.status === 'active' ? colors.success : colors.danger,
                    fontWeight: '600',
                    fontSize: 14 
                  }}>
                    {account.status === 'active' ? 'Desactivar' : 'Activar'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onEdit(account)}
                style={[styles.btnBase, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.btnTextWhite}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[styles.btnBorder, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 14 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cuerpo con Scroll (Equivalente al overflow-y-auto) */}
          <ScrollView contentContainerStyle={styles.scrollBody}>
            
            {/* Sección: Información General */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Información general</Text>
              <View style={styles.grid}>
                
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Número</Text>
                  <Text style={styles.value}>{account.accountNumber}</Text>
                </View>
                
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Tipo</Text>
                  <Text style={styles.value}>{account.type}</Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Moneda</Text>
                  <Text style={styles.value}>{account.currency}</Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Estado</Text>
                  <Text style={styles.value}>{account.status}</Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Saldo</Text>
                  <Text style={styles.value}>
                    {Number(account.balance).toLocaleString('es-GT', { style: 'currency', currency: account.currency || 'GTQ' })}
                  </Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Cliente</Text>
                  <Text style={styles.value}>{account.ownerName || 'No asignado'}</Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Límite diario</Text>
                  <Text style={styles.value}>{account.dailyLimit ?? 0}</Text>
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.label}>Límite mensual</Text>
                  <Text style={styles.value}>{account.monthlyLimit ?? 0}</Text>
                </View>

              </View>
            </View>

            {/* Sección: Movimientos Recientes */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Movimientos recientes</Text>
              
              {transactionsLoading ? (
                <Text style={styles.infoText}>Cargando movimientos...</Text>
              ) : error ? (
                <Text style={[styles.infoText, { color: colors.danger }]}>{error}</Text>
              ) : transactions.length === 0 ? (
                <Text style={styles.infoText}>No hay movimientos disponibles para esta cuenta.</Text>
              ) : (
                <View style={styles.listContainer}>
                  {transactions.map((tx) => (
                    <View 
                      key={tx.id || tx._id || tx.transactionId} 
                      style={styles.transactionItem}
                    >
                      <View style={styles.rowJustify}>
                        <Text style={styles.txDescription}>{tx.description || tx.concept || 'Movimiento'}</Text>
                        <Text style={styles.txDate}>
                          {new Date(tx.createdAt || tx.date || tx.timestamp).toLocaleDateString('es-GT')}
                        </Text>
                      </View>
                      
                      <View style={[styles.rowJustify, { marginTop: 8 }]}>
                        <Text style={styles.txType}>{tx.type || tx.transactionType || tx.transaction_type || '—'}</Text>
                        <Text style={[
                          styles.txAmount, 
                          { color: (Number(tx.amount ?? tx.transaction_amount ?? tx.value ?? 0)) >= 0 ? colors.success : colors.danger }
                        ]}>
                          {(Number(tx.amount ?? tx.transaction_amount ?? tx.value ?? 0)).toLocaleString('es-GT', {
                            style: 'currency',
                            currency: tx.currency || tx.currency_to || tx.currency_from || account.currency || 'GTQ',
                          })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Sección: Resumen de la cuenta */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumen de la cuenta</Text>
              <View style={styles.summaryContainer}>
                <Text style={styles.label}>Creada el:</Text>
                <Text style={styles.summaryValue}>
                  {account.createdAt ? new Date(account.createdAt).toLocaleString('es-GT') : 'No disponible'}
                </Text>
                
                <Text style={[styles.label, { marginTop: 12 }]}>ID interno:</Text>
                <Text style={styles.summaryValue}>{account.id}</Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.85,
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  btnBase: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBorder: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextWhite: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollBody: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  gridCol: {
    width: '50%',
    paddingRight: 8,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.muted,
  },
  listContainer: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  rowJustify: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  txDate: {
    fontSize: 12,
    color: colors.muted,
  },
  txType: {
    fontSize: 13,
    color: colors.muted,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    gap: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  }
});