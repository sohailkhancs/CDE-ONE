-- CDE-ONE PostgreSQL Database Setup
-- Run this in SQL Shell (psql) or pgAdmin while connected to the 'postgres' database

-- 1. Create the database
DROP DATABASE IF EXISTS cde_one_db;
CREATE DATABASE cde_one_db;

-- 2. Create a user for the application
DROP USER IF EXISTS cde_admin;
CREATE USER cde_admin WITH PASSWORD 'cde_admin_2024';

-- 3. Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE cde_one_db TO cde_admin;

-- 4. Connect to the new database
\c cde_one_db

-- 5. Grant schema privileges - THIS IS CRITICAL
GRANT ALL ON SCHEMA public TO cde_admin;

-- 6. Allow user to create tables and other objects
GRANT CREATE ON DATABASE cde_one_db TO cde_admin;

-- 7. Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cde_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cde_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO cde_admin;

-- Verification query
SELECT datname FROM pg_database WHERE datname = 'cde_one_db';
