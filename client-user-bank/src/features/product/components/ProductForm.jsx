import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  StyleSheet, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa Enterprise
  danger: '#FF5A79',        // Alertas de error corregidas a paleta mate
  inputBg: '#151515',
};

function buildInitialFormData(product) {
  if (!product) {
    return {
      name: '',
      description: '',
      type: 'PRODUCTO',
      price: '',
      is_active: true,
    };
  }
  return {
    name: product.name,
    description: product.description || '',
    type: product.type,
    price: String(product.price), // Convertido a String para compatibilidad con TextInput
    is_active: product.is_active !== false,
  };
}

export default function ProductForm({ product, onSubmit, onClose }) {
  const [formData, setFormData] = useState(() => buildInitialFormData(product));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    if (!formData.price) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'El precio debe ser un número válido no negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        price: parseFloat(formData.price),
      };
      if (product) {
        payload.is_active = Boolean(formData.is_active);
      }
      await onSubmit(payload);
    } catch (err) {
      console.error('Error en el submit del producto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.modalContainer} contentContainerStyle={styles.contentContainer}>
      
      {/* HEADER DEL FORMULARIO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {product ? 'Editar Registro' : 'Nuevo Producto'}
        </Text>
        <TouchableOpacity onPress={onClose} accessibilityRole="button">
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* CUERPO DEL FORMULARIO */}
      <View style={styles.formBody}>
        
        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre del Activo *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => handleTextChange('name', text)}
            placeholder="Ej: Cuenta de Ahorro Preferencial"
            placeholderTextColor={colors.muted}
            maxLength={100}
          />
          <View style={styles.metaRow}>
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : <View />}
            <Text style={styles.charCount}>{formData.name.length}/100</Text>
          </View>
        </View>

        {/* Fila Dual: Categoría y Monto */}
        <View style={styles.dualRow}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(itemValue) => handleTextChange('type', itemValue)}
                style={styles.picker}
                dropdownIconColor={colors.primary}
              >
                <Picker.Item key="prod" label="Producto" value="PRODUCTO" color={Platform.OS === 'ios' ? colors.text : undefined} />
                <Picker.Item key="serv" label="Servicio" value="SERVICIO" color={Platform.OS === 'ios' ? colors.text : undefined} />
              </Picker>
            </View>
          </View>

          <View style={styles.flex1}>
            <Text style={styles.label}>Monto Unitario (Q) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={formData.price}
              onChangeText={(text) => handleTextChange('price', text)}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
        </View>

        {/* Descripción Técnica */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción Técnica</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => handleTextChange('description', text)}
            placeholder="Detalles adicionales del servicio..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCountRight}>{formData.description.length}/500</Text>
        </View>

        {/* Switch de Disponibilidad (Solo en edición) */}
        {product ? (
          <View style={styles.switchContainer}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchLabel}>Disponibilidad</Text>
              <Text style={styles.switchSubtitle}>
                Si desactivas el producto, dejará de mostrarse en el catálogo para clientes y no podrá solicitarse.
              </Text>
            </View>
            <Switch
              value={Boolean(formData.is_active)}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? colors.text : undefined}
            />
          </View>
        ) : null}

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Text style={styles.submitButtonText}>
                {product ? 'Guardar Cambios' : 'Confirmar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxHeight: '90%', // Asegura contención táctil limpia dentro de modales nativos
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.muted,
    padding: 4,
  },
  formBody: {
    padding: 20,
    gap: 18,
  },
  fieldGroup: {
    width: '100%',
  },
  dualRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: colors.text,
    fontSize: 14,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  textArea: {
    height: 80,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.danger,
    flex: 1,
  },
  charCount: {
    fontSize: 11,
    color: colors.muted,
  },
  charCountRight: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
    gap: 2,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  switchSubtitle: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
});