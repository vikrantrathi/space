import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';
import Activity from '../../../../../lib/db/models/Activity';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isAuthenticated, userEmail, userName } = await request.json();

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await connectToDatabase();

    // Find quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Log the view activity
    const activity = new Activity({
      type: 'quotation_viewed',
      description: isAuthenticated 
        ? `User ${userName || userEmail || 'Unknown'} viewed quotation: ${quotation.title}`
        : `Anonymous user viewed quotation: ${quotation.title}`,
      userId: isAuthenticated ? userEmail : undefined,
      userEmail: userEmail || undefined,
      metadata: { 
        quotationId: quotation._id.toString(),
        quotationTitle: quotation.title,
        isAuthenticated,
        viewSource: 'public_url'
      },
      ipAddress: ip,
      userAgent: userAgent
    });

    await activity.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking quotation view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
