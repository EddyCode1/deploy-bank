import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuickLinkFavorites } from '../hooks/useQuickLinkFavorites';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

// Obtener dimensiones para calcular las columnas del Grid de manera exacta
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2; // (Pantalla - Padding total - Gap medio) / 2 columnas

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa característico
  primaryMuted: 'rgba(0, 173, 181, 0.1)',
  favorite: '#FBBF24',      // Amarillo para la estrella
  skeleton: '#262626'
};

export default function QuickLinks({ links = [], loading }) {
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useQuickLinkFavorites();

  // Esqueleto de carga (Loading State)
  if (loading) {
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.card, styles.skeletonCard]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {links.map((item) => {
        const favoriteActive = isFavorite(item.id);

        return (
          <View key={item.id} style={styles.card}>
            {/* Contenedor del Link principal */}
            <TouchableOpacity
              style={styles.linkContent}
              activeOpacity={0.7}
              onPress={() => {
                if (typeof item.path === 'string') {
                  navigateToMainTab(navigation, item.path);
                } else {
                  navigateToMainTab(navigation, item.path.tab, { screen: item.path.screen });
                }
              }}
            >
              {/* Contenedor del Icono */}
              <View style={styles.iconContainer}>
                {typeof item.icon === 'string' ? (
                  <Text style={styles.iconText}>{item.icon}</Text>
                ) : (
                  item.icon
                )}
              </View>

              {/* Etiqueta / Texto */}
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>

            {/* Botón de Favorito Absoluto */}
            <TouchableOpacity
              style={styles.favoriteButton}
              activeOpacity={0.6}
              onPress={() => toggleFavorite(item.id)}
            >
              <MaterialCommunityIcons
                name={favoriteActive ? "star" : "star-outline"}
                size={20}
                color={favoriteActive ? colors.favorite : colors.muted}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    position: 'relative',
    minHeight: 82,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  skeletonCard: {
    backgroundColor: colors.skeleton,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16, // Espacio preventivo para que el texto no toque la estrella
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
  },
});