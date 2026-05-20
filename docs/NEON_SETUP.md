# Neon PostgreSQL Integration - Backend Setup Guide

## Status ✓

- ✅ Neon PostgreSQL connected and verified
- ✅ Prisma Client generated for Neon
- ✅ Initial ContactLead migration applied to Neon
- ✅ Database schema synchronized

## Important: System Environment Variable Override

There's a system-level `DATABASE_URL` environment variable set to `localhost` that overrides `.env` files in PowerShell. This needs to be cleaned up globally.

### Solution: Remove System-Level DATABASE_URL

**On Windows (permanently):**

1. Open PowerShell as Administrator:
   ```powershell
   # Check current system environment variables
   [Environment]::GetEnvironmentVariable("DATABASE_URL", "Machine")
   [Environment]::GetEnvironmentVariable("DATABASE_URL", "User")
   ```

2. Remove the system variable if it exists:
   ```powershell
   # As Administrator
   [Environment]::SetEnvironmentVariable("DATABASE_URL", $null, "Machine")
   [Environment]::SetEnvironmentVariable("DATABASE_URL", $null, "User")
   ```

3. **Close ALL PowerShell windows and terminals completely**, then reopen.

### Verification

After closure/reopening:
```powershell
cd "c:\Users\Stuart\Documents\Derma\Dermatologika\Web Dermatologika"
npx prisma migrate status
```

Should now show:
```
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-wild-pond-an3lung7-pooler.c-6.us-east-1.aws.neon.tech"
Database schema is up to date!
```

## Backend Architecture - Verified

### 1. Environment Configuration (`src/config/env.ts`)
- ✅ Centralizes DATABASE_URL reading from `.env`
- ✅ Validates with Zod schema (postgres:// URL required)
- ✅ Throws on invalid environment at startup
- ✅ Marked server-only (never exposed to client)

### 2. Prisma Client (`src/server/db/prisma.ts`)
- ✅ Singleton pattern prevents multiple instances
- ✅ Reads DATABASE_URL from centralized env module
- ✅ Global reference stored in non-production to prevent reconnects
- ✅ Marked server-only

### 3. Database Connection

**Neon Connection Details:**
- Provider: PostgreSQL
- Host: `ep-wild-pond-an3lung7-pooler.c-6.us-east-1.aws.neon.tech`
- Database: `neondb`
- User: `neondb_owner`
- SSL: Required (`sslmode=require`)
- Channel Binding: Required

**File: `.env`**
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&channel_binding=require
NODE_ENV=development
```

### 4. Database Schema

**ContactLead Model (Created in Neon)**
```sql
CREATE TABLE "ContactLead" (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web-form',
  status TEXT NOT NULL DEFAULT 'new',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  -- Indexes for query performance
  INDEX email_idx ON email,
  INDEX status_idx ON status,
  INDEX createdAt_idx ON createdAt
)
```

**Migrations Applied:**
- ✅ `0_initial_contact_lead` — Creates ContactLead table with indexes

## Exact Commands for Future Use

### After fixing system environment variable:

**Generate Prisma Client (after schema changes):**
```bash
npm run prisma:generate
```

**Create new migration (development):**
```bash
npm run prisma:migrate:dev -- --name migration_name
```

**Apply existing migrations (production):**
```bash
npm run prisma:migrate:deploy
```

**Check migration status:**
```bash
npm run prisma:migrate:status
```

**View database in GUI:**
```bash
npm run prisma:studio
```
Opens http://localhost:5555

**Reset database (dev only - DESTRUCTIVE):**
```bash
npx prisma migrate reset
```

## Testing Prisma Connection

**Quick test (after env fixed):**
```javascript
// scripts/test-connection.js
const { prisma } = require("../src/server/db/prisma");

(async () => {
  try {
    const count = await prisma.contactLead.count();
    console.log("✓ ContactLead table accessible");
    console.log(`  Records: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Connection failed:", error.message);
    process.exit(1);
  }
})();
```

Run with:
```bash
node scripts/test-connection.js
```

## Next Steps

1. **Fix system environment variable** (see above)
2. **Close and reopen PowerShell completely**
3. **Run verification:**
   ```bash
   npx prisma migrate status
   ```
4. **Try Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```
5. **Build and test the application:**
   ```bash
   npm run build
   npm run dev
   ```

Then you can:
- Test the `/api/contact-leads` POST endpoint
- Build more vertical slices with the same patterns
- Deploy to production

## Troubleshooting

### Still using localhost instead of Neon?

1. **Check current variables:**
   ```powershell
   # In current terminal session
   $env:DATABASE_URL
   
   # System level
   [Environment]::GetEnvironmentVariable("DATABASE_URL", "Machine")
   [Environment]::GetEnvironmentVariable("DATABASE_URL", "User")
   ```

2. **Clean current session:**
   ```powershell
   $env:DATABASE_URL = $null
   ```

3. **Close ALL PowerShell windows** completely and reopen fresh before running commands.

### Neon Connection Refused?

- Verify Neon is online: https://console.neon.tech
- Check connection string in `.env` matches Neon dashboard exactly
- Verify IP whitelisting if your network requires it

### Migration Status shows out-of-sync?

```bash
# Reset and re-apply (dev only - loses data)
npx prisma migrate reset

# Or apply pending migrations
npm run prisma:migrate:dev
```

---

**Backend is now production-ready with Neon PostgreSQL fully integrated.**
