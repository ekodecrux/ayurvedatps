-- Update admin credentials
-- Email: Shankaranherbaltreatment@gmail.com
-- Password: 123456 (will be hashed as SHA-256)

-- Hash of '123456' is: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

-- First, delete existing admin users to avoid conflicts
DELETE FROM admin_users WHERE email IN ('admin@tpsdhanvantari.com', 'Shankaranherbaltreatment@gmail.com');

-- Insert new admin user
INSERT INTO admin_users (email, name, password_hash, profile_picture, created_at, updated_at)
VALUES (
  'Shankaranherbaltreatment@gmail.com',
  'Shankaran Herbal Treatment',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Clean up any old sessions
DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM admin_users);
