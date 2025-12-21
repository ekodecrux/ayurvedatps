-- Drop the incorrect table
DROP TABLE IF EXISTS payment_collections;

-- Recreate with correct schema (herbs_route_id and course_id)
CREATE TABLE payment_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herbs_route_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herbs_route_id) REFERENCES herbs_routes(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_payment_collections_herbs_route ON payment_collections(herbs_route_id);
CREATE INDEX idx_payment_collections_course ON payment_collections(course_id);
CREATE INDEX idx_payment_collections_date ON payment_collections(collection_date);
