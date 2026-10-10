export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SoundStore Product API",
    version: "1.0.0",
    description:
      "Product detail API backed by PostgreSQL. Product seed data is synchronized from api-product/src/products.js when the API starts.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local development" }],
  tags: [{ name: "Products" }, { name: "Health" }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API and database availability",
        responses: {
          200: {
            description: "API and database are available",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
          503: { description: "Database is unavailable" },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        responses: {
          200: {
            description: "Product list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product detail",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Positive integer product ID",
            schema: { type: "integer", minimum: 1 },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Product detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Product ID is not a positive safe integer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          500: { description: "Unexpected server error" },
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: "object",
        required: ["status", "database"],
        properties: {
          status: { type: "string", example: "ok" },
          database: { type: "string", example: "connected" },
        },
      },
      Error: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Product not found" },
        },
      },
      Product: {
        type: "object",
        required: [
          "id",
          "name",
          "subtitle",
          "price",
          "currency",
          "image",
          "variants",
          "description",
        ],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "MW75 TUMI" },
          subtitle: {
            type: "string",
            example: "Active Noise-Cancelling Wireless Headphones",
          },
          price: { type: "number", format: "decimal", example: 750 },
          currency: { type: "string", example: "USD" },
          image: {
            type: "string",
            format: "uri",
            example: "https://cdn.shopify.com/product.png",
          },
          variants: { $ref: "#/components/schemas/Variants" },
          description: { type: "string" },
        },
      },
      Variants: {
        type: "object",
        required: ["color", "quantity", "colorOptions"],
        properties: {
          color: { type: "array", items: { type: "string" } },
          quantity: {
            type: "integer",
            minimum: 0,
            description: "Stock for the first color variant, for legacy clients.",
          },
          colorOptions: {
            type: "array",
            items: { $ref: "#/components/schemas/ColorVariant" },
          },
        },
      },
      ColorVariant: {
        type: "object",
        required: ["name", "stock", "images"],
        properties: {
          name: { type: "string", example: "Black" },
          stock: { type: "integer", minimum: 0, example: 3 },
          images: {
            type: "array",
            items: { $ref: "#/components/schemas/ProductImage" },
          },
        },
      },
      ProductImage: {
        type: "object",
        required: ["url", "alt"],
        properties: {
          url: { type: "string", format: "uri" },
          alt: { type: "string" },
        },
      },
    },
  },
};
