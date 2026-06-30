import { StyleSheet, Dimensions } from 'react-native';

// Paleta de colores consistente con la interfaz del banco
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', // Turquesa institucional
  danger: '#D9534F',  // Rojo peligro (logout)
  white: '#FFFFFF',
  cardBg: '#252525',
};

export const profileStyles = StyleSheet.create({
  // .profile-btn y .profile-btn-wrapper agrupados para componentes nativos
  profileBtnWrapper: {
    position: 'absolute',
    top: 24, // Equivalente aproximado a 1.5rem
    right: 24,
    zIndex: 1000,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24, // 50% de 48 para círculo perfecto
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    
    // Configuración de sombra (Box Shadow adaptada a iOS/Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // .profile-img, .profile-icon
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: colors.primary,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: colors.primary,
  },

  // .profile-dropdown
  profileDropdown: {
    position: 'absolute',
    top: 56,
    right: 0,
    minWidth: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16, // Equivalente a 1rem
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 20, // 1.25rem
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8, // Equivalente a 0.5rem (Soportado en versiones modernas de RN)

    // Configuración de sombra aumentada para el menú desplegable
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // .profile-dropdown-wide
  profileDropdownWide: {
    minWidth: 240,
    paddingTop: 24, // 1.5rem
    paddingBottom: 20, // 1.25rem
  },

  // .profile-dropdown-email
  profileDropdownEmail: {
    fontSize: 15, // Ajuste equivalente a 0.97rem
    color: colors.muted,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },

  // .profile-dropdown-link
  profileDropdownLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },

  // .profile-dropdown-logout
  profileDropdownLogout: {
    color: colors.danger,
    fontSize: 16, // 1rem
    fontWeight: '600',
    marginTop: 11, // 0.7rem
  },

  // .profile-dropdown-img, .profile-dropdown-icon
  profileDropdownImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    color: colors.primary,
    marginBottom: 8,
  },
  profileDropdownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    color: colors.primary,
    marginBottom: 8,
  },

  // .profile-dropdown-action
  profileDropdownAction: {
    backgroundColor: colors.primary,
    borderRadius: 12, // 0.75rem
    paddingHorizontal: 20, // 1.25rem
    paddingVertical: 8, // 0.5rem
    marginTop: 4, // 0.25rem
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDropdownActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  }
});