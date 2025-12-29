# Fix: Missing currency Column in herbs_routes Table

## Error
```
D1_ERROR: no such column: h.currency at offset 291: SQLITE_ERROR
```

## Root Cause
The `herbs_routes` table in production is missing the `currency` column that the API is trying to query.

## Solution

### Option 1: Add the Missing Column (RECOMMENDED)

Run this command to add the `currency` column to the existing `herbs_routes` table:

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="ALTER TABLE herbs_routes ADD COLUMN currency TEXT DEFAULT 'INR'"
```

Expected output: `Success!`

### Option 2: Check Current Table Schema

First, check what columns exist in the `herbs_routes` table:

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="PRAGMA table_info(herbs_routes)"
```

This will show you all columns in the table. Look for `currency` - if it's missing, run Option 1.

### After Adding the Column

1. **No need to redeploy** - the change is immediate in the database
2. **Refresh your browser**: https://herbs-routes-working.ayurveda-clinic.pages.dev
3. **Clear cache**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
4. **Click View button** on the IND00001 record
5. **It should work now!** ✅

## Why This Happened

The `herbs_routes` table was created but some columns were missing from the schema. The `currency` column was added in later migrations but those migrations didn't run on production.

## Quick Fix Command

```bash
npx wrangler d1 execute ayurveda-db-prod --remote --command="ALTER TABLE herbs_routes ADD COLUMN currency TEXT DEFAULT 'INR'"
```

Run this command and the View/Edit/Print buttons will work immediately!
