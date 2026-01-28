-- Migration: Create medicines master table
-- Date: 2026-01-28
-- Purpose: Master list of medicines for dropdown selection

CREATE TABLE IF NOT EXISTS medicines_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_medicines_master_name ON medicines_master(name);

-- Insert default medicines
INSERT OR IGNORE INTO medicines_master (name, description, category) VALUES
('Triphala Churna', 'Digestive and detoxification formula', 'Churna'),
('Ashwagandha Capsules', 'Stress relief and immunity booster', 'Capsule'),
('Brahmi Ghrita', 'Brain tonic and memory enhancer', 'Ghee'),
('Chyawanprash', 'Immunity and vitality booster', 'Lehya'),
('Dashmool Kwath', 'Anti-inflammatory decoction', 'Kwath'),
('Arjuna Powder', 'Heart health support', 'Churna'),
('Tulsi Drops', 'Respiratory and immunity support', 'Liquid'),
('Amla Juice', 'Vitamin C rich antioxidant', 'Juice'),
('Giloy Sat', 'Fever and immunity enhancer', 'Extract'),
('Neem Capsules', 'Blood purifier and skin health', 'Capsule'),
('Haridra Khanda', 'Anti-inflammatory and immunity', 'Powder'),
('Shankhapushpi Syrup', 'Memory and concentration enhancer', 'Syrup'),
('Avipattikar Churna', 'Acidity and digestive support', 'Churna'),
('Yograj Guggulu', 'Joint pain and arthritis relief', 'Tablet'),
('Mahasudarshan Churna', 'Fever and infection treatment', 'Churna');
