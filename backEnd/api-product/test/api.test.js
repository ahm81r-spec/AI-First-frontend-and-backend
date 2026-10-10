import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/server.js";

let server;
let baseUrl;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("returns the MW75 TUMI product with the expected fields and variants", async () => {
  const response = await fetch(`${baseUrl}/api/products/1`);
  const product = await response.json();

  assert.equal(response.status, 200);
  assert.equal(product.id, 1);
  assert.equal(product.name, "MW75 TUMI");
  assert.equal(product.price, 750);
  assert.equal(product.currency, "USD");
  assert.match(product.image, /^https:\/\/cdn\.shopify\.com\//);
  assert.deepEqual(product.variants.color, ["Black", "Silver"]);
  assert.equal(product.variants.quantity, 3);
  assert.equal(product.variants.colorOptions[0].stock, 3);
  assert.equal(product.variants.colorOptions[1].stock, 1);
  assert.equal(product.variants.colorOptions[0].images.length, 4);
  assert.equal(product.variants.colorOptions[1].images.length, 4);
  assert.match(product.description, /40mm Beryllium drivers/);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
});

test("rejects invalid product ids", async (t) => {
  for (const id of ["0", "-1", "1.5", "abc", "1e0", "9007199254740992"]) {
    await t.test(id, async () => {
      const response = await fetch(`${baseUrl}/api/products/${id}`);
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.deepEqual(body, {
        success: false,
        message: "Invalid product id",
      });
    });
  }
});

test("rejects a missing product id", async (t) => {
  for (const path of ["/api/products", "/api/products/"]) {
    await t.test(path, async () => {
      const response = await fetch(`${baseUrl}${path}`);
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.deepEqual(body, {
        success: false,
        message: "Invalid product id",
      });
    });
  }
});

test("returns 404 for a valid but unknown product id", async () => {
  const response = await fetch(`${baseUrl}/api/products/999`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    success: false,
    message: "Product not found",
  });
});

test("rejects unsupported methods on the product endpoint", async () => {
  const response = await fetch(`${baseUrl}/api/products/1`, { method: "POST" });
  const body = await response.json();

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, OPTIONS");
  assert.equal(body.success, false);
});
