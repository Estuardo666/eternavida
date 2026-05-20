# Dermatologika

Base tecnica production-ready para iniciar el desarrollo de Dermatologika con arquitectura modular, TypeScript estricto y separacion clara de responsabilidades.

## Stack

- Next.js con App Router
- React
- TypeScript strict
- Tailwind CSS
- Clerk para autenticacion publica de cuentas
- PostgreSQL
- Prisma ORM
- Zod para validacion
- ESLint

## Estructura principal

```txt
src/
  app/
  components/
  features/
  lib/
  services/
  server/
  hooks/
  types/
  styles/
  config/
  seo/
  tests/
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Database Setup (PostgreSQL + Prisma)

### ⚠️ IMPORTANT: System Environment Variable Override

There is a system-level `DATABASE_URL` variable set to `localhost` that overrides `.env` files.

**This must be fixed before using Neon.**

**Quick Fix (Windows):**
```bash
# Run as Administrator
powershell -ExecutionPolicy Bypass -File scripts/cleanup-env.ps1

# Close ALL PowerShell windows completely
# Wait 5 seconds
# Reopen PowerShell fresh
```

### Quick Start (After Fixing Env)

1. **Verify environment is clean**
   ```bash
   npx prisma migrate status
   ```
   Should show Neon endpoint, not localhost.

2. **View database**
   ```bash
   npm run prisma:studio
   ```
   Opens http://localhost:5555

3. **Build and run**
   ```bash
   npm run build
   npm run dev
   ```

4. **Test endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/contact-leads \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test","email":"test@example.com","message":"Testing"}'
   ```

### Documentation

- **Neon Setup & Troubleshooting**: [docs/NEON_SETUP.md](docs/NEON_SETUP.md)
- **Database Setup Guide**: [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
- **API Testing**: [docs/API_TESTING.md](docs/API_TESTING.md)
- **Advanced Orders, PDFs, and Webhooks**: [docs/ADMIN_ORDERS_WEBHOOKS.md](docs/ADMIN_ORDERS_WEBHOOKS.md)
- **ContactLead Vertical**: [docs/CONTACT_LEAD_VERTICAL.md](docs/CONTACT_LEAD_VERTICAL.md)
- **Public Auth With Clerk**: [docs/PUBLIC_AUTH_CLERK.md](docs/PUBLIC_AUTH_CLERK.md)

### Public Auth With Clerk

- Public account pages now live at `/login` and `/register`.
- Public auth uses Clerk with email/password only.
- Google or other external providers are not enabled by default.
- Required env vars:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

- If these keys are not configured, the public auth pages render a setup notice instead of crashing the app.
- Current admin auth remains separate and still uses the internal session-cookie flow at `/admin/login`.

### Internal API Protection

- `POST /api/contact-leads` remains public for external forms.
- `GET /api/contact-leads` requires a valid admin session cookie.
- `GET /api/contact-leads/[id]` requires a valid admin session cookie.
- `PATCH /api/contact-leads/[id]` requires a valid admin session cookie.
- `POST /api/admin/login` creates the admin session cookie after validating credentials.
- `POST /api/admin/logout` clears the admin session cookie.

Protected routes return:
- `401` when the admin session cookie is missing, invalid, or expired.
- `403` when valid credentials do not belong to an `admin` account.

Login example:
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@dermatologika.local","password":"change-this-admin-password"}'
```

Protected route with session cookie:
```bash
curl http://localhost:3000/api/contact-leads \
  -b cookies.txt
```

Logout example:
```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt \
  -c cookies.txt
```

### Prisma Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run prisma:generate` | Generate Prisma Client after schema changes |
| `npm run prisma:migrate:dev -- --name init` | Create and apply migration (dev) |
| `npm run prisma:migrate:deploy` | Apply existing migrations (production) |
| `npm run prisma:migrate:status` | Check migration status |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npx prisma migrate reset` | Reset database (dev only - DESTRUCTIVE) |

---

## Previous Quick Start

### Quick Start

1. **Create PostgreSQL database** (see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for detailed steps)
   ```bash
   psql -U postgres -c "CREATE DATABASE dermatologika_dev;"
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Update .env with your DATABASE_URL
   # Example: postgresql://postgres:password@localhost:5432/dermatologika_dev?schema=public
   ```

3. **Verify connection**
   ```bash
   # Linux/macOS
   bash verify-db.sh
   
   # Windows
   verify-db.bat
   
   # Or with Node
   node scripts/test-db-connection.js
   ```

4. **Apply migrations**
   ```bash
   npm run prisma:migrate:dev
   ```

5. **View database**
   ```bash
   npm run prisma:studio
   ```
   Opens http://localhost:5555

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration (development)
npm run prisma:migrate:dev -- --name feature_name

# Apply existing migrations (production)
npm run prisma:migrate:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (development only - DESTRUCTIVE!)
npx prisma migrate reset
```

### Documentation

- **Database Setup Guide**: [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
- **Database Testing**: [docs/DATABASE_TESTING.md](docs/DATABASE_TESTING.md)
- **Connection Troubleshooting**: [docs/DATABASE_TESTING.md#troubleshooting](docs/DATABASE_TESTING.md#troubleshooting)

### Architecture

- **Validation**: `src/config/env.ts` — Centralizes and validates `DATABASE_URL`
- **Connection**: `src/server/db/prisma.ts` — Singleton Prisma Client (server-only)
- **Repository**: `src/server/contact/contact-lead.repository.ts` — Data access layer
- **Schema**: `prisma/schema.prisma` — Database models

**Key Principles**:
- `DATABASE_URL` is server-only (never exposed to client)
- No scattered `process.env` access
- All database operations through repository layer
- TypeScript strict mode throughout

## Prisma

1. Copia variables de entorno desde .env.example a .env.
2. Configura DATABASE_URL con tu instancia PostgreSQL.
3. Genera cliente Prisma:

```bash
npm run prisma:generate
```

4. Crea y aplica migraciones en local:

```bash
npm run prisma:migrate:dev -- --name init
```

5. Aplica migraciones en entorno productivo:

```bash
npm run prisma:migrate:deploy
```

## Testing the API

### ContactLead Endpoint

The first implemented vertical is `ContactLead`, representing a lead captured from a public contact form.

**POST /api/contact-leads**
```bash
curl -X POST http://localhost:3000/api/contact-leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I would like more information about services.",
    "source": "web-form"
  }'
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Full Testing Guide

See [docs/API_TESTING.md](docs/API_TESTING.md) for:
- cURL examples (success, validation, edge cases)
- Node.js fetch examples
- Prisma Studio workflow
- HTTP status code reference

### Architecture Documentation

Each vertical includes comprehensive architecture documentation:

- [docs/CONTACT_LEAD_VERTICAL.md](docs/CONTACT_LEAD_VERTICAL.md) — ContactLead domain architecture, layers, data flow, validation rules

## Entorno

- Validacion centralizada en src/config/env.ts.
- Las variables server-only (por ejemplo DATABASE_URL) se consumen exclusivamente desde ese modulo.
- El acceso a base de datos vive en src/server/db/prisma.ts.
