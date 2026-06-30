import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import useTransactionStore from '../store/useTransactionStore';
import { styles, colors } from './DepositForm.styles';

export default function DepositForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    currency: 'GTQ',
    reference: '',
    concept: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createDeposit } = useTransactionStore();

  const validateForm = () => {
    const newErrors = {};

    // Validar accountId
    if (!formData.accountId || formData.accountId.trim() === '') {
      newErrors.accountId = 'El número de cuenta es requerido';
    } else if (!/^[a-zA-Z0-9-]{3,}$/.test(formData.accountId.trim())) {
      newErrors.accountId = 'Formato de cuenta inválido';
    }

    // Validar amount
    if (!formData.amount || formData.amount === '') {
      newErrors.amount = 'El monto es requerido';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = 'El monto debe ser un número válido';
      } else if (amount <= 0) {
        newErrors.amount = 'El monto debe ser mayor a 0';
      } else if (amount > 999999999) {
        newErrors.amount = 'El monto excede el límite máximo permitido';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        newErrors.amount = 'El monto debe tener máximo 2 decimales';
      }
    }

    if (!formData.currency || !['GTQ', 'USD'].includes(formData.currency)) {
      newErrors.currency = 'Selecciona una moneda válida (GTQ o USD)';
    }

    // Validar referencia
    if (formData.reference && formData.reference.length > 100) {
      newErrors.reference = 'La referencia no puede exceder 100 caracteres';
    }

    // Validar concepto
    if (formData.concept && formData.concept.length > 500) {
      newErrors.concept = 'El concepto no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Atención', 'Por favor completa correctamente todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createDeposit({
        accountId: formData.accountId.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        reference: formData.reference.trim() || undefined,
        concept: formData.concept.trim() || undefined,
      });

      if (result.success) {
        Alert.alert('Éxito', 'Depósito creado exitosamente');
        setFormData({
          accountId: '',
          amount: '',
          currency: 'GTQ',
          reference: '',
          concept: '',
        });
        setErrors({});
        onSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar el depósito');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Error inesperado al procesar el depósito');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Crear Depósito</Text>
      <Text style={styles.subtitle}>Registra un depósito en GTQ o USD según la cuenta destino.</Text>

      <View style={styles.formGap}>
        {/* Account ID Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Número de cuenta *</Text>
          <TextInput
            style={[styles.input, errors.accountId && styles.inputError]}
            value={formData.accountId}
            onChangeText={(val) => handleFieldChange('accountId', val)}
            placeholder="Ej: número de cuenta en el banco"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.accountId && <Text style={styles.errorText}>{errors.accountId}</Text>}
        </View>

        {/* Currency Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Moneda *</Text>
          <View style={[styles.pickerContainer, errors.currency && styles.pickerContainerError]}>
            <Picker
              selectedValue={formData.currency}
              dropdownIconColor={colors.muted}
              onValueChange={(val) => handleFieldChange('currency', val)}
            >
              <Picker.Item label="GTQ — Quetzales" value="GTQ" color={Platform.OS === 'dark' ? '#FFF' : '#000'} />
              <Picker.Item label="USD — Dólares" value="USD" color={Platform.OS === 'dark' ? '#FFF' : '#000'} />
            </Picker>
          </View>
          {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}
        </View>

        {/* Amount Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Monto ({formData.currency}) *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            value={formData.amount}
            onChangeText={(val) => handleFieldChange('amount', val)}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
          {errors.amount ? (
            <Text style={styles.errorText}>{errors.amount}</Text>
          ) : (
            <Text style={styles.hintText}>Máximo 2 decimales</Text>
          )}
        </View>

        {/* Reference Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Referencia (Opcional)</Text>
          <TextInput
            style={[styles.input, errors.reference && styles.inputError]}
            value={formData.reference}
            onChangeText={(val) => handleFieldChange('reference', val)}
            placeholder="Ej: Transferencia bancaria"
            placeholderTextColor={colors.muted}
            maxLength={100}
          />
          {errors.reference && <Text style={styles.errorText}>{errors.reference}</Text>}
          <Text style={styles.hintText}>{formData.reference.length}/100</Text>
        </View>

        {/* Concept Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Concepto (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.concept && styles.inputError]}
            value={formData.concept}
            onChangeText={(val) => handleFieldChange('concept', val)}
            placeholder="Descripción del depósito"
            placeholderTextColor={colors.muted}
            maxLength={500}
            multiline
            numberOfLines={3}
          />
          {errors.concept && <Text style={styles.errorText}>{errors.concept}</Text>}
          <Text style={styles.hintText}>{formData.concept.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.btnSubmit, isSubmitting && styles.btnSubmitDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnSubmitText}>Crear Depósito</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}