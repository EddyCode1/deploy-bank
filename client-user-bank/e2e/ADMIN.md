Pruebas E2E (Manual) — Módulo Admin

Objetivo: Verificar flujos principales que el admin debe usar. Ejecuta estas pruebas contra tu backend local (Android Studio o device conectado) usando el dev client.

Prerequisitos:
- App corriendo en emulador o device (usar `pnpm run dev` o abrir desde Android Studio).
- Usuario admin con credenciales de prueba.
- Backend accesible (ver `src/shared/constants/endpoints.js` para host).

Comandos útiles:

pnpm install
pnpm run dev
# si arrancas desde Android Studio, reinicia la app desde el emulador

Instrucciones de prueba

1) UsersScreen
- Ir a la pantalla Usuarios.
- Verificar que se muestre la lista de usuarios.
- Buscar un usuario por nombre desde la caja de búsqueda.
- Resultado esperado: la lista se filtra y muestra usuarios coincidentes.
- Reportar: Pantalla vacía, error de red, búsqueda no filtra.

2) UserDetailScreen
- Desde UsersScreen, abrir detalle de un usuario (tap en un item).
- Verificar que carguen datos: nombre, email, teléfono, cuentas.
- Cambiar estado (Activo/Inactivo) si la UI tiene ese control.
- Resultado esperado: la acción actualiza el estado y la UI refleja cambio.
- Reportar: errores al cargar, controles inexistentes, update falla.

3) AdminDeposits (tab en TransactionScreen)
- Navegar a Transacciones → pestaña Deposits/Admin (si aplica).
- Iniciar depósito hacia una cuenta de usuario (usar número de cuenta de prueba).
- Completar formulario y enviar.
- Resultado esperado: transacción aceptada, backend devuelve éxito y balance actualiza.
- Reportar: formulario no existe, validaciones erróneas, error de servidor.

4) Services (ServiceScreen como admin)
- Ir a Servicios.
- Ver lista de servicios; intentar crear/editar/eliminar (según permisos del admin).
- Resultado esperado: acciones CRUD funcionan y listados se actualizan.
- Reportar: botones faltantes, errores 500, UI que no actualiza.

5) Schedule (ScheduleScreen)
- Ir a Horarios / Schedule.
- Ver horarios de atención; navegar entre días/filtrar.
- Resultado esperado: carga de horarios y navegación fluida.
- Reportar: pantalla vacía, errores de carga, UI que no responde.

Registro de incidencias
- Anotar: nombre de la pantalla, acción realizada, paso donde falla, mensaje de error o captura.
- Adjuntar logs de Metro/Android Studio si hay stack traces.

Automatización (opcional)
- Si quieres, puedo generar un esqueleto de pruebas con Detox o Playwright + Appium.
- Dime qué framework prefieres y lo preparo.

Notas
- Muchas pantallas dependen de llamadas al backend; asegúrate de tener el backend en `http://10.0.2.2:3000` (emulador Android) o el host correcto en variables de entorno.
- Si alguna pantalla requiere permisos (cámara, fotos), acepta los permisos en el emulador/device antes de probar.

---

Si quieres, puedo también generar pruebas automáticas básicas (Detox) o un checklist imprimible para QA.