import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import ScheduleTable from '../components/ScheduleTable';
import { SERVICE_SCHEDULES, SCHEDULE_DAYS } from '../constants/scheduleData';
import { styles } from './ScheduleScreen.styles';

const ScheduleScreen = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = () => {
      try {
        setSchedules(SERVICE_SCHEDULES);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setLoading(false);
      }
    };

    const timer = setTimeout(loadSchedules, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView 
      style={styles.scrollContainer} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ENCABEZADO DE LA SCREEN */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Horarios de Servicios</Text>
        <Text style={styles.pageSubtitle}>
          Consulta los horarios disponibles para nuestros servicios en línea
        </Text>
      </View>

      {/* TARJETA DE INFORMACIÓN */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>📅</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Disponibilidad</Text>
          <Text style={styles.infoDays}>{SCHEDULE_DAYS.join(' ')}</Text>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ADB5" />
          <Text style={styles.loadingText}>Cargando horarios...</Text>
        </View>
      ) : (
        <ScheduleTable schedules={schedules} />
      )}

      {/* NOTA DE PIE */}
      <View style={styles.footerNote}>
        <Text style={styles.footerTitle}>Nota importante</Text>
        <Text style={styles.footerText}>
          Los horarios pueden cambiar según mantenimiento del sistema. Para información
          actualizada, contáctanos a través de BI Chat o nuestras líneas de atención al cliente.
        </Text>
      </View>
    </ScrollView>
  );
};

export default ScheduleScreen;