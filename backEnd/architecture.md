# Product API Architecture

## Components

```text
frontEnd/frontEndWithDB
        |
        | GET /api/products/1 (HTTP, JSON, CORS)
        v
Express API (Node.js)
  |-- GET /health
  |-- GET /api/products[/:id]
  |-- Swagger UI (/api-docs)
  |-- Product repository
  |-- Startup schema + seed synchronization
        |
        | PostgreSQL protocol
        v
PostgreSQL 16 (Docker volume)
```

## Data model

- `products`: product name, subtitle, price/currency, primary image, and
  description.
- `product_variants`: one row per product color, including that color's stock.
- `product_images`: ordered images and accessible alt text for a variant.

Foreign keys cascade from products to variants and variants to images. Database
constraints enforce positive prices, nonnegative stock, required text, and
unique colors and image positions within a variant.

## Request flow

1. Front-end requests `GET /api/products/:id`.
2. Express validates that the ID is a positive safe integer.
3. The repository reads the product, its color variants, and ordered images
   using parameterized SQL.
4. The repository maps PostgreSQL rows to the existing frontend JSON contract.
5. Express returns JSON; unexpected errors are logged and return a generic 500.

## Startup and source data

Compose starts PostgreSQL and waits for its health check before starting the
API. The API applies the idempotent schema in `database/001-schema.sql`, then
imports `api-product/src/products.js` and synchronizes that catalog within a
database transaction. This keeps each variant stock tied to its own source
`colors[].stock` value.

The stock seed is catalog data, not transactional inventory. Since seed
synchronization runs at startup, local database catalog/stock edits are replaced
by the source file's values when the API restarts.

## Operations

- `docker compose up --build -d`: run API and database.
- `docker compose ps`: inspect service health.
- `docker compose logs -f api`: inspect API startup and errors.
- `docker compose down`: stop services while preserving the named database
  volume.
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`

Use a different Compose project name or port overrides when port 3000 or 5432
is already in use. Do not use the documented local default credentials in a
production deployment.
