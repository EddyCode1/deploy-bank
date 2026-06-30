import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../services/authService';

// Paleta Premium Matte Dark con acento Turquesa
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa característico
  primaryMuted: 'rgba(0, 173, 181, 0.1)',
  danger: '#EF4444',
  inputBg: '#1A1A1A'
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // En React Native, los parámetros se extraen de route.params
  const routeToken = route.params?.token || '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    // Si no hay token de ruta, el campo token manual es obligatorio
    if (!routeToken && !formData.token.trim()) {
      tempErrors.token = 'Token requerido';
    }

    if (!formData.password) {
      tempErrors.password = 'Contraseña requerida';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Mínimo 8 caracteres';
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Confirmar contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const finalToken = routeToken || formData.token.trim();
      const result = await authService.resetPassword(finalToken, formData.password);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido restablecida correctamente.',
          [{ text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Hubo un problema al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Banco del Quetzal</Text>
            </View>
            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>Define una nueva contraseña segura.</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            
            {/* Input manual de token si no existe en la ruta */}
            {!routeToken && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Token de recuperación</Text>
                <View style={[styles.inputWrapper, errors.token && styles.inputErrorBorder]}>
                  <MaterialCommunityIcons name="key-variant" size={18} color={colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Pega aquí tu token"
                    placeholderTextColor="#555555"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={formData.token}
                    onChangeText={(text) => handleInputChange('token', text)}
                    editable={!isLoading}
                  />
                </View>
                {errors.token && <Text style={styles.errorText}>{errors.token}</Text>}
              </View>
            )}

            {/* Nueva Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                  <MaterialCommunityIcons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Botón de envío */}
            <TouchableOpacity 
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Procesando...</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Guardar contraseña</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" style={styles.arrowIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Enlace de regreso */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLinkContainer}>
            <Text style={styles.footerLinkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeContainer: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 173, 181, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 14,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 6,
  },
  footerLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});