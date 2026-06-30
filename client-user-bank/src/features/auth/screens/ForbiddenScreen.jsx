import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Paleta de colores Premium Matte Dark
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',      // Turquesa característico
  primaryHover: '#007A80',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  dangerText: '#EF4444',
  inputBg: '#1A1A1A'
};

export default function ForbiddenScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // En React Navigation los parámetros se extraen desde route.params
  const requiredRole = route.params?.requiredRole;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* Encabezado / Icono */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-lock-outline" size={26} color={colors.dangerText} />
          </View>
          
          <Text style={styles.title}>Acceso denegado</Text>
          <Text style={styles.subtitle}>No tienes permisos para acceder a esta sección.</Text>
          
          {requiredRole && (
            <View style={styles.roleBadgeContainer}>
              <Text style={styles.roleText}>
                Rol requerido:{' '}
                <Text style={styles.badge}>{requiredRole}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Acciones de Navegación */}
        <View style={styles.actionContainer}>
          {/* Botón Volver al panel (Lobby) */}
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary]} 
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <View style={styles.btnContent}>
              <Text style={styles.btnPrimaryText}>Volver al panel</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>

          {/* Botón Cambiar de sesión (Login) */}
          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]} 
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} // Resetea el stack al login
            activeOpacity={0.8}
          >
            <View style={styles.btnContent}>
              <MaterialCommunityIcons name="logout" size={16} color={colors.text} style={styles.logoutIcon} />
              <Text style={styles.btnSecondaryText}>Cambiar de sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  roleBadgeContainer: {
    marginTop: 12,
    backgroundColor: colors.inputBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleText: {
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionContainer: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 6,
  },
  logoutIcon: {
    marginRight: 6,
  },
});