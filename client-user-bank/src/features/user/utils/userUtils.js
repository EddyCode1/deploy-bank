/**
 * @file userUtils.js
 * @description Funciones de utilidad para el formateo de datos de usuarios en la interfaz móvil.
 */

/**
 * Formatea el nombre del usuario junto a su correo electrónico.
 * Compatible con la estructura normalizada y con el esquema raw del backend.
 * * @param {Object} user - Objeto de usuario.
 * @returns {string} Nombre formateado (ej. "Juan Pérez (juan@mail.com)").
 */
export function formatUserName(user) {
  if (!user) return 'Usuario N/A';
  
  // Prioriza el nombre combinado de la normalización
  const fullName = user.nombre || [user.name, user.surname].filter(Boolean).join(' ') || 'Sin Nombre';
  const email = user.email || user.correo || 'sin@email.com';
  
  return `${fullName} (${email})`;
}

/**
 * Formatea un valor numérico a moneda local de Guatemala (Quetzales).
 * Útil para representar de forma limpia los ingresos mensuales en las tarjetas y detalles.
 * * @param {number|string} amount - Cantidad monetaria.
 * @returns {string} Monto formateado (ej. "Q 2,500.00").
 */
export function formatCurrency(amount) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return 'Q 0.00';
  
  return `Q ${numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * Formatea una cadena de texto telefónica en el formato estándar de Guatemala (XXXX-XXXX).
 * * @param {string} phone - Número de teléfono crudo.
 * @returns {string} Teléfono estructurado (ej. "5544-3322").
 */
export function formatPhoneNumber(phone) {
  if (!phone) return 'N/A';
  // Limpia cualquier carácter que no sea número
  const cleaned = String(phone).replace(/\D/g, '');
  
  // Si cumple con los 8 dígitos estándar del país
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  
  return phone;
}

export default {
  formatUserName,
  formatCurrency,
  formatPhoneNumber,
};