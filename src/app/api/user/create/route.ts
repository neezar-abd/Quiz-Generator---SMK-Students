import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
  console.log('Creating default user...');
    
    // Create default user with simple approach
    const defaultUser = await prisma.user.create({
      data: {
        id: 'default-user',
        email: 'default@localhost', 
        name: 'Default User'
      }
    });

  console.log('Default user created:', defaultUser);

    return NextResponse.json({
      success: true,
      message: 'Default user created successfully',
      data: defaultUser
    });

  } catch (error: unknown) {
    // If user already exists, that's fine
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: unknown }).code === 'P2002') {
    console.log('User already exists');
      
      const existingUser = await prisma.user.findUnique({
        where: { id: 'default-user' }
      });

      return NextResponse.json({
        success: true,
        message: 'Default user already exists',
        data: existingUser
      });
    }

  console.error('User creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create default user',
      details: error && typeof error === 'object' && 'message' in error ? String((error as { message?: unknown }).message) : 'Unknown error'
    }, { status: 500 });
  }
}