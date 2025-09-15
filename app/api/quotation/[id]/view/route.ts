import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';
import Activity from '../../../../../lib/db/models/Activity';
import { authMiddleware } from '../../../../../lib/auth/auth-middleware';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    name?: string;
    role: string;
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await connectToDatabase();

    // Try to authenticate user
    let user = null;
    let isAuthenticated = false;
    try {
      const authResult = authMiddleware(request);
      if (!authResult) {
        user = (request as AuthenticatedRequest).user;
        isAuthenticated = true;
      }
    } catch (error) {
      // Authentication failed, treat as anonymous
      isAuthenticated = false;
    }

    // Find quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Log the view activity
    
    const activity = new Activity({
      type: 'quotation_viewed',
      description: isAuthenticated 
        ? `User ${user?.name || user?.email || 'Unknown'} viewed quotation: ${quotation.title}`
        : `Anonymous user viewed quotation: ${quotation.title}`,
      userId: isAuthenticated ? user?.email : undefined,
      userEmail: user?.email || undefined,
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
