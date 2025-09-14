import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token not expired
      status: 'pending_verification'
    });

    if (!user) {
      return NextResponse.json({
        error: 'Invalid or expired verification link. Please contact your administrator for a new invitation.'
      }, { status: 400 });
    }

    // Return user data (without sensitive information)
    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
