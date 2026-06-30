import React, { useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import useTransactionStore from '../store/useTransactionStore';
import { styles, colors } from './TransactionDetail.styles';

export default function TransactionDetail({ transactionId, onClose }) {
  const { currentTransaction, loading, fetchTransactionById } = useTransactionStore();

  useEffect(() => {
    if (transactionId) {
      void fetchTransactionById(transactionId);
    }
  }, [transactionId, fetchTransactionById]);

  // Formateadores de fecha y dinero locales (es-GT)
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount, currency = 'GTQ') => {
    const validAmount = typeof amount === 'number' ? amount : 0;
    const prefix = currency === 'GTQ' ? 'Q' : '$';
    return `${prefix} ${validAmount.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Render para estado de carga aislado
  if (loading) {
    return (
      <Modal animationType="fade" transparent visible={!!transactionId} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </Modal>
    );
  }

  if (!currentTransaction) return null;

  // Adaptación de mapeo de llaves API dinámicas
  const tx = currentTransaction.data || currentTransaction;
  const transactionId_display = tx._id || tx.id || 'N/A';
  const transactionType = tx.type || tx.transactionType || tx.transaction_type || 'Desconocido';
  const transactionAmount = Number(tx.amount ?? tx.transaction_amount ?? 0);
  const transactionCurrency = tx.currency || tx.currency_to || tx.currency_from || tx.account_id?.currency || 'GTQ';
  const transactionStatus = (tx.status || 'completada').toLowerCase();
  const amountDebited = Number(tx.amount_debited ?? tx.debit_amount ?? tx.amount ?? tx.transaction_amount ?? 0);
  const amountCredited = Number(tx.amount_credited ?? tx.credit_amount ?? tx.amount ?? tx.transaction_amount ?? 0);
  const fromCurrency = tx.currency_from || tx.from_currency || transactionCurrency;
  const toCurrency = tx.currency_to || tx.to_currency || transactionCurrency;
  const exchangeRate = tx.exchange_rate;
  const conversionNote = tx.conversion_note;

  // Lógica de estilos del badge de estado
  const isCompleted = transactionStatus === 'completed' || transactionStatus === 'completada';
  const isPending = transactionStatus === 'pending';
  const badgeStyle = isCompleted ? styles.badge : { ...styles.badge, backgroundColor: isPending ? colors.warningBg : colors.dangerBg };
  const badgeTextStyle = {
    ...styles.badgeText,
    color: isCompleted ? colors.primary : (isPending ? colors.warning : colors.danger)
  };

  const showConversion = fromCurrency || toCurrency || exchangeRate || conversionNote;

  return (
    <Modal animationType="fade" transparent visible={!!transactionId} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalles de Transacción</Text>
            <TouchableOpacity style={styles.btnCloseX} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.btnCloseXText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* CUERPO CON SCROLL */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* ID Block */}
            <View style={styles.infoBlock}>
              <Text style={styles.label}>ID Transacción</Text>
              <Text style={styles.valueText} selectable>{transactionId_display}</Text>
            </View>

            {/* Tipo y Estado en Grid */}
            <View style={styles.gridTwoColumns}>
              <View style={[styles.infoBlock, styles.gridColumn]}>
                <Text style={styles.label}>Tipo</Text>
                <Text style={[styles.valueText, styles.valueTextCapitalize]}>{transactionType}</Text>
              </View>
              
              <View style={[styles.infoBlock, styles.gridColumn]}>
                <Text style={styles.label}>Estado</Text>
                <View style={[badgeStyle, isCompleted && { backgroundColor: colors.successBg }]}>
                  <Text style={badgeTextStyle}>{transactionStatus}</Text>
                </View>
              </View>
            </View>

            {/* Monto Principal */}
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Monto principal</Text>
              <Text style={[styles.valueAmount, { color: transactionAmount >= 0 ? colors.primary : colors.danger }]}>
                {formatCurrency(transactionAmount, transactionCurrency)}
              </Text>
            </View>

            {/* Fecha */}
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.valueText}>{formatDate(tx.createdAt || tx.date)}</Text>
            </View>

            {/* Bloque Informativo de Conversión */}
            {showConversion && (
              <View style={styles.conversionContainer}>
                <Text style={styles.conversionTitle}>Información de conversión</Text>
                <View style={styles.conversionGrid}>
                  <View style={styles.conversionItem}>
                    <Text style={styles.conversionLabel}>Monto debitado</Text>
                    <Text style={styles.conversionValue}>{formatCurrency(amountDebited, fromCurrency || 'GTQ')}</Text>
                  </View>
                  <View style={styles.conversionItem}>
                    <Text style={styles.conversionLabel}>Monto acreditado</Text>
                    <Text style={styles.conversionValue}>{formatCurrency(amountCredited, toCurrency || 'GTQ')}</Text>
                  </View>
                  <View style={styles.conversionItem}>
                    <Text style={styles.conversionLabel}>Moneda origen</Text>
                    <Text style={styles.conversionValue}>{fromCurrency || 'N/A'}</Text>
                  </View>
                  <View style={styles.conversionItem}>
                    <Text style={styles.conversionLabel}>Moneda destino</Text>
                    <Text style={styles.conversionValue}>{toCurrency || 'N/A'}</Text>
                  </View>
                  {exchangeRate && (
                    <View style={styles.conversionItemFull}>
                      <Text style={styles.conversionLabel}>Tasa usada</Text>
                      <Text style={styles.conversionValue}>{exchangeRate}</Text>
                    </View>
                  )}
                  {conversionNote && (
                    <View style={styles.conversionItemFull}>
                      <Text style={styles.conversionLabel}>Nota de conversión</Text>
                      <Text style={styles.conversionValue}>{conversionNote}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Opcionales: Referencia, Concepto y Descripción */}
            {tx.reference && (
              <View style={styles.infoBlock}>
                <Text style={styles.label}>Referencia</Text>
                <Text style={styles.valueText}>{tx.reference}</Text>
              </View>
            )}

            {tx.concept && (
              <View style={styles.infoBlock}>
                <Text style={styles.label}>Concepto</Text>
                <Text style={styles.valueText}>{tx.concept}</Text>
              </View>
            )}

            {tx.description && (
              <View style={styles.infoBlock}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.valueText}>{tx.description}</Text>
              </View>
            )}
          </ScrollView>

          {/* BOTÓN PRINCIPAL CERRAR */}
          <TouchableOpacity style={styles.btnMainClose} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnMainCloseText}>Cerrar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}