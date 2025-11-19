import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      userAgent,
      device,
      browser,
      country,
      countryCode,
      city,
      region,
      ipAddress,
      timezone,
      isp,
      referrer,
      initialPage,
      language,
      screenResolution,
      createdAt
    } = body;

    // Check if user already exists
    const existingUser = await prisma.visitorProfile.findUnique({
      where: { userId }
    });

    if (existingUser) {
      console.log('User already exists:', userId);
      return NextResponse.json({ message: 'User already exists' });
    }

    // Create new visitor profile
    const newUser = await prisma.visitorProfile.create({
      data: {
        userId,
        userAgent,
        device,
        browser,
        country,
        countryCode,
        city,
        region,
        ipAddress,
        timezone,
        isp,
        referrer,
        initialPage,
        language,
        screenResolution,
        firstVisit: new Date(createdAt),
        lastVisit: new Date(createdAt),
        totalSessions: 1,
        totalPageViews: 1,
        isActive: true
      }
    });

    console.log('New visitor profile created:', newUser.userId);
    return NextResponse.json({ message: 'User profile created successfully', userId: newUser.userId });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }
}