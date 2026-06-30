import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { profileStyles as styles } from '../constants/ProfileStyles';

// Importación del asset adaptada a la ruta local de React Native
const defaultProfile = require('../../../../assets/avatarDefault.png');

const ProfileButton = ({ imageUrl, email, onEditProfile, onLogout, onChangePhoto }) => {
  const [open, setOpen] = useState(false);
  
  // Verificación lógica de imagen intacta
  const isUrlValid = imageUrl?.trim();
  const [avatarSrc, setAvatarSrc] = useState(isUrlValid ? { uri: imageUrl } : defaultProfile);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAvatarSrc(imageUrl?.trim() ? { uri: imageUrl } : defaultProfile);
    }, 0);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  const handleAction = (action) => {
    setOpen(false); // Cierra el dropdown al presionar una opción
    action();
  };

  return (
    <>
      {/* Si el dropdown está abierto, este contenedor detecta clicks afuera para cerrarlo */}
      {open && (
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.profileBtnWrapper}>
        {/* Botón del avatar principal */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
          style={styles.profileBtn}
          accessibilityLabel="Perfil de usuario"
        >
          <Image
            source={avatarSrc}
            style={styles.profileImg}
            onError={() => setAvatarSrc(defaultProfile)}
          />
        </TouchableOpacity>

        {/* Menú desplegable condicional */}
        {open && (
          <View style={[styles.profileDropdown, styles.profileDropdownWide]}>
            {/* Correo arriba */}
            {email && (
              <Text numberOfLines={1} style={styles.profileDropdownEmail}>
                {email}
              </Text>
            )}
            
            {/* Foto de perfil grande */}
            <Image
              source={avatarSrc}
              style={styles.profileDropdownImg}
              onError={() => setAvatarSrc(defaultProfile)}
            />

            {/* Cambiar foto */}
            <TouchableOpacity onPress={() => handleAction(onChangePhoto)}>
              <Text style={styles.profileDropdownLink}>Cambiar foto</Text>
            </TouchableOpacity>

            {/* Gestionar perfil */}
            <TouchableOpacity 
              style={styles.profileDropdownAction} 
              onPress={() => handleAction(onEditProfile)}
            >
              <Text style={styles.profileDropdownActionText}>Gestionar perfil</Text>
            </TouchableOpacity>

            {/* Cerrar sesión */}
            <TouchableOpacity onPress={() => handleAction(onLogout)}>
              <Text style={styles.profileDropdownLogout}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default ProfileButton;