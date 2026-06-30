import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert 
} from 'react-native';
import { transactionService } from '../services/transactionService';
import { styles, colors } from './AdminDepositsScreen.styles';

export default function AdminDepositsScreen() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');

  const formatDate = (value) => {
    if (!value) return 'N/A';
    try {
      return new Date(value).toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatMoney = (amount, currency = 'GTQ') => {
    return `${currency} ${Number(amount || 0).toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDuration = (value) => {
    const totalSeconds = Math.max(0, Number(value) || 0);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  function PendingDepositCard({
    deposit,
    isBusy,
    isEditing,
    editingAmount,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onRevert,
    onUpdateAmount,
  }) {
    const [seconds, setSeconds] = useState(() => Number(deposit.secondsRemaining) || 0);

    useEffect(() => {
      setSeconds(Number(deposit.secondsRemaining) || 0);
    }, [deposit.secondsRemaining]);

    useEffect(() => {
      if (seconds <= 0) return undefined;
      const interval = setInterval(() => {
        setSeconds((current) => Math.max(current - 1, 0));
      }, 1000);
      return () => clearInterval(interval);
    }, [seconds]);

    const expired = seconds <= 0;
    const canRevert = deposit.canRevert && !expired;

    return (
      <View key={deposit.id} style={styles.depositCard}>
        <View style={styles.cardRow}>
          <Text style={styles.idText}>ID: ...{String(deposit.id).slice(-8).toUpperCase()}</Text>
          <Text style={styles.accountText}>No. {deposit.accountNumber}</Text>
        </View>

        <View style={styles.cardRow}>
          {isEditing ? (
            <View style={styles.editInputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editingAmount}
                onChangeText={onUpdateAmount}
                autoFocus
              />
            </View>
          ) : (
            <Text style={styles.amountText}>{formatMoney(deposit.amount, deposit.currencyTo || 'GTQ')}</Text>
          )}

          <View style={[styles.badge, expired ? styles.expiredBadge : styles.timerBadge]}>
            <Text style={[styles.badgeText, expired ? styles.expiredBadgeText : styles.timerBadgeText]}>
              {expired ? 'Tiempo expirado' : formatDuration(seconds)}
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.conversionText}>
            Ruta: {deposit.currencyFrom} ➔ {deposit.currencyTo}
          </Text>
          <Text style={styles.dateText}>{formatDate(deposit.createdAt)}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.btnAction, { borderColor: colors.border }]}
                onPress={onCancelEdit}
                disabled={isBusy}
              >
                <Text style={[styles.btnActionText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => onSaveEdit(deposit)}
                disabled={isBusy}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.btnActionText, { color: '#FFF' }]}>Guardar</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btnAction, { borderColor: colors.primary }]}
                onPress={() => onStartEdit(deposit)}
                disabled={isBusy}
              >
                <Text style={[styles.btnActionText, { color: colors.primary }]}>Editar monto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnAction,
                  {
                    borderColor: canRevert ? colors.danger : colors.border,
                    opacity: canRevert ? 1 : 0.4,
                  }
                ]}
                onPress={() => onRevert(deposit)}
                disabled={isBusy || !canRevert}
              >
                <Text style={[styles.btnActionText, { color: canRevert ? colors.danger : colors.muted }]}>Revertir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  const loadPendingDeposits = async () => {
    setLoading(true);
    setError(null);
    const result = await transactionService.getPendingDeposits();
    if (result.success) {
      setDeposits(result.data.deposits || []);
    } else {
      setError(result.error || 'No se pudieron cargar los depósitos pendientes');
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPendingDeposits();
  }, []);

  const handleRevert = async (deposit) => {
    Alert.alert(
      'Confirmar Reversión',
      `¿Está seguro que desea revertir el depósito de ${formatMoney(deposit.amount, deposit.currencyTo)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revertir',
          style: 'destructive',
          onPress: async () => {
            setActionId(deposit.id);
            const result = await transactionService.revertDeposit(deposit.id);
            if (result.success) {
              Alert.alert('Éxito', 'Depósito revertido correctamente');
              await loadPendingDeposits();
            } else {
              setError(result.error || 'No se pudo revertir el depósito');
            }
            setActionId(null);
          }
        }
      ]
    );
  };

  const handleStartEdit = (deposit) => {
    setEditingId(deposit.id);
    setEditingAmount(String(deposit.amount ?? ''));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAmount('');
  };

  const handleSaveEdit = async (deposit) => {
    const amount = Number(editingAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número mayor a 0');
      return;
    }
    setActionId(deposit.id);
    const result = await transactionService.updateDepositAmount(deposit.id, amount);
    if (result.success) {
      handleCancelEdit();
      Alert.alert('Éxito', 'Monto actualizado correctamente');
      await loadPendingDeposits();
    } else {
      setError(result.error || 'No se pudo actualizar el depósito');
    }
    setActionId(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Depósitos pendientes (Admin)</Text>
          <Text style={styles.subtitle}>
            Reversa disponible solo en ventana corta de tiempo según política backend.
          </Text>
        </View>
        <TouchableOpacity style={styles.btnRefresh} onPress={loadPendingDeposits} disabled={loading}>
          <Text style={styles.btnText}>{loading ? '...' : 'Actualizar'}</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR BANNER */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* RENDERIZADO PRINCIPAL / FLUJO DE CARGA */}
      {loading && deposits.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
      ) : deposits.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay depósitos pendientes para gestión administrativa.</Text>
        </View>
      ) : (
        deposits.map((deposit) => {
          const isBusy = actionId === deposit.id;
          const isEditing = editingId === deposit.id;

          return (
            <PendingDepositCard
              key={deposit.id}
              deposit={deposit}
              isBusy={isBusy}
              isEditing={isEditing}
              editingAmount={editingAmount}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onRevert={handleRevert}
              onUpdateAmount={setEditingAmount}
            />
          );
        })
      )}
    </ScrollView>
  );
}