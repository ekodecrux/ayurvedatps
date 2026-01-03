-- Add country_iso3 field to patients table
ALTER TABLE patients ADD COLUMN country_iso3 TEXT;

-- Update existing patients with default ISO3 codes based on country name
UPDATE patients SET country_iso3 = 'IND' WHERE country = 'India' OR country IS NULL;
UPDATE patients SET country_iso3 = 'USA' WHERE country = 'USA';
UPDATE patients SET country_iso3 = 'GBR' WHERE country = 'UK' OR country = 'United Kingdom';
UPDATE patients SET country_iso3 = 'AUS' WHERE country = 'Australia';
UPDATE patients SET country_iso3 = 'CAN' WHERE country = 'Canada';
UPDATE patients SET country_iso3 = 'ARE' WHERE country = 'UAE';
UPDATE patients SET country_iso3 = 'SGP' WHERE country = 'Singapore';
UPDATE patients SET country_iso3 = 'MYS' WHERE country = 'Malaysia';
UPDATE patients SET country_iso3 = 'SAU' WHERE country = 'Saudi Arabia';
