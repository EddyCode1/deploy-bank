import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../shared/store/authStore';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import SummaryCard from '../components/SummaryCard';
import QuickLinks from '../components/QuickLinks';
import { useMyAccounts } from '../../account/hooks/useMyAccounts';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

const QUICK_LINKS = [
  { id: 'account',      label: 'Mis Cuentas',    icon: '🏦', path: 'Account' },
  { id: 'transactions', label: 'Transacciones',  icon: '💸', path: 'Transacciones' },
  { id: 'favorites',    label: 'Favoritos',      icon: '⭐', path: 'Favorites' },
  { id: 'profile',      label: 'Mi Perfil',      icon: '👤', path: { tab: 'More', screen: 'Profile' } },
  { id: 'products',     label: 'Productos',      icon: '📦', path: { tab: 'More', screen: 'Products' } },
  { id: 'services',     label: 'Servicios',      icon: '🧾', path: { tab: 'More', screen: 'Services' } },
];

export default function DashboardScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const { accounts, summary, loading, summaryLoading, refresh } = useMyAccounts();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const formatBalance = (amount) =>
    Number(amount || 0).toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      maximumFractionDigits: 2,
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading || summaryLoading}
          onRefresh={refresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Saludo */}
      <View style={styles.greetingCard}>
        <Text style={styles.greetingLabel}>Banco del Quetzal</Text>
        <Text style={styles.greetingText}>
          {greeting}, {user?.nombre || user?.name || user?.username || 'Usuario'}
        </Text>
        <Text style={styles.greetingSubtext}>
          Bienvenido a tu banca digital
        </Text>
      </View>

      {/* Resumen de cuentas */}
      <Text style={styles.sectionTitle}>Resumen</Text>
      <View style={styles.cardsRow}>
        <View style={styles.cardHalf}>
          <SummaryCard
            title="Balance total"
            value={formatBalance(summary?.totalBalance)}
            icon="💰"
            loading={summaryLoading}
            accent="#00ADB5"
            onClick={() => navigateToMainTab(navigation, 'Account')}
            tooltip="Ver mis cuentas"
          />
        </View>
        <View style={styles.cardHalf}>
          <SummaryCard
            title="Cuentas activas"
            value={String(summary?.totalAccounts ?? accounts.length ?? 0)}
            icon="🏦"
            loading={summaryLoading}
            accent="#6366F1"
            onClick={() => navigateToMainTab(navigation, 'Account')}
            tooltip="Ver mis cuentas"
          />
        </View>
      </View>

      {/* Accesos rápidos */}
      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <QuickLinks links={QUICK_LINKS} loading={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  greetingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  greetingLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.sm,
  },
  cardHalf: {
    flex: 1,
  },
});
