# MW75 TUMI Product API

Simple Node.js REST API serving the MW75 TUMI product data used by the
`frontEnd/frontEndHardCode` product page. Product data is hardcoded; no database
or third-party package is required.

## Requirements

- Node.js 18 or newer

## Run

From this directory:

```powershell
npm start
```

The API listens on `http://127.0.0.1:3000`. Set `PORT` or `HOST` environment
variables to override the defaults.

## Endpoint

`GET /api/products/1`

Success returns HTTP 200 with the product object. It includes the PRD fields
(`id`, `name`, `price`, `image`, `variants`, and `description`), plus `subtitle`,
`currency`, and per-color `colorOptions` containing stock and four gallery
images each. `variants.quantity` is the in-stock quantity of the default Black
variant; each color's exact stock is also available in `colorOptions`.

Invalid IDs (anything other than a positive safe integer in decimal notation)
return HTTP 400. A valid ID without a matching product returns HTTP 404.
Unsupported methods on the product route return HTTP 405. Responses include
CORS headers for local front-end development.

Example:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/products/1
```

## Test

```powershell
npm test
```
