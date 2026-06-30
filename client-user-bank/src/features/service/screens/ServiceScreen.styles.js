import { StyleSheet, Platform } from 'react-native';

export const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  danger: '#E11D48',
  success: '#1FA187',
  successBg: 'rgba(31, 161, 135, 0.15)',
  dangerBg: 'rgba(225, 29, 72, 0.15)',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  btnPrimaryInline: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
  },
  // Catálogo de Servicios
  catalogItem: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  catalogItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 173, 181, 0.05)',
  },
  catalogItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // Formularios
  formGap: {
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnSubmitDisabled: {
    opacity: 0.5,
  },
  receiptSection: {
    marginTop: 20,
    gap: 12,
  },
  // Tabla / Historial alternativo para Mobile
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    gap: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTextMain: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  historyTextMuted: {
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  // Modal Admin
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnCancel: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnActionAdmin: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});