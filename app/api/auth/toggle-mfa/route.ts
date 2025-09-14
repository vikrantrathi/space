import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import Activity from '../../../../lib/db/models/Activity';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { enabled } = await request.json();

    // Validate input
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input: enabled must be a boolean' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find and update the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update MFA setting
    user.mfaEnabled = enabled;
    await user.save();

    // Log the MFA toggle activity
    const activity = new Activity({
      type: 'admin_action',
      description: `User ${user.name} (${user.email}) ${enabled ? 'enabled' : 'disabled'} MFA`,
      userId: user._id,
      userEmail: user.email,
      metadata: {
        action: 'mfa_toggle',
        mfaEnabled: enabled,
        previousState: !enabled,
      },
    });
    await activity.save();

    return NextResponse.json({
      success: true,
      message: `MFA ${enabled ? 'enabled' : 'disabled'} successfully`,
      mfaEnabled: enabled,
    });
  } catch (error) {
    console.error('MFA toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
