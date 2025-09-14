import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';
import { authMiddleware } from '../../../../../lib/auth/auth-middleware';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;

    // Connect to database
    await connectToDatabase();

    // Get quotations for the user by email OR associated user
    // Only show quotations that are "sent" or have been acted upon (not drafts)
    const quotations = await Quotation.find({
      $and: [
        {
          $or: [
            { clientEmail: user.email },
            { associatedUser: user.userId }
          ]
        },
        {
          status: { $ne: 'draft' } // Exclude draft quotations
        }
      ]
    })
      .populate('associatedUser', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error('Get user quotations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
