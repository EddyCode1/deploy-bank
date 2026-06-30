import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  successBg: 'rgba(34, 197, 94, 0.15)',
  successText: '#22C55E',
  skyBg: 'rgba(0, 173, 181, 0.15)',
  skyText: '#00ADB5',
};

export const financialStyles = StyleSheet.create({
  // .financial-page (Contenedor con scroll adaptado a la pantalla)
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingHorizontal: windowWidth > 640 ? 24 : 16,
    paddingVertical: windowWidth > 640 ? 32 : 24,
    paddingBottom: 40, // Margen de seguridad para el scroll inferior
    gap: 24,           // Reemplaza la separación .financial-section + .financial-section
  },

  // .financial-header
  header: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  headerTextWrap: {
    gap: 6,
  },
  // .financial-header h1
  headerTitle: {
    fontSize: windowWidth > 640 ? 24 : 20,
    fontWeight: '800',
    color: colors.text,
  },
  // .financial-header p
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },

  // .financial-actions y .export-button
  exportButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  exportButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },

  // .financial-summary-grid (Diseño fluido vertical para mobile)
  summaryGrid: {
    gap: 12,
    width: '100%',
  },

  // .financial-section
  section: {
    gap: 14,
  },
  // .section-title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },

  // .financial-cards-list y .financial-loans-list
  listGap: {
    gap: 12,
  },

  // Contenedor principal de tarjetas/préstamos individuales
  entityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  entityMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },

  // Badges adaptadas (.rounded-full)
  skyBadge: {
    backgroundColor: colors.skyBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skyBadgeText: {
    color: colors.skyText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  successBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  successBadgeText: {
    color: colors.successText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // .grid adaptado a dos columnas nativas balanceadas en mobile
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // .rounded-2xl bg-white
  subCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    // Resta los gaps para encajar dos columnas exactas en cualquier tamaño de pantalla
    width: windowWidth > 500 ? '49%' : '48.5%',
    gap: 4,
  },
  subLabel: {
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  subValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  // Pie de las tarjetas financieras
  entityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerDateText: {
    fontSize: 11,
    color: colors.muted,
  },

  // Estados de carga e Historial
  historyContainer: {
    marginTop: 4,
  },
  innerLoading: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
});