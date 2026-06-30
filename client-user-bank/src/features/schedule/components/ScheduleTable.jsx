import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  surface: '#1E1E1E',       // Fondo de las tarjetas principales (Mate)
  card: '#262626',          // Sub-contenedor interno para servicios
  border: '#2A2A2A',        // Bordes sutiles oscuros
  text: '#FFFFFF',          // Texto principal de alto contraste
  muted: '#A0A0A0',         // Texto secundario o etiquetas
  primary: '#00ADB5',       // Turquesa Enterprise (Acentuado para los horarios)
};

const ScheduleTable = ({ schedules = [] }) => {
  // Estado vacío nativo
  if (schedules.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay horarios disponibles en este momento</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {schedules.map((schedule) => (
        <View key={schedule.id} style={styles.categoryCard}>
          
          {/* ENCABEZADO DE LA CATEGORÍA */}
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{schedule.category}</Text>
          </View>

          {/* LISTADO DE SERVICIOS Y HORARIOS */}
          <View style={styles.servicesBody}>
            {schedule.services.length > 0 ? (
              schedule.services.map((service, serviceIndex) => (
                <React.Fragment key={`${schedule.id}-${serviceIndex}`}>
                  <View style={[
                    styles.serviceRow, 
                    serviceIndex > 0 && styles.rowDivider
                  ]}>
                    <View style={styles.serviceInfoCol}>
                      <Text style={styles.labelMuted}>SERVICIO</Text>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                    
                    {/* El diseño original solo renderiza el horario en la primera fila de la sección */}
                    {serviceIndex === 0 && (
                      <View style={styles.hoursCol}>
                        <Text style={styles.labelMutedRight}>HORARIO</Text>
                        <Text style={styles.hoursText}>{schedule.schedule}</Text>
                      </View>
                    )}
                  </View>
                </React.Fragment>
              ))
            ) : (
              /* Fallback en caso de que la categoría no contenga servicios individuales */
              <View style={styles.serviceRow}>
                <View style={styles.serviceInfoCol}>
                  <Text style={styles.labelMuted}>SERVICIO</Text>
                  <Text style={styles.serviceText}>—</Text>
                </View>
                <View style={styles.hoursCol}>
                  <Text style={styles.labelMutedRight}>HORARIO</Text>
                  <Text style={styles.hoursText}>{schedule.schedule}</Text>
                </View>
              </View>
            )}
          </View>

        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  categoryHeader: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesBody: {
    padding: 16,
    gap: 14,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowDivider: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  serviceInfoCol: {
    flex: 1,
    gap: 4,
  },
  hoursCol: {
    minWidth: 120,
    alignItems: 'flex-end',
    gap: 4,
  },
  labelMuted: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.5,
  },
  labelMutedRight: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  hoursText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary, // Resaltado turquesa enterprise
    textAlign: 'right',
    lineHeight: 18,
  },
});

export default ScheduleTable;