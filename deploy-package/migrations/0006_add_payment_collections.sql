-- Create payment_collections table to track multiple payments per course
CREATE TABLE IF NOT EXISTS payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines_tracking(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_collections_medicine_id ON payment_collections(medicine_id);
CREATE INDEX IF NOT EXISTS idx_payment_collections_date ON payment_collections(collection_date);
