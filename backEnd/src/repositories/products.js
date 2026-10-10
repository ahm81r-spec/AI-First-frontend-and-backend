function toProduct(row, variants) {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    price: Number(row.price),
    currency: row.currency.trim(),
    image: row.image_url,
    variants: {
      color: variants.map((variant) => variant.name),
      quantity: variants[0]?.stock ?? 0,
      colorOptions: variants.map((variant) => ({
        name: variant.name,
        stock: variant.stock,
        images: variant.images,
      })),
    },
    description: row.description,
  };
}

export function createProductRepository(database) {
  async function getProductById(id) {
    const productResult = await database.query(
      `SELECT id, name, subtitle, price, currency, image_url, description
       FROM products
       WHERE id = $1`,
      [id],
    );

    if (productResult.rowCount === 0) return null;

    const variantResult = await database.query(
      `SELECT
         variants.id,
         variants.color AS name,
         variants.stock,
         COALESCE(
           json_agg(
             json_build_object(
               'url', images.image_url,
               'alt', images.alt_text
             ) ORDER BY images.position
           ) FILTER (WHERE images.id IS NOT NULL),
           '[]'::json
         ) AS images
       FROM product_variants AS variants
       LEFT JOIN product_images AS images ON images.variant_id = variants.id
       WHERE variants.product_id = $1
       GROUP BY variants.id
       ORDER BY variants.id`,
      [id],
    );

    const variants = variantResult.rows.map((variant) => ({
      name: variant.name,
      stock: variant.stock,
      images: variant.images,
    }));

    return toProduct(productResult.rows[0], variants);
  }

  async function getProducts() {
    const result = await database.query(
      "SELECT id FROM products ORDER BY id",
    );
    const products = [];
    for (const row of result.rows) {
      const product = await getProductById(row.id);
      if (product) products.push(product);
    }
    return products;
  }

  return { getProductById, getProducts };
}
