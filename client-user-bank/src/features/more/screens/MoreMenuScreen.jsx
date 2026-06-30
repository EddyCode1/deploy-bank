import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../shared/store/authStore';
import { isAdminUser } from '../../../shared/auth/roles';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

const menuItems = [
  { label: 'Mi Perfil', screen: 'Profile', icon: 'person' },
  { label: 'Productos', screen: 'Products', icon: 'credit-card' },
  { label: 'Servicios', screen: 'Services', icon: 'receipt' },
  { label: 'Saldos', screen: 'Financial', icon: 'bar-chart' },
  { label: 'Horarios', screen: 'Schedule', icon: 'schedule' },
];

const adminItems = [
  { label: 'Gestión de usuarios', screen: 'Users', icon: 'manage-accounts' },
];

export default function MoreMenuScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = isAdminUser(user);
  const items = isAdmin ? [...menuItems, ...adminItems] : menuItems;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Más opciones</Text>

      {items.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.item}
          onPress={() => navigation.navigate(item.screen)}
        >
          <MaterialIcons name={item.icon} size={24} color={COLORS.primary} style={styles.icon} />
          <Text style={styles.itemText}>{item.label}</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
        <MaterialIcons name="logout" size={20} color="#EF4444" style={styles.icon} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  itemText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: '#EF4444',
    fontWeight: '600',
  },
});
