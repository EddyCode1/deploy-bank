import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';

const colors = {
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa Enterprise
  danger: '#FF5A79',        // Rojo Mate
  infoBg: 'rgba(0, 173, 181, 0.15)',
  successBg: 'rgba(34, 197, 94, 0.15)',
  successText: '#22C55E',
  dangerBg: 'rgba(255, 90, 121, 0.15)',
};

export default function ProductList({ products = [], isAdmin, onEdit, onDelete, onRequest, requestingId }) {
  
  // Badge de categoría (Producto/Servicio)
  const getTypeBadgeStyle = (type) => {
    return type === 'PRODUCTO'
      ? { backgroundColor: colors.infoBg, color: colors.primary }
      : { backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }; // Púrpura para servicio
  };

  // Badge de estado (Activo/Inactivo)
  const getStatusBadgeStyle = (is_active) => {
    return is_active
      ? { backgroundColor: colors.successBg, color: colors.successText }
      : { backgroundColor: colors.dangerBg, color: colors.danger };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString.replace(/-/g, '/'));
    return date.toLocaleDateString('es-GT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <View style={styles.gridContainer}>
      {products.map((product) => {
        const typeStyle = getTypeBadgeStyle(product.type);
        const statusStyle = getStatusBadgeStyle(product.is_active);

        return (
          <View key={product._id} style={styles.card}>
            
            {/* SECCIÓN SUPERIOR: Títulos y Badges */}
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.typeBadge, { backgroundColor: typeStyle.backgroundColor }]}>
                <Text style={[styles.typeBadgeText, { color: typeStyle.color }]}>
                  {product.type}
                </Text>
              </View>
            </View>

            {/* SECCIÓN CENTRAL: Información */}
            <View style={styles.cardBody}>
              {product.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {product.description}
                </Text>
              ) : null}

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Precio:</Text>
                  <Text style={styles.priceValue}>
                    Q{Number(product.price).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>REFERENCIA ID:</Text>
                  <Text style={styles.monoText}>
                    {product._id?.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Fecha de registro */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerLabel}>Registrado:</Text>
                <Text style={styles.footerValue}>{formatDate(product.createdAt)}</Text>
              </View>
            </View>

            {/* SECCIÓN INFERIOR: Acciones */}
            {isAdmin ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => onEdit?.(product)}
                >
                  <Text style={styles.editButtonText}>Modificar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => onDelete?.(product._id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.clientActionWrap}>
                <TouchableOpacity 
                  style={[styles.requestButton, requestingId === product._id && styles.buttonDisabled]} 
                  onPress={() => onRequest?.(product)}
                  disabled={!onRequest || requestingId === product._id}
                >
                  {requestingId === product._id ? (
                    <ActivityIndicator size="small" color={colors.bg} />
                  ) : (
                    <Text style={styles.requestButtonText}>Solicitar producto</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoContainer: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 11,
    color: colors.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  clientActionWrap: {
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  requestButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});