import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  muted: '#A0A0A0',
  danger: '#EF4444',
};

export function EmptyState({ message = 'No hay datos para mostrar', icon = '📭', style = {} }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message = 'Ocurrió un error', icon = '⚠️', style = {} }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'col',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    width: '100%',
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});