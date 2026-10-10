import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "soundstore",
  user: process.env.DB_USER ?? "soundstore",
  password: process.env.DB_PASSWORD ?? "soundstore_dev",
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error);
});
