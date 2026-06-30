import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  activateUser, 
  deactivateUser, 
  updateUserRole 
} from '../service/userService';
import UserFormModal from '../components/UserFormModal'; // Asegúrate de actualizar este Modal a código nativo
import { STATUS_UI_CONFIG, USER_STATUS } from '../types/userTypes';
import { isAdminUser, getUserRole } from '../../../shared/auth/roles';

export default function UsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // all | pending
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estados de Modales y Flujos
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState(null);

  const getUserStatus = (user) => (user?.status || 'active').toLowerCase();
  
  const normalizeRole = (role) => {
    const value = String(role || '').toUpperCase();
    if (!value) return 'USER_ROLE';
    return value.includes('ADMIN') ? 'ADMIN_ROLE' : 'USER_ROLE';
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getUsers({
        search: searchTerm.trim() || undefined,
        page,
        limit: pageSize,
      });
      if (result.success) {
        setUsers(result.data.items);
        setTotalUsers(result.data.total);
        setCurrentPage(page);
      } else {
        showNotification(result.error || 'Error al cargar usuarios', 'error');
      }
    } catch {
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  const handleSearch = () => {
    loadUsers(1);
  };

  const handleViewDetail = (userId) => {
    // Redirección usando React Navigation pasando parámetros
    navigation.navigate('DetalleUsuario', { userId });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = getUserStatus(user) === 'active' ? 'inactive' : 'active';
    setActionLoading(true);
    try {
      const result = nextStatus === 'active'
        ? await activateUser(user.id || user._id)
        : await deactivateUser(user.id || user._id);
      if (result.success) {
        showNotification(`Usuario ${nextStatus === 'active' ? 'activado' : 'desactivado'} correctamente`, 'success');
        loadUsers(currentPage);
      } else {
        showNotification(result.error || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      showNotification(error.message || 'Error inesperado al cambiar estado', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (user) => {
    setActionLoading(true);
    try {
      const result = await activateUser(user.id || user._id);
      if (result.success) {
        showNotification('Usuario activado correctamente', 'success');
        loadUsers(currentPage);
      } else {
        showNotification(result.error || 'Error al activar usuario', 'error');
      }
    } catch (error) {
      showNotification(error.message || 'Error inesperado al activar usuario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (userData) => {
    setActionLoading(true);
    setFormError(null);
    try {
      if (selectedUser) {
        const userId = selectedUser.id || selectedUser._id;
        const result = await updateUser(userId, userData);
        if (result.success) {
          const previousRole = normalizeRole(selectedUser.rol || selectedUser.role);
          const nextRole = normalizeRole(userData.rol);
          if (previousRole !== nextRole) {
            const roleResult = await updateUserRole(userId, nextRole);
            if (!roleResult.success) {
              setFormError(roleResult.error || 'Usuario actualizado, pero no se pudo cambiar el rol');
              return;
            }
          }
          showNotification('Usuario actualizado correctamente', 'success');
          setIsFormModalOpen(false);
          loadUsers(currentPage);
        } else {
          setFormError(result.error || 'Error al actualizar usuario');
        }
      } else {
        const result = await createUser(userData);
        if (result.success) {
          if (result.warning) {
            showNotification(result.warning, 'error');
          } else {
            showNotification('Usuario creado correctamente', 'success');
          }
          setIsFormModalOpen(false);
          setFormError(null);
          loadUsers(1);
        } else {
          setFormError(result.error || 'Error al crear usuario');
        }
      }
    } catch (error) {
      setFormError(error.message || 'Error inesperado al guardar usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingUsersCount = users.filter((user) => getUserStatus(user) !== 'active').length;
  const usersToDisplay = viewMode === 'pending'
    ? users.filter((user) => getUserStatus(user) !== 'active')
    : users;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  // Renderizador optimizado para las tarjetas de la lista nativa
  const renderUserItem = ({ item: user }) => {
    const isActive = getUserStatus(user) === 'active';
    return (
      <View style={styles.userCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.userName}>{user.nombre || 'N/A'}</Text>
            <Text style={styles.userUsername}>@{user.username || 'N/A'}</Text>
          </View>
          <View style={styles.badgesRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.rol || 'USER'}</Text>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.statusActiveBg : styles.statusInactiveBg]}>
              <Text style={[styles.statusBadgeText, isActive ? styles.statusActiveText : styles.statusInactiveText]}>
                {(user.status || 'active').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {user.email || 'N/A'}</Text>
          <Text style={styles.infoText}><Text style={styles.infoLabel}>Tel:</Text> {user.telefono || 'N/A'}</Text>
        </View>

        {/* Acciones de la Tarjeta */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]} 
            onPress={() => handleViewDetail(user.id || user._id)}
          >
            <Text style={styles.viewButtonText}>Ver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEditUser(user)}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={() => isActive ? toggleUserStatus(user) : handleActivateUser(user)}
          >
            <Text style={styles.toggleButtonText}>{isActive ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Sistema flotante de Notificación */}
      {notification && (
        <View style={[styles.notificationBox, notification.type === 'error' ? styles.notifError : styles.notifSuccess]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}

      {/* Header Fijo */}
      <View style={styles.headerContainer}>
        <View>
          <h1 style={styles.screenTitle}>Usuarios</h1>
          <Text style={styles.screenSubtitle}>Gestión y visualización del sistema</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser}>
          <Text style={styles.createButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Búsqueda */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, email o usuario..."
          placeholderTextColor="#707075"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros / Selector de Pestaña */}
      <View style={styles.filterTabsContainer}>
        <TouchableOpacity
          style={[styles.filterTab, viewMode === 'all' && styles.filterTabActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.filterTabText, viewMode === 'all' && styles.filterTabTextActive]}>
            Todos ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, viewMode === 'pending' && styles.filterTabActive]}
          onPress={() => setViewMode('pending')}
        >
          <Text style={[styles.filterTabText, viewMode === 'pending' && styles.filterTabTextActive]}>
            Sin activar ({pendingUsersCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista Principal Reactiva */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loaderText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={usersToDisplay}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {viewMode === 'pending' ? 'No hay usuarios pendientes' : 'No hay usuarios disponibles'}
              </Text>
            </View>
          }
          // Paginación Nativa al pie del Scroll
          ListFooterComponent={
            <View style={styles.paginationContainer}>
              <Text style={styles.paginationInfo}>Total: {totalUsers}</Text>
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  disabled={currentPage <= 1}
                  onPress={() => loadUsers(currentPage - 1)}
                  style={[styles.pageButton, currentPage <= 1 && styles.pageButtonDisabled]}
                >
                  <Text style={styles.pageButtonText}>Anterior</Text>
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>{currentPage} de {totalPages}</Text>
                <TouchableOpacity
                  disabled={currentPage >= totalPages}
                  onPress={() => loadUsers(currentPage + 1)}
                  style={[styles.pageButton, currentPage >= totalPages && styles.pageButtonDisabled]}
                >
                  <Text style={styles.pageButtonText}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

      {/* Modal de Formulario */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setFormError(null); }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={actionLoading}
        submitError={formError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F10', // Deep Black
  },
  notificationBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 999,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 6 },
    }),
  },
  notifSuccess: { backgroundColor: '#1FA187' },
  notifError: { backgroundColor: '#EF4444' },
  notificationText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  screenSubtitle: { color: '#A0A0A5', fontSize: 13, marginTop: 2 },
  createButton: {
    backgroundColor: '#00F0FF', // Turquoise Accent
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 14 },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E1E20',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  searchButton: {
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchButtonText: { color: '#000000', fontWeight: '700', fontSize: 14 },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#161617',
    padding: 4,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: { backgroundColor: '#2A2A2C' },
  filterTabText: { color: '#A0A0A5', fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: '#00F0FF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  loaderText: { color: '#A0A0A5', marginTop: 12 },
  emptyContainer: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#707075', fontSize: 15 },
  
  // Estilos de la Tarjeta (Reemplazo del table row)
  userCard: {
    backgroundColor: '#1E1E20', // Mate finish surface
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2C',
    paddingBottom: 10,
    marginBottom: 10,
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  userUsername: { fontSize: 13, color: '#A0A0A5', marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 6 },
  roleBadge: { backgroundColor: 'rgba(47, 127, 191, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleBadgeText: { color: '#2F7FBF', fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusActiveBg: { backgroundColor: 'rgba(31, 161, 135, 0.15)' },
  statusInactiveBg: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  statusActiveText: { color: '#1FA187' },
  statusInactiveText: { color: '#EF4444' },
  cardBody: { gap: 4, marginBottom: 12 },
  infoText: { color: '#FFFFFF', fontSize: 13 },
  infoLabel: { color: '#707075', fontWeight: '500' },
  
  // Acciones en Tarjetas
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButton: { borderColor: '#00F0FF' },
  viewButtonText: { color: '#00F0FF', fontWeight: '600', fontSize: 12 },
  editButton: { borderColor: '#FF9800' },
  editButtonText: { color: '#FF9800', fontWeight: '600', fontSize: 12 },
  toggleButton: { borderColor: '#707075' },
  toggleButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },

  // Paginación
  paginationContainer: {
    marginTop: 16,
    backgroundColor: '#161617',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  paginationInfo: { color: '#A0A0A5', fontSize: 13 },
  paginationControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pageButton: {
    borderWidth: 1,
    borderColor: '#2A2A2C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E1E20',
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  pageIndicator: { color: '#A0A0A5', fontSize: 13 },
});