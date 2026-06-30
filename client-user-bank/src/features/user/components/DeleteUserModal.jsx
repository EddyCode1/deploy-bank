import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles, colors } from './DeleteUserModal.styles';

export default function DeleteUserModal({ isOpen, onClose, onConfirm, user, isLoading = false }) {
  // Manejo de guardas nativas
  if (!isOpen || !user) return null;

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <Text style={styles.title}>Confirmar eliminación</Text>
          
          <Text style={styles.message}>
            ¿Estás seguro de que deseas eliminar al usuario?
          </Text>

          {/* Tarjeta de Información del Usuario */}
          <View style={styles.userCard}>
            <Text style={styles.userName}>
              {user.nombre || 'N/A'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email || user.correo || 'N/A'}
            </Text>
          </View>

          {/* Alerta Destructiva */}
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Esta acción no se puede deshacer
            </Text>
          </View>

          {/* Botonera de Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={() => onConfirm(user.id || user._id)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnConfirmText}>Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}