import "dotenv/config";
import { createApp } from "./app.js";
import { initializeDatabase } from "./db/initialize.js";
import { pool } from "./db/pool.js";
import { createProductRepository } from "./repositories/products.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

async function start() {
  await initializeDatabase(pool);
  const app = createApp({
    productRepository: createProductRepository(pool),
    databaseHealthCheck: async () => {
      await pool.query("SELECT 1");
    },
  });

  const server = app.listen(port, host, () => {
    console.log(`Product API listening at http://${host}:${port}`);
    console.log(`Swagger UI available at http://${host}:${port}/api-docs`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down API`);
    server.close(async (error) => {
      try {
        await pool.end();
      } catch (poolError) {
        console.error("Failed to close PostgreSQL pool:", poolError);
        process.exitCode = 1;
      }
      if (error) {
        console.error("Failed to close HTTP server:", error);
        process.exitCode = 1;
      }
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch(async (error) => {
  console.error("Failed to start product API:", error);
  await pool.end();
  process.exitCode = 1;
});
