import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { generateAccountNumber } from '../service/userService';
import { styles, colors } from './UserFormModal.styles';

export default function UserFormModal({ isOpen, onClose, onSubmit, user = null, isLoading = false, submitError = null }) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    numeroCuenta: generateAccountNumber(),
    dpi: '',
    direccion: '',
    telefono: '',
    correo: '',
    password: '',
    nombreTrabajo: '',
    ingresosMensuales: '',
    rol: 'USER_ROLE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initialData = user
      ? {
          nombre: user.nombre || '',
          username: user.username || '',
          numeroCuenta: user.numeroCuenta || '',
          dpi: user.dpi || '',
          direccion: user.direccion || '',
          telefono: user.telefono || '',
          correo: user.correo || user.email || '',
          password: '',
          nombreTrabajo: user.nombreTrabajo || '',
          ingresosMensuales: user.ingresosMensuales ? String(user.ingresosMensuales) : '',
          rol: user.rol || 'USER_ROLE',
        }
      : {
          nombre: '',
          username: '',
          numeroCuenta: generateAccountNumber(),
          dpi: '',
          direccion: '',
          telefono: '',
          correo: '',
          password: '',
          nombreTrabajo: '',
          ingresosMensuales: '',
          rol: 'USER_ROLE',
        };

    queueMicrotask(() => {
      setFormData(initialData);
      setErrors({});
    });
  }, [user, isOpen]);

  const handleChange = (name, value) => {
    let sanitizedValue = value;

    if (name === 'telefono') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 8);
    } else if (name === 'dpi') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 13);
    } else if (name === 'ingresosMensuales') {
      sanitizedValue = value.replace(/[^\d.]/g, '');
      const parts = sanitizedValue.split('.');
      if (parts.length > 2) {
        sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameTrimmed = formData.nombre.trim();
    if (!nameTrimmed) {
      newErrors.nombre = 'Nombre requerido';
    } else {
      const parts = nameTrimmed.split(/\s+/);
      if (parts[0].length > 100) {
        newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
      } else if (parts.slice(1).join(' ').length > 100) {
        newErrors.nombre = 'El apellido no puede exceder 100 caracteres';
      }
    }

    const usernameTrimmed = formData.username.trim();
    if (!usernameTrimmed) {
      newErrors.username = 'Usuario requerido';
    } else if (usernameTrimmed.length < 4) {
      newErrors.username = 'Mínimo 4 caracteres';
    } else if (usernameTrimmed.length > 50) {
      newErrors.username = 'Máximo 50 caracteres';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Contraseña requerida';
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      } else if (formData.password.length > 100) {
        newErrors.password = 'Máximo 100 caracteres';
      }
    }

    const correoTrimmed = formData.correo.trim();
    if (!correoTrimmed) {
      newErrors.correo = 'Email requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoTrimmed)) {
      newErrors.correo = 'Formato de email inválido';
    } else if (correoTrimmed.length > 100) {
      newErrors.correo = 'Máximo 100 caracteres';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'Teléfono requerido';
    } else if (!/^\d{8}$/.test(formData.telefono)) {
      newErrors.telefono = 'Debe tener exactamente 8 dígitos numéricos';
    }

    const direccionTrimmed = formData.direccion.trim();
    if (!direccionTrimmed) {
      newErrors.direccion = 'Dirección requerida';
    } else if (direccionTrimmed.length > 200) {
      newErrors.direccion = 'Máximo 200 caracteres';
    }

    if (!isEditing) {
      if (!formData.dpi) {
        newErrors.dpi = 'DPI requerido';
      } else if (!/^\d{13}$/.test(formData.dpi)) {
        newErrors.dpi = 'Debe tener exactamente 13 dígitos numéricos';
      }
    }

    const trabajoTrimmed = formData.nombreTrabajo.trim();
    if (!trabajoTrimmed) {
      newErrors.nombreTrabajo = 'Nombre del trabajo requerido';
    } else if (trabajoTrimmed.length > 100) {
      newErrors.nombreTrabajo = 'Máximo 100 caracteres';
    }

    const ingresos = parseFloat(formData.ingresosMensuales);
    if (formData.ingresosMensuales === '' || isNaN(ingresos)) {
      newErrors.ingresosMensuales = 'Ingresos requeridos';
    } else if (ingresos < 100) {
      newErrors.ingresosMensuales = 'El mínimo es Q100.00';
    } else if (ingresos > 1000000) {
      newErrors.ingresosMensuales = 'El máximo es Q1,000,000.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;

    const dataToSend = { ...formData };
    dataToSend.ingresosMensuales = parseFloat(dataToSend.ingresosMensuales);
    
    if (isEditing && !dataToSend.password) {
      delete dataToSend.password;
    }

    onSubmit(dataToSend);
  };

  const formatCurrencyQuetzal = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'Q0.00';
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(num);
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.btnCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Form Scrollable */}
          <ScrollView 
            style={styles.scrollForm} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {/* Nombre Completo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nombre completo <Text style={{ color: colors.danger }}>*</Text>{' '}
                <Text style={styles.labelMuted}>(nombre y apellido)</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                placeholder="Juan García"
                placeholderTextColor={colors.muted}
                editable={!isLoading}
              />
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Usuario <Text style={{ color: colors.danger }}>*</Text>{' '}
                <Text style={styles.labelMuted}>(4–50 caracteres)</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={formData.username}
                onChangeText={(text) => handleChange('username', text)}
                placeholder="juangarcia"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Número de Cuenta (Solo Lectura) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                No. de Cuenta {!isEditing && <Text style={styles.labelMuted}>(automático)</Text>}
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.numeroCuenta}
                editable={false}
              />
            </View>

            {/* DPI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                DPI {isEditing ? <Text style={styles.labelMuted}>(no editable)</Text> : <Text style={{ color: colors.danger }}>*</Text>}
              </Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputDisabled, errors.dpi && styles.inputError]}
                value={formData.dpi}
                onChangeText={(text) => handleChange('dpi', text)}
                placeholder={!isEditing ? "1234567890123" : ""}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                editable={!isEditing && !isLoading}
              />
              {errors.dpi && <Text style={styles.errorText}>{errors.dpi}</Text>}
              {!isEditing && !errors.dpi && !!formData.dpi && (
                <Text style={styles.helperText}>{formData.dpi.length}/13 dígitos</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.correo && styles.inputError]}
                value={formData.correo}
                onChangeText={(text) => handleChange('correo', text)}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Teléfono <Text style={{ color: colors.danger }}>*</Text>{' '}
                <Text style={styles.labelMuted}>(8 dígitos)</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.telefono && styles.inputError]}
                value={formData.telefono}
                onChangeText={(text) => handleChange('telefono', text)}
                placeholder="12345678"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contraseña {!isEditing && <Text style={{ color: colors.danger }}>*</Text>}
              </Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder={isEditing ? 'Dejar vacío para no modificar' : 'Mínimo 6 caracteres'}
                placeholderTextColor={colors.muted}
                secureTextEntry={true}
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Dirección */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Dirección <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.inputTextArea, errors.direccion && styles.inputError]}
                value={formData.direccion}
                onChangeText={(text) => handleChange('direccion', text)}
                placeholder="Zona, calle, avenida, número de casa"
                placeholderTextColor={colors.muted}
                multiline={true}
                numberOfLines={2}
                editable={!isLoading}
              />
              {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}
            </View>

            {/* Nombre del Trabajo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nombre del trabajo <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.nombreTrabajo && styles.inputError]}
                value={formData.nombreTrabajo}
                onChangeText={(text) => handleChange('nombreTrabajo', text)}
                placeholder="Empresa S.A."
                placeholderTextColor={colors.muted}
                editable={!isLoading}
              />
              {errors.nombreTrabajo && <Text style={styles.errorText}>{errors.nombreTrabajo}</Text>}
            </View>

            {/* Ingresos Mensuales */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ingresos mensuales (Q) <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <View style={styles.currencyInputWrapper}>
                <Text style={styles.currencyPrefix}>Q</Text>
                <TextInput
                  style={[styles.input, styles.inputCurrency, errors.ingresosMensuales && styles.inputError]}
                  value={formData.ingresosMensuales}
                  onChangeText={(text) => handleChange('ingresosMensuales', text)}
                  placeholder="5000.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
              </View>
              {errors.ingresosMensuales && <Text style={styles.errorText}>{errors.ingresosMensuales}</Text>}
              {!!formData.ingresosMensuales && !errors.ingresosMensuales && (
                <Text style={styles.successText}>✓ {formatCurrencyQuetzal(formData.ingresosMensuales)}</Text>
              )}
            </View>

            {/* Selector de Rol Nivel Táctil */}
            <View style={[styles.inputGroup, { marginBottom: 32 }]}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.selectorContainer}>
                <TouchableOpacity
                  style={[styles.selectorOption, formData.rol === 'USER_ROLE' && styles.selectorOptionActive]}
                  onPress={() => handleChange('rol', 'USER_ROLE')}
                  disabled={isLoading}
                >
                  <Text style={[styles.selectorText, formData.rol === 'USER_ROLE' && styles.selectorTextActive]}>
                    Usuario
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectorOption, formData.rol === 'ADMIN_ROLE' && styles.selectorOptionActive]}
                  onPress={() => handleChange('rol', 'ADMIN_ROLE')}
                  disabled={isLoading}
                >
                  <Text style={[styles.selectorText, formData.rol === 'ADMIN_ROLE' && styles.selectorTextActive]}>
                    Administrador
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cuadro de Error de Servidor */}
            {submitError && (
              <View style={styles.serverErrorBox}>
                <Text style={styles.serverErrorText}>
                  <Text style={{ fontWeight: '700' }}>Error:</Text> {submitError}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Fijo */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSubmit}
              onPress={handleFormSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnSubmitText}>
                  {isEditing ? 'Actualizar' : 'Crear Usuario'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}