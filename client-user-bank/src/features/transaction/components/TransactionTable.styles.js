import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',      // Turquesa / Azul vibrante unificado
  primaryBg: 'rgba(0, 173, 181, 0.12)',
  success: '#1FA187',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#E11D48',
  dangerBg: 'rgba(225, 29, 72, 0.12)',
};

export const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
  },
  // Contenedor de estado de carga
  centerContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Contenedor de lista vacía
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  // Tarjetas / Filas de Transacción Móvil
  txItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  // Fila superior izquierda (Tipo e ID corta)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idText: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: 'monospace',
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  // Montos y Badges
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  // Botón de acción ver detalles
  btnView: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnViewText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});