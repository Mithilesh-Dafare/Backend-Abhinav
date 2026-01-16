-- Solar Energy Website Database Schema
-- PostgreSQL Database Setup

-- Create database (run this manually if needed)
-- CREATE DATABASE solar_energy;

-- Connect to the database before running the following commands
-- \c solar_energy;

-- Leads table for storing contact form submissions
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    monthly_bill DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Optional: Add a unique constraint on email if you want to prevent duplicate submissions
-- ALTER TABLE leads ADD CONSTRAINT unique_email UNIQUE (email);

-- Sample query to view all leads
-- SELECT * FROM leads ORDER BY created_at DESC;

-- Sample query to count leads by zip code
-- SELECT zip_code, COUNT(*) as lead_count FROM leads GROUP BY zip_code ORDER BY lead_count DESC;

