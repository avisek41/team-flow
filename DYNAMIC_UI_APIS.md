# Dynamic UI Backend API Documentation

Base URL (Local): `http://localhost:3000`

---

## 📱 Mobile App (Main Endpoint)
This is the core endpoint that your React Native app will call. It dynamically merges the city data, day phase, active festivals, and salary cycles into one unified JSON configuration.

- **URL:** `GET /api/v1/ui-config`
- **Query Parameters:**
  - `city_id` (required): e.g. `mumbai`, `odisha`, `ahmedabad`
  - `client_time` (optional): ISO timestamp (e.g. `2026-07-02T15:00:00Z`). Defaults to server time if omitted.
  - `day_of_month` (optional): `1` to `31`. Defaults to the current day.
- **Example:**
  `GET http://localhost:3000/api/v1/ui-config?city_id=mumbai&day_of_month=28`

---

## 🌍 Public Resource APIs (Read-Only)
These endpoints are completely public and can be fetched by anyone to see the raw database records.

**1. Get All Data Combined**
- `GET /api/v1/public/all`
  *(Returns everything: cities, restaurants, categories, day_phases, salary_cycles, and festivals in one single JSON payload)*

**2. Individual Resources**
- `GET /api/v1/public/cities` - Get all cities and their configurations
- `GET /api/v1/public/restaurants` - Get all restaurants
- `GET /api/v1/public/categories` - Get all city categories
- `GET /api/v1/public/day-phases` - Get morning/afternoon/evening/night configurations
- `GET /api/v1/public/salary-cycles` - Get salary cycle configurations
- `GET /api/v1/public/festivals` - Get active festival overlays

---

## 🛠️ Admin APIs (Create / Update / Delete)
These endpoints allow you to modify the database. *(Note: The token requirement has been removed per your request, so these are currently open for testing!)*

All admin endpoints follow the same pattern for the following resources:
- `/admin/v1/cities`
- `/admin/v1/categories`
- `/admin/v1/restaurants`
- `/admin/v1/day-phases`
- `/admin/v1/salary-cycles`
- `/admin/v1/festivals`

### Create a Resource
- **Method:** `POST`
- **Example URL:** `POST /admin/v1/restaurants`
- **Body:** JSON object with the properties for the new resource.
```json
{
  "id": "mum_004",
  "city_id": "mumbai",
  "name": "New Restaurant",
  "rating": "4.9"
}
```

### Update a Resource
- **Method:** `PUT` or `PATCH`
- **Example URL:** `PUT /admin/v1/restaurants/mum_004`
- **Body:** JSON object with the fields you want to update.
```json
{
  "rating": "5.0",
  "discount": "60% OFF"
}
```

### Delete a Resource
- **Method:** `DELETE`
- **Example URL:** `DELETE /admin/v1/restaurants/mum_004`
- **Response:** `{ "success": true, "message": "Record deleted successfully" }`
