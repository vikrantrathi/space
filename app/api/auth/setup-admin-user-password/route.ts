import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import Activity from '../../../../lib/db/models/Activity';

// Password validation helper
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({
        error: 'Token and password are required'
      }, { status: 400 });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json({
        error: passwordErrors.join('; ')
      }, { status: 400 });
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password and mark as verified
    user.password = hashedPassword;
    user.status = 'active';
    user.isApproved = true;
    user.emailVerified = true;
    user.verificationToken = undefined; // Clear the token
    user.verificationTokenExpiry = undefined; // Clear expiry
    user.approvedAt = new Date();

    await user.save();

    // Log activity
    const activity = new Activity({
      type: 'user_verified',
      description: `User ${user.email} completed account setup and verification`,
      userId: user._id.toString(),
      userEmail: user.email,
      adminId: user.createdBy, // The admin who created the user
      metadata: {
        setupCompleted: true,
        emailVerified: true,
        accountActivated: true,
      },
    });
    await activity.save();

    return NextResponse.json({
      message: 'Account setup completed successfully. You can now log in.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Password setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
