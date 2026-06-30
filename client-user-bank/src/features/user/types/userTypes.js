/**
 * @file userTypes.js
 * @description Definición de constantes, roles, estados y esquemas de tipado JSDoc para el módulo de usuarios.
 */

/**
 * Roles del sistema unificados con el contrato del Backend.
 * @type {readonly string[]}
 */
export const USER_ROLES = Object.freeze([
  'ADMIN_ROLE', 
  'USER_ROLE'
]);

/**
 * Estados de cuenta normalizados que maneja la capa de la aplicación móvil.
 * @type {Object.<string, string>}
 */
export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
});

/**
 * Configuración visual y semántica para los badges de estado.
 * Mapea directamente los estilos necesarios para el diseño de tarjetas en modo oscuro.
 */
export const STATUS_UI_CONFIG = Object.freeze({
  [USER_STATUS.ACTIVE]: {
    label: 'ACTIVO',
    badgeBg: 'rgba(31, 161, 135, 0.12)',   // Verde Jade con opacidad
    textColor: '#1FA187',
  },
  [USER_STATUS.INACTIVE]: {
    label: 'INACTIVO',
    badgeBg: 'rgba(239, 68, 68, 0.12)',    // Rojo Danger con opacidad
    textColor: '#EF4444',
  },
  [USER_STATUS.PENDING]: {
    label: 'PENDIENTE',
    badgeBg: 'rgba(255, 152, 0, 0.12)',     // Naranja Mate con opacidad
    textColor: '#FF9800',
  },
});

// ==========================================
// DEFINICIÓN DE TIPOS VIA JSDOC (IntelliSense)
// ==========================================

/**
 * @typedef {Object} UserAccount
 * @property {string} id - ID único de la cuenta bancaria o interna asociada.
 * @property {string} accountNumber - Número de cuenta de 10 dígitos.
 * @property {string} type - Tipo de cuenta (Ahorro, Monetaria, etc.).
 * @property {number} balance - Saldo disponible actual.
 */

/**
 * @typedef {Object} User
 * @property {string} id - Identificador único del usuario (mapeado de id o _id).
 * @property {string} nombre - Nombre completo combinado (Name + Surname).
 * @property {string} username - Nombre de usuario del sistema (ej. @ejemplo).
 * @property {string} email - Correo electrónico principal.
 * @property {string} telefono - Número telefónico de contacto.
 * @property {string} dpi - Documento Personal de Identificación.
 * @property {string} direccion - Dirección residencial física del cliente.
 * @property {string} workName - Lugar de trabajo o nombre de la empresa.
 * @property {number} monthlyIncome - Ingresos mensuales declarados (mínimo Q100).
 * @property {'ADMIN_ROLE' | 'USER_ROLE'} rol - Rol administrativo asignado.
 * @property {'active' | 'inactive' | 'pending'} status - Estado de la cuenta normalizado.
 * @property {UserAccount[]} cuentas - Sub-colección de cuentas financieras vinculadas.
 */