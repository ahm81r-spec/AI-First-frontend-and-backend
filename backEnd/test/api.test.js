import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";

const product = {
  id: 1,
  name: "MW75 TUMI",
  subtitle: "Active Noise-Cancelling Wireless Headphones",
  price: 750,
  currency: "USD",
  image: "https://example.test/black.png",
  variants: {
    color: ["Black", "Silver"],
    quantity: 3,
    colorOptions: [
      {
        name: "Black",
        stock: 3,
        images: [{ url: "https://example.test/black.png", alt: "Black headphones" }],
      },
      {
        name: "Silver",
        stock: 1,
        images: [{ url: "https://example.test/silver.png", alt: "Silver headphones" }],
      },
    ],
  },
  description: "A wireless headphone.",
};

let server;
let baseUrl;

before(async () => {
  const productRepository = {
    async getProductById(id) {
      return id === product.id ? product : null;
    },
    async getProducts() {
      return [product];
    },
  };
  const app = createApp({
    productRepository,
    databaseHealthCheck: async () => {},
  });

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("returns product detail with individual color stock", async () => {
  const response = await fetch(`${baseUrl}/api/products/1`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.name, "MW75 TUMI");
  assert.equal(body.variants.colorOptions[0].stock, 3);
  assert.equal(body.variants.colorOptions[1].stock, 1);
});

test("lists products", async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.length, 1);
  assert.equal(body[0].id, 1);
});

test("rejects invalid IDs and returns not found for unknown products", async (t) => {
  for (const id of ["0", "abc", "-1", "1.5", "9007199254740992"]) {
    await t.test(`${id} is invalid`, async () => {
      const response = await fetch(`${baseUrl}/api/products/${id}`);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        success: false,
        message: "Invalid product id",
      });
    });
  }

  const missing = await fetch(`${baseUrl}/api/products/999`);
  assert.equal(missing.status, 404);
});

test("serves health and OpenAPI documentation", async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.deepEqual(await health.json(), { status: "ok", database: "connected" });

  const specification = await fetch(`${baseUrl}/api-docs.json`);
  const document = await specification.json();
  assert.equal(document.openapi, "3.0.3");
  assert.ok(document.paths["/api/products/{id}"]);
});
