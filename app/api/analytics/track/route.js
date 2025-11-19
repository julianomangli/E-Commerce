import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userId,
      eventType,
      eventData,
      productId,
      value,
      path,
      title,
      ipAddress,
      userAgent,
      country,
      city,
      device,
      browser
    } = body;

    // Upsert customer session
    const session = await prisma.customerSession.upsert({
      where: { sessionId },
      update: {
        lastActivity: new Date(),
        isActive: true
      },
      create: {
        sessionId,
        userId: userId?.startsWith('user_') ? null : userId, // Only use registered user IDs
        visitorId: userId?.startsWith('user_') ? userId : null, // Store visitor ID as string
        ipAddress,
        userAgent,
        country,
        city,
        device,
        browser,
        isActive: true,
        lastActivity: new Date()
      }
    });

    // Record page view if path is provided
    if (path) {
      await prisma.pageView.create({
        data: {
          sessionId: session.sessionId,
          path,
          title: title || path
        }
      });
    }

    // Record customer event if eventType is provided (skip HEARTBEAT as it's not a valid EventType)
    if (eventType && eventType !== 'HEARTBEAT') {
      await prisma.customerEvent.create({
        data: {
          sessionId: session.sessionId,
          visitorId: userId?.startsWith('user_') ? userId : null,
          eventType,
          eventData: eventData ? JSON.stringify(eventData) : null,
          productId,
          value
        }
      });
    }

    return NextResponse.json({ success: true, sessionId: session.sessionId });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // Mark session as inactive
    await prisma.customerSession.update({
      where: { sessionId },
      data: {
        isActive: false,
        lastActivity: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session end tracking error:", error);
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
  }
}