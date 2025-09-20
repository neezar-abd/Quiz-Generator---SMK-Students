import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
  console.log('Creating default user...');
    
    // Create or update default user
    const user = await prisma.user.upsert({
      where: { id: 'default-user' },
      update: {
        email: 'developer@smk.test',
        name: 'Development User'
      },
      create: {
        id: 'default-user',
        email: 'developer@smk.test',
        name: 'Development User'
      }
    });

  console.log('Default user created/updated:', user);

    return NextResponse.json({ 
      success: true,
      message: 'Default user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
  console.error('Failed to create default user:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to create default user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}