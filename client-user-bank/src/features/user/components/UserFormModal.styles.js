import { StyleSheet } from 'react-native';

export const colors = {
  overlay: 'rgba(0, 0, 0, 0.6)',
  surface: '#1E1E1E',       // Fondo mate del modal
  bg: '#121212',            // Fondo de los inputs
  border: '#2A2A2A',
  primary: '#06B6D4',       // Turquesa / Cyan corporativo
  text: '#FFFFFF',
  muted: '#A0A0A0',
  danger: '#E11D48',
  success: '#10B981',
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  btnCloseText: {
    fontSize: 24,
    color: colors.muted,
    lineHeight: 24,
  },
  scrollForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  labelMuted: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: '#262626',
    color: colors.muted,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputTextArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  currencyInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 14,
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
    zIndex: 1,
  },
  inputCurrency: {
    paddingLeft: 30,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  helperText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  successText: {
    fontSize: 11,
    color: colors.success,
    marginTop: 4,
    fontWeight: '500',
  },
  // Selector alternativo al <select> HTML
  selectorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  selectorOption: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectorOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  selectorTextActive: {
    color: colors.primary,
  },
  serverErrorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  serverErrorText: {
    fontSize: 13,
    color: '#FC8181',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  btnSubmit: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});