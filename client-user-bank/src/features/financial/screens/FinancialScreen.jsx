import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Platform, 
  Alert 
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Servicios y Constantes compartidas
import { financialService } from '../service/financialService';
import { TRANSACTION_FILTER_OPTIONS } from '../constants/financialData';

// Componentes ya migrados a Mobile
import FinancialSummaryCard from '../components/FinancialSummaryCard';
import FinancialFilters from '../components/FinancialFilters';
import FinancialHistoryList from '../components/FinancialHistoryList';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  successBg: 'rgba(34, 197, 94, 0.15)',
  successText: '#22C55E',
  skyBg: 'rgba(0, 173, 181, 0.15)',
  skyText: '#00ADB5',
  danger: '#EF4444',
};

const formatCurrency = (value, currency = 'GTQ') =>
  Number(value ?? 0).toLocaleString('es-GT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });

const initialFilters = {
  startDate: '',
  endDate: '',
  type: 'Todos',
  currency: 'Todos',
  status: 'Todos',
  search: '',
  ...TRANSACTION_FILTER_OPTIONS,
};

const buildDashboardSummary = (cards, loans) => {
  const totalCardBalance = cards.reduce((sum, item) => sum + (item.balanceDue ?? 0), 0);
  const totalLoanBalance = loans.reduce((sum, item) => sum + (item.outstandingBalance ?? 0), 0);
  return [
    {
      title: 'Saldo total tarjetas',
      value: formatCurrency(totalCardBalance, 'GTQ'),
      subtitle: 'Saldo pendiente consolidado en todas las tarjetas',
    },
    {
      title: 'Saldo total préstamos',
      value: formatCurrency(totalLoanBalance, 'GTQ'),
      subtitle: 'Saldo pendiente consolidado en préstamos activos',
    },
    {
      title: 'Servicios de consulta',
      value: 'Tarjetas & Préstamos',
      subtitle: 'Historial de transacciones, exportación y control financiero',
    },
  ];
};

export default function FinancialScreen() {
  const [creditCards, setCreditCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cardsError, setCardsError] = useState(null);
  const [loansError, setLoansError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cardsResult, loansResult] = await Promise.all([
          financialService.getCreditCards(),
          financialService.getLoans(),
        ]);

        if (cardsResult.success) {
          setCreditCards(cardsResult.data);
          setCardsError(null);
        } else {
          setCreditCards([]);
          setCardsError(cardsResult.error);
        }

        if (loansResult.success) {
          setLoans(loansResult.data);
          setLoansError(null);
        } else {
          setLoans([]);
          setLoansError(loansResult.error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const result = await financialService.getFinancialHistory(filters);
        if (result.success) {
          setHistory(result.data);
        } else {
          setHistory([]);
          setHistoryError(result.error);
        }
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [filters]);

  const summary = useMemo(() => buildDashboardSummary(creditCards, loans), [creditCards, loans]);

  // Generación nativa resiliente de PDFs a través de HTML estático
  const handleExportPdf = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
              h1 { color: #111; font-size: 20px; border-bottom: 2px solid #00ADB5; padding-bottom: 10px; }
              .section-title { font-size: 16px; margin-top: 25px; color: #222; text-transform: uppercase; }
              .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 10px; background: #fafafa; }
              .grid { display: flex; flex-wrap: wrap; gap: 10px; }
              .grid-cell { flex: 1; min-width: 45%; background: white; padding: 10px; border: 1px solid #eee; border-radius: 6px; }
              .label { font-size: 10px; color: #666; text-transform: uppercase; }
              .value { font-size: 14px; font-weight: bold; margin-top: 4px; }
            </style>
          </head>
          <body>
            <h1>Estado de Cuenta Consolidado</h1>
            <p>Generado el: ${new Date().toLocaleDateString('es-GT')}</p>
            
            <div class="section-title">Resumen de Saldos</div>
            ${summary.map(s => `
              <div class="card">
                <div class="label">${s.title}</div>
                <div class="value" style="font-size: 18px; color: #00ADB5;">${s.value}</div>
                <div style="font-size: 11px; color:#777;">${s.subtitle}</div>
              </div>
            `).join('')}

            <div class="section-title">Tarjetas de Crédito</div>
            ${creditCards.map(c => `
              <div class="card">
                <div style="font-weight:bold;">${c.name} (${c.status})</div>
                <div class="grid" style="margin-top:10px;">
                  <div class="grid-cell"><div class="label">Pendiente</div><div class="value">${formatCurrency(c.balanceDue, c.currency)}</div></div>
                  <div class="grid-cell"><div class="label">Disponible</div><div class="value">${formatCurrency(c.availableBalance, c.currency)}</div></div>
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Guardar Reporte Financiero' });
      }
    } catch (err) {
      console.error('Error exportando PDF:', err);
      Alert.alert('Error', 'No fue posible exportar el PDF en este dispositivo.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header Principal */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Consulta de Saldo</Text>
          <Text style={styles.headerSubtitle}>
            Accede a la información consolidada de tus tarjetas y préstamos con estándar enterprise.
          </Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPdf}>
          <Text style={styles.exportButtonText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Grid de Resumen */}
      <View style={styles.summaryGrid}>
        {loading ? (
          <View style={styles.innerLoading}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Cargando saldos...</Text>
          </View>
        ) : (
          summary.map((item) => (
            <FinancialSummaryCard key={item.title} {...item} />
          ))
        )}
      </View>

      {/* Sección: Tarjetas de Crédito */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarjetas de Crédito</Text>
        {cardsError && (
          <View style={styles.innerLoading}>
            <Text style={styles.errorText}>{cardsError}</Text>
          </View>
        )}
        <View style={styles.listGap}>
          {creditCards.map((card) => (
            <View key={card.id} style={styles.entityCard}>
              <View style={styles.entityHeader}>
                <View>
                  <Text style={styles.entityName}>{card.name}</Text>
                  <Text style={styles.entityMeta}>{card.type} · {card.currency}</Text>
                </View>
                <View style={styles.skyBadge}>
                  <Text style={styles.skyBadgeText}>{card.status}</Text>
                </View>
              </View>

              <View style={styles.subGrid}>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Límite autorizado</Text>
                  <Text style={styles.subValue}>{formatCurrency(card.authorizedLimit, card.currency)}</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Saldo pendiente</Text>
                  <Text style={styles.subValue}>{formatCurrency(card.balanceDue, card.currency)}</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Saldo disponible</Text>
                  <Text style={styles.subValue}>{formatCurrency(card.availableBalance, card.currency)}</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Pago mínimo</Text>
                  <Text style={styles.subValue}>{formatCurrency(card.minimumPayment, card.currency)}</Text>
                </View>
              </View>

              <View style={styles.entityFooter}>
                <Text style={styles.footerDateText}>Corte: {card.cutOffDate}</Text>
                <Text style={styles.footerDateText}>Límite de pago: {card.paymentDueDate}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sección: Préstamos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préstamos Activos</Text>
        {loansError && (
          <View style={styles.innerLoading}>
            <Text style={styles.errorText}>{loansError}</Text>
          </View>
        )}
        <View style={styles.listGap}>
          {loans.map((loan) => (
            <View key={loan.id} style={styles.entityCard}>
              <View style={styles.entityHeader}>
                <View>
                  <Text style={styles.entityName}>{loan.name}</Text>
                  <Text style={styles.entityMeta}>{loan.type}</Text>
                </View>
                <View style={styles.successBadge}>
                  <Text style={styles.successBadgeText}>{loan.status}</Text>
                </View>
              </View>

              <View style={styles.subGrid}>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Monto original</Text>
                  <Text style={styles.subValue}>{formatCurrency(loan.principalAmount)}</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Saldo pendiente</Text>
                  <Text style={styles.subValue}>{formatCurrency(loan.outstandingBalance)}</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Tasa interés</Text>
                  <Text style={styles.subValue}>{loan.interestRate}%</Text>
                </View>
                <View style={styles.subCard}>
                  <Text style={styles.subLabel}>Cuota mensual</Text>
                  <Text style={styles.subValue}>{formatCurrency(loan.monthlyInstallment)}</Text>
                </View>
              </View>

              <View style={styles.entityFooter}>
                <Text style={styles.footerDateText}>Próximo pago: {loan.nextPaymentDate}</Text>
                <Text style={styles.footerDateText}>Plazo restante: {loan.termRemaining}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Sección: Historial de Movimientos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Movimientos</Text>
        <FinancialFilters filters={filters} onChange={setFilters} />
        <View style={styles.historyContainer}>
          {historyLoading ? (
            <View style={styles.innerLoading}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingText}>Filtrando transacciones...</Text>
            </View>
          ) : historyError ? (
            <View style={styles.innerLoading}>
              <Text style={styles.errorText}>{historyError}</Text>
            </View>
          ) : (
            <FinancialHistoryList items={history} />
          )}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  headerTextWrap: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  exportButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryGrid: {
    gap: 12,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  listGap: {
    gap: 12,
  },
  entityCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  entityMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  skyBadge: {
    backgroundColor: colors.skyBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skyBadgeText: {
    color: colors.skyText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  successBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  successBadgeText: {
    color: colors.successText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    width: '48.5%', // Ajuste perfecto para simular 2 columnas responsivas
    gap: 4,
  },
  subLabel: {
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  subValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  entityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerDateText: {
    fontSize: 11,
    color: colors.muted,
  },
  historyContainer: {
    marginTop: 4,
  },
  innerLoading: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
});