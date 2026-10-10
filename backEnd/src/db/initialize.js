import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { products } from "../../api-product/src/products.js";

const schemaPath = new URL("../../database/001-schema.sql", import.meta.url);

export async function initializeDatabase(database) {
  const schema = await readFile(fileURLToPath(schemaPath), "utf8");
  await database.query(schema);

  const client = await database.connect();
  try {
    await client.query("BEGIN");
    for (const product of products) {
      await client.query(
        `INSERT INTO products (id, name, subtitle, price, currency, image_url, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           subtitle = EXCLUDED.subtitle,
           price = EXCLUDED.price,
           currency = EXCLUDED.currency,
           image_url = EXCLUDED.image_url,
           description = EXCLUDED.description,
           updated_at = NOW()`,
        [
          product.id,
          product.name,
          product.subtitle,
          product.price,
          product.currency,
          product.image,
          product.description,
        ],
      );

      await client.query("DELETE FROM product_variants WHERE product_id = $1", [
        product.id,
      ]);

      for (const variant of product.variants.colorOptions) {
        const result = await client.query(
          `INSERT INTO product_variants (product_id, color, stock)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [product.id, variant.name, variant.stock],
        );
        const variantId = result.rows[0].id;

        for (const [position, image] of variant.images.entries()) {
          await client.query(
            `INSERT INTO product_images (variant_id, image_url, alt_text, position)
             VALUES ($1, $2, $3, $4)`,
            [variantId, image.url, image.alt, position],
          );
        }
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
