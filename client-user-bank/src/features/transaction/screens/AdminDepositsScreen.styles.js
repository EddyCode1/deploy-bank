import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', // Turquesa vibrante para acciones principales
  danger: '#E11D48',
  dangerBg: 'rgba(225, 29, 72, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  // Panel Superior / Header Card
  headerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 2,
  },
  btnRefresh: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Banner de Alerta / Error
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  // Mensaje Vacío
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  // Tarjetas de Depósitos (Reemplazo de filas de la Tabla)
  depositCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.muted,
  },
  accountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  conversionText: {
    fontSize: 12,
    color: colors.muted,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  // Estado / Temporizador
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Modificadores de Edición Inline integrados en tarjeta
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    height: 40,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  // Botones y Acciones
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  btnAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  btnActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});