import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, Switch, Platform
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';

import useAuthStore from '../../auth/store/useAuthStore';
import { isAdminUser } from '../../../shared/auth/roles';
import { bankingClient } from '../../../shared/api/adminClient';
import { accountService } from '../../account/services/accountService';
import PaymentHistory from '../components/PaymentHistory';
import PaymentReceipt, { buildPaymentReceiptHtml } from '../../../shared/components/PaymentReceipt';
import { styles, colors } from './ServiceScreen.styles';

export default function ServiceScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = isAdminUser(user);

  const [catalog, setCatalog] = useState([]);
  const [adminCatalog, setAdminCatalog] = useState([]);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [serviceEditing, setServiceEditing] = useState(null);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true,
  });

  const [form, setForm] = useState({
    serviceId: '',
    accountId: '',
    amount: '',
    currency: 'GTQ',
    reference: '',
    description: '',
  });
  const [serviceReceipt, setServiceReceipt] = useState(null);
  const [downloadLoadingService, setDownloadLoadingService] = useState(false);

  const resolveApiError = (error, fallback) => {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [catalogRes, adminCatalogRes, accountRes, myPaymentsRes, allPaymentsRes] = await Promise.all([
        bankingClient.get('/products', { params: { type: 'SERVICIO', is_active: true } }),
        isAdmin ? bankingClient.get('/products', { params: { type: 'SERVICIO' } }) : Promise.resolve(null),
        accountService.getMyAccounts({}),
        bankingClient.get('/services/payments/me'),
        isAdmin ? bankingClient.get('/services/payments') : Promise.resolve(null),
      ]);

      setCatalog(catalogRes?.data?.products ?? []);
      setAdminCatalog(isAdmin ? (adminCatalogRes?.data?.products ?? []) : []);
      setPayments(isAdmin ? (allPaymentsRes?.data?.payments ?? []) : (myPaymentsRes?.data?.payments ?? []));
      setAccounts(accountRes?.success ? accountRes.data.items : []);
    } catch (error) {
      Alert.alert('Error', resolveApiError(error, 'No se pudo cargar el módulo de servicios'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isAdmin]);

  const selectedService = useMemo(
    () => catalog.find((item) => item._id === form.serviceId),
    [catalog, form.serviceId]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateService = () => {
    setServiceEditing(null);
    setServiceForm({ name: '', description: '', price: '', is_active: true });
    setServiceFormOpen(true);
  };

  const openEditService = (service) => {
    setServiceEditing(service);
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: String(Number(service.price ?? 0)),
      is_active: service.is_active !== false,
    });
    setServiceFormOpen(true);
  };

  const saveService = async () => {
    if (!serviceForm.name.trim() || serviceForm.price === '') {
      Alert.alert('Atención', 'Nombre y precio son obligatorios');
      return;
    }

    const price = Number(serviceForm.price);
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert('Atención', 'El precio debe ser válido y no negativo');
      return;
    }

    setSavingService(true);
    try {
      const payload = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim() || undefined,
        type: 'SERVICIO',
        price,
        is_active: Boolean(serviceForm.is_active),
      };

      if (serviceEditing?._id) {
        await bankingClient.put(`/products/${serviceEditing._id}`, payload);
        Alert.alert('Éxito', 'Servicio actualizado correctamente');
      } else {
        await bankingClient.post('/products', payload);
        Alert.alert('Éxito', 'Servicio creado correctamente');
      }

      setServiceFormOpen(false);
      setServiceEditing(null);
      await loadData();
    } catch (error) {
      Alert.alert('Error', resolveApiError(error, 'No se pudo guardar el servicio'));
    } finally {
      setSavingService(false);
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      await bankingClient.put(`/products/${service._id}`, { is_active: !service.is_active });
      Alert.alert('Éxito', `Servicio ${service.is_active ? 'desactivado' : 'activado'}`);
      await loadData();
    } catch (error) {
      Alert.alert('Error', resolveApiError(error, 'No se pudo actualizar estado del servicio'));
    }
  };

  const handleDownloadServiceReceipt = async () => {
    if (!serviceReceipt) return;
    setDownloadLoadingService(true);
    try {
      const html = buildPaymentReceiptHtml(serviceReceipt);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Guardar comprobante' });
      }
    } catch (error) {
      console.error('Error generating service receipt PDF:', error);
      Alert.alert('Error', 'No fue posible generar el comprobante en PDF.');
    } finally {
      setDownloadLoadingService(false);
    }
  };

  const deleteService = (service) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar el servicio "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await bankingClient.delete(`/products/${service._id}`);
              Alert.alert('Éxito', 'Servicio eliminado');
              await loadData();
            } catch (error) {
              Alert.alert('Error', resolveApiError(error, 'No se pudo eliminar el servicio'));
            }
          }
        }
      ]
    );
  };

  const submitPayment = async () => {
    if (!form.serviceId || !form.accountId || !form.amount) {
      Alert.alert('Atención', 'Completa servicio, cuenta y monto');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bankingClient.post('/services/payments', {
        serviceId: form.serviceId,
        accountId: form.accountId,
        amount: Number(form.amount),
        currency: form.currency,
        reference: form.reference || undefined,
        description: form.description || undefined,
      });
      Alert.alert('Éxito', 'Pago de servicio realizado correctamente. Puedes descargar tu comprobante.');
      const receipt = {
        transactionId: result.data?.id || result.data?._id || result.data?.paymentId || `PAY-${Date.now()}`,
        dateTime: new Date().toISOString(),
        operationType: 'Pago de servicio',
        sourceAccount: accounts.find((account) => account.id === form.accountId)?.accountNumber || form.accountId,
        destination: selectedService?.name || 'Pago de servicio',
        amount: Number(form.amount),
        currency: form.currency,
        status: 'COMPLETADO',
        reference: form.reference || undefined,
        description: form.description || undefined,
      };
      setServiceReceipt(receipt);
      setForm({ serviceId: '', accountId: '', amount: '', currency: 'GTQ', reference: '', description: '' });
      await loadData();
    } catch (error) {
      Alert.alert('Error', resolveApiError(error, 'No se pudo realizar el pago del servicio'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* SECCIÓN ENCABEZADO */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Servicios bancarios</Text>
          <Text style={styles.subtitle}>Realiza pagos de servicios y consulta su historial.</Text>
        </View>
        <TouchableOpacity style={styles.btnPrimaryInline} onPress={loadData}>
          <Text style={styles.btnText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING PRINCIPAL */}
      {loading && !submitting && !savingService ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <>
          {/* CATÁLOGO DE SERVICIOS */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Catálogo de servicios</Text>
            <Text style={styles.cardSubtitle}>Servicios activos disponibles para pago.</Text>
            
            {catalog.length > 0 ? (
              catalog.map((service) => (
                <TouchableOpacity
                  key={service._id}
                  style={[styles.catalogItem, form.serviceId === service._id && styles.catalogItemSelected]}
                  onPress={() => handleChange('serviceId', service._id)}
                >
                  <View style={styles.catalogItemHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>Q{Number(service.price ?? 0).toFixed(2)}</Text>
                  </View>
                  <Text style={[styles.subtitle, { fontSize: 12, marginTop: 4 }]}>
                    {service.description || 'Sin descripción'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.subtitle}>No hay servicios activos.</Text>
            )}
          </View>

          {/* FORMULARIO DE PAGO */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Pagar servicio</Text>
            <Text style={styles.cardSubtitle}>Selecciona cuenta, monto y referencia para registrar el pago.</Text>

            <View style={styles.formGap}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Servicio</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.serviceId}
                    dropdownIconColor={colors.muted}
                    onValueChange={(val) => handleChange('serviceId', val)}
                  >
                    <Picker.Item label="Selecciona un servicio" value="" color={colors.muted} />
                    {catalog.map((service) => (
                      <Picker.Item key={service._id} label={service.name} value={service._id} color={Platform.OS === 'dark' ? '#FFF' : '#000'} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Cuenta origen</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.accountId}
                    dropdownIconColor={colors.muted}
                    onValueChange={(val) => handleChange('accountId', val)}
                  >
                    <Picker.Item label="Selecciona una cuenta" value="" color={colors.muted} />
                    {accounts.map((acc) => (
                      <Picker.Item 
                        key={acc.id} 
                        label={`${acc.accountNumber} (${acc.currency}) - Q${Number(acc.balance).toFixed(2)}`} 
                        value={acc.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.fieldGroup, styles.flex1]}>
                  <Text style={styles.label}>Monto</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    value={form.amount}
                    onChangeText={(val) => handleChange('amount', val)}
                  />
                </View>
                <View style={[styles.fieldGroup, styles.flex1]}>
                  <Text style={styles.label}>Moneda de pago</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.currency}
                      onValueChange={(val) => handleChange('currency', val)}
                    >
                      <Picker.Item label="GTQ" value="GTQ" />
                      <Picker.Item label="USD" value="USD" />
                      <Picker.Item label="EUR" value="EUR" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Referencia</Text>
                <TextInput
                  style={styles.input}
                  maxLength={120}
                  placeholder="Ej: contrato, NIS, cliente"
                  placeholderTextColor={colors.muted}
                  value={form.reference}
                  onChangeText={(val) => handleChange('reference', val)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  placeholder="Detalle adicional del pago"
                  placeholderTextColor={colors.muted}
                  value={form.description}
                  onChangeText={(val) => handleChange('description', val)}
                />
              </View>

              <TouchableOpacity 
                style={[styles.btnSubmit, submitting && styles.btnSubmitDisabled]} 
                onPress={submitPayment}
                disabled={submitting}
              >
                <Text style={styles.btnText}>
                  {submitting ? 'Procesando pago...' : `Pagar ${selectedService?.name || 'servicio'}`}
                </Text>
              </TouchableOpacity>

              {serviceReceipt && (
                <View style={styles.receiptSection}>
                  <TouchableOpacity
                    style={[styles.btnSubmit, downloadLoadingService && styles.btnSubmitDisabled]}
                    onPress={handleDownloadServiceReceipt}
                    disabled={downloadLoadingService}
                  >
                    {downloadLoadingService ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnText}>Descargar comprobante</Text>
                    )}
                  </TouchableOpacity>
                  <PaymentReceipt receipt={serviceReceipt} />
                </View>
              )}

            </View>
          </View>

          {/* VISTA ADMINISTRADOR */}
          {isAdmin && (
            <View style={styles.cardContainer}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Catálogo de servicios (admin)</Text>
                  <Text style={styles.cardSubtitle}>Gestión completa de servicios disponibles.</Text>
                </View>
                <TouchableOpacity style={styles.btnPrimaryInline} onPress={openCreateService}>
                  <Text style={styles.btnText}>+ Nuevo</Text>
                </TouchableOpacity>
              </View>

              {adminCatalog.map((service) => (
                <View key={service._id} style={[styles.historyItem, { paddingVertical: 14 }]}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyTextMain}>{service.name}</Text>
                    <Text style={[styles.badge, { 
                      backgroundColor: service.is_active ? colors.successBg : colors.dangerBg,
                      color: service.is_active ? colors.success : colors.danger 
                    }]}>
                      {service.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </Text>
                  </View>
                  <Text style={styles.historyTextMuted}>{service.description || '—'}</Text>
                  <Text style={[styles.historyTextMain, { fontSize: 13, color: colors.muted }]}>
                    Q{Number(service.price ?? 0).toFixed(2)}
                  </Text>
                  
                  <View style={[styles.rowButtons, { marginTop: 6 }]}>
                    <TouchableOpacity style={styles.btnActionAdmin} onPress={() => openEditService(service)}>
                      <Text style={[styles.btnText, { color: colors.primary }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActionAdmin} onPress={() => toggleServiceStatus(service)}>
                      <Text style={[styles.btnText, { color: colors.muted }]}>
                        {service.is_active ? 'Desactivar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActionAdmin} onPress={() => deleteService(service)}>
                      <Text style={[styles.btnText, { color: colors.danger }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* HISTORIAL GENERAL DE PAGOS */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>
              {isAdmin ? 'Pagos de servicios (global)' : 'Mis pagos de servicios'}
            </Text>
            <Text style={styles.cardSubtitle}>Registro de pagos completados con detalle.</Text>
            <PaymentHistory payments={payments} isAdmin={isAdmin} />
          </View>
        </>
      )}

      {/* MODAL PARA CREAR / EDITAR SERVICIO (ADMIN) */}
      <Modal visible={serviceFormOpen} transparent animationType="slide" onRequestClose={() => setServiceFormOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitle}>{serviceEditing ? 'Editar servicio' : 'Nuevo servicio'}</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                maxLength={100}
                value={serviceForm.name}
                onChangeText={(text) => setServiceForm(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                maxLength={500}
                multiline
                numberOfLines={3}
                value={serviceForm.description}
                onChangeText={(text) => setServiceForm(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, styles.flex1]}>
                <Text style={styles.label}>Precio</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={serviceForm.price}
                  onChangeText={(text) => setServiceForm(prev => ({ ...prev, price: text }))}
                />
              </View>
              <View style={[styles.fieldGroup, { justifyContent: 'center', alignItems: 'center', flex: 0.8 }]}>
                <Text style={[styles.label, { marginBottom: 4 }]}>Activo</Text>
                <Switch
                  trackColor={{ false: colors.border, true: 'rgba(0, 173, 181, 0.3)' }}
                  thumbColor={serviceForm.is_active ? colors.primary : colors.muted}
                  value={serviceForm.is_active}
                  onValueChange={(val) => setServiceForm(prev => ({ ...prev, is_active: val }))}
                />
              </View>
            </View>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setServiceFormOpen(false)}>
                <Text style={[styles.btnText, { color: colors.muted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={saveService} disabled={savingService}>
                <Text style={styles.btnText}>{savingService ? 'Guardando...' : serviceEditing ? 'Actualizar' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}