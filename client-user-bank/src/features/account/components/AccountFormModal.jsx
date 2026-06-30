import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
// Nota: Para los selectores en React Native se suele usar @react-native-picker/picker. 
// Para mantener el código sin dependencias externas complejas, simularemos un selector limpio o puedes importar Picker directamente.
import { Picker } from '@react-native-picker/picker'; 

const TYPE_OPTIONS = [
  { value: 'CORRIENTE', label: 'Corriente' },
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'NOMINA', label: 'Nómina' },
];

const CURRENCY_OPTIONS = [
  { value: 'GTQ', label: 'Quetzales (GTQ)' },
  { value: 'USD', label: 'Dólares (USD)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

// Lógica de negocio intacta
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Paleta de colores consistente
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', 
  danger: '#D9534F',  
  white: '#FFFFFF',
  inputBg: '#252525',
  readOnlyBg: '#1A1A1A'
};

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  account = null,
  isLoading = false,
  submitError = null,
  isAdmin = false,
  users = [],
}) {
  const isEditing = !!account;
  const [formData, setFormData] = useState({
    accountNumber: generateAccountNumber(),
    type: 'CORRIENTE',
    currency: 'GTQ',
    status: 'active',
    balance: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    ownerId: '',
  });
  const [errors, setErrors] = useState({});

  // Lógica de sincronización intacta (se cambió window.setTimeout por los timers nativos globales)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setErrors({});
      setFormData({
        accountNumber: account?.accountNumber || generateAccountNumber(),
        type: account?.type || 'CORRIENTE',
        currency: account?.currency || 'GTQ',
        status: account?.status || 'active',
        balance: account?.balance ?? 0,
        dailyLimit: account?.dailyLimit ?? 0,
        monthlyLimit: account?.monthlyLimit ?? 0,
        ownerId: account?.ownerId || '',
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [account, isOpen]);

  // Manejador adaptado para React Native (recibe name y value directamente)
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Validación idéntica sin modificaciones lógicas
  const validate = () => {
    const next = {};
    if (!formData.type) next.type = 'Selecciona el tipo de cuenta';
    if (!formData.currency) next.currency = 'Selecciona la moneda';
    if (!formData.accountNumber) next.accountNumber = 'Número de cuenta requerido';
    if (isAdmin && !isEditing && !formData.ownerId) next.ownerId = 'Selecciona el cliente';
    if (formData.balance < 0) next.balance = 'El saldo inicial no puede ser negativo';
    if (Number(formData.dailyLimit) < 0) next.dailyLimit = 'Límite diario inválido';
    if (Number(formData.monthlyLimit) < 0) next.monthlyLimit = 'Límite mensual inválido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...formData,
      balance: Number(formData.balance),
      dailyLimit: Number(formData.dailyLimit),
      monthlyLimit: Number(formData.monthlyLimit),
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          
          {/* Header del Modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar cuenta' : 'Crear nueva cuenta'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario Scrolleable */}
          <ScrollView contentContainerStyle={styles.formContainer}>
            
            {/* Campo: Número de cuenta (Read Only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de cuenta</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                value={formData.accountNumber}
                editable={false}
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>

            {/* Campo: Tipo de cuenta */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de cuenta</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  dropdownIconColor={colors.muted}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChange('type', itemValue)}
                >
                  {TYPE_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} style={styles.pickerItem}/>
                  ))}
                </Picker>
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            {/* Campo: Moneda */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Moneda</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.currency}
                  dropdownIconColor={colors.muted}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChange('currency', itemValue)}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} style={styles.pickerItem}/>
                  ))}
                </Picker>
              </View>
              {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}
            </View>

            {/* Campos exclusivos de Administrador */}
            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.status}
                    dropdownIconColor={colors.muted}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleChange('status', itemValue)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} style={styles.pickerItem}/>
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Saldo inicial</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(formData.balance)}
                  onChangeText={(text) => handleChange('balance', text)}
                  placeholderTextColor={colors.muted}
                />
                {errors.balance && <Text style={styles.errorText}>{errors.balance}</Text>}
              </View>
            )}

            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Límite diario</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(formData.dailyLimit)}
                  onChangeText={(text) => handleChange('dailyLimit', text)}
                  placeholderTextColor={colors.muted}
                />
              </View>
            )}

            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Límite mensual</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(formData.monthlyLimit)}
                  onChangeText={(text) => handleChange('monthlyLimit', text)}
                  placeholderTextColor={colors.muted}
                />
              </View>
            )}

            {isAdmin && !isEditing && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente propietario</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.ownerId}
                    dropdownIconColor={colors.muted}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleChange('ownerId', itemValue)}
                  >
                    <Picker.Item label="Selecciona un usuario" value="" color={colors.muted} style={styles.pickerItem}/>
                    {users.map((user) => (
                      <Picker.Item 
                        key={user.id || user._id} 
                        label={user.nombre || user.username || user.email || 'Usuario'} 
                        value={user.id || user._id}
                        color={colors.text}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.ownerId && <Text style={styles.errorText}>{errors.ownerId}</Text>}
              </View>
            )}

            {/* Manejo de error del servidor */}
            {submitError && (
              <View style={styles.submitErrorContainer}>
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            )}

            {/* Grupo de acciones inferiores */}
            <View style={styles.actionGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                disabled={isLoading}
                style={[styles.btnBase, styles.btnCancel]}
              >
                <Text style={{ color: colors.muted, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={isLoading}
                style={[styles.btnBase, styles.btnSubmit]}
              >
                <Text style={styles.btnSubmitText}>
                  {isLoading ? 'Guardando...' : isEditing ? 'Actualizar cuenta' : 'Crear cuenta'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.85,
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButtonText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.muted,
    lineHeight: 26,
  },
  formContainer: {
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputReadOnly: {
    backgroundColor: colors.readOnlyBg,
    color: colors.muted,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: colors.text,
  },
  pickerItem: {
    backgroundColor: colors.surface,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  submitErrorContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(219, 83, 79, 0.1)',
    padding: 12,
  },
  submitErrorText: {
    fontSize: 13,
    color: colors.danger,
  },
  actionGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingBottom: 8,
  },
  btnBase: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSubmit: {
    backgroundColor: colors.primary,
  },
  btnSubmitText: {
    color: colors.white,
    fontWeight: '600',
  },
});