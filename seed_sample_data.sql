-- Insert sample patients
INSERT INTO patients (patient_id, name, age, gender, phone, email, country, country_code, country_iso3, weight, height, address_hno, address_street, address_area, address_district, address_state, address_pincode, created_at) VALUES
('IND00001', 'Rajesh Kumar', 45, 'Male', '9876543210', 'rajesh@example.com', 'India', '+91', 'IND', 75.5, 175, 'H.No 123', 'MG Road', 'Indiranagar', 'Bangalore Urban', 'Karnataka', '560038', '2024-01-15 10:30:00'),
('IND00002', 'Priya Sharma', 32, 'Female', '9876543211', 'priya@example.com', 'India', '+91', 'IND', 62.0, 165, 'H.No 456', 'Park Street', 'Koramangala', 'Bangalore Urban', 'Karnataka', '560034', '2024-01-16 11:45:00'),
('IND00003', 'Anil Verma', 50, 'Male', '9876543212', 'anil@example.com', 'India', '+91', 'IND', 80.0, 178, 'H.No 789', 'Church Street', 'MG Road', 'Bangalore Urban', 'Karnataka', '560001', '2024-01-17 09:15:00'),
('IND00004', 'Lakshmi Prasad', 38, 'Female', '9876543213', 'lakshmi@example.com', 'India', '+91', 'IND', 68.5, 160, 'H.No 321', 'Brigade Road', 'Shivajinagar', 'Bangalore Urban', 'Karnataka', '560025', '2024-01-18 14:20:00'),
('IND00005', 'Suresh Reddy', 55, 'Male', '9876543214', 'suresh@example.com', 'India', '+91', 'IND', 85.0, 180, 'H.No 654', 'Residency Road', 'Ashok Nagar', 'Bangalore Urban', 'Karnataka', '560025', '2024-01-19 16:00:00');

-- Insert herbs & roots records for the patients
INSERT INTO herbs_routes (patient_id, given_date, treatment_months, diagnosis, course, payment_amount, advance_payment, due_balance, next_followup_date, created_at) VALUES
(1, '2024-01-15', 1, 'Joint pain and inflammation', 3, 5000.00, 2000.00, 3000.00, '2024-02-15', '2024-01-15 10:35:00'),
(2, '2024-01-16', 1, 'Digestive issues and acidity', 2, 3500.00, 1500.00, 2000.00, '2024-02-16', '2024-01-16 11:50:00'),
(3, '2024-01-17', 1, 'High blood pressure', 4, 6000.00, 3000.00, 3000.00, '2024-02-17', '2024-01-17 09:20:00'),
(4, '2024-01-18', 1, 'Skin allergies', 2, 4000.00, 2000.00, 2000.00, '2024-02-18', '2024-01-18 14:25:00'),
(5, '2024-01-19', 1, 'Chronic fatigue', 3, 5500.00, 2500.00, 3000.00, '2024-02-19', '2024-01-19 16:05:00');

-- Insert some medicines for each herbs_routes record
INSERT INTO medicines_tracking (herbs_route_id, roman_id, medicine_name, given_date, treatment_months, payment_amount, advance_payment, balance_due, morning_before, morning_after, afternoon_before, afternoon_after, evening_before, evening_after, night_before, night_after) VALUES
-- For Rajesh Kumar (herbs_route_id 1)
(1, 'I', 'Ashwagandha Churna', '2024-01-15', 1, 1500.00, 500.00, 1000.00, 1, 0, 0, 1, 0, 1, 0, 0),
(1, 'II', 'Yograj Guggulu', '2024-01-15', 1, 2000.00, 1000.00, 1000.00, 0, 1, 1, 0, 0, 1, 0, 0),
(1, 'III', 'Castor Oil', '2024-01-15', 1, 1500.00, 500.00, 1000.00, 1, 0, 0, 0, 0, 1, 0, 0),
-- For Priya Sharma (herbs_route_id 2)
(2, 'I', 'Triphala Churna', '2024-01-16', 1, 1200.00, 600.00, 600.00, 1, 0, 0, 0, 0, 0, 1, 0),
(2, 'II', 'Hingvastak Churna', '2024-01-16', 1, 1300.00, 500.00, 800.00, 0, 1, 0, 1, 0, 0, 0, 0),
(2, 'III', 'Avipattikar Churna', '2024-01-16', 1, 1000.00, 400.00, 600.00, 1, 0, 0, 1, 0, 0, 0, 0),
-- For Anil Verma (herbs_route_id 3)
(3, 'I', 'Arjuna Bark', '2024-01-17', 1, 2000.00, 1000.00, 1000.00, 1, 0, 0, 1, 0, 0, 0, 0),
(3, 'II', 'Punarnava Guggulu', '2024-01-17', 1, 2500.00, 1200.00, 1300.00, 0, 1, 1, 0, 0, 1, 0, 0),
(3, 'III', 'Brahmi Churna', '2024-01-17', 1, 1500.00, 800.00, 700.00, 1, 0, 0, 0, 1, 0, 0, 0),
-- For Lakshmi Prasad (herbs_route_id 4)
(4, 'I', 'Neem Capsules', '2024-01-18', 1, 1500.00, 700.00, 800.00, 0, 1, 0, 1, 0, 1, 0, 0),
(4, 'II', 'Haridra Khanda', '2024-01-18', 1, 1800.00, 900.00, 900.00, 1, 0, 1, 0, 0, 1, 0, 0),
(4, 'III', 'Manjistha Churna', '2024-01-18', 1, 700.00, 400.00, 300.00, 1, 0, 0, 0, 1, 0, 0, 0),
-- For Suresh Reddy (herbs_route_id 5)
(5, 'I', 'Chyawanprash', '2024-01-19', 1, 1800.00, 800.00, 1000.00, 1, 0, 0, 0, 0, 1, 0, 0),
(5, 'II', 'Shilajit Capsules', '2024-01-19', 1, 2200.00, 1100.00, 1100.00, 0, 1, 0, 1, 0, 1, 0, 0),
(5, 'III', 'Ashwagandha Tablets', '2024-01-19', 1, 1500.00, 600.00, 900.00, 1, 0, 1, 0, 0, 0, 1, 0);
