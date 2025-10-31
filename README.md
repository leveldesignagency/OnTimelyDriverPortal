# OnTimely Driver Portal (Mobile/Tablet Web)

This is a standalone web app for drivers. It shares the same Supabase backend as the desktop and mobile apps.

- Mobile/tablet only: on desktop, users see a prompt to use a phone or tablet.
- Features (phase 1):
  - Enter driver name/plate to load upcoming trips
  - List trips as cards with pickup times/locations
  - (Next) Trip detail + QR scan to verify pickup and write to Supabase

## Dev

```
cd apps/driver-portal
npm install
npm run dev
```

Required env vars (create `.env`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Data flow
- Reads `guests` with chauffeur fields.
- Will write verification events to `chauffer_verification_logs` and update `guests.module_values` checkpoints, which the desktop/mobile apps already consume.
