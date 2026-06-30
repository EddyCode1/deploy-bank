import { StyleSheet } from 'react-native';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  warning: '#FFBB00',
};

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 24,
    gap: 6,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoDays: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  footerNote: {
    backgroundColor: 'rgba(255, 187, 0, 0.05)',
    borderColor: 'rgba(255, 187, 0, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
    gap: 6,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    textAlign: 'justify',
  },
});