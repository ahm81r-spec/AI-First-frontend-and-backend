CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
  subtitle VARCHAR(160) NOT NULL CHECK (length(trim(subtitle)) > 0),
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  currency CHAR(3) NOT NULL,
  image_url TEXT NOT NULL,
  description VARCHAR(1000) NOT NULL CHECK (length(trim(description)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(60) NOT NULL CHECK (length(trim(color)) > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  UNIQUE (product_id, color)
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (variant_id, position)
);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS product_images_variant_id_idx
  ON product_images(variant_id);
