/**
 * Constantes con los horarios de servicios del banco
 */

export const SERVICE_SCHEDULES = [
  {
    id: 1,
    category: 'Ingreso al servicio de Banco del Quetzal en Línea',
    services: [
      'Perfil de Seguridad',
      'BQ Chat',
      'Gestiones en Línea',
      'Consulta de saldos de la cuenta monetaria y ahorro',
      'Tarjetas de crédito y prepago',
      'Plan Dorado de Inversión',
      'Consulta de Plazo Fijo'
    ],
    schedule: '24 hrs.'
  },
  {
    id: 2,
    category: 'Consulta de Préstamos Q/$ y Credi-Nómina',
    services: ['Consulta de puntos Club-BQ'],
    schedule: '4:00 a 22:00 hrs.'
  },
  {
    id: 3,
    category: 'Pago de Préstamo , Credi-Nómina, Aporte Plan Futuro y Plan Dorado de Inversión ',
    services: ['Pago Servicios Básicos y Serpipagos'],
    schedule: '5:00 a 22:00 hrs.'
  },
  {
    id: 4,
    category: 'Transferencias a terceros en otros bancos del sistema',
    services: [],
    schedule: '1:00 a 23:00 hrs.'
  },
  {
    id: 5,
    category: 'Transferencias al exterior',
    services: ['Compra y Venta de Divisas Internacional'],
    schedule: '7:00 a 20:00 hrs.'
  },
  {
    id: 6,
    category: 'Transferencias locales',
    services: [
      'Pago de tarjeta de crédito',
      'Transferencias a terceros',
      'Transferencias a otros bancos'
    ],
    schedule: '24 hrs.'
  },
  {
    id: 7,
    category: 'Bi-Credit On Line y recarga prepago',
    services: ['Bloqueo y desbloqueo de la cuenta monetaria', 'Cheques y tarjeta de débito'],
    schedule: '24 hrs.'
  },
  {
    id: 8,
    category: 'Solicitud de Chequera',
    services: [],
    schedule: '24 hrs.'
  }
];

export const SCHEDULE_DAYS = ['Lunes a Domingo'];
