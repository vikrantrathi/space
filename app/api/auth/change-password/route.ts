import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import { authMiddleware } from '../../../../lib/auth/auth-middleware';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    dbUser.password = hashedPassword;
    await dbUser.save();

    // Log activity
    const Activity = await import('../../../../lib/db/models/Activity');
    const passwordChangeActivity = new Activity.default({
      type: 'password_changed',
      description: `User ${dbUser.name} (${dbUser.email}) changed their password`,
      userId: dbUser._id,
      userEmail: dbUser.email,
      metadata: {
        role: dbUser.role,
        timestamp: new Date().toISOString(),
      },
    });
    await passwordChangeActivity.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}