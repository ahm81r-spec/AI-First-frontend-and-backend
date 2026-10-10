# SoundStore Product API

Backend for the MW75 TUMI product page. It uses Node.js, Express, PostgreSQL,
Docker Compose, and Swagger UI. Product, color stock, and gallery image data are
seeded from [`api-product/src/products.js`](./api-product/src/products.js).

## Requirements

- Docker Desktop with the Linux container engine running
- Docker Compose v2

For running the API directly on your computer instead of in Docker, Node.js 20
or newer is also required.

## Run with Docker Compose

Open PowerShell in this `backEnd` directory:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Compose starts PostgreSQL and waits for its health check before starting the
API. On startup, the API creates the database schema and synchronizes the
catalog from `api-product/src/products.js`.

Local URLs:

- API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/api-docs>
- OpenAPI JSON: <http://localhost:3000/api-docs.json>
- Health check: <http://localhost:3000/health>
- MW75 TUMI product: <http://localhost:3000/api/products/1>
- PostgreSQL: `localhost:5432`

Stop the services while preserving the database volume:

```powershell
docker compose down
```

To remove the database volume and its data as well, use
`docker compose down --volumes`. This permanently deletes the local database
data.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | Return all products |
| `GET` | `/api/products/:id` | Return one product by ID |
| `GET` | `/health` | Check API and database availability |

Product IDs must be positive safe integers. A valid but unknown ID returns
`404`; an invalid ID returns `400`.

Example success response for `GET /api/products/1`:

```json
{
  "id": 1,
  "name": "MW75 TUMI",
  "subtitle": "Active Noise-Cancelling Wireless Headphones",
  "price": 750,
  "currency": "USD",
  "image": "https://cdn.shopify.com/...",
  "variants": {
    "color": ["Black", "Silver"],
    "quantity": 3,
    "colorOptions": [
      {
        "name": "Black",
        "stock": 3,
        "images": [
          {
            "url": "https://cdn.shopify.com/...",
            "alt": "Black TUMI MW75 headphones"
          }
        ]
      },
      {
        "name": "Silver",
        "stock": 1,
        "images": [
          {
            "url": "https://cdn.shopify.com/s/files/1/0404/1101/files/MW75S_TUMI_800x800_Hero.png?v=1769444695",
            "alt": "Floating silver TUMI MW75 Active Noise-Cancelling Headphones — hero"
          }
        ]
      }
    ]
  },
  "description": "A collection of active noise-cancelling sound tools..."
}
```

Each `variants.colorOptions[]` entry has its own authoritative `stock` value and
ordered `images`. `variants.quantity` is retained for compatibility and
represents the stock of the first color variant; use each color's `stock` when
displaying or validating quantity for that variant.

The response example shows one gallery image per color for brevity; the API
returns all four images for each color.

## Frontend integration

The existing frontend at `frontEnd/frontEndWithDB` requests
`http://127.0.0.1:3000/api/products/1`. Start the Docker Compose stack, then
open `frontEnd/frontEndWithDB/index.html` with a local web server such as the
VS Code Live Server extension. CORS is enabled; its origin can be limited with
the `CORS_ORIGIN` environment variable.

## Configuration

Compose reads optional settings from `.env` in this directory. Start with
`.env.example`:

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `soundstore` | Database name |
| `POSTGRES_USER` | `soundstore` | Database user |
| `POSTGRES_PASSWORD` | `soundstore_dev` | Local development password |
| `POSTGRES_PORT` | `5432` | Host port for PostgreSQL |
| `API_PORT` | `3000` | Host port for the API |
| `CORS_ORIGIN` | `*` | Allowed browser origin(s) |

These credentials are for local development only. Do not use them in production.

## Data and database

The schema is defined in [`database/001-schema.sql`](./database/001-schema.sql):

- `products` stores product name, subtitle, price, currency, primary image, and
  description.
- `product_variants` stores each color and its stock.
- `product_images` stores ordered gallery images and alt text per color.

The product catalog in `api-product/src/products.js` is the seed source of
truth. When the API starts, it synchronizes these products, variants, and
images into PostgreSQL. Changes made directly to seeded catalog rows in the
database are replaced by the source file's values on the next API startup.
Update the source file and restart/recreate the API to change this seed data.

## Tests

Install dependencies and run the test suite from this directory:

```powershell
npm install
npm test
```

Tests cover the original in-memory API, Express routes, product stock fields,
input validation, not-found responses, health check, and OpenAPI document. The
automated route tests use an injected repository and do not require PostgreSQL.

## Run the API on the host (optional)

To run the API process directly while PostgreSQL is running in Docker:

```powershell
npm install
npm start
```

Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `PORT` in the
environment as needed. The defaults target a PostgreSQL service on
`127.0.0.1:5432` with the local development credentials above.

## Related documentation

- [Product requirements](./prd.md)
- [Architecture](./architecture.md)
