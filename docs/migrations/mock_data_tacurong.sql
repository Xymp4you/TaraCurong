-- ============================================================
-- TaraCurong Realistic Mock Data Seed (Tacurong City)
-- 119 Jobseekers, 20 Employers, 50 Jobs
-- All NSRP fields filled with realistic/randomized data.
-- ============================================================

BEGIN;

-- ---------------------------------------------------------
-- 0. SCHEMA FIX: Ensure users and admins tables exist
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY,
  name        TEXT,
  email       TEXT UNIQUE,
  password_hash TEXT,
  role        TEXT,
  city        TEXT,
  province    TEXT,
  employment_status TEXT,
  registration_date TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 1. INSERT EMPLOYERS (20 Real Tacurong Employers)
-- ---------------------------------------------------------
INSERT INTO employers (id, email, password_hash, establishment_name, city, province, barangay, address, industry, total_paid_employees, account_status)
VALUES
(gen_random_uuid(), 'hr@smtacurong.com', '$2b$10$dummyhash', 'SM City Tacurong City', 'Tacurong City', 'Sultan Kudarat', 'Buenaflor', 'San Isidro Street', 'Retail/Malls', 500, 'approved'),
(gen_random_uuid(), 'careers@kccmalls.com', '$2b$10$dummyhash', 'KCC Mall of Tacurong', 'Tacurong City', 'Sultan Kudarat', 'San Emmanuel', 'J. Catolico Ave', 'Retail/Malls', 800, 'approved'),
(gen_random_uuid(), 'recruitment@gaisano.com', '$2b$10$dummyhash', 'Gaisano Mall of Tacurong', 'Tacurong City', 'Sultan Kudarat', 'San Emmanuel', 'J. Catolico Ave', 'Retail/Malls', 400, 'approved'),
(gen_random_uuid(), 'jobs@robinsons.com', '$2b$10$dummyhash', 'Robinsons Place Tacurong', 'Tacurong City', 'Sultan Kudarat', 'Buenaflor', 'J. Catolico Ave', 'Retail/Malls', 300, 'approved'),
(gen_random_uuid(), 'hr@allianceselect.com', '$2b$10$dummyhash', 'Alliance Select Foods International', 'Tacurong City', 'Sultan Kudarat', 'Tinago', 'Tuna Canning Road', 'Manufacturing/Tuna', 1200, 'approved'),
(gen_random_uuid(), 'hr@celebes.com', '$2b$10$dummyhash', 'Celebes Canning Corporation', 'Tacurong City', 'Sultan Kudarat', 'Tinago', 'Tuna Canning Road', 'Manufacturing/Tuna', 1000, 'approved'),
(gen_random_uuid(), 'hr@gentuna.com', '$2b$10$dummyhash', 'General Tuna Corporation', 'Tacurong City', 'Sultan Kudarat', 'Tinago', 'Tuna Canning Road', 'Manufacturing/Tuna', 2000, 'approved'),
(gen_random_uuid(), 'hr@philbest.com', '$2b$10$dummyhash', 'Philbest Canning Corporation', 'Tacurong City', 'Sultan Kudarat', 'Tinago', 'Tuna Canning Road', 'Manufacturing/Tuna', 1500, 'approved'),
(gen_random_uuid(), 'hr@oceancanning.com', '$2b$10$dummyhash', 'Ocean Canning Corporation', 'Tacurong City', 'Sultan Kudarat', 'Tinago', 'Tuna Canning Road', 'Manufacturing/Tuna', 800, 'approved'),
(gen_random_uuid(), 'admin@stelizabeth.ph', '$2b$10$dummyhash', 'St. Elizabeth Hospital', 'Tacurong City', 'Sultan Kudarat', 'San Antonio', 'Santiago Blvd', 'Healthcare', 400, 'approved'),
(gen_random_uuid(), 'hr@notredame-tacurong.edu.ph', '$2b$10$dummyhash', 'Notre Dame of Tacurong College', 'Tacurong City', 'Sultan Kudarat', 'San Antonio', 'Marist Ave', 'Education', 300, 'approved'),
(gen_random_uuid(), 'hr@msutacurong.edu.ph', '$2b$10$dummyhash', 'Mindanao State University - Tacurong', 'Tacurong City', 'Sultan Kudarat', 'Grino', 'MSU Road', 'Education', 500, 'approved'),
(gen_random_uuid(), 'hr@tacurongcity.gov.ph', '$2b$10$dummyhash', 'LGU Tacurong City', 'Tacurong City', 'Sultan Kudarat', 'San Rafael', 'City Hall Drive', 'Government', 2000, 'approved'),
(gen_random_uuid(), 'hr@rdrealty.com', '$2b$10$dummyhash', 'RD Realty Development Corp', 'Tacurong City', 'Sultan Kudarat', 'Tina', 'RD Building', 'Real Estate', 150, 'approved'),
(gen_random_uuid(), 'hr@alsons.com', '$2b$10$dummyhash', 'Alsons Aquaculture Corp', 'Tacurong City', 'Sultan Kudarat', 'Alabel', 'Alsons Road', 'Agriculture/Fisheries', 600, 'approved'),
(gen_random_uuid(), 'hr@smb.com.ph', '$2b$10$dummyhash', 'San Miguel Brewery - Tacurong', 'Tacurong City', 'Sultan Kudarat', 'San Emmanuel', 'Makar Junction', 'Manufacturing/Beverage', 300, 'approved'),
(gen_random_uuid(), 'hr@coca-cola.com.ph', '$2b$10$dummyhash', 'Coca-Cola Beverages Philippines - Tacurong', 'Tacurong City', 'Sultan Kudarat', 'Bula', 'Bula Road', 'Manufacturing/Beverage', 250, 'approved'),
(gen_random_uuid(), 'careers@shell.ph', '$2b$10$dummyhash', 'Shell North Wharf', 'Tacurong City', 'Sultan Kudarat', 'New Isabela', 'Makar Wharf', 'Logistics/Energy', 100, 'approved'),
(gen_random_uuid(), 'hr@phoenix.ph', '$2b$10$dummyhash', 'Phoenix Petroleum Philippines', 'Tacurong City', 'Sultan Kudarat', 'New Isabela', 'Makar Wharf', 'Logistics/Energy', 80, 'approved'),
(gen_random_uuid(), 'hr@petron.ph', '$2b$10$dummyhash', 'Petron Tacurong Depot', 'Tacurong City', 'Sultan Kudarat', 'New Isabela', 'Makar Wharf', 'Logistics/Energy', 90, 'approved');

-- ---------------------------------------------------------
-- 2. INSERT JOBS (50 Realistic Tacurong Jobs)
-- ---------------------------------------------------------
INSERT INTO jobs (id, employer_id, position_title, minimum_education_required, years_of_experience_required, starting_salary, job_status, vacancies, work_setup, psoc_code)
SELECT 
  gen_random_uuid(), 
  id, 
  (ARRAY['Cashier', 'Sales Associate', 'Stock Clerk', 'Fish Processing Worker', 'QA Inspector', 'Production Supervisor', 'Registered Nurse', 'Admin Assistant', 'Security Guard', 'Delivery Driver', 'Heavy Equipment Operator', 'Customer Service Representative', 'Accounting Clerk', 'IT Support Technician', 'Civil Engineer', 'Marketing Officer', 'Forklift Operator', 'Lab Technician', 'Maintenance Worker', 'Janitorial Staff'])[floor(random() * 20 + 1)],
  (ARRAY['High School Graduate', 'College Graduate', 'Vocational Course', 'No Minimum Requirement'])[floor(random() * 4 + 1)],
  floor(random() * 5),
  (ARRAY['PHP 12,000 - 15,000', 'PHP 18,000 - 25,000', 'PHP 30,000 - 45,000', 'PHP 10,000 - 12,000', 'Negotiable'])[floor(random() * 5 + 1)],
  'open',
  floor(random() * 10 + 1),
  (ARRAY['onsite', 'remote', 'hybrid'])[floor(random() * 3 + 1)],
  'PSOC-' || floor(random() * 9000 + 1000)
FROM (SELECT id FROM employers CROSS JOIN generate_series(1, 3)) AS sub
LIMIT 50;

-- ---------------------------------------------------------
-- 3. INSERT JOBSEEKERS (119 Realistic Tacurong Jobseekers)
-- ---------------------------------------------------------
INSERT INTO jobseekers (
  id, email, password_hash, first_name, last_name, middle_name, 
  birth_date, gender, barangay, city, province, 
  employment_status, is_pwd, is_ofw, job_seeking_status, 
  nsrp_id, profile_complete, profile_completeness
)
SELECT 
  gen_random_uuid(),
  'jobseeker' || i || '@example.com',
  '$2b$10$dummyhash',
  (ARRAY['Juan', 'Maria', 'Jose', 'Elena', 'Ricardo', 'Liza', 'Antonio', 'Teresita', 'Roberto', 'Imelda', 'Gabriel', 'Grino', 'Paolo', 'Angela', 'Dante', 'Cynthia', 'Ferdinand', 'Lourdes', 'Gregorio', 'Pilar'])[floor(random() * 20 + 1)],
  (ARRAY['Dela Cruz', 'Santos', 'Reyes', 'Gonzales', 'Bautista', 'Garcia', 'Lopez', 'Rodriguez', 'Martinez', 'Perez', 'Aquino', 'Magsaysay', 'Ramos', 'Estrada', 'Arroyo', 'Duterte', 'Marcos', 'Robredo', 'Pascua', 'Dumlao'])[floor(random() * 20 + 1)],
  (ARRAY['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.'])[floor(random() * 10 + 1)],
  (CURRENT_DATE - (INTERVAL '18 years' + (random() * 25 * INTERVAL '1 year')))::DATE,
  (ARRAY['Male', 'Female'])[floor(random() * 2 + 1)],
  (ARRAY['Poblacion', 'Carmen', 'Batomelong', 'Kalandagan', 'Bula', 'Tina', 'EJC Montilla', 'Calean', 'San Pablo', 'San Emmanuel', 'San Rafael', 'San Antonio', 'Grino', 'New Passi', 'New Isabela', 'Buenaflor', 'D'Ledesma', 'San Isidro', 'San Jose', 'Siguel', 'Tuka', 'Tinago', 'New Carmen', 'Lower Katungal'])[floor(random() * 24 + 1)],
  'Tacurong City',
  'Sultan Kudarat',
  (ARRAY['unemployed', 'employed', 'self-employed'])[floor(random() * 3 + 1)],
  (random() < 0.05),
  (random() < 0.1),
  (ARRAY['actively_looking', 'open', 'not_looking'])[floor(random() * 3 + 1)],
  'NSRP-' || (20250000 + i),
  true,
  floor(80 + random() * 20)
FROM generate_series(1, 119) AS i;

-- ---------------------------------------------------------
-- 4. INSERT INTO USERS (Mirroring Jobseekers & Employers for Auth)
-- ---------------------------------------------------------
-- Add Jobseekers to Users
INSERT INTO users (id, name, email, role, city, province, employment_status, registration_date, created_at)
SELECT id, first_name || ' ' || last_name, email, 'jobseeker', city, province, employment_status, barangay, created_at
FROM jobseekers;

-- ---------------------------------------------------------
-- 5. TEST ACCOUNTS (One for each role)
-- ---------------------------------------------------------

-- Admin: admin@taracurong.com / Admin123!
INSERT INTO public.admins (name, email, password_hash)
VALUES ('System Admin', 'admin@taracurong.com', '$2a$10$q1Wt35QwKkFydp9HwOqC/Ow4UFH8PTWN8nSBwrhx30TWNyAVcIEE2')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Employer: employer@taracurong.com / Employer123!
INSERT INTO public.employers (id, establishment_name, email, password_hash, account_status, city, province, barangay, industry)
VALUES (gen_random_uuid(), 'TaraCurong Test Employer', 'employer@taracurong.com', '$2a$10$jz1ueWdKacHlQB4kI/xG3e3APX4Z/5UtxigSOLChvl2DxhVGIPlH2', 'approved', 'Tacurong City', 'Sultan Kudarat', 'Buenaflor', 'Services')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Jobseeker: jobseeker@taracurong.com / Jobseeker123!
INSERT INTO public.jobseekers (id, first_name, last_name, email, password_hash, city, province, barangay, nsrp_id, profile_complete)
VALUES (gen_random_uuid(), 'Test', 'Jobseeker', 'jobseeker@taracurong.com', '$2a$10$CRp7vlCdVXaDYnQhA/aZiuZET/eAhYTVy9d9pT3f9oCjCnS/bOHp2', 'Tacurong City', 'Sultan Kudarat', 'San Pablo', 'NSRP-TEST-001', true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Sync Test Accounts to Users table
INSERT INTO users (id, name, email, role, password_hash, city, province, created_at)
SELECT id, establishment_name, email, 'employer', password_hash, city, province, created_at
FROM employers WHERE email = 'employer@taracurong.com'
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, role, password_hash, city, province, created_at)
SELECT id, first_name || ' ' || last_name, email, 'jobseeker', password_hash, city, province, created_at
FROM jobseekers WHERE email = 'jobseeker@taracurong.com'
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

COMMIT;
