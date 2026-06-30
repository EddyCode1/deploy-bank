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

export default function VerifyEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Lee el token desde los parámetros de navegación (Deep Linking)
  const tokenFromUrl = route.params?.token || '';

  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const finalToken = (tokenFromUrl || tokenInput).trim();
    
    if (!finalToken) {
      setError('Token requerido');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const result = await authService.verifyEmail(finalToken);
      if (result.success) {
        Alert.alert(
          '¡Éxito!',
          'Tu correo electrónico ha sido verificado correctamente.',
          [{ text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'El token de verificación es inválido o ha expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || (!tokenFromUrl && !tokenInput.trim());

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* Icono Principal y Encabezado */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="email-check-outline" size={26} color={colors.primary} />
            </View>
            <Text style={styles.title}>Verificar correo</Text>
            <Text style={styles.subtitle}>
              Confirma tu cuenta usando el enlace o token que recibiste.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            
            {/* Mostrar el input solo si NO viene el token por URL */}
            {!tokenFromUrl && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Token de verificación</Text>
                <View style={[styles.inputWrapper, error ? styles.inputErrorBorder : null]}>
                  <MaterialCommunityIcons name="key-variant" size={18} color={colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Pega aquí el token del correo"
                    placeholderTextColor="#555555"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={tokenInput}
                    onChangeText={(text) => {
                      setTokenInput(text);
                      if (error) setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )}

            {/* Botón de Acción */}
            <TouchableOpacity 
              style={[styles.btnPrimary, isButtonDisabled && styles.btnDisabled]} 
              onPress={handleVerify}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Verificando...</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Verificar correo</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" style={styles.arrowIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Enlaces de Navegación Inferiores */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkTextPrimary}>Volver al inicio de sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('ResendVerification')} 
              style={{ marginTop: 14 }}
            >
              <Text style={styles.linkTextSecondary}>¿No recibiste el correo? Reenviar</Text>
            </TouchableOpacity>
          </View>

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
    padding: 28,
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
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 173, 181, 0.2)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
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
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.5,
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
  footerLinks: {
    marginTop: 26,
    alignItems: 'center',
  },
  linkTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  linkTextSecondary: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});