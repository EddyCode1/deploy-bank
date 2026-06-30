import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../hooks/useFavorites';
import { useAuthStore } from '../../../shared/store/authStore';
import { getUsers } from '../../user/service/userService';
import { isAdminUser } from '../../../shared/auth/roles';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

// Colores de diseño mate oscuro coherentes con el dashboard
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  success: '#22C55E',
  danger: '#EF4444',
  white: '#FFFFFF'
};

function getOwnerAccountFromUser(person) {
  if (!person) return '';
  const primary = Array.isArray(person.cuentas) ? person.cuentas[0] : null;
  return String(
    person.accountNumber ||
      person.numeroCuenta ||
      person.numero ||
      person.accountId ||
      person.idCuenta ||
      primary?.numero ||
      primary?.accountNumber ||
      primary?.id ||
      ''
  ).trim();
}

export default function FavoriteScreen() {
  const navigation = useNavigation();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = isAdminUser(currentUser);

  const {
    favorites,
    loading: favoritesLoading,
    refresh: loadFavorites,
    addFavorite,
    removeFavorite,
    updateFavoriteAlias,
  } = useFavorites({ autoLoad: true });

  const [peopleLoading, setPeopleLoading] = useState(true);
  const loading = favoritesLoading || peopleLoading;
  const [actionLoading, setActionLoading] = useState(false);

  const [aliasInput, setAliasInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [creating, setCreating] = useState(false);

  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [peopleError, setPeopleError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingAlias, setEditingAlias] = useState('');

  const loadPeople = async (search = '') => {
    if (!isAdmin) {
      setPeople([]);
      return;
    }
    setSearching(true);
    setPeopleError(null);
    const result = await getUsers({ search: search.trim() || undefined, page: 1, limit: 50 });
    if (result.success) {
      setPeople(result.data.items || []);
    } else {
      setPeopleError(result.error || 'No se pudo cargar el directorio');
    }
    setSearching(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadPeople('');
    }
    setPeopleLoading(false);
  }, [isAdmin]);

  const handleAddFavorite = async () => {
    if (!aliasInput.trim() || !accountInput.trim()) {
      Alert.alert('Atención', 'Por favor completa todos los campos.');
      return;
    }
    setCreating(true);
    const result = await addFavorite({ alias: aliasInput, accountNumber: accountInput });
    setCreating(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo agregar el favorito');
      return;
    }
    Alert.alert('Éxito', 'Favorito agregado correctamente');
    setAliasInput('');
    setAccountInput('');
  };

  const handleAddFromDirectory = async (person) => {
    const accountNumber = getOwnerAccountFromUser(person);
    if (!accountNumber) {
      Alert.alert('Error', 'Esta persona no tiene un número de cuenta visible');
      return;
    }
    setActionLoading(true);
    const aliasGuess = person.nombre || person.username || `Favorito ${accountNumber.slice(-4)}`;
    const result = await addFavorite({ alias: aliasGuess, accountNumber });
    setActionLoading(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo agregar el favorito');
      return;
    }
    Alert.alert('Éxito', 'Favorito agregado desde el directorio');
  };

  const handleRemove = (favorite) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar "${favorite.alias}" (cuenta ${favorite.accountNumber}) de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const result = await removeFavorite(favorite.id);
            setActionLoading(false);
            if (!result.success) {
              Alert.alert('Error', result.error || 'No se pudo eliminar');
              return;
            }
            Alert.alert('Éxito', 'Favorito eliminado');
          }
        }
      ]
    );
  };

  const startEdit = (favorite) => {
    setEditingId(favorite.id);
    setEditingAlias(favorite.alias);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingAlias('');
  };

  const saveEdit = async (favoriteId) => {
    if (!editingAlias.trim()) {
      Alert.alert('Error', 'El alias no puede estar vacío');
      return;
    }
    setActionLoading(true);
    const result = await updateFavoriteAlias(favoriteId, editingAlias);
    setActionLoading(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo actualizar el alias');
      return;
    }
    Alert.alert('Éxito', 'Alias actualizado');
    setEditingId(null);
    setEditingAlias('');
  };

  const handleTransfer = (accountNumber) => {
    if (!accountNumber) return;
    navigateToMainTab(navigation, 'Transacciones', {
      screen: 'TransactionMain',
      params: { tab: 'transfer', dest: accountNumber },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      
      {/* Encabezado Principal */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Cuentas favoritas</Text>
          <Text style={styles.subtitle}>Guarda las cuentas frecuentes para enviar dinero rápido.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Guardados: {favorites.length}</Text>
        </View>
      </View>

      {/* Sección Formulario de Adición */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Agregar cuenta favorita</Text>
        <Text style={styles.sectionDesc}>Ingresa el alias identificador y la cuenta destino.</Text>
        
        <View style={styles.formGap}>
          <TextInput
            style={styles.input}
            value={aliasInput}
            onChangeText={setAliasInput}
            placeholder="Alias (ej: Mamá, Renta)"
            placeholderTextColor={colors.muted}
            maxLength={50}
          />
          <TextInput
            style={styles.input}
            value={accountInput}
            onChangeText={setAccountInput}
            placeholder="Número de cuenta destino"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleAddFavorite} disabled={creating}>
            {creating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Agregar favorito</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de Cuentas Favoritas */}
      <View style={styles.headerSectionRow}>
        <Text style={styles.sectionTitle}>Tus cuentas favoritas</Text>
        <TouchableOpacity style={styles.btnSmall} onPress={() => loadFavorites()}>
          <Text style={styles.btnSmallText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.centerBlockText}>Cargando favoritos...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.centerBlockText}>No tienes cuentas favoritas todavía.</Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {favorites.map((favorite) => (
            <View key={favorite.id} style={styles.favoriteCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardMeta}>FAVORITO</Text>
                  {editingId === favorite.id ? (
                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      value={editingAlias}
                      onChangeText={setEditingAlias}
                      maxLength={50}
                    />
                  ) : (
                    <Text style={styles.cardTitle}>{favorite.alias}</Text>
                  )}
                  <Text style={styles.cardAccount}>Cuenta: {favorite.accountNumber}</Text>
                  {favorite.accountType && <Text style={styles.cardType}>{favorite.accountType}</Text>}
                </View>

                <TouchableOpacity 
                  style={styles.btnDelete} 
                  onPress={() => handleRemove(favorite)} 
                  disabled={actionLoading}
                >
                  <Text style={{ color: colors.danger, fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Botones Operativos de la Tarjeta */}
              <View style={styles.cardActions}>
                {editingId === favorite.id ? (
                  <>
                    <TouchableOpacity style={[styles.btnAction, { backgroundColor: colors.success }]} onPress={() => saveEdit(favorite.id)}>
                      <Text style={styles.btnTextSmall}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnAction, { backgroundColor: colors.card }]} onPress={cancelEdit}>
                      <Text style={[styles.btnTextSmall, { color: colors.text }]}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.btnAction, { borderColor: colors.border, borderWidth: 1 }]} onPress={() => startEdit(favorite)}>
                      <Text style={[styles.btnTextSmall, { color: colors.text }]}>Editar alias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnAction, { backgroundColor: colors.success }]} onPress={() => handleTransfer(favorite.accountNumber)}>
                      <Text style={styles.btnTextSmall}>➔ Enviar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Vista Exclusiva de Administradores */}
      {isAdmin && (
        <View style={[styles.sectionCard, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Directorio de personas (Admin)</Text>
          <Text style={styles.sectionDesc}>Busca usuarios del sistema e interactúa de inmediato.</Text>

          <View style={[styles.formGap, { marginTop: 12 }]}>
            <TextInput
              style={styles.input}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Buscar por nombre, usuario o email"
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={() => loadPeople(searchTerm)}>
              {searching ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Buscar en directorio</Text>}
            </TouchableOpacity>
          </View>

          {peopleError && <Text style={styles.errorText}>{peopleError}</Text>}

          <View style={{ marginTop: 14, gap: 12 }}>
            {people.map((person) => {
              const accountNumber = getOwnerAccountFromUser(person);
              return (
                <View key={person.id || person._id} style={styles.personRow}>
                  <View>
                    <Text style={styles.personName}>{person.nombre || 'Sin nombre'}</Text>
                    <Text style={styles.personMeta}>@{person.username || 'sin-usuario'} • {person.rol || 'Usuario'}</Text>
                    <Text style={styles.personMeta}>Email: {person.email || 'N/A'}</Text>
                    <Text style={styles.personAccount}>Cuenta: {accountNumber || 'No asignada'}</Text>
                  </View>
                  
                  <View style={styles.personActions}>
                    <TouchableOpacity 
                      style={[styles.btnRow, { backgroundColor: accountNumber ? colors.primary : colors.card }]}
                      disabled={!accountNumber || actionLoading}
                      onPress={() => handleAddFromDirectory(person)}
                    >
                      <Text style={styles.btnTextSmall}>+ Favorito</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btnRow, { backgroundColor: accountNumber ? colors.success : colors.card }]}
                      disabled={!accountNumber || actionLoading}
                      onPress={() => handleTransfer(accountNumber)}
                    >
                      <Text style={styles.btnTextSmall}>Enviar Q</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
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
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  badge: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  formGap: {
    marginTop: 14,
    gap: 10,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  headerSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  btnSmall: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnSmallText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  centerBlock: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
  },
  centerBlockText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  gridContainer: {
    gap: 12,
  },
  favoriteCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardMeta: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  cardAccount: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    fontFamily: 'Platform-Mono',
  },
  cardType: {
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  btnDelete: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextSmall: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  personRow: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  personMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  personAccount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  personActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnRow: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  }
});