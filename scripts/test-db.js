#!/usr/bin/env node

/**
 * Simple Supabase Connection Test Script
 * Run with: node scripts/test-db.js
 */

require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Supabase Connection...\n');

  // Check environment variables
  console.log('Environment Check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not found in environment variables');
  console.log('Tip: Make sure to create .env.local with your Supabase DATABASE_URL\n');
    process.exit(1);
  }

  // Check DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  const isValidFormat = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  
  console.log('- DATABASE_URL format valid:', isValidFormat);
  console.log('- DATABASE_URL preview:', dbUrl.substring(0, 20) + '...\n');

  if (!isValidFormat) {
  console.log('Invalid DATABASE_URL format');
  console.log('Tip: Should start with postgresql:// or postgres://\n');
    process.exit(1);
  }

  // Try to import and test Prisma
  try {
  console.log('Testing Database Connection...');
    
    // Dynamic import to handle potential module issues
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
  console.log('Basic connection successful');

    // Test table existence
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('User', 'Quiz', 'QuestionMCQ', 'QuestionEssay')
    `;

  console.log('Table check completed');
  console.log('Tables found:', tables.length);

    if (tables.length === 0) {
  console.log('Warning: No quiz tables found. You may need to run the SQL setup script.');
    } else {
      console.log('Tables:', tables.map(t => t.table_name).join(', '));
    }

    // Test record counts
    try {
      const userCount = await prisma.user.count();
      const quizCount = await prisma.quiz.count();
  console.log('Record counts:');
      console.log('- Users:', userCount);
      console.log('- Quizzes:', quizCount);
    } catch (countError) {
  console.log('Warning: Could not get record counts (tables might not exist yet)');
    }

    await prisma.$disconnect();
  console.log('\nSupabase connection test PASSED!');
    console.log('Your database is ready for the AI Quiz Generator.\n');

  } catch (error) {
  console.log('Database connection FAILED');
    console.error('Error:', error.message);
    
  console.log('\nTroubleshooting steps:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run the SQL setup script in Supabase SQL Editor');
    console.log('5. Check network connectivity\n');
    
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);