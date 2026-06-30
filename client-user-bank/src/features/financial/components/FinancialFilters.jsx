import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
};

const FinancialFilters = ({ filters, onChange }) => {
  // Estados para controlar la visibilidad del Picker de fechas (nativo mobile)
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Parsear strings ISO a objetos Date de JS seguros
  const startDateValue = filters.startDate ? new Date(filters.startDate) : new Date();
  const endDateValue = filters.endDate ? new Date(filters.endDate) : new Date();

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios'); // En iOS se mantiene abierto
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      onChange({ ...filters, startDate: isoDate });
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      onChange({ ...filters, endDate: isoDate });
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Filtros de Fecha */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Fecha inicio</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateButtonText}>
              {filters.startDate || 'Seleccionar'}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
        </View>

        <View style={styles.flex1}>
          <Text style={styles.label}>Fecha fin</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateButtonText}>
              {filters.endDate || 'Seleccionar'}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
            />
          )}
        </View>
      </View>

      {/* Tipo de Transacción */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Tipo de transacción</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filters.type}
            onValueChange={(itemValue) => onChange({ ...filters, type: itemValue })}
            style={styles.picker}
            dropdownIconColor={colors.primary}
          >
            {filters.types.map((option) => (
              <Picker.Item key={option} label={option} value={option} color={Platform.OS === 'ios' ? colors.text : undefined} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Fila: Moneda y Estado */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Moneda</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.currency}
              onValueChange={(itemValue) => onChange({ ...filters, currency: itemValue })}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              {filters.currencies.map((option) => (
                <Picker.Item key={option} label={option} value={option} color={Platform.OS === 'ios' ? colors.text : undefined} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.flex1}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.status}
              onValueChange={(itemValue) => onChange({ ...filters, status: itemValue })}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              {filters.statuses.map((option) => (
                <Picker.Item key={option} label={option} value={option} color={Platform.OS === 'ios' ? colors.text : undefined} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Input de Búsqueda por Texto */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Buscar</Text>
        <TextInput
          style={styles.input}
          value={filters.search}
          onChangeText={(text) => onChange({ ...filters, search: text })}
          placeholder="Buscar por descripción, categoría..."
          placeholderTextColor={colors.muted}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  fieldGroup: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden', // Evita que el Picker desborde los bordes redondeados en Android
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
});

export default FinancialFilters;