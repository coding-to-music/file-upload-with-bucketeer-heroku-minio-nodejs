CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL UNIQUE,
  image_url TEXT
);
