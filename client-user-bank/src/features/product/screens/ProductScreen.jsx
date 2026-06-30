import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import useAuthStore from '../../auth/store/useAuthStore';
import useProductStore from '../store/useProductStore';
import { useProductRequests } from '../hooks/useProductRequests';
import { isAdminUser } from '../../../shared/auth/roles';
import { bankingClient } from '../../../shared/api/adminClient';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa Enterprise
  danger: '#FF5A79',        // Rojo Mate
  success: '#22C55E',       // Verde Jade
  warning: '#EAB308',       // Ámbar
  inputBg: '#151515',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
};

function resolveApiError(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function getStatusBadgeColor(status) {
  if (status === 'APROBADO') return { bg: 'rgba(34, 197, 94, 0.15)', text: colors.success };
  if (status === 'RECHAZADO') return { bg: 'rgba(255, 90, 121, 0.15)', text: colors.danger };
  return { bg: 'rgba(234, 179, 8, 0.15)', text: colors.warning };
}

export default function ProductScreen() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingProduct, setRequestingProduct] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminUser(user);

  const {
    products = [],
    loading,
    error,
    filters,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
  } = useProductStore();

  useEffect(() => {
    setFilters({ type: 'PRODUCTO', is_active: '' });
  }, [setFilters]);

  const {
    myRequests,
    allRequests,
    loading: requestsLoading,
    refresh: loadRequests,
  } = useProductRequests({ isAdmin, autoLoad: true });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = (productId) => {
    const target = products.find((p) => p._id === productId);
    const name = target?.name || 'este producto';

    Alert.alert(
      'Eliminar Activo',
      `¿Eliminar definitivamente "${name}"? Si solo necesitas dejar de ofrecerlo, edítalo y desactívalo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteProduct(productId);
            if (ok) Alert.alert('Éxito', 'Producto eliminado correctamente.');
          }
        }
      ]
    );
  };

  const handleOpenRequestModal = (product) => {
    setRequestingProduct(product);
    setRequestNotes('');
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setRequestingProduct(null);
    setRequestNotes('');
  };

  const submitRequest = async () => {
    if (!requestingProduct?._id) return;
    setRequestingId(requestingProduct._id);
    try {
      await bankingClient.post('/products/requests', {
        productId: requestingProduct._id,
        notes: requestNotes?.trim() || undefined,
      });
      Alert.alert('Completado', 'Solicitud enviada correctamente.');
      handleCloseRequestModal();
      await loadRequests();
    } catch (err) {
      Alert.alert('Error', resolveApiError(err, 'No se pudo enviar la solicitud.'));
    } finally {
      setRequestingId(null);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    setStatusUpdatingId(requestId);
    try {
      await bankingClient.patch(`/products/requests/${requestId}/status`, { status });
      Alert.alert('Actualizado', `Solicitud ${status.toLowerCase()} correctamente.`);
      await loadRequests();
    } catch (err) {
      Alert.alert('Error', resolveApiError(err, 'No se pudo actualizar la solicitud.'));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const onSubmitForm = async (data) => {
    let result = null;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, data);
    } else {
      result = await createProduct(data);
    }
    if (result) handleCloseForm();
  };

  const pendingRequestsCount = useMemo(
    () => allRequests.filter((item) => item.status === 'PENDIENTE').length,
    [allRequests]
  );

  return (
    <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContent}>
      
      {/* HEADER DE LA PÁGINA */}
      <View style={styles.pageHeader}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.pageTitle}>Catálogo de Productos</Text>
          <Text style={styles.pageSubtitle}>Gestión integral de servicios financieros</Text>
        </View>

        {isAdmin && (
          <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
            <Text style={styles.createButtonText}>+ Nuevo Registro</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MENSAJE DE ERROR GLOBAL */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* FILTROS TÁCTILES */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Estado de Cuenta</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filters.is_active}
            onValueChange={(value) => setFilters({ type: 'PRODUCTO', is_active: value })}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            <Picker.Item label="Cualquier estado" value="" color={Platform.OS === 'ios' ? colors.text : undefined} />
            <Picker.Item label="Activos" value="true" color={Platform.OS === 'ios' ? colors.text : undefined} />
            <Picker.Item label="Inactivos" value="false" color={Platform.OS === 'ios' ? colors.text : undefined} />
          </Picker>
        </View>
      </View>

      {/* LISTADO DE PRODUCTOS / SERVICIOS */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Sincronizando con el servidor...</Text>
        </View>
      ) : products.length > 0 ? (
        <ProductList
          products={products}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRequest={!isAdmin ? handleOpenRequestModal : undefined}
          requestingId={requestingId}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay registros para mostrar</Text>
        </View>
      )}

      {/* SECCIÓN REGISTRO DE SOLICITUDES (TABLA MIGRADA A TARJETAS) */}
      <View style={styles.requestsSection}>
        <View style={styles.requestsHeader}>
          <View style={styles.flex1}>
            <Text style={styles.sectionTitle}>
              {isAdmin ? 'Solicitudes de productos' : 'Mis solicitudes'}
            </Text>
            <Text style={styles.sectionSubtitle}>Flujo de aprobación de activos bancarios.</Text>
          </View>
          {isAdmin && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pendientes: {pendingRequestsCount}</Text>
            </View>
          )}
        </View>

        {requestsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
        ) : (
          <View style={styles.requestsList}>
            {(isAdmin ? allRequests : myRequests).map((item) => {
              const badgeStyle = getStatusBadgeColor(item.status);
              return (
                <View key={item._id} style={styles.requestRowCard}>
                  <View style={styles.requestTopLine}>
                    <Text style={styles.requestProductName} numberOfLines={1}>
                      {item.product_id?.name || 'Producto'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.requestMiddleData}>
                    <Text style={styles.dataText}>
                      <Text style={styles.boldLabel}>Cliente: </Text>
                      {String(item.user_id || '').slice(-8).toUpperCase() || '—'}
                    </Text>
                    <Text style={styles.dataText} numberOfLines={2}>
                      <Text style={styles.boldLabel}>Notas: </Text>
                      {item.notes || item.admin_notes || '—'}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleString('es-GT')}
                    </Text>
                  </View>

                  {isAdmin && item.status === 'PENDIENTE' && (
                    <View style={styles.adminActionRow}>
                      <TouchableOpacity
                        style={[styles.rowButton, styles.rowApprove]}
                        onPress={() => updateRequestStatus(item._id, 'APROBADO')}
                        disabled={statusUpdatingId === item._id}
                      >
                        <Text style={styles.rowButtonText}>Aprobar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rowButton, styles.rowReject]}
                        onPress={() => updateRequestStatus(item._id, 'RECHAZADO')}
                        disabled={statusUpdatingId === item._id}
                      >
                        <Text style={styles.rowButtonText}>Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {(isAdmin ? allRequests : myRequests).length === 0 && (
              <Text style={styles.noRequestsText}>No hay solicitudes registradas.</Text>
            )}
          </View>
        )}
      </View>

      {/* MODAL NATIVO: FORMULARIO DE ALTA/EDICIÓN */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCentered}>
            <ProductForm
              key={String(editingProduct?._id ?? 'new')}
              product={editingProduct}
              onSubmit={onSubmitForm}
              onClose={handleCloseForm}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL NATIVO: GENERAR SOLICITUD CLIENTE */}
      <Modal visible={showRequestModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCentered}>
            <View style={styles.nativeModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Solicitar producto</Text>
                <TouchableOpacity onPress={handleCloseRequestModal}>
                  <Text style={styles.closeModalX}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalBodyText}>
                  Producto seleccionado: <Text style={styles.boldLabel}>{requestingProduct?.name}</Text>
                </Text>

                <TextInput
                  value={requestNotes}
                  onChangeText={setRequestNotes}
                  rows={4}
                  maxLength={500}
                  multiline
                  placeholder="Motivo o comentario para tu solicitud (opcional)"
                  placeholderTextColor={colors.muted}
                  style={styles.modalTextArea}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.mBtn, styles.mCancelBtn]} onPress={handleCloseRequestModal}>
                    <Text style={styles.mCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.mBtn, styles.mSubmitBtn]} 
                    onPress={submitRequest}
                    disabled={requestingId === requestingProduct?._id}
                  >
                    {requestingId === requestingProduct?._id ? (
                      <ActivityIndicator size="small" color={colors.bg} />
                    ) : (
                      <Text style={styles.mSubmitText}>Enviar solicitud</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 200,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 13,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 90, 121, 0.15)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  pickerWrapper: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  requestsSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12,
    gap: 8,
  },
  flex1: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  requestsList: {
    gap: 12,
  },
  requestRowCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  requestTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  requestMiddleData: {
    gap: 4,
  },
  dataText: {
    fontSize: 12,
    color: colors.muted,
  },
  boldLabel: {
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  rowButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rowApprove: { backgroundColor: colors.success },
  rowReject: { backgroundColor: colors.danger },
  rowButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  noRequestsText: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCentered: {
    width: '100%',
    maxWidth: 400,
  },
  nativeModalContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  closeModalX: { color: colors.muted, fontSize: 16, padding: 4 },
  modalBody: { padding: 16, gap: 14 },
  modalBodyText: { color: colors.muted, fontSize: 13 },
  modalTextArea: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    height: 100,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  mBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  mCancelBtn: { borderWidth: 1, borderColor: colors.border },
  mCancelText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  mSubmitBtn: { backgroundColor: colors.primary },
  mSubmitText: { color: colors.bg, fontWeight: '700', fontSize: 13 },
});