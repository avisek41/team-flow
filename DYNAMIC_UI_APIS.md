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

## Mobile App — Admin-published experience (recommended)

Admin sets **all** Studio signals, then clicks **Publish Experience**:

- Location (`city_id`)
- Time Context (`time_context`)
- Weather (`weather`)
- Festival Preview Override (`festival`)
- Salary Cycle (`salary_cycle`)

### Admin publish

No auth required for publish.

```http
PUT /admin/v1/active-experience
Content-Type: application/json

{
  "city_id": "mumbai",
  "time_context": "morning",
  "weather": "rain",
  "festival": "diwali",
  "salary_cycle": "premium"
}
```

Allowed values:

| Field | Values |
|-------|--------|
| `city_id` | `ahmedabad`, `mumbai`, `odisha`, `delhi`, `bengaluru`, `hyderabad` |
| `time_context` | `morning`, `afternoon`, `evening`, `night` |
| `weather` | `normal`, `rain`, `heatwave`, `cold` |
| `festival` | `none`, `diwali`, `holi`, `navratri`, `christmas`, `eid` |
| `salary_cycle` | `premium`, `normal`, `savings` |

### Mobile — Option A (one call, simplest)

```http
GET /api/v1/ui-config/published
```

Uses the admin-published Location + Time + Weather + Festival + Salary automatically.

### Mobile — Option B (two calls)

```http
GET /api/v1/public/active-experience
```

```json
{
  "success": true,
  "data": {
    "city_id": "mumbai",
    "display_name": "Mumbai, Maharashtra",
    "time_context": "morning",
    "weather": "rain",
    "festival": "diwali",
    "salary_cycle": "premium",
    "published_at": "..."
  }
}
```

Then:

```http
GET /api/v1/ui-config?city_id=mumbai&time_context=morning&weather=rain&festival=diwali&salary_cycle=premium
```

`GET /api/v1/public/active-city` still works and now returns the **full** experience object (same as `active-experience`).

### Defaults (when admin has not published)

| Signal | Default |
|--------|---------|
| Location | `ahmedabad` |
| Time Context | `morning` |
| Weather | `normal` |
| Festival | `none` |
| Salary Cycle | `normal` |

---

## Mobile App (Primary Endpoint)

`GET /api/v1/ui-config`

### Query parameters

| Param | Required | Notes |
|-------|----------|-------|
| `city_id` | **Yes*** | Required unless calling `/ui-config/published` |
| `time_context` | No | Admin/manual override: `morning` \| `afternoon` \| `evening` \| `night` |
| `weather` | No | `normal` \| `rain` \| `heatwave` \| `cold` |
| `festival` | No | `none` \| `diwali` \| `holi` \| … (overrides calendar) |
| `salary_cycle` | No | `premium` \| `normal` \| `savings` (overrides day-of-month) |
| `client_time` | No | Used only when phase/festival not overridden |
| `day_of_month` | No | Used only when salary not overridden |
| `use_published` | No | `true` / `1` — same as `/ui-config/published` |

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

- `GET /api/v1/public/active-experience` — **admin-published Location + Time + Weather + Festival + Salary**
- `GET /api/v1/public/active-city` — alias of active-experience
- `GET /api/v1/public/cities` — only the 6 supported cities
- `GET /api/v1/public/categories?city_id=`
- `GET /api/v1/public/restaurants?city_id=`
- `GET /api/v1/public/day-phases`
- `GET /api/v1/public/salary-cycles`
- `GET /api/v1/public/festivals?city_id=`
- `GET /api/v1/public/all?city_id=`

---

## Admin APIs (Dynamic Experience Studio)

### Publish (no auth)

| Method | Path |
|--------|------|
| `PUT` / `POST` | `/admin/v1/active-experience` |
| `GET` | `/admin/v1/active-experience` |
| `PUT` / `POST` / `GET` | `/admin/v1/active-city` (alias) |

### Content CRUD (requires auth)

`Authorization: Bearer <ADMIN_SECRET_TOKEN>`

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
Apply migration `src/database/migrations/004_city_image_url.sql` to add `cities.image_url` and seed city landmark images.
