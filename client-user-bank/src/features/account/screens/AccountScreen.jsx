import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../shared/store/authStore';
import { isAdminUser } from '../../../shared/auth/roles';
import { useMyAccounts } from '../hooks/useMyAccounts';
import { accountService } from '../services/accountService';
import AccountDetailModal from '../components/AccountDetailModal';
import AccountFormModal from '../components/AccountFormModal';
import { notifyAccountsUpdated } from '../../../shared/events/bankingEvents';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  success: '#4E9F3D',
  danger: '#EF4444',
  warning: '#F59E0B',
};

const STATUS_COLOR = {
  active: colors.success,
  pending: colors.warning,
  inactive: colors.danger,
};

const STATUS_LABEL = {
  active: 'ACTIVA',
  pending: 'PENDIENTE',
  inactive: 'INACTIVA',
};

function AccountCard({ account, onPress }) {
  const statusColor = STATUS_COLOR[account.status] || colors.muted;
  return (
    <TouchableOpacity style={styles.accountCard} onPress={() => onPress(account)} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.accountType}>{account.type}</Text>
          <Text style={styles.accountNumber}>No. {account.accountNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABEL[account.status] || account.status}
          </Text>
        </View>
      </View>
      <Text style={styles.balanceText}>
        {account.currency}{' '}
        {Number(account.balance).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      {account.ownerName ? (
        <Text style={styles.ownerText} numberOfLines={1}>{account.ownerName}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { accounts, loading, refresh } = useMyAccounts();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTx, setSelectedTx] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const openDetail = async (account) => {
    setSelectedAccount(account);
    setTxLoading(true);
    const result = await accountService.getAccountTransactions(account.id);
    setSelectedTx(result.success ? result.data.transactions : []);
    setTxLoading(false);
  };

  const handleEdit = (account) => {
    setSelectedAccount(null);
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleStatusChange = async (account, newStatus) => {
    const result = await accountService.changeAccountStatus(account.id, newStatus);
    if (result.success) {
      Alert.alert('Éxito', 'Estado actualizado correctamente');
      setSelectedAccount(null);
      refresh();
    } else {
      Alert.alert('Error', result.error || 'No se pudo cambiar el estado');
    }
  };

  const handleSaveAccount = async (formData) => {
    let result;
    if (editingAccount) {
      result = await accountService.updateAccount(editingAccount.id, formData);
    } else {
      result = await accountService.createAccount(formData, { isAdmin });
    }
    if (result.success) {
      Alert.alert('Éxito', editingAccount ? 'Cuenta actualizada' : 'Cuenta creada correctamente');
      notifyAccountsUpdated();
      setFormOpen(false);
      setEditingAccount(null);
      refresh();
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar la cuenta');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mis cuentas</Text>
            <Text style={styles.subtitle}>
              {accounts.length} {accounts.length === 1 ? 'cuenta registrada' : 'cuentas registradas'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnNew}
            onPress={() => { setEditingAccount(null); setFormOpen(true); }}
          >
            <MaterialIcons name="add" size={18} color="#FFF" />
            <Text style={styles.btnNewText}>Nueva</Text>
          </TouchableOpacity>
        </View>

        {loading && accounts.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : accounts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tienes cuentas registradas aún.</Text>
            <TouchableOpacity
              style={[styles.btnNew, { marginTop: 12 }]}
              onPress={() => { setEditingAccount(null); setFormOpen(true); }}
            >
              <Text style={styles.btnNewText}>Solicitar cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} onPress={openDetail} />
          ))
        )}
      </ScrollView>

      {/* Modal detalle */}
      <AccountDetailModal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        account={selectedAccount}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        transactions={selectedTx}
        transactionsLoading={txLoading}
      />

      {/* Modal crear / editar */}
      <AccountFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingAccount(null); }}
        account={editingAccount}
        isAdmin={isAdmin}
        onSave={handleSaveAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  btnNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  btnNewText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountNumber: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  ownerText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
});
