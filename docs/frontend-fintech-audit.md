# Auditoria frontend fintech

## Diagnostico actual

El frontend estaba construido con Next.js App Router, Clerk para autenticacion y Tailwind CSS. La base tecnica es correcta para un homebanking moderno, pero la experiencia visual anterior estaba demasiado apoyada en estetica de terminal: fondo negro, verde neon, textos tecnicos, labels en ingles y comandos tipo sistema. Eso genera personalidad, pero para banca digital reduce claridad, accesibilidad y percepcion de confianza.

## Problemas detectados

- Jerarquia visual: el saldo compite con textos tecnicos y ruido decorativo. El usuario necesita ver primero saldo, acciones y actividad reciente.
- UX writing: textos como `XFER_LOG`, `BOOTING_CAYMAN_OS` o `Terminate_Session` aumentan carga cognitiva.
- Accesibilidad: contraste irregular en verdes oscuros, foco poco consistente, botones iconicos sin suficientes labels y formularios con placeholders usados como instrucciones.
- Responsive: la navegacion lateral no tenia equivalente movil suficientemente claro y varios contenidos dependian de tablas horizontales.
- Arquitectura: componentes criticos estaban concentrados en `app/dashboard/page.tsx`, mezclando fetch, estado, layout, formularios y tablas.
- Performance visual: scanlines, fondos fijos y sombras neon sumaban ruido y repintados sin aportar a tareas bancarias.
- Producto: faltaba flujo explicito de pago de servicios y una vista de transferencias mas guiada.

## Mejoras aplicadas

- Nueva paleta clara y confiable con azul principal, superficies blancas, fondos suaves y acento calido.
- Dashboard reorganizado por tareas: Inicio, Transferir, Movimientos, Servicios y Cuenta.
- Saldo destacado en una tarjeta principal con ocultar/mostrar y copiar CBU.
- Acciones prioritarias visibles: transferir, pagar y ver movimientos.
- Movimientos convertidos de tabla densa a lista escaneable y responsive.
- Transferencias simplificadas a destino, monto y motivo, con validacion inmediata.
- Pago de servicios agregado como flujo base con vencimientos proximos.
- Login/signup redisenados con cards limpias, copy de confianza y estilos Clerk consistentes.
- Tokens globales CSS para color, superficie, borde, foco, botones e inputs.
- Respeto por `prefers-reduced-motion` para usuarios sensibles a movimiento.

## Organizacion recomendada

```txt
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (banking)/
    dashboard/page.tsx
    transfers/page.tsx
    movements/page.tsx
    services/page.tsx
components/
  ui/
    Button.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
    Tabs.tsx
    Toast.tsx
  banking/
    BalanceCard.tsx
    MovementItem.tsx
    TransferForm.tsx
    ServiceBillCard.tsx
    AccountDetails.tsx
  layout/
    AppHeader.tsx
    AppSidebar.tsx
    MobileNav.tsx
lib/
  api/
    client.ts
    users.ts
    transactions.ts
  formatters.ts
  validators.ts
styles/
  tokens.css
  utilities.css
```

## Design system sugerido

```css
:root {
  --brand: #0588d7;
  --brand-strong: #005cbd;
  --brand-soft: #e6f4ff;
  --accent: #ff6b35;
  --success: #079455;
  --danger: #d92d20;
  --surface: #ffffff;
  --surface-muted: #f6f8fb;
  --foreground: #111827;
  --muted: #667085;
  --border: #e6eaf0;
}
```

Esta paleta toma senales de fintech argentinas y bancos tradicionales: azul tipo BBVA/Santander para seguridad, celeste estilo Mercado Pago para cercania, acento naranja tipo Naranja X para llamadas puntuales, y superficies limpias estilo Uala.

## Componentes reutilizables prioritarios

- `BalanceCard`: saldo, ocultar saldo, copiar CBU, alias.
- `QuickAction`: boton de accion primaria para tareas frecuentes.
- `MovementItem`: movimiento responsive con icono, contraparte, fecha y monto.
- `TransferForm`: validacion de CBU/CVU, monto y motivo.
- `ServiceBillCard`: servicio, vencimiento, monto y accion de pago.
- `AppShell`: header, sidebar desktop y tabs mobile.
- `FeedbackBanner` o `Toast`: mensajes de exito/error consistentes.

## Animaciones y microinteracciones

- Hover sutil con `translateY(-1px)` en cards accionables.
- Feedback instantaneo al copiar CBU.
- Boton loading con spinner en transferencias y activacion de cuenta.
- Transiciones de color en tabs y navegacion.
- Skeletons para saldo y movimientos en una siguiente iteracion.
- Confirmacion final de transferencia con resumen antes de enviar si el backend permite doble paso.

## A11y y UX

- Mantener labels visibles, no depender solo de placeholders.
- Usar `aria-label` en botones solo icono.
- Preservar foco visible global.
- Evitar textos en mayuscula sostenida para lectura rapida.
- No usar tablas para movimientos en mobile salvo que haya datos realmente tabulares complejos.
- Mantener targets tactiles de al menos 44px.

## Performance

- Reducir decoraciones fijas, blur excesivo y scanlines.
- Dividir `dashboard/page.tsx` en componentes client mas pequenos.
- Mover formatters y validators a funciones puras.
- Considerar React Query/SWR para cache, revalidacion y estados de error.
- Usar skeletons en lugar de pantallas de carga bloqueantes.
- Evitar duplicar `SyncUser`; debe vivir una sola vez en el layout o en una ruta protegida.
