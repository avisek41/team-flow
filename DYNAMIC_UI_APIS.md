# Dynamic UI Backend API Documentation

Base URL (Local): `http://localhost:3000`

Supported cities (exact IDs only):

- `ahmedabad` → Ahmedabad, Gujarat
- `mumbai` → Mumbai, Maharashtra
- `odisha` → Bhubaneswar, Odisha
- `delhi` → Delhi, Delhi
- `bengaluru` → Bengaluru, Karnataka
- `hyderabad` → Hyderabad, Telangana

Architecture: **React Native → Express → Supabase**. Mobile never talks to PostgREST directly.

---

## Mobile App (Primary Endpoint)

`GET /api/v1/ui-config`

### Query parameters

| Param | Required | Notes |
|-------|----------|-------|
| `city_id` | **Yes** | Must be one of the 6 supported IDs. **No default city.** |
| `client_time` | No | ISO timestamp used for day-phase + festival calendar date |
| `day_of_month` | No | 1–31; salary cycle if omitted uses date from `client_time` / now |

### Salary cycle (fixed)

| Days | Cycle |
|------|-------|
| 1–5 | `premium` |
| 6–24 | `normal` |
| 25–31 | `savings` |

### Festival resolution (calendar)

Express picks the festival where:

- `enabled` is true
- `start_date <= client date <= end_date`
- `city_id` is null (all cities) **or** matches request city
- highest `priority` wins on overlap

If none match → non-festival experience (`festival: null`).

### Example

```http
GET /api/v1/ui-config?city_id=delhi&client_time=2026-08-13T17:00:00+05:30&day_of_month=13
```

### Error responses (never falls back to another city)

| Code | Status | When |
|------|--------|------|
| `CITY_ID_REQUIRED` | 400 | Missing `city_id` |
| `CITY_ID_UNSUPPORTED` | 400 | Not in the 6-city allowlist |
| `CITY_CONFIG_MISSING` | 404 | City missing or incomplete pack (`missing` array listed) |

---

## Public Resource APIs (Read-Only)

- `GET /api/v1/public/cities` — only the 6 supported cities
- `GET /api/v1/public/categories?city_id=`
- `GET /api/v1/public/restaurants?city_id=`
- `GET /api/v1/public/day-phases`
- `GET /api/v1/public/salary-cycles`
- `GET /api/v1/public/festivals?city_id=`
- `GET /api/v1/public/all?city_id=`

---

## Admin APIs (Dynamic Experience Studio)

All require: `Authorization: Bearer <ADMIN_SECRET_TOKEN>`

Resources (GET list + POST + PUT/PATCH + DELETE):

| Path | Table |
|------|--------|
| `/admin/v1/cities` | cities |
| `/admin/v1/categories` | city_categories |
| `/admin/v1/restaurants` | restaurants |
| `/admin/v1/greetings` | city_greetings |
| `/admin/v1/salary-messages` | city_salary_messages |
| `/admin/v1/spotlights` | local_spotlights |
| `/admin/v1/ui-labels` | ui_labels |
| `/admin/v1/trending-tags` | trending_tags |
| `/admin/v1/day-phases` | day_phases |
| `/admin/v1/salary-cycles` | salary_cycles |
| `/admin/v1/festivals` | festival_overlays |
| `/admin/v1/festival-categories` | festival_categories |
| `/admin/v1/festival-greetings` | festival_greetings |

City-scoped lists accept `?city_id=`.

Supported cities **cannot be deleted**. Creating cities outside the allowlist is rejected.

Festival admin fields: `id`, `enabled`, `start_date`, `end_date`, `city_id` (null = all), `priority`, overlays/banner/chips.

---

## Seed

```bash
# optional rebuild from Desktop source + generators
npm run seed:build

# upsert into Supabase
npm run seed
```

Uses `src/database/seed/dynamic_ui_seed.json`.

Apply migration `src/database/migrations/003_festival_calendar_and_constraints.sql` once on existing DBs.
