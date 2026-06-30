import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', // Turquesa
  danger: '#E11D48',
  warning: '#F59E0B',
};

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 20,
    lineHeight: 18,
  },
  formGap: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  hintText: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  btnSubmit: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnSubmitDisabled: {
    opacity: 0.5,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: colors.danger,
  },
  balanceText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  limitText: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  dailyLimitBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  dailyLimitRow: {
    fontSize: 12,
    color: colors.muted,
  },
  dailyLimitLabel: {
    fontWeight: '600',
  },
  dailyLimitDanger: {
    color: colors.danger,
    fontWeight: '700',
  },
  dailyLimitWarning: {
    color: colors.warning,
    fontWeight: '600',
  },
});