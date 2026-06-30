import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import useAuthStore from '../../auth/store/useAuthStore';
import { authService } from '../../auth/services/authService';
import { publicClient } from '../../../shared/api/adminClient';

// Imagen por defecto local para el entorno móvil
const DEFAULT_PROFILE = require('../../../../assets/avatarDefault.png');

// Paleta de colores Premium Matte Dark
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  primaryHover: '#007A80',
  danger: '#EF4444',
  white: '#FFFFFF',
  inputBg: '#1A1A1A'
};

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const scrollViewRef = useRef(null);

  const [photoSrc, setPhotoSrc] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del Formulario Controlado
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    trabajo: '',
    ingresoMensual: ''
  });

  const [errors, setErrors] = useState({});

  // Sincroniza imagen de perfil
  useEffect(() => {
    if (user?.profilePicture?.trim()) {
      setPhotoSrc({ uri: user.profilePicture });
    } else {
      setPhotoSrc(DEFAULT_PROFILE);
    }
  }, [user?.profilePicture]);

  // Inicializa y restablece valores del formulario
  const resetForm = () => {
    setForm({
      nombre: user?.nombre || '',
      telefono: user?.telefono || '',
      direccion: user?.direccion || '',
      trabajo: user?.trabajo || '',
      ingresoMensual: user?.ingresoMensual != null ? String(user.ingresoMensual) : ''
    });
    setErrors({});
  };

  useEffect(() => {
    resetForm();
  }, [user]);

  // Sincronización inicial desde el backend
  useEffect(() => {
    let mounted = true;

    const syncProfileFromBackend = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (!mounted || !result.success || !result.user) return;
        patchUser(result.user);
      } catch (err) {
        console.error('Error al sincronizar perfil:', err);
      }
    };

    void syncProfileFromBackend();
    return () => {
      mounted = false;
    };
  }, [patchUser]);

  // Manejo de cambio de fotografía usando la API Nativa
  const handlePhotoChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Es necesario el acceso a la galería para cambiar tu foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
      base64: true, // Requerido para simular la persistencia DataURL (base64) del entorno web
    });

    if (result.canceled || !result.assets?.[0]) return;

    try {
      const asset = result.assets[0];
      const dataUrl = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      
      patchUser({ profilePicture: dataUrl });
      setPhotoSrc({ uri: dataUrl });
      Alert.alert('Éxito', 'Foto guardada en este dispositivo localmente.');
    } catch (err) {
      Alert.alert('Error', 'No se pudo procesar la imagen elegida.');
    }
  };

  // Validaciones manuales antes del envío
  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
      valid = false;
    }

    if (form.telefono && !/^[0-9\-\s+()]{7,20}$/.test(form.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
      valid = false;
    }

    if (form.direccion && form.direccion.length > 180) {
      newErrors.direccion = 'La dirección no puede exceder 180 caracteres';
      valid = false;
    }

    if (form.trabajo && form.trabajo.length > 120) {
      newErrors.trabajo = 'El lugar de trabajo no puede exceder 120 caracteres';
      valid = false;
    }

    if (form.ingresoMensual && Number(form.ingresoMensual) < 0) {
      newErrors.ingresoMensual = 'El ingreso mensual no puede ser negativo';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Envío del formulario al endpoint API
  const onSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const nameParts = String(form.nombre || '').trim().split(/\s+/);
      const payload = {
        name: nameParts[0] || undefined,
        surname: nameParts.slice(1).join(' ') || undefined,
        phone: form.telefono || undefined,
        address: String(form.direccion || '').trim() || undefined,
        workName: String(form.trabajo || '').trim() || undefined,
        monthlyIncome: form.ingresoMensual !== '' && form.ingresoMensual != null
          ? Number(form.ingresoMensual)
          : undefined,
      };

      const response = await publicClient.put('/users/me', payload);
      
      if (!response.data?.success) {
        Alert.alert('Error', response.data?.message || 'No se pudo actualizar el perfil');
        return;
      }

      const refreshedProfile = await authService.getCurrentUser();
      if (refreshedProfile.success && refreshedProfile.user) {
        patchUser(refreshedProfile.user);
      } else {
        patchUser({
          ...user,
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion,
          trabajo: form.trabajo,
          ingresoMensual: form.ingresoMensual !== '' ? Number(form.ingresoMensual) : null,
        });
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditMode(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al actualizar perfil';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header de Sección */}
        <View style={styles.headerCard}>
          <Text style={styles.sectionTag}>CUENTA</Text>
          <Text style={styles.mainTitle}>Mi perfil</Text>
          <Text style={styles.sectionSubtitle}>
            Consulta y edita tus datos personales. La foto se procesará y guardará en el almacenamiento de este dispositivo móvil.
          </Text>
        </View>

        {/* Sección Foto de Perfil */}
        <View style={styles.photoContainer}>
          <Text style={styles.photoBoxTitle}>Foto de Perfil</Text>
          <View style={styles.imageFrame}>
            <Image
              source={photoSrc}
              style={styles.avatarImage}
              onError={() => setPhotoSrc(DEFAULT_PROFILE)}
            />
          </View>
          <TouchableOpacity style={styles.btnChangePhoto} onPress={handlePhotoChange}>
            <Text style={styles.btnChangePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
          <Text style={styles.photoFootnote}>Se guarda localmente de forma optimizada.</Text>
        </View>

        {/* Sección Datos Personales */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeaderRow}>
            <Text style={styles.detailsTitle}>Datos personales</Text>
            {!editMode && (
              <TouchableOpacity style={styles.btnEdit} onPress={() => setEditMode(true)}>
                <Text style={styles.btnEditText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {editMode ? (
            <View style={styles.formContainer}>
              {/* Campo Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={[styles.textInput, errors.nombre && styles.inputErrorBorder]}
                  value={form.nombre}
                  onChangeText={(v) => setForm({ ...form, nombre: v })}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={colors.muted}
                  editable={!loading}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
              </View>

              {/* Campo Usuario (Solo Lectura) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Usuario</Text>
                <TextInput
                  style={[styles.textInput, styles.inputReadOnly]}
                  value={user?.username || ''}
                  editable={false}
                />
                <Text style={styles.inputHint}>Este campo no es editable.</Text>
              </View>

              {/* Campo Correo (Solo Lectura) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={[styles.textInput, styles.inputReadOnly]}
                  value={user?.email || ''}
                  editable={false}
                  keyboardType="email-address"
                />
                <Text style={styles.inputHint}>Este campo no es editable.</Text>
              </View>

              {/* Campo Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={[styles.textInput, errors.telefono && styles.inputErrorBorder]}
                  value={form.telefono}
                  onChangeText={(v) => setForm({ ...form, telefono: v })}
                  placeholder="Ej. +502 5555-5555"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
                {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
              </View>

              {/* Campo Dirección */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <TextInput
                  style={[styles.textInput, errors.direccion && styles.inputErrorBorder]}
                  value={form.direccion}
                  onChangeText={(v) => setForm({ ...form, direccion: v })}
                  placeholder="Tu dirección residencial"
                  placeholderTextColor={colors.muted}
                  editable={!loading}
                />
                {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}
              </View>

              {/* Campo Lugar de Trabajo */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lugar de trabajo</Text>
                <TextInput
                  style={[styles.textInput, errors.trabajo && styles.inputErrorBorder]}
                  value={form.trabajo}
                  onChangeText={(v) => setForm({ ...form, trabajo: v })}
                  placeholder="Empresa o Institución"
                  placeholderTextColor={colors.muted}
                  editable={!loading}
                />
                {errors.trabajo && <Text style={styles.errorText}>{errors.trabajo}</Text>}
              </View>

              {/* Campo Ingreso Mensual */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ingreso mensual</Text>
                <TextInput
                  style={[styles.textInput, errors.ingresoMensual && styles.inputErrorBorder]}
                  value={form.ingresoMensual}
                  onChangeText={(v) => setForm({ ...form, ingresoMensual: v })}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.ingresoMensual && <Text style={styles.errorText}>{errors.ingresoMensual}</Text>}
              </View>

              {/* Acciones del Formulario */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.btnAction, styles.btnSubmit]} 
                  onPress={onSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.btnActionText}>Guardar cambios</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.btnAction, styles.btnCancel]} 
                  onPress={() => { setEditMode(false); resetForm(); }}
                  disabled={loading}
                >
                  <Text style={[styles.btnActionText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Vista de Lectura (Data Labels) */
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{user?.nombre || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Usuario</Text>
                <Text style={styles.infoValue}>{user?.username || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Correo</Text>
                <Text style={[styles.infoValue, { fontSize: 13 }]} numberOfLines={1}>
                  {user?.email || '—'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user?.telefono || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{user?.direccion || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lugar de trabajo</Text>
                <Text style={styles.infoValue}>{user?.trabajo || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ingreso mensual</Text>
                <Text style={styles.infoValue}>
                  {user?.ingresoMensual != null && user?.ingresoMensual !== ''
                    ? Number(user.ingresoMensual).toLocaleString('es-GT', {
                        style: 'currency',
                        currency: 'GTQ',
                        maximumFractionDigits: 2,
                      })
                    : '—'}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Rol asignado</Text>
                <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
                  {user?.rol || '—'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 18,
  },
  photoContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageFrame: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 130,
    height: 130,
    backgroundColor: colors.inputBg,
  },
  btnChangePhoto: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 18,
  },
  btnChangePhotoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  photoFootnote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 10,
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  btnEdit: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  formContainer: {
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  inputReadOnly: {
    backgroundColor: '#161616',
    borderColor: '#222',
    color: colors.muted,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  inputHint: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmit: {
    backgroundColor: colors.primary,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  btnActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  infoList: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.muted,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 2,
  },
});