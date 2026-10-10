import { createServer } from "node:http";
import { products } from "./products.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

export function createApp() {
  return createServer((request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      response.end();
      return;
    }

    const pathname = new URL(request.url, "http://localhost").pathname;
    const productRoute = pathname.match(/^\/api\/products\/([^/]+)$/);
    const productCollectionRoute =
      pathname === "/api/products" || pathname === "/api/products/";

    if (productRoute || productCollectionRoute) {
      if (request.method !== "GET") {
        response.setHeader("Allow", "GET, OPTIONS");
        sendJson(response, 405, {
          success: false,
          message: "Method not allowed",
        });
        return;
      }

      const rawId = productRoute?.[1];
      if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
        sendJson(response, 400, {
          success: false,
          message: "Invalid product id",
        });
        return;
      }

      const id = Number(rawId);
      if (!Number.isSafeInteger(id)) {
        sendJson(response, 400, {
          success: false,
          message: "Invalid product id",
        });
        return;
      }

      const product = products.find((item) => item.id === id);
      if (!product) {
        sendJson(response, 404, {
          success: false,
          message: "Product not found",
        });
        return;
      }

      sendJson(response, 200, product);
      return;
    }

    sendJson(response, 404, {
      success: false,
      message: "Route not found",
    });
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  createApp().listen(PORT, HOST, () => {
    console.log(`Product API listening at http://${HOST}:${PORT}`);
  });
}
