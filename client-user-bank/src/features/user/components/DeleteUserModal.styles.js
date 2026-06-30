import { StyleSheet } from 'react-native';

export const colors = {
  overlay: 'rgba(0, 0, 0, 0.6)',
  surface: '#1E1E1E',       // Fondo mate oscuro
  card: '#262626',          // Gris claro/fondo secundario
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  danger: '#E11D48',        // Rojo peligro/destructivo
  dangerLight: 'rgba(225, 29, 72, 0.1)',
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.muted,
  },
  warningCard: {
    backgroundColor: colors.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  btnConfirm: {
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  btnConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});