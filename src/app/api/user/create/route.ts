import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🔄 Creating default user...');
    
    // Create default user with simple approach
    const defaultUser = await prisma.user.create({
      data: {
        id: 'default-user',
        email: 'default@localhost', 
        name: 'Default User'
      }
    });

    console.log('✅ Default user created:', defaultUser);

    return NextResponse.json({
      success: true,
      message: 'Default user created successfully',
      data: defaultUser
    });

  } catch (error: any) {
    // If user already exists, that's fine
    if (error.code === 'P2002') {
      console.log('ℹ️ User already exists');
      
      const existingUser = await prisma.user.findUnique({
        where: { id: 'default-user' }
      });

      return NextResponse.json({
        success: true,
        message: 'Default user already exists',
        data: existingUser
      });
    }

    console.error('❌ User creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create default user',
      details: error.message
    }, { status: 500 });
  }
}