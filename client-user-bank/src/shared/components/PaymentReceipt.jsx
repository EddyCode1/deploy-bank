import React from 'react';
import { View, Text } from 'react-native';

const formatCurrency = (value, currency = 'GTQ') => {
  const amount = Number(value ?? 0);
  return amount.toLocaleString('es-GT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const buildPaymentReceiptHtml = (receipt) => {
  if (!receipt) return '';

  const notes = [
    receipt.reference ? `<div class="row"><div class="label">Referencia</div><div class="value">${receipt.reference}</div></div>` : '',
    receipt.concept ? `<div class="row"><div class="label">Concepto</div><div class="value">${receipt.concept}</div></div>` : '',
    receipt.description ? `<div class="row"><div class="label">Descripción</div><div class="value">${receipt.description}</div></div>` : '',
  ].filter(Boolean).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #333; background: #f7f7f7; }
          .container { background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 0 16px rgba(0,0,0,0.08); }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 700; color: #0f4c81; }
          .subtitle { margin-top: 4px; font-size: 12px; color: #555; }
          .status { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #ffffff; background: #0f9d58; padding: 6px 12px; border-radius: 999px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .label { font-size: 11px; color: #7a7a7a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
          .value { font-size: 15px; font-weight: 700; color: #111; }
          .section { margin-top: 20px; }
          .section-title { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
          .box { background: #f3f6fb; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="brand">Banco del Quetzal</div>
              <div class="subtitle">Comprobante de operación</div>
            </div>
            <div class="status">${receipt.status || 'COMPLETADO'}</div>
          </div>
          <div class="box">
            <div class="row"><div class="label">Transacción</div><div class="value">${receipt.transactionId || '-'}</div></div>
            <div class="row"><div class="label">Fecha y hora</div><div class="value">${formatDateTime(receipt.dateTime)}</div></div>
            <div class="row"><div class="label">Operación</div><div class="value">${receipt.operationType}</div></div>
            <div class="row"><div class="label">Moneda</div><div class="value">${receipt.currency}</div></div>
          </div>
          <div class="section">
            <div class="section-title">Detalles</div>
            <div class="box">
              <div class="row"><div class="label">Cuenta origen</div><div class="value">${receipt.sourceAccount || '-'}</div></div>
              <div class="row"><div class="label">Cuenta destino / servicio</div><div class="value">${receipt.destination || '-'}</div></div>
              <div class="row"><div class="label">Monto</div><div class="value">${formatCurrency(receipt.amount, receipt.currency)}</div></div>
              ${receipt.exchangeRate ? `<div class="row"><div class="label">Tasa de cambio</div><div class="value">${receipt.exchangeRate}</div></div>` : ''}
            </div>
          </div>
          ${notes ? `<div class="section"><div class="section-title">Notas</div><div class="box">${notes}</div></div>` : ''}
        </div>
      </body>
    </html>
  `;
};

export default function PaymentReceipt({ receipt }) {
  if (!receipt) return null;

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <View>
          <Text style={localStyles.brand}>Banco del Quetzal</Text>
          <Text style={localStyles.subtitle}>Comprobante de operación</Text>
        </View>
        <View style={localStyles.statusBadge}>
          <Text style={localStyles.statusText}>{receipt.status || 'COMPLETADO'}</Text>
        </View>
      </View>

      <View style={localStyles.box}>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Transacción</Text>
          <Text style={localStyles.value}>{receipt.transactionId || '-'}</Text>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Fecha y hora</Text>
          <Text style={localStyles.value}>{formatDateTime(receipt.dateTime)}</Text>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Operación</Text>
          <Text style={localStyles.value}>{receipt.operationType}</Text>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Moneda</Text>
          <Text style={localStyles.value}>{receipt.currency}</Text>
        </View>
      </View>

      <View style={[localStyles.box, { marginTop: 16 }]}> 
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Cuenta origen</Text>
          <Text style={localStyles.value}>{receipt.sourceAccount || '-'}</Text>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Cuenta destino / servicio</Text>
          <Text style={localStyles.value}>{receipt.destination || '-'}</Text>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>Monto</Text>
          <Text style={localStyles.value}>{formatCurrency(receipt.amount, receipt.currency)}</Text>
        </View>
        {receipt.exchangeRate ? (
          <View style={localStyles.row}>
            <Text style={localStyles.label}>Tasa de cambio</Text>
            <Text style={localStyles.value}>{receipt.exchangeRate}</Text>
          </View>
        ) : null}
      </View>

      {(receipt.reference || receipt.concept || receipt.description) ? (
        <View style={[localStyles.box, { marginTop: 16 }]}> 
          {receipt.reference ? (
            <View style={localStyles.row}>
              <Text style={localStyles.label}>Referencia</Text>
              <Text style={localStyles.value}>{receipt.reference}</Text>
            </View>
          ) : null}
          {receipt.concept ? (
            <View style={localStyles.row}>
              <Text style={localStyles.label}>Concepto</Text>
              <Text style={localStyles.value}>{receipt.concept}</Text>
            </View>
          ) : null}
          {receipt.description ? (
            <View style={localStyles.row}>
              <Text style={localStyles.label}>Descripción</Text>
              <Text style={localStyles.value}>{receipt.description}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const localStyles = {
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    color: '#00adb5',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#9ca3af',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: '#0f9d58',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  box: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
};
