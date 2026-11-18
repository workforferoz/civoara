# CIVOARA — Production Deployment & Operations Guide

## 1. Overview
CIVOARA is architected for zero-downtime deployment on Vercel backed by Supabase Enterprise PostgreSQL with PostGIS extensions.

---

## 2. Environment Variables Configuration

Set the following environment variables in your deployment platform (Vercel / Cloudflare / Docker):

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser | HTTPS endpoint for Supabase project instance |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser | Public anonymous API key (governed strictly by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only Secret | Privileged key for administrative migrations & idempotent cron tasks |
| `NEXT_PUBLIC_APP_URL` | Public / Browser | Canonical base URL (e.g. `https://civoara.gov` or `http://localhost:3000`) |
| `CRON_SECRET` | Server-Only Secret | Bearer token authenticating scheduled cron invocations (`/api/cron/sla`) |
| `NEXT_PUBLIC_MAP_DEFAULT_LAT` | Public | Default map center latitude (`12.9716`) |
| `NEXT_PUBLIC_MAP_DEFAULT_LNG` | Public | Default map center longitude (`77.5946`) |
| `NEXT_PUBLIC_MAP_DEFAULT_ZOOM` | Public | Default zoom level (`13`) |

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET` to browser-facing components or client-side bundles.

---

## 3. Database Migration & Provisioning

Execute the versioned database schema and seed scripts in your Supabase SQL editor:

1. **Master Schema Migration**:
   ```sql
   -- Run contents of:
   supabase/migrations/001_initial_schema.sql
   ```
   This creates PostGIS geometries, enums, all 15 relational tables, spatial indices, and Row Level Security (RLS) policies.

2. **Controlled Development / Demo Seed**:
   ```sql
   -- Run contents of:
   supabase/seed/seed.sql
   ```
   Provisions municipal departments (PWD, SWM, BESCOM, BWSSB, GEN), 5 Bengaluru demo ward polygons, SLA policies, and priority routing rules.

3. **Supabase Storage Bucket**:
   Create a public bucket named `civic-reports`:
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
   - File size limit: `5MB`
   - Policy: Authenticated/Public users can upload; Public can read.

---

## 4. Vercel Deployment & Automated Cron Schedule

Deploy via Vercel CLI or Git integration:

```bash
vercel --prod
```

`vercel.json` automatically registers the scheduled background worker:
- Route: `/api/cron/sla`
- Cadence: Every 15 minutes (`*/15 * * * *`)
- Purpose: Inspects open non-resolved tickets, evaluates SLA expiration, and executes idempotent Level 0-3 escalations.

---

## 5. Security & Invariant Checklist

- [x] **Strict RBAC**: Roles (`citizen`, `officer`, `supervisor`, `commissioner`, `admin`) enforced in PostgreSQL RLS.
- [x] **No Role Self-Escalation**: Database triggers reject any user attempting to alter `profiles.role`.
- [x] **Zero PII Leakage**: Public routes (`/public/map`, `/public/performance`, `/public/issues`) never return phone numbers, emails, or personal addresses.
- [x] **Sybil Protection**: Duplicate issue clustering filters out repeated submissions by the same user before computing priority elevation.
- [x] **Non-Destructive Org Segments**: Historical delays are never erased during departmental restructuring or ward reassignments.

---

## 6. Backup & Disaster Recovery Procedures

1. **Continuous WAL Archiving**: Managed via Supabase Point-In-Time Recovery (PITR).
2. **Scheduled Backups**: Daily encrypted PostgreSQL dumps stored in dedicated S3 storage.
3. **Rollback Strategy**: In the event of an administrative restructuring failure, `organization_versions` and closed `ownership_segments` preserve historical state allowing instant programmatic rollback.
