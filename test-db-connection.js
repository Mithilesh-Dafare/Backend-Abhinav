// Quick database connection test script
// Run this with: node test-db-connection.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'solar_energy',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

console.log('Testing database connection...');
console.log('Configuration:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || 5432);
console.log('  Database:', process.env.DB_NAME || 'solar_energy');
console.log('  User:', process.env.DB_USER || 'postgres');
console.log('');

pool.query('SELECT NOW() as current_time, version() as pg_version')
  .then((result) => {
    console.log('✓ Database connection successful!');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    console.log('');
    
    // Test if leads table exists
    return pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leads'
      );
    `);
  })
  .then((result) => {
    if (result.rows[0].exists) {
      console.log('✓ Leads table exists');
      
      // Count existing leads
      return pool.query('SELECT COUNT(*) as count FROM leads');
    } else {
      console.log('✗ Leads table does NOT exist');
      console.log('  Run: psql -U postgres -d solar_energy -f schema.sql');
      process.exit(1);
    }
  })
  .then((result) => {
    if (result) {
      console.log('  Existing leads:', result.rows[0].count);
    }
    console.log('');
    console.log('Database is ready!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Database connection failed!');
    console.error('');
    console.error('Error details:');
    console.error('  Code:', err.code);
    console.error('  Message:', err.message);
    console.error('');
    
    if (err.code === 'ECONNREFUSED') {
      console.error('Possible solutions:');
      console.error('  1. Make sure PostgreSQL is running');
      console.error('  2. Check DB_HOST and DB_PORT in .env file');
    } else if (err.code === '28P01') {
      console.error('Possible solutions:');
      console.error('  1. Check DB_USER and DB_PASSWORD in .env file');
      console.error('  2. Verify the user has access to the database');
    } else if (err.code === '3D000') {
      console.error('Possible solutions:');
      console.error('  1. Create the database: CREATE DATABASE solar_energy;');
      console.error('  2. Or update DB_NAME in .env file');
    } else {
      console.error('Full error:', err);
    }
    
    process.exit(1);
  });

