import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getUserById } from '../service/userService';

export default function UserDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // En React Navigation los parámetros vienen dentro de route.params
  const { userId } = route.params || {}; 
  
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('datos');

  useEffect(() => {
    const loadUserDetail = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const result = await getUserById(userId);
        if (result.success) {
          setUser(result.data);
          if (result.data.cuentas && Array.isArray(result.data.cuentas)) {
            setAccounts(result.data.cuentas);
          }
        }
      } catch (error) {
        console.error("Error al cargar detalles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserDetail();
  }, [userId]);

  // Pantalla de Carga
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00ADB5" />
        <Text style={styles.loadingText}>Cargando información del usuario...</Text>
      </View>
    );
  }

  // Pantalla de Error / No encontrado
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No se encontró el usuario</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Volver a usuarios</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{user.nombre || 'Sin nombre'}</Text>
            <Text style={styles.subtitle}>@{user.username || 'N/A'}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'datos' && styles.activeTab]}
            onPress={() => setActiveTab('datos')}
          >
            <Text style={[styles.tabText, activeTab === 'datos' && styles.activeTabText]}>
              Datos Personales
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'cuentas' && styles.activeTab]}
            onPress={() => setActiveTab('cuentas')}
          >
            <Text style={[styles.tabText, activeTab === 'cuentas' && styles.activeTabText]}>
              Cuentas ({accounts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content Cards */}
        <View style={styles.surfaceCard}>
          {activeTab === 'datos' && (
            <View style={styles.gapGrid}>
              {/* Información básica */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{user.nombre || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Usuario</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{user.username || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{user.email || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{user.telefono || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rol</Text>
                <View style={styles.valueContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{user.rol || 'USER'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>ID</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.idText}>{user.id || user._id || 'N/A'}</Text>
                </View>
              </View>

              {/* Información adicional (Dirección) */}
              {(user.direccion || user.ciudad || user.pais) && (
                <View style={styles.dividerSection}>
                  <Text style={styles.sectionTitle}>Dirección</Text>
                  
                  {user.direccion && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Dirección</Text>
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{user.direccion}</Text>
                      </View>
                    </View>
                  )}
                  
                  {user.ciudad && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Ciudad</Text>
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{user.ciudad}</Text>
                      </View>
                    </View>
                  )}

                  {user.pais && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>País</Text>
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{user.pais}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'cuentas' && (
            <View>
              {accounts.length === 0 ? (
                <Text style={styles.emptyText}>Este usuario no tiene cuentas asociadas</Text>
              ) : (
                <View style={styles.accountsContainer}>
                  {accounts.map((account, index) => {
                    const isAccountActive = (account.estado || account.status || 'active').toLowerCase() === 'active';
                    return (
                      <View key={account.id || account._id || index} style={styles.accountCard}>
                        <View style={styles.accountRow}>
                          <View style={styles.accountCol}>
                            <Text style={styles.accountLabel}>Número de Cuenta</Text>
                            <Text style={styles.accountValue}>{account.numero || account.accountNumber || 'N/A'}</Text>
                          </View>
                          <View style={styles.accountCol}>
                            <Text style={styles.accountLabel}>Tipo</Text>
                            <Text style={styles.accountValue}>{account.tipo || account.type || 'N/A'}</Text>
                          </View>
                        </View>

                        <View style={[styles.accountRow, { marginTop: 12 }]}>
                          <View style={styles.accountCol}>
                            <Text style={styles.accountLabel}>Saldo</Text>
                            <Text style={styles.balanceValue}>
                              ${parseFloat(account.saldo || account.balance || 0).toFixed(2)}
                            </Text>
                          </View>
                          <View style={styles.accountCol}>
                            <Text style={styles.accountLabel}>Estado</Text>
                            <View style={[styles.statusBadge, isAccountActive ? styles.statusActiveBg : styles.statusInactiveBg]}>
                              <Text style={[styles.statusBadgeText, isAccountActive ? styles.statusActiveText : styles.statusInactiveText]}>
                                {account.estado || account.status || 'Active'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos Nativos adaptados del CSS/Tailwind original
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F10', // Reemplazar por tu 'var(--bg)' real (ej. Deep Black)
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0F0F10',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#A0A0A5', // var(--muted)
    fontSize: 16,
  },
  errorText: {
    color: '#A0A0A5',
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#00ADB5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#00ADB5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#00ADB5',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // var(--text)
  },
  subtitle: {
    color: '#A0A0A5',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2C', // var(--gris-medio)
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00F0FF',
  },
  tabText: {
    color: '#A0A0A5',
    fontWeight: '500',
    fontSize: 15,
  },
  activeTabText: {
    color: '#00F0FF',
  },
  surfaceCard: {
    backgroundColor: '#1E1E20', // var(--surface) (Mate finish)
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gapGrid: {
    gap: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#707075', // var(--gris-oscuro)
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  valueContainer: {
    backgroundColor: '#141415', // var(--gris-claro-fondo) alternativo oscuro
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  idText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Platform-specific-mono', // Opcional si tienes tipografía mono
  },
  badge: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: {
    color: '#00ADB5',
    fontSize: 12,
    fontWeight: '600',
  },
  dividerSection: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2C',
    paddingTop: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    color: '#A0A0A5',
    fontSize: 15,
  },
  accountsContainer: {
    gap: 16,
  },
  accountCard: {
    borderWidth: 1,
    borderColor: '#2A2A2C',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#161617',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountCol: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: '#A0A0A5',
    marginBottom: 2,
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50', // var(--success) o verde jade
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusActiveBg: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusInactiveBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusActiveText: {
    color: '#4CAF50',
  },
  statusInactiveText: {
    color: '#EF4444',
  },
});