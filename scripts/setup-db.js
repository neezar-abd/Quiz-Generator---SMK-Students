#!/usr/bin/env node

/**
 * Database Setup Script
 * Initializes the Supabase database with Prisma schema
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up database...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const fs = require('fs');

if (!fs.existsSync(envPath)) {
  console.log('.env file not found!');
  console.log('Please create a .env file with your DATABASE_URL');
  console.log('Example: DATABASE_URL="postgresql://username:password@host:port/database"');
  process.exit(1);
}

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database (for development)
  console.log('\nPushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Optional: Seed database with sample data
  console.log('\n🌱 Database setup complete!');
  console.log('\nNext steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Open Prisma Studio (optional): npx prisma studio');
  console.log('3. View your app at: http://localhost:3000');

} catch (error) {
  console.error('Database setup failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Check your DATABASE_URL in .env');
  console.log('2. Ensure your database is running');
  console.log('3. Verify network connectivity to your database');
  process.exit(1);
}