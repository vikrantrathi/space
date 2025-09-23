import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import OTP from '../../../../lib/db/models/OTP';
import Activity from '../../../../lib/db/models/Activity';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password } = await request.json();

    // Validate input
    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Email, OTP, and password are required' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Ensure OTP is a string, trim whitespace, and normalize
    const cleanOtp = String(otp).trim().replace(/\s/g, '');
    
    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit number' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find and verify OTP
    const otpDoc = await OTP.findOne({
      code: cleanOtp,
      email: email.toLowerCase(),
      used: false,
      expires: { $gt: new Date() }
    });

    if (!otpDoc) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    // Clean up used OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), used: true });

    // Log password reset activity
    const resetActivity = new Activity({
      type: 'auth_password_reset',
      description: `Password reset completed for user ${user.name} (${user.email})`,
      userId: user._id,
      userEmail: user.email,
      metadata: {
        resetMethod: 'otp_verification',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    await resetActivity.save();

    return NextResponse.json({
      message: 'Password reset successful',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
