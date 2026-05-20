# Correos Transaccionales E-Commerce y Gestión de Pedidos

Implementar persistencia de pedidos, sistema de correos transaccionales vía Resend con modo test seguro (dominio no verificado), y un panel de administración para gestionar destinatarios, plantillas y probar envíos.

---

## 1. Prisma Schema — Nuevos Modelos

Agregar al final de `prisma/schema.prisma`:

- `Order` — pedido con estado, datos de envío, método de pago, totales, y relación a usuario (Clerk ID como string, no FK obligatoria para guest checkout).
- `OrderItem` — líneas de pedido con snapshot de precio, nombre, marca, cantidad.
- `EmailTemplate` — metadatos de plantillas transaccionales (key, subject, description, active).
- `EmailLog` — registro de envíos con estado (queued, sent, delivered, bounced, failed), recipient, templateKey, metadata JSON, errorMessage.
- `EmailSettings` — singleton (id = "default") con: adminEmails (string[]), testMode (boolean), testEmails (string[]), fromName, fromEmail, replyTo.

Enums nuevos: `OrderStatus` (pending, confirmed, processing, shipped, delivered, cancelled, refunded), `EmailStatus`.

Generar migración: `npx prisma migrate dev --name add_orders_and_email_system`.

---

## 2. Dependencias

Instalar `resend` (SDK oficial). No requiere otros paquetes nuevos.

---

## 3. Variables de Entorno

Agregar a `.env.local`:

- `RESEND_API_KEY` (configurar en el entorno; no versionar ni documentar el valor real)
- `EMAIL_FROM_NAME` (ej: "Dermatologika")
- `EMAIL_FROM_ADDRESS` (ej: `no-reply@dermatologika.com` o `onboarding@resend.dev` hasta verificar dominio)
- `EMAIL_REPLY_TO`

No exponer la API key en el cliente.

---

## 4. Capa de Email — `src/server/email/`

### 4.1 Cliente Resend (`resend.client.ts`)
Inicializar `Resend` con la API key desde env. Exportar instancia tipada.

### 4.2 Email Settings Repository (`email-settings.repository.ts`)
- `getSettings()` — upsert default si no existe.
- `updateSettings(input)` — validar con Zod schema.
- Schema Zod: adminEmails (array de emails, min 1), testMode (boolean), testEmails (array), fromName, fromEmail, replyTo.

### 4.3 Email Log Repository (`email-log.repository.ts`)
- `createLog(data)`
- `updateLogStatus(id, status, error?)`
- `listLogs(filters)` — paginado, filtros por status, templateKey, date range.
- `getStats()` — conteo por status últimos 30 días.

### 4.4 Email Sender Service (`email-sender.service.ts`)
Función central `sendTransactionalEmail({ to, templateKey, subject, html, metadata })`:
1. Leer `EmailSettings`.
2. Si `testMode === true`, filtrar destinatarios: solo permitir `adminEmails` + `testEmails`. Reemplazar `to` con la intersección. Si vacío, no enviar y loggear skip.
3. Determinar `from`: `fromName <fromEmail>`.
4. Crear log en estado `queued`.
5. Llamar a Resend `emails.send`.
6. Actualizar log: `sent` + `resendId`, o `failed` + error.
7. Retornar resultado tipado.

Esta es la **única** función que habla con Resend. Todo el resto del sistema la consume.

---

## 5. Plantillas HTML — `src/server/email/templates/`

Crear funciones que reciban datos tipados y retornen HTML string (inline styles para máxima compatibilidad):

- `orderConfirmationTemplate(order: OrderWithItems)` — confirmación de pedido al cliente
- `orderStatusUpdateTemplate(order: Order, oldStatus: OrderStatus)` — cambio de estado
- `orderNotificationAdminTemplate(order: OrderWithItems)` — notificación a admins de nuevo pedido
- `contactLeadNotificationTemplate(lead: ContactLead)` — notificación a admins de nuevo lead
- `welcomeUserTemplate(user: { firstName, email })` — bienvenida post-registro
- `abandonedCartReminderTemplate(items: CartItem[])` — carrito abandonado (futuro)
- `testEmailTemplate()` — plantilla simple para probar conexión

### Arquitectura del sistema de plantillas

**Layout base reutilizable** (`email-layout.template.ts`):
- Función `renderEmailLayout({ title, previewText, contentHtml })` que retorna el HTML completo del email.
- Estructura: `<!DOCTYPE html>`, `<html>`, `<head>` con `<meta charset="UTF-8">`, `<meta name="viewport">`, estilos CSS **inline** en `<style>` para clientes que lo soportan + estilos inline en cada elemento para compatibilidad máxima.
- Contenedor principal: `<table width="100%" cellpadding="0" cellspacing="0" border="0">` con centrado, max-width 600px, fondo #ffffff, border-radius 8px, sombra sutil.
- Header: logo Dermatologika (imagen pública via URL absoluta, 120px ancho), color de fondo verde brand (#72B255), padding generoso.
- Body area: recibe `contentHtml` inyectado. Padding 24px, tipografía sistema (Arial/Helvetica), color #333333, line-height 1.6.
- Footer: dirección de contacto, teléfono, link al sitio, disclaimer legal. Fondo gris claro #f5f5f5, padding 16px, texto #666666 tamaño 12px.
- Preview text: `<div class="preview">` oculto visualmente pero visible en preview del cliente.

**Composición por plantilla**:
Cada plantilla específica (ej. `orderConfirmationTemplate`) NO genera HTML completo. Solo genera el fragmento de contenido (inner HTML) y lo pasa a `renderEmailLayout`. Ejemplo:
```ts
export function orderConfirmationTemplate(order: OrderWithItems): string {
  const contentHtml = buildOrderConfirmationFragment(order);
  return renderEmailLayout({
    title: `Tu pedido ${order.orderNumber} ha sido recibido`,
    previewText: `Gracias por tu compra en Dermatologika. Total: $${order.total}`,
    contentHtml,
  });
}
```

**Escape de variables**: Todas las variables dinámicas (nombres, emails, direcciones) deben escaparse HTML básico (`<`, `>`, `&`, `"`) antes de inyectarse en el HTML. Crear helper `escapeHtml()` en `src/server/email/lib/escape-html.ts`.

**Formato de precios**: Usar helper `fmtPrice(amount: Decimal | number): string` con `es-EC` currency USD, siempre 2 decimales.

**Responsive**: Usar tablas anidadas (email-first approach), no flexbox/grid de CSS moderno. Max-width 600px, padding adaptativo en móvil via `style` inline.

**Colores del brand**: usar los tokens existentes del proyecto adaptados a email (inline):
- Brand primary: `#72B255`
- Brand soft: `#e8f5e0`
- Text primary: `#1a1a1a`
- Text secondary: `#4a4a4a`
- Text muted: `#737373`
- Status success: `#2e8b57`
- Status error: `#c0392b`
- Background subtle: `#f4faee`

---

## 6. Servicios de Email — `src/services/email/`

### 6.1 `send-order-confirmation.ts`
- Input: `orderId`
- Busca order con items, genera HTML, envía al email del cliente.
- Llama a `email-sender.service.ts`.

### 6.2 `send-order-status-update.ts`
- Input: `orderId`, `newStatus`
- Envía solo si el estado cambió a uno notificable (confirmed, shipped, delivered, cancelled).

### 6.3 `send-admin-order-notification.ts`
- Input: `orderId`
- Lee `EmailSettings.adminEmails`, envía notificación a cada admin.

### 6.4 `send-contact-lead-notification.ts`
- Input: `leadId`
- Envía a admins cuando se crea un nuevo lead.

### 6.5 `send-welcome-email.ts`
- Input: `email`, `firstName`
- Envía email de bienvenida post-registro (puede invocarse desde webhook Clerk `user.created`).

### 6.6 `send-test-email.ts`
- Input: `to`, `templateKey?`
- Usado desde el panel admin para testear.

---

## 7. Capa de Pedidos — `src/server/orders/`

### 7.1 Order Repository (`order.repository.ts`)
- `createOrder(input: CreateOrderInput)` — crea order + items en transacción Prisma.
- `getOrderById(id)` — incluye items.
- `getOrdersByUserId(userId)` — paginado, ordenado por createdAt desc.
- `getAllOrders(filters)` — para admin, paginado, filtros por status, date range.
- `updateOrderStatus(id, status)` — retorna order actualizado.
- `updateOrderPaymentStatus(id, paymentStatus)`.

### 7.2 Order Schemas (`order.schemas.ts`)
Zod schema para `CreateOrderInput`:
- clerkUserId (optional string)
- guestEmail (optional string, valid email) — requerido si no hay clerkUserId
- guestPhone (optional)
- shippingAddress: object con firstName, lastName, address, apartment, province, city, phone, idNumber
- shippingMethodId (string)
- paymentMethodId (string)
- couponCode (optional string)
- items: array de { productId, name, brand, price, discountPrice, quantity, imageUrl }
- subtotal, shippingCost, discountAmount, taxAmount, total — todos Decimal/string validados

### 7.3 Order Service (`order.service.ts`)
- `createOrderFromCheckout(input)`:
  1. Validar input con Zod.
  2. Calcular totales (o confiar en los enviados desde frontend pero validar).
  3. Crear order en transacción.
  4. Después de crear, disparar emails:
     - `sendAdminOrderNotification(orderId)`
     - `sendOrderConfirmation(orderId)` (si tiene guestEmail o usuario con email)
  5. Retornar order.
- `updateOrderStatus(orderId, status)`:
  1. Actualizar en DB.
  2. Si el estado es notificable, disparar `sendOrderStatusUpdate(orderId, status)`.

---

## 8. API Routes

### 8.1 Checkout — `src/app/api/checkout/create-order/route.ts`
- `POST`: recibe datos del checkout, valida con Zod, llama `orderService.createOrderFromCheckout()`.
- Retorna `{ success: true, data: { orderId, orderNumber } }`.
- Proteger con rate limiting (opcional, usar headers básicos).
- No requiere auth (guest checkout permitido), pero si hay sesión Clerk, incluir clerkUserId.

### 8.2 Orders (Cliente) — `src/app/api/orders/route.ts`
- `GET`: retorna pedidos del usuario autenticado (via Clerk). Paginado.

### 8.3 Orders (Admin) — `src/app/api/admin/orders/route.ts`
- `GET`: `requireAdminAuth()`, lista todos los pedidos con filtros (status, search, pagination).
- `POST`: no aplica (los pedidos se crean desde checkout).

### 8.4 Order Detail (Admin) — `src/app/api/admin/orders/[id]/route.ts`
- `GET`: detalle de pedido para admin.
- `PATCH`: actualizar status, paymentStatus. Validar body. Disparar emails de estado.

### 8.5 Email Settings (Admin) — `src/app/api/admin/email-settings/route.ts`
- `GET`: retorna settings actuales.
- `PUT`: actualiza settings. Validar con Zod.

### 8.6 Email Logs (Admin) — `src/app/api/admin/email-logs/route.ts`
- `GET`: lista logs paginados, filtros por status/template/date.

### 8.7 Send Test Email (Admin) — `src/app/api/admin/email-test/route.ts`
- `POST`: recibe `{ to, templateKey }`, valida email, llama `sendTestEmail()`. Solo admins.

---

## 9. Integración con Checkout Frontend

Modificar `src/features/checkout/components/checkout-page.tsx`:
- En `handleSubmit`, en lugar de guardar en `sessionStorage`, hacer `fetch POST /api/checkout/create-order` con todos los datos del formulario + items del carrito + pricing preview.
- En éxito, redirigir a `/checkout/confirmacion?order=${orderNumber}` (o seguir usando sessionStorage como fallback pero poblado desde la respuesta del servidor).
- En `CheckoutConfirmation`, leer `orderNumber` de query param o sessionStorage, y opcionalmente fetchear detalles desde `/api/orders/[id]` (si está autenticado).

Modificar `src/app/(account)/cuenta/pedidos/page.tsx`:
- Convertir a Server Component o usar RSC.
- Si autenticado, fetchear `/api/orders` y mostrar tabla/lista de pedidos.
- Mostrar empty state si no hay pedidos.

---

## 10. Panel de Administración de Emails

### 10.1 Ruta: `/admin/email-settings`
- Agregar en `admin-sidebar.tsx` dentro de la sección "Tienda" o nueva sección "Comunicaciones":
  - `/admin/orders` — "Pedidos"
  - `/admin/email-settings` — "Configuración de correos"
  - `/admin/email-logs` — "Logs de correos"

### 10.2 Page: `/admin/(dashboard)/email-settings/page.tsx`
- Server Component que fetchea settings iniciales.
- Renderiza `EmailSettingsAdminPanel`.

### 10.3 Componente: `EmailSettingsAdminPanel`
- Formulario editable:
  - `testMode` (toggle): cuando activo, solo envía a emails admin/test.
  - `adminEmails` (lista dinámica, agregar/eliminar emails).
  - `testEmails` (lista dinámica).
  - `fromName`, `fromEmail`, `replyTo` (inputs de texto).
- Sección "Enviar correo de prueba":
  - Select de templateKey disponibles.
  - Input `to`.
  - Botón "Enviar prueba" que llama `POST /api/admin/email-test`.
  - Mostrar resultado (éxito/error) y el log de Resend.
- Guardar cambios con `PUT /api/admin/email-settings`.

### 10.4 Page: `/admin/(dashboard)/email-logs/page.tsx`
- Tabla paginada de logs:
  - Fecha, destinatario, template, estado (chip de color), Resend ID.
  - Filtros por status y templateKey.
  - Botón para refrescar.

### 10.5 Page: `/admin/(dashboard)/orders/page.tsx`
- Tabla de pedidos:
  - OrderNumber, fecha, cliente (nombre/email), total, estado (chip), método de pago.
  - Filtros por status, search por orderNumber o email.
  - Acciones: ver detalle, cambiar estado (dropdown).
- Dialog/modal para ver detalle del pedido (items, dirección, totales).

---

## 11. Escenarios de Email Transaccional (Checklist)

### E-Commerce
- [ ] **Nuevo pedido (cliente)**: `orderConfirmationTemplate` al email del cliente/guest.
- [ ] **Nuevo pedido (admin)**: `orderNotificationAdminTemplate` a todos los `adminEmails`.
- [ ] **Pedido confirmado**: cuando admin cambia status a `confirmed`.
- [ ] **Pedido en envío**: cuando status cambia a `shipped`.
- [ ] **Pedido entregado**: cuando status cambia a `delivered`.
- [ ] **Pedido cancelado**: cuando status cambia a `cancelled`.
- [ ] **Pago recibido**: cuando paymentStatus cambia (si aplica método manual).

### Usuarios / Leads
- [ ] **Bienvenida**: cuando Clerk emite `user.created` (mejorar webhook existente en `src/app/api/webhooks/clerk/route.ts`).
- [ ] **Nuevo lead**: cuando se crea un ContactLead (`createContactLeadService` o webhook).
- [ ] **Verificación de email**: ya lo maneja Clerk, no implementar duplicado.
- [ ] **Reset de contraseña**: ya lo maneja Clerk, no implementar duplicado.

---

## 12. Modo Test y Verificación de Dominio Resend

### Fase 1: Modo Test (dominio no verificado)
- `EmailSettings.testMode = true` por defecto tras crear settings.
- En `email-sender.service.ts`, si `testMode === true`:
  - Reescribir `to` para incluir solo emails que estén en `adminEmails` o `testEmails`.
  - Si `fromEmail` usa dominio no verificado, usar `onboarding@resend.dev` como fallback de from si es necesario, pero mejor documentar que el `fromEmail` debe ser del dominio verificado o `onboarding@resend.dev`.
  - Loggear explicitamente `skipped` si no hay destinatarios válidos.
- Mostrar banner en el panel admin: "Dominio no verificado. Solo emails de prueba serán enviados. Verifica tu dominio en Resend para producción."

### Fase 2: Verificación de Dominio
- Incluir en la documentación del plan (para el usuario o agente):
  1. Ir a Resend Dashboard > Domains > Add Domain.
  2. Agregar `dermatologika.com` (o el dominio real).
  3. Agregar los registros DNS (SPF, DKIM, DMARC) en Cloudflare/Proveedor DNS.
  4. Esperar verificación (puede tomar minutos a horas).
  5. Cambiar `EMAIL_FROM_ADDRESS` al dominio verificado.
  6. Desactivar `testMode` en el panel admin.

---

## 13. Estructura de Carpetas Propuesta

```
src/
  server/
    email/
      resend.client.ts
      email-settings.repository.ts
      email-log.repository.ts
      email-sender.service.ts
      templates/
        order-confirmation.template.ts
        order-status-update.template.ts
        order-admin-notification.template.ts
        contact-lead-notification.template.ts
        welcome-user.template.ts
        test-email.template.ts
    orders/
      order.repository.ts
      order.schemas.ts
      order.service.ts
  services/
    email/
      send-order-confirmation.ts
      send-order-status-update.ts
      send-admin-order-notification.ts
      send-contact-lead-notification.ts
      send-welcome-email.ts
      send-test-email.ts
      get-email-settings.ts
      get-email-logs.ts
    orders/
      get-user-orders.ts
      get-admin-orders.ts
  features/
    admin-orders/
      components/
        order-admin-panel.tsx
        order-detail-modal.tsx
    admin-emails/
      components/
        email-settings-panel.tsx
        email-logs-panel.tsx
        email-test-form.tsx
    orders/
      components/
        order-list.tsx
        order-card.tsx
  app/
    api/
      checkout/
        create-order/
          route.ts
      orders/
        route.ts
      admin/
        orders/
          route.ts
          [id]/
            route.ts
        email-settings/
          route.ts
        email-logs/
          route.ts
        email-test/
          route.ts
    admin/
      (dashboard)/
        orders/
          page.tsx
        email-settings/
          page.tsx
        email-logs/
          page.tsx
    (account)/
      cuenta/
        pedidos/
          page.tsx  (actualizar para mostrar pedidos reales)
```

---

## 14. Notas de Implementación para el Agente

- **Tipado estricto**: todos los inputs/outputs deben tener interfaces Zod + TypeScript. No usar `any`.
- **Server-only**: todos los repositorios y el sender deben importar `"server-only"`.
- **Error handling**: cada envío de email debe capturar errores, loggear en consola, y actualizar `EmailLog` con estado `failed`.
- **No exponer secrets**: la API key de Resend nunca debe enviarse al cliente.
- **Guest checkout**: soportar pedidos sin usuario autenticado usando `guestEmail` y `guestPhone`.
- **Idempotencia**: el endpoint `create-order` debe ser llamado una sola vez. Considerar que el frontend limpie el carrito solo tras éxito confirmado.
- **Clerk webhook**: modificar `src/app/api/webhooks/clerk/route.ts` para disparar `sendWelcomeEmail()` tras `user.created`. Asegurar que el webhook no falle si el email falla (no bloquear la creación de usuario).
- **Contact lead**: modificar `src/services/contact/create-contact-lead.ts` para disparar `sendContactLeadNotification()` tras crear el lead.
- **Responsive emails**: las plantillas deben funcionar en móvil (max-width 600px, inline styles).
- **Prisma Decimal**: usar `Decimal` en el schema y manejar conversión a/from number/string en Zod schemas.
