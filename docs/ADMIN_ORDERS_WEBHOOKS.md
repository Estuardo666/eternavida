# Admin Orders, PDFs, and Webhooks

This document describes the advanced order-management implementation added for the admin panel and customer account area.

## Scope

The implementation covers:

- advanced admin order dashboard with filters, KPIs, bulk actions, detail editing, notes, timeline, tracking, discounts, payment status updates, and PDF export
- webhook configuration and webhook event log screens in admin
- CSV export and retryable webhook delivery pipeline
- customer account order upgrades with payment status, tracking visibility, item expansion, and PDF download

## Module Ownership

### Server

- `src/server/orders/`
  - order validation, repository access, totals recalculation, dashboard stats, PDF rendering, timeline and notes mutations
- `src/server/webhooks/`
  - webhook config persistence, event serialization, signed dispatch, retry state, and event storage

### App Routes

Admin routes:

- `GET /api/admin/orders`
- `PATCH /api/admin/orders`
- `GET /api/admin/orders/[id]`
- `PATCH /api/admin/orders/[id]`
- `GET /api/admin/orders/[id]/notes`
- `POST /api/admin/orders/[id]/notes`
- `GET /api/admin/orders/[id]/timeline`
- `POST /api/admin/orders/[id]/resend-email`
- `GET /api/admin/orders/[id]/export-pdf`
- `GET /api/admin/orders/export`
- `GET /api/admin/orders/dashboard`
- `GET /api/admin/webhook-config`
- `PUT /api/admin/webhook-config`
- `POST /api/admin/webhook-config`
- `GET /api/admin/webhook-events`
- `POST /api/admin/webhooks/retry`

Customer route:

- `GET /api/orders/[id]/export-pdf`

### Frontend

- `src/features/admin-orders/components/`
  - main admin panel, dashboard stats, shared types, detail modal, and PDF document
- `src/features/admin-webhooks/components/`
  - webhook configuration UI and webhook event log UI
- `src/app/(account)/cuenta/pedidos/page.tsx`
  - upgraded customer-facing order history

## Webhook Behavior

Webhook delivery is controlled from `ExternalApiConfig` and `WebhookEvent`.

Current behavior:

- HMAC SHA-256 signature is sent in `X-Webhook-Signature`
- order lifecycle events are queued by the order service
- delivery attempts are persisted with status, attempt count, last HTTP status, and last error
- failed and retrying events can be replayed from admin
- test events can be sent from the webhook config screen

## PDF and Export Behavior

- admins can export a single order to PDF from the order table or detail modal
- customers can export their own order PDF from account orders
- admins can export filtered or selected orders to CSV

## Notes

- `Order.checkoutNotes` preserves the legacy database column mapping for checkout notes while relation-backed internal notes now live in `OrderNote`
- Prisma client generation can fail on Windows if the Prisma query engine DLL is locked by a running dev process; stop the local Next.js dev server before running the production build
