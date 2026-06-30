import React from 'react';
import { View, Text, Platform } from 'react-native';
import { styles, colors } from '../screens/ServiceScreen.styles';

export default function PaymentHistory({ payments = [], isAdmin }) {
  if (payments.length === 0) {
    return <Text style={[styles.subtitle, { marginTop: 8 }]}>No hay pagos registrados todavía.</Text>;
  }

  return (
    <View style={{ marginTop: 8 }}>
      {payments.map((payment) => (
        <View key={payment._id} style={styles.historyItem}>
          <View style={styles.historyRow}>
            <Text style={styles.historyTextMain}>{payment.service_id?.name || 'Servicio'}</Text>
            <Text style={[styles.historyTextMain, { color: colors.primary }]}>
              -{Number(payment.amount_debited ?? 0).toFixed(2)} {payment.currency_to}
            </Text>
          </View>
          
          <View style={styles.historyRow}>
            <Text style={styles.historyTextMuted}>
              Cuenta: {payment.account_id?.account_number || '—'}
            </Text>
            <Text style={styles.historyTextMuted}>
              Sol: {Number(payment.amount_requested ?? 0).toFixed(2)} {payment.currency_from}
            </Text>
          </View>

          <View style={styles.historyRow}>
            <Text style={styles.historyTextMuted}>Ref: {payment.reference || '—'}</Text>
            <Text style={styles.historyTextMuted}>
              {new Date(payment.createdAt).toLocaleDateString('es-GT')}
            </Text>
          </View>

          {isAdmin && (
            <Text style={[styles.historyTextMuted, { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
              User ID: ...{String(payment.user_id || '').slice(-8).toUpperCase()}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}