import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const colors = {
  bgOverlay: 'rgba(0, 0, 0, 0.6)',
  surface: '#1E1E1E',
  card: '#262626',
  innerCard: '#121212',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',    // Turquesa
  success: '#1FA187',
  successBg: 'rgba(31, 161, 135, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#E11D48',
  dangerBg: 'rgba(225, 29, 72, 0.12)',
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  btnCloseX: {
    padding: 4,
  },
  btnCloseXText: {
    fontSize: 24,
    color: colors.muted,
    lineHeight: 24,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  // Bloques de Información Básica (Reemplazo de bg-white web)
  infoBlock: {
    backgroundColor: colors.innerCard,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  gridTwoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  gridColumn: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  valueTextCapitalize: {
    textTransform: 'capitalize',
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Badge de Estado
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  // Contenedor de Conversión Diferenciada
  conversionContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  conversionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  conversionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  conversionItem: {
    width: '50%',
    gap: 2,
  },
  conversionItemFull: {
    width: '100%',
    gap: 2,
  },
  conversionLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  conversionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  // Botón Inferior Principal
  btnMainClose: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnMainCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});