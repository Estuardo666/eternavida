# Panel de Pedidos Avanzado + Dashboard KPIs + Sistema de Webhooks para API Externa

Rediseñar el panel administrativo de pedidos al nivel de WooCommerce/Shopify: dashboard con KPIs y gráficos, gestión avanzada de pedidos (timeline, notas, tracking, edición inline, acciones masivas, export CSV), e implementar un sistema de eventos/webhooks con cola de reintentos preparado para integración con una API externa futura.

---

## 1. Dependencias Nuevas

Agregar a `package.json`:

- `recharts` (^2.x) — gráficos de líneas y barras para el dashboard. Ligero, React-native, compatible con Tailwind, sin configuración extra.
- `@react-pdf/renderer` (^4.x) — generación de PDFs server-side con componentes React. No requiere headless browser ni Chromium. Ideal para Vercel.
- No se necesita librería de CSV; usar `Blob` + `URL.createObjectURL` nativo del navegador.

---

## 2. Prisma Schema — Extensiones

Agregar al schema existente:

### 2.1 Campos nuevos en `Order`
```prisma
  paymentStatus      PaymentStatus @default(pending)
  trackingNumber     String?
  trackingUrl        String?
  source             OrderSource   @default(web)  // web, api, manual
  externalOrderId    String?       @unique
  syncedAt           DateTime?
  notes              OrderNote[]
  timeline           OrderTimeline[]
  webhookEvents      WebhookEvent[]
```

### 2.2 Nuevos enums
```prisma
enum PaymentStatus {
  pending
  paid
  failed
  refunded
  partially_refunded
}

enum OrderSource {
  web
  api
  manual
}

enum OrderNoteVisibility {
  internal
  customer
}

enum WebhookEventStatus {
  pending
  delivered
  failed
  retrying
}
```

### 2.3 Nuevos modelos
```prisma
model OrderNote {
  id        String               @id @default(cuid())
  orderId   String
  order     Order                @relation(fields: [orderId], references: [id], onDelete: Cascade)
  content   String
  visibility OrderNoteVisibility @default(internal)
  createdBy String?              // clerkUserId o "system"
  createdAt DateTime             @default(now())

  @@index([orderId])
  @@index([createdAt])
}

model OrderTimeline {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  eventType   String   // status_changed, item_edited, note_added, tracking_updated, payment_status_changed, discount_modified, email_resent, address_updated
  description String
  metadata    Json?    // oldValue, newValue, diff
  createdBy   String?  // clerkUserId o "system"
  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([eventType])
  @@index([createdAt])
}

model ExternalApiConfig {
  id            String   @id @default("default")
  webhookUrl    String?
  secretToken   String?  // para firmar payloads HMAC-SHA256
  enabled       Boolean  @default(false)
  retryAttempts Int      @default(3)
  timeoutMs     Int      @default(10000)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WebhookEvent {
  id              String             @id @default(cuid())
  orderId         String
  order           Order              @relation(fields: [orderId], references: [id], onDelete: Cascade)
  eventType       String             // order.created, order.updated, order.status_changed
  payload         Json               // snapshot del order serializado
  status          WebhookEventStatus @default(pending)
  attemptCount    Int                @default(0)
  lastAttemptAt   DateTime?
  lastResponseStatus Int?            // HTTP status code
  lastResponseBody   String?         // truncated response body
  lastError       String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([orderId])
  @@index([status])
  @@index([createdAt])
}
```

Generar migración: `npx prisma migrate dev --name add_order_advanced_features`.

---

## 3. Capa de Webhooks — `src/server/webhooks/`

### 3.1 External API Config Repository (`external-api-config.repository.ts`)
- `getConfig()` — upsert default.
- `updateConfig(input)` — validar con Zod.

### 3.2 Webhook Event Repository (`webhook-event.repository.ts`)
- `createEvent(orderId, eventType, payload)`
- `listPendingEvents(limit = 50)`
- `markDelivered(id, responseStatus, responseBody?)`
- `markFailed(id, error, responseStatus?, responseBody?)`
- `incrementAttempt(id)`

### 3.3 Webhook Dispatcher Service (`webhook-dispatcher.service.ts`)
```ts
async function dispatchWebhookEvent(eventId: string)
```
1. Leer `ExternalApiConfig`. Si `enabled === false` o no hay `webhookUrl`, marcar como `failed` con razón.
2. Leer el evento. Si `attemptCount >= config.retryAttempts`, marcar como `failed`.
3. Construir payload:
```json
{
  "event": "order.status_changed",
  "timestamp": "2026-05-20T12:00:00Z",
  "payload": { /* order completo serializado con items, notas, totales */ }
}
```
4. Firmar con HMAC-SHA256 si hay `secretToken`:
   - Header `X-Webhook-Signature: sha256=<hex>`
   - Header `X-Webhook-Event: order.status_changed`
   - Header `X-Webhook-Id: <eventId>`
5. Hacer `fetch POST` con timeout (`AbortController`).
6. Si 2xx: marcar `delivered`.
7. Si error (red, timeout, 4xx/5xx): marcar `retrying` (si quedan intentos) o `failed`. Guardar `lastResponseStatus` y `lastResponseBody`.

### 3.4 Webhook Trigger Service (`webhook-trigger.service.ts`)
Funciones públicas que crean eventos y (opcionalmente) disparan inmediatamente:
- `triggerOrderCreated(order)`
- `triggerOrderUpdated(order, changes)`
- `triggerOrderStatusChanged(order, oldStatus, newStatus)`
- `triggerOrderPaymentStatusChanged(order, oldStatus, newStatus)`

Cada función:
1. Lee config. Si no está habilitada, retorna early.
2. Serializa el order completo a JSON plano (convertir Decimals a strings).
3. Crea `WebhookEvent`.
4. Llama `dispatchWebhookEvent(eventId)` (fire-and-forget, no bloquear flujo principal).

### 3.5 Retry Cron / Endpoint
Como no hay sistema de cron/background jobs en el proyecto, usar un **Server Action** o **API route** invocable manualmente desde el panel admin: `POST /api/admin/webhooks/retry-failed`. También se puede disparar automáticamente al cargar el panel de webhooks.

En producción futura, este endpoint puede ser invocado por un cron de Vercel o un servicio externo.

---

## 4. Capa de Pedidos — Extensiones

### 4.1 Order Repository — Nuevos métodos
- `addOrderNote(orderId, content, visibility, createdBy)`
- `getOrderNotes(orderId)`
- `addOrderTimeline(orderId, eventType, description, metadata, createdBy)`
- `getOrderTimeline(orderId)`
- `updateOrderTracking(orderId, { trackingNumber, trackingUrl })`
- `updateOrderPaymentStatus(orderId, paymentStatus)`
- `updateOrderAddress(orderId, addressFields)`
- `updateOrderItems(orderId, items)` — requiere recalcular totales
- `applyOrderDiscount(orderId, discountAmount)`
- `getOrderStats(dateRange)` — para dashboard
- `getOrdersForExport(filters)` — retorna todos (sin paginación) para CSV

### 4.2 Order Service — Nuevos métodos
- `addNote(orderId, ...)` — guarda nota + timeline entry.
- `updateTracking(orderId, ...)` — guarda tracking + timeline entry.
- `updatePaymentStatus(orderId, ...)` — guarda + timeline + email de estado de pago + webhook.
- `editOrderItems(orderId, newItems)` — validar, recalcular subtotal/total, timeline entry.
- `applyManualDiscount(orderId, amount)` — timeline entry.
- `updateShippingAddress(orderId, address)` — timeline entry.
- `resendOrderConfirmation(orderId)` — re-envía email al cliente + timeline entry.
- `getDashboardStats()` — delega a repository.

Cada operación que modifica un pedido DEBE:
1. Actualizar la DB.
2. Crear un `OrderTimeline` entry.
3. Si cambia estado de pago, disparar email.
4. Disparar webhook si está habilitado.

---

## 5. API Routes Nuevas y Extendidas

### 5.1 Admin Order Detail Extended
`PATCH /api/admin/orders/[id]/route.ts` — extender body schema para aceptar:
```ts
z.union([
  z.object({ status: OrderStatus }),
  z.object({ paymentStatus: PaymentStatus }),
  z.object({ trackingNumber: z.string(), trackingUrl: z.string().optional() }),
  z.object({ address: addressSchema }), // partial update
  z.object({ items: z.array(orderItemSchema) }), // full replacement de items
  z.object({ discountAmount: z.string().or(z.number()) }),
])
```
Rutear a la función de servicio correspondiente según las keys del body.

### 5.2 Admin Order Notes
`POST /api/admin/orders/[id]/notes/route.ts`
- Body: `{ content: string, visibility: "internal" | "customer" }`
- Requiere admin auth.

`GET /api/admin/orders/[id]/notes/route.ts`
- Retorna notas del pedido.

### 5.3 Admin Order Timeline
`GET /api/admin/orders/[id]/timeline/route.ts`
- Retorna timeline entries ordenadas desc.

### 5.4 Admin Resend Email
`POST /api/admin/orders/[id]/resend-email/route.ts`
- Body: `{ templateKey: "order_confirmation" | "order_status_update" }`
- Llama `sendOrderConfirmation` o `sendOrderStatusUpdate`.
- Crea timeline entry.

### 5.5 Admin Export Orders
`GET /api/admin/orders/export/route.ts`
- Query params: mismos filtros que lista.
- Retorna CSV con headers: orderNumber, createdAt, firstName, lastName, email, phone, province, city, address, status, paymentStatus, shippingMethodName, paymentMethodName, subtotal, shippingCost, discountAmount, taxAmount, total, trackingNumber, items (name x qty).
- Header `Content-Type: text/csv`, `Content-Disposition: attachment; filename="pedidos.csv"`.

### 5.5b Exportar Pedido como PDF
`GET /api/admin/orders/[id]/export-pdf/route.ts`
- Requiere admin auth (o el propietario del pedido si se usa desde cuenta del cliente).
- Busca el pedido con items. Si no existe, retorna 404.
- Genera PDF server-side con `@react-pdf/renderer`:
  - Documento A4 vertical.
  - **Header**: logo de Dermatologika (imagen pública, URL absoluta), nombre del negocio, dirección, teléfono, sitio web.
  - **Sección cliente**: nombre completo, email, teléfono, cédula/RUC.
  - **Sección pedido**: orderNumber, fecha de creación, estado (texto + color), estado de pago.
  - **Tabla de productos**: columnas Producto, Marca, Precio unit., Cant., Subtotal. Alternar filas con fondo sutil.
  - **Sección totales**: Subtotal, Envío, Descuento, Impuestos, Total (destacado en bold).
  - **Sección envío**: método, dirección completa, provincia, ciudad, tracking number + URL.
  - **Sección pago**: método, instrucciones.
  - **Footer**: "Gracias por tu compra — Dermatologika" + número de página.
- Retorna el buffer del PDF con headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="pedido-{orderNumber}.pdf"`
- La ruta para el cliente será `GET /api/orders/[id]/export-pdf/route.ts` con la misma lógica pero autenticado vía Clerk (solo puede ver su propio pedido, validar `clerkUserId`).

### 5.6 Admin Dashboard Stats
`GET /api/admin/orders/dashboard/route.ts`
- Retorna JSON con stats para el dashboard:
```json
{
  "today": { "count": 12, "revenue": 1240.50 },
  "week": { "count": 84, "revenue": 9450.00 },
  "month": { "count": 310, "revenue": 34200.00 },
  "statusBreakdown": { "pending": 15, "confirmed": 8, ... },
  "dailyRevenue": [ { "date": "2026-05-19", "revenue": 320.00 }, ... ]
}
```

### 5.7 Admin Webhook Config
`GET /api/admin/webhook-config/route.ts`
`PUT /api/admin/webhook-config/route.ts`

### 5.8 Admin Retry Webhooks
`POST /api/admin/webhooks/retry/route.ts`
- Reintenta todos los eventos en estado `failed` o `retrying`.

### 5.9 Admin Webhook Events (Logs)
`GET /api/admin/webhook-events/route.ts`
- Lista events con filtros por status, orderId, eventType. Paginado.

---

## 6. Panel de Pedidos Rediseñado — Frontend

### 6.1 Estructura de la página `/admin/orders`

Layout vertical:
```
┌─ Dashboard KPIs (cards + mini-chart) ─┐
├─ Filtros avanzados + acciones masivas ─┤
├─ Lista de pedidos (tabla/lista) ───────┤
├─ Paginación ───────────────────────────┤
└─ Panel de detalle (modal/drawer) ──────┘
```

### 6.2 Dashboard KPIs — `OrderDashboardStats`
Usar `recharts`:

- **Cards superiores** (grid 4 columnas):
  - "Hoy": pedidos + ingresos (vs ayer, flecha up/down)
  - "Esta semana": pedidos + ingresos
  - "Este mes": pedidos + ingresos
  - "Pendientes": conteo de pedidos `pending` + `processing`

- **Gráfico de líneas** (`Recharts LineChart`): ingresos diarios últimos 7 días.
  - Responsive container, color de línea `#72B255`, área debajo con gradiente suave.
  - Tooltip custom con formato de moneda.
  - Sin ejes excesivos, minimalista.

- **Gráfico de barras** (`Recharts BarChart`): pedidos por estado (últimos 30 días).
  - Cada barra con color del estado correspondiente.

- **Gráfico de donut** (`Recharts PieChart`): métodos de pago más usados (top 5).

Todos los charts usan los surface styles existentes (`ADMIN_PANEL_SURFACE_CLASS_NAME`) como contenedor.

### 6.3 Filtros Avanzados
Barra de filtros encima de la lista:
- Búsqueda global (orderNumber, nombre, email, teléfono)
- Dropdown de estado (multiselect opcional, o single)
- Dropdown de paymentStatus
- Dropdown de shippingMethodName
- Dropdown de paymentMethodName
- Date picker range: "Desde" / "Hasta" (inputs tipo date nativos)
- Rango de total: min / max (inputs number)
- Botón "Aplicar" + "Limpiar filtros"

Los filtros deben serializarse a query params de la URL para que sea shareable/bookmarkeable.

### 6.4 Lista de Pedidos Mejorada
Cambiar de "lista de cards" a **tabla** (desktop) / **lista de cards** (mobile):

- **Checkbox** en cada fila para selección múltiple.
- **Header sticky** con: Checkbox | Pedido | Fecha | Cliente | Total | Estado | Pago | Envío | Acciones.
- **Acciones por fila** (dropdown o botones inline):
  - Ver detalle
  - Cambiar estado rápido (mini dropdown)
  - Reenviar email
- **Acciones masivas** (barra flotante cuando hay items seleccionados):
  - "Cambiar estado a..." (dropdown)
  - "Exportar seleccionados a CSV"

### 6.5 Detalle de Pedido — Modal/Drawer a pantalla completa
Diseño tipo Shopify order detail (scrollable, bien organizado):

**Header del modal:**
- OrderNumber grande, fecha, estado (badge editable inline), paymentStatus (badge), botón "Cerrar".
- Acciones rápidas: Reenviar email, Exportar este pedido, Imprimir (opcional futuro).

**Layout de 2 columnas dentro del modal:**
- **Izquierda (2/3):**
  - Timeline/Activity log (timeline vertical con puntos de color, mostrando status changes, notas, tracking updates, emails sent). Ordenado desc.
  - Productos (tabla editable): cada fila muestra name, brand, price, qty, subtotal. Botón "Editar items" que abre modo edición (cantidad, precio, eliminar, agregar nuevo).
  - Totales: subtotal, envío, descuento, impuestos, total. El descuento debe ser editable inline con un botón "Aplicar descuento".
  - Notas: lista de notas con indicador "Interna" vs "Cliente". Input para agregar nueva nota + toggle de visibilidad.

- **Derecha (1/3):**
  - Cliente: nombre, email, teléfono, cédula.
  - Dirección de envío: editable inline. Campos: firstName, lastName, address, apartment, province, city, phone, idNumber. Botón "Guardar cambios".
  - Envío: método, costo. Tracking number (input editable) + tracking URL.
  - Pago: método, estado de pago (dropdown editable), instrucciones del método.
  - Resumen de estado: mini timeline visual con pasos (Pending → Confirmed → Processing → Shipped → Delivered). El paso actual resaltado.

### 6.6 Exportar Pedido como PDF
En el detalle del pedido (admin y cliente), botón "Descargar PDF":
- Icono de descarga (lucide `Download`).
- Al hacer click, abre `window.open("/api/admin/orders/{id}/export-pdf")` (o `/api/orders/{id}/export-pdf` para cliente).
- Mostrar estado de carga mientras se genera (spinner pequeño).
- En caso de error, toast con mensaje.

### 6.7 Reenvío de Email
En el detalle, un dropdown "Reenviar email" con opciones:
- Confirmación de pedido
- Estado actualizado (usar estado actual)
Al enviar, mostrar toast de éxito/error y agregar entry al timeline.

### 6.8 Exportación a CSV
- **Desde la lista**: botón "Exportar" que descarga CSV con todos los pedidos filtrados.
- **Desde acciones masivas**: "Exportar seleccionados".
- Formato CSV: UTF-8 con BOM para Excel, delimiter `;`, headers en español.

---

## 7. Panel de Configuración de Webhooks — `/admin/webhook-config`

Agregar al admin sidebar en sección "Integraciones" (nueva sección debajo de "Tienda"):
- `/admin/webhook-config` — "Configuración de webhooks"
- `/admin/webhook-events` — "Eventos de webhooks"

### 7.1 Webhook Config Panel
- Toggle "Habilitar webhook"
- Input "URL del webhook" (validar URL)
- Input "Secret token" (tipo password, para firmar payloads)
- Input "Timeout (ms)" (default 10000)
- Input "Intentos de reintento" (default 3)
- Sección de documentación del payload: mostrar ejemplo JSON del payload que se envía, y los headers (`X-Webhook-Signature`, `X-Webhook-Event`, `X-Webhook-Id`).
- Botón "Guardar"
- Botón "Enviar evento de prueba" — crea un evento fake de tipo `test.ping` y lo dispara.

### 7.2 Webhook Events Log Panel
Tabla paginada:
- Fecha | Evento | Pedido | Estado (chip) | Intentos | HTTP Status | Último error
- Filtros: por estado, eventType, orderNumber.
- Acciones: "Reintentar" (botón por fila).

---

## 8. Página de Pedidos del Cliente — Mejoras

`/cuenta/pedidos/page.tsx`:
- Mostrar tabla/lista real con datos del servidor.
- Cada pedido expandible para ver items.
- Mostrar tracking number + link si existe.
- Estado de pago visible.
- **Acción por pedido**: botón "Descargar PDF" que llama a `/api/orders/{id}/export-pdf` (autenticado, solo su propio pedido).
- Link a detalle de pedido (nueva ruta `/cuenta/pedidos/[orderNumber]` opcional futuro, pero no requerido para este plan).

---

## 9. Email Transaccional Adicional

### 9.1 Nuevo template: `payment-status-update.template.ts`
- Enviado cuando el admin cambia `paymentStatus` a `paid` o `refunded`.
- Subject: "Pago confirmado / Reembolso procesado — Pedido #{orderNumber}".

### 9.2 Reenvío de confirmación
- Usar `sendOrderConfirmation` existente pero desde el panel admin.

---

## 10. Serialización del Order para API Externa

Crear helper `serializeOrderForWebhook(order: OrderWithRelations): unknown` en `src/server/webhooks/serialize-order.ts`:
- Convierte todos los `Decimal` a `string` (para evitar problemas de JSON).
- Incluye: order completo, items, notes (solo `customer` visibility), timeline, shipping, payment.
- Formato plano, sin relaciones circulares.
- Usar este helper tanto en `WebhookDispatcher` como en cualquier exportación futura.

---

## 11. Estructura de Carpetas Propuesta

```
src/
  server/
    orders/
      order.repository.ts          (extendido)
      order.schemas.ts             (extendido)
      order.service.ts             (extendido)
    webhooks/
      external-api-config.repository.ts
      webhook-event.repository.ts
      webhook-dispatcher.service.ts
      webhook-trigger.service.ts
      serialize-order.ts
  services/
    orders/
      get-admin-orders.ts        (extendido con filtros)
      get-order-dashboard-stats.ts
      export-orders-to-csv.ts
    webhooks/
      get-webhook-config.ts
      update-webhook-config.ts
      retry-failed-webhooks.ts
  features/
    admin-orders/
      components/
        order-admin-panel.tsx      (rediseñado)
        order-dashboard-stats.tsx  (nuevo, contiene recharts)
        order-detail-modal.tsx     (nuevo, reemplaza sticky panel)
        order-products-editor.tsx  (nuevo)
        order-address-editor.tsx   (nuevo)
        order-timeline.tsx         (nuevo)
        order-notes-editor.tsx     (nuevo)
        order-bulk-actions.tsx     (nuevo)
        order-export-button.tsx    (nuevo)
        order-pdf-document.tsx       (nuevo, componentes @react-pdf/renderer)
    admin-webhooks/
      components/
        webhook-config-panel.tsx   (nuevo)
        webhook-events-panel.tsx   (nuevo)
  app/
    api/
      admin/
        orders/
          route.ts                 (extendido con filtros)
          [id]/
            route.ts               (extendido)
            notes/
              route.ts             (nuevo)
            timeline/
              route.ts             (nuevo)
            resend-email/
              route.ts             (nuevo)
          export/
            route.ts               (nuevo)
          export-pdf/
            route.ts               (nuevo)
          dashboard/
            route.ts               (nuevo)
        webhook-config/
          route.ts                 (nuevo)
        webhooks/
          retry/
            route.ts               (nuevo)
          events/
            route.ts               (nuevo)
    admin/
      (dashboard)/
        orders/
          page.tsx                 (actualizar layout)
        webhook-config/
          page.tsx                 (nuevo)
        webhook-events/
          page.tsx                 (nuevo)
```

---

## 12. Notas de Implementación para el Agente

- **Tipado estricto**: todas las extensiones del schema deben reflejarse en los tipos TypeScript. `OrderWithRelations` debe incluir `items`, `notes`, `timeline`, `webhookEvents`.
- **Timeline automático**: cada mutación del pedido debe insertar un `OrderTimeline`. No dejar esto al frontend. Centralizar en `order.service.ts`.
- **Edición de items**: al cambiar items, recalcular subtotal desde items. Mantener shippingCost, taxAmount, discountAmount intactos a menos que se modifiquen explícitamente. Validar que `total = subtotal + shippingCost + taxAmount - discountAmount`.
- **CSV**: usar `encodeURIComponent` o helper simple para escapar comillas y punto-y-coma. Incluir BOM (`\ufeff`) para Excel.
- **Recharts**: instalar `recharts`. Usar `<ResponsiveContainer width="100%" height={240}>` para que se adapte. No importar componentes de recharts que no se usen (tree-shake friendly).
- **Webhooks fire-and-forget**: el dispatcher debe usarse con `void` o `Promise.allSettled` para no bloquear el flujo principal del checkout o del admin. Los errores se manejan en los retries.
- **No exponer secret**: `ExternalApiConfig.secretToken` nunca debe enviarse al frontend. En GET del config, omitir `secretToken`.
- **Modo test de Resend**: el sistema de webhooks es independiente del modo test de Resend. El webhook siempre dispara si está habilitado, sin importar `testMode`.
- **Payment status emails**: agregar `PaymentStatus` como nuevo enum en Prisma. `orderStatusUpdate` y `paymentStatusUpdate` son emails separados.
- **Order source**: `source` ayuda a la API externa a saber de dónde vino el pedido. `manual` se puede usar si en el futuro se crean pedidos desde el admin.
- **Acciones masivas**: el frontend debe enviar un array de `orderIds` al backend. El backend itera y aplica el cambio a cada uno.
- **PDF con @react-pdf/renderer**: usar `<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>` (para el logo). Usar `StyleSheet.create()` con fuentes seguras (Helvetica, Courier, Times-Roman incluidas por defecto). Para moneda usar `Intl.NumberFormat` antes de inyectar al PDF. No usar CSS externo ni Tailwind dentro del documento PDF; todo va inline en `StyleSheet`. El logo debe ser una URL pública accesible (puede ser un archivo en `public/` servido desde el dominio).
