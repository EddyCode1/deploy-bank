import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useTransactionStore from '../store/useTransactionStore';
import { useMyAccounts } from '../../account/hooks/useMyAccounts';
import { notifyAccountsUpdated } from '../../../shared/events/bankingEvents';
import PaymentReceipt, { buildPaymentReceiptHtml } from '../../../shared/components/PaymentReceipt';
import { styles, colors } from './TransferForm.styles';

export default function TransferForm({ onSuccess, initialDestinationAccountId = '' }) {
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    destinationAccountId: '',
    amount: '',
    reference: '',
    concept: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { createTransfer } = useTransactionStore();

  const {
    accounts: myAccounts,
  } = useMyAccounts({ autoLoad: true });

  const formatCurrency = (value) => {
    const num = Number(value ?? 0);
    return 'Q ' + num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const balanceError = useMemo(() => {
    const amount = parseFloat(formData.amount);
    if (!selectedAccount || !amount || isNaN(amount)) return null;
    const balance = Number(selectedAccount.balance ?? 0);
    const limit = Number(selectedAccount.monthlyLimit ?? 0);
    if (amount > balance) {
      return `Saldo insuficiente. Tu saldo disponible es ${formatCurrency(balance)}`;
    }
    if (limit > 0 && amount > limit) {
      return `Supera el límite por transferencia de ${formatCurrency(limit)}`;
    }
    return null;
  }, [formData.amount, selectedAccount]);

  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting) return true;
    if (!selectedAccount) return true;
    const amount = parseFloat(formData.amount);
    if (!amount || isNaN(amount) || amount <= 0) return true;
    const balance = Number(selectedAccount.balance ?? 0);
    const limit = Number(selectedAccount.monthlyLimit ?? 0);
    if (amount > balance) return true;
    if (limit > 0 && amount > limit) return true;
    return false;
  }, [isSubmitting, formData.amount, selectedAccount]);

  useEffect(() => {
    const trimmed = initialDestinationAccountId?.trim();
    if (!trimmed) return;
    
    setFormData((prev) => ({
      ...prev,
      destinationAccountId: trimmed
    }));
  }, [initialDestinationAccountId]);

  const validateForm = () => {
    const newErrors = {};

    // Validar cuenta origen
    if (!formData.sourceAccountId || formData.sourceAccountId.trim() === '') {
      newErrors.sourceAccountId = 'La cuenta origen es requerida';
    } else if (!/^[a-zA-Z0-9-]{3,}$/.test(formData.sourceAccountId.trim())) {
      newErrors.sourceAccountId = 'Formato de cuenta origen inválido';
    }

    // Validar cuenta destino
    if (!formData.destinationAccountId || formData.destinationAccountId.trim() === '') {
      newErrors.destinationAccountId = 'La cuenta destino es requerida';
    } else if (!/^[a-zA-Z0-9-]{3,}$/.test(formData.destinationAccountId.trim())) {
      newErrors.destinationAccountId = 'Formato de cuenta destino inválido';
    }

    // Validar que las cuentas sean diferentes
    if (
      formData.sourceAccountId.trim() &&
      formData.destinationAccountId.trim() &&
      formData.sourceAccountId.trim() === formData.destinationAccountId.trim()
    ) {
      newErrors.destinationAccountId = 'La cuenta destino debe ser diferente a la cuenta origen';
    }

    // Validar monto
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
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptData) return;
    setDownloadLoading(true);
    try {
      const html = buildPaymentReceiptHtml(receiptData);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Guardar comprobante' });
      }
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      Alert.alert('Error', 'No fue posible generar el comprobante en PDF.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Atención', 'Por favor completa correctamente todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTransfer({
        sourceAccountId: formData.sourceAccountId.trim(),
        destinationAccountId: formData.destinationAccountId.trim(),
        amount: parseFloat(formData.amount),
        reference: formData.reference.trim() || undefined,
        concept: formData.concept.trim() || undefined
      });

      if (result.success) {
        const receipt = {
          transactionId: result.data?.id || result.data?._id || result.data?.transactionId || `TRX-${Date.now()}`,
          dateTime: new Date().toISOString(),
          operationType: 'Transferencia',
          sourceAccount: formData.sourceAccountId.trim(),
          destination: formData.destinationAccountId.trim(),
          amount: parseFloat(formData.amount),
          currency: 'GTQ',
          status: 'COMPLETADO',
          reference: formData.reference.trim() || undefined,
          concept: formData.concept.trim() || undefined,
        };

        Alert.alert('Éxito', 'Transferencia realizada con éxito. Puedes descargar tu comprobante.');
        notifyAccountsUpdated();
        setReceiptData(receipt);
        setFormData({
          sourceAccountId: '',
          destinationAccountId: '',
          amount: '',
          reference: '',
          concept: ''
        });
        setSelectedAccount(null);
        setErrors({});
        onSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar la transferencia');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Error inesperado al procesar la transferencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Crear Transferencia</Text>
      <Text style={styles.subtitle}>Envía dinero entre cuentas y registra referencia/concepto opcional.</Text>

      <View style={styles.formGap}>
        {/* Source Account Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuenta Origen *</Text>
          <View style={[styles.pickerContainer, errors.sourceAccountId && styles.pickerContainerError]}>
            <Picker
              selectedValue={formData.sourceAccountId}
              dropdownIconColor={colors.muted}
              onValueChange={(val) => {
                const account = myAccounts.find((a) => a.accountNumber === val);
                setSelectedAccount(account || null);
                handleFieldChange('sourceAccountId', val);
              }}
            >
              <Picker.Item label="Selecciona tu cuenta" value="" color={colors.muted} />
              {myAccounts.map((account) => (
                <Picker.Item
                  key={account.id || account.accountNumber}
                  label={`${account.accountNumber} - ${account.type}`}
                  value={account.accountNumber}
                  color={Platform.OS === 'ios' ? colors.text : undefined}
                />
              ))}
            </Picker>
          </View>
          {errors.sourceAccountId && <Text style={styles.errorText}>{errors.sourceAccountId}</Text>}
          {selectedAccount && (
            <Text style={styles.balanceText}>
              Saldo disponible: {formatCurrency(selectedAccount.balance)}
            </Text>
          )}
          {selectedAccount && (
            <View style={styles.dailyLimitBox}>
              <Text style={styles.dailyLimitRow}>
                <Text style={styles.dailyLimitLabel}>Límite por transferencia: </Text>
                {formatCurrency(selectedAccount.monthlyLimit ?? 2000)}
              </Text>
              <Text style={styles.dailyLimitRow}>
                <Text style={styles.dailyLimitLabel}>Transferido hoy: </Text>
                {formatCurrency(selectedAccount.dailyTransferredAmount ?? 0)}
              </Text>
              {(() => {
                const dailyLimit = Number(selectedAccount.dailyLimit ?? 10000);
                const transferred = Number(selectedAccount.dailyTransferredAmount ?? 0);
                const available = Math.max(0, dailyLimit - transferred);
                if (available <= 0) {
                  return (
                    <Text style={[styles.dailyLimitRow, styles.dailyLimitDanger]}>
                      Alcanzaste tu límite diario de transferencias
                    </Text>
                  );
                }
                return (
                  <Text style={[styles.dailyLimitRow, available < 100 && styles.dailyLimitWarning]}>
                    <Text style={styles.dailyLimitLabel}>Disponible hoy: </Text>
                    {formatCurrency(available)}
                  </Text>
                );
              })()}
            </View>
          )}
        </View>

        {/* Destination Account Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuenta Destino *</Text>
          <TextInput
            style={[styles.input, errors.destinationAccountId && styles.inputError]}
            value={formData.destinationAccountId}
            onChangeText={(val) => handleFieldChange('destinationAccountId', val)}
            placeholder="Ej: número de cuenta del beneficiario"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.destinationAccountId && <Text style={styles.errorText}>{errors.destinationAccountId}</Text>}
        </View>

        {/* Amount Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Monto (GTQ) *</Text>
          <TextInput
            style={[styles.input, (errors.amount || balanceError) && styles.inputError]}
            value={formData.amount}
            onChangeText={(val) => handleFieldChange('amount', val)}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
          {errors.amount ? (
            <Text style={styles.errorText}>{errors.amount}</Text>
          ) : balanceError ? (
            <Text style={styles.errorText}>{balanceError}</Text>
          ) : (
            <Text style={styles.hintText}>Máximo 2 decimales</Text>
          )}
          {!balanceError && !errors.amount && selectedAccount && (
            <Text style={styles.limitText}>
              Límite por transferencia: {formatCurrency(selectedAccount.monthlyLimit ?? 2000)}
            </Text>
          )}
        </View>

        {/* Reference Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Referencia (Opcional)</Text>
          <TextInput
            style={[styles.input, errors.reference && styles.inputError]}
            value={formData.reference}
            onChangeText={(val) => handleFieldChange('reference', val)}
            placeholder="Ej: Pago de servicios"
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
            placeholder="Descripción de la transferencia"
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
          style={[styles.btnSubmit, isSubmitDisabled && styles.btnSubmitDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnSubmitText}>Realizar Transferencia</Text>
          )}
        </TouchableOpacity>

        {receiptData && (
          <View style={styles.receiptSection}>
            <TouchableOpacity
              style={[styles.btnSubmit, downloadLoading && styles.btnSubmitDisabled]}
              onPress={handleDownloadReceipt}
              disabled={downloadLoading}
            >
              {downloadLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnSubmitText}>Descargar comprobante</Text>
              )}
            </TouchableOpacity>
            <PaymentReceipt receipt={receiptData} />
          </View>
        )}

      </View>
    </View>
  );
}