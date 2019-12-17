CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL,
  input_schema JSONB NOT NULL
);
