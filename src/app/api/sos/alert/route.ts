import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Decode the basic token (in production, use JWT)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, email] = decoded.split(':');
      
      const { location, timestamp } = await req.json();

      // In a real app, you would:
      // 1. Get user's emergency contacts from database
      // 2. Send SMS/push notifications to emergency contacts
      // 3. Log the SOS alert in database
      // 4. Potentially contact emergency services

      console.log('SOS Alert triggered:', {
        user: email,
        location,
        timestamp,
      });

      // Simulate sending alerts to emergency contacts
      // In production, integrate with Twilio, Firebase Cloud Messaging, etc.

      return NextResponse.json({
        success: true,
        message: 'SOS alert sent to emergency contacts',
        location,
      });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('SOS alert error:', error);
    return NextResponse.json(
      { error: 'Failed to send SOS alert' },
      { status: 500 }
    );
  }
}
