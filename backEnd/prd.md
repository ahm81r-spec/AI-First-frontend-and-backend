# Product API with PostgreSQL — PRD

## Overview

Build a Node.js and Express REST API documented with Swagger UI. PostgreSQL
stores product details, color variants, stock, and gallery images. The MW75
TUMI seed catalog is sourced from `api-product/src/products.js` and synchronized
to PostgreSQL whenever the API starts.

## Users and user stories

- As a shopper, I can view product name, price, photos, description, colors, and
  stock on the existing `frontEnd/frontEndWithDB` product page.
- As a frontend developer, I can call a stable JSON endpoint and rely on each
  color variant having its own stock and gallery.
- As a developer, I can browse and understand the API contract in Swagger UI.
- As an operator, I can check API/database availability and run the application
  with Docker Compose.

## Scope

### In scope

- `GET /api/products` and `GET /api/products/:id`
- `GET /health`
- Swagger UI at `/api-docs` and OpenAPI JSON at `/api-docs.json`
- PostgreSQL schema and source-driven seed data
- Docker Compose orchestration for API and database
- Product detail integration with the existing front-end
- Positive safe-integer path ID validation and clear error responses

### Out of scope

- User accounts, authentication, product administration, order processing,
  payment, or inventory reservation
- Production deployment and external secret management

## Data requirements

Products include an integer ID, name, subtitle, positive price, currency,
primary image URL, and non-empty description (up to 1000 characters). Each
product has one or more color variants. A variant has its own nonnegative
integer stock and ordered gallery images, each with URL and alt text.

## API contract

| Endpoint | Success | Errors |
|---|---|---|
| `GET /api/products` | `200` JSON array | `500` database/internal failure |
| `GET /api/products/:id` | `200` product JSON | `400` invalid ID, `404` missing product, `500` internal failure |
| `GET /health` | `200` when DB responds | `503` when DB health check fails |
| `GET /api-docs` | Swagger UI | — |

## Acceptance criteria

- [ ] Docker Compose starts PostgreSQL and API after the database is healthy.
- [ ] API initializes the schema and synchronizes MW75 TUMI seed data into SQL.
- [ ] Each color response retains that color's own stock from the source data.
- [ ] Product endpoints return JSON that the existing product page can render.
- [ ] Invalid IDs return `400`; unknown valid IDs return `404`.
- [ ] Health endpoint reports database connectivity.
- [ ] Swagger UI and OpenAPI JSON describe the endpoints and response schemas.
- [ ] Automated HTTP tests cover success, validation, not-found, health, and docs.

## Constraints and assumptions

- Local development only; Postgres credentials in Compose defaults are not for
  production.
- The current in-memory `api-product/src/products.js` file is the source of
  truth for seed catalog content. On API startup, these catalog and stock values
  overwrite matching product/variant rows in the local database.
- The API keeps the existing frontend response shape, including `variants.color`,
  `variants.quantity` for compatibility, and the authoritative per-color
  `variants.colorOptions[].stock`.
