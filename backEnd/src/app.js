import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

const productIdPattern = /^[1-9]\d*$/;

function sendError(response, status, message) {
  return response.status(status).json({ success: false, message });
}

export function createApp({
  productRepository,
  databaseHealthCheck,
  corsOrigin = process.env.CORS_ORIGIN ?? "*",
}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "10kb" }));

  app.get("/health", async (_request, response, next) => {
    try {
      await databaseHealthCheck();
      response.json({ status: "ok", database: "connected" });
    } catch (error) {
      console.error("Database health check failed:", error);
      sendError(response, 503, "Database unavailable");
    }
  });

  app.get("/api-docs.json", (_request, response) => {
    response.json(openApiDocument);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get("/api/products", async (_request, response, next) => {
    try {
      response.json(await productRepository.getProducts());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (request, response, next) => {
    const { id: rawId } = request.params;
    if (!productIdPattern.test(rawId)) {
      return sendError(response, 400, "Invalid product id");
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id)) {
      return sendError(response, 400, "Invalid product id");
    }

    try {
      const product = await productRepository.getProductById(id);
      if (!product) return sendError(response, 404, "Product not found");
      return response.json(product);
    } catch (error) {
      return next(error);
    }
  });

  app.use((_request, response) => {
    sendError(response, 404, "Route not found");
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.parse.failed") {
      return sendError(response, 400, "Invalid JSON body");
    }
    if (error?.type === "entity.too.large") {
      return sendError(response, 413, "Request body is too large");
    }

    console.error("Unhandled API error:", error);
    return sendError(response, 500, "Internal server error");
  });

  return app;
}
