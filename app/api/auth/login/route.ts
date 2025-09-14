import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import OTP from '../../../../lib/db/models/OTP';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check email verification status first
    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email address before logging in. Check your email for the verification link.' }, { status: 403 });
    }

    // Check if user is approved
    if (user.status === 'pending_approval') {
      return NextResponse.json({ error: 'Your account is pending approval. Please wait for admin approval.' }, { status: 403 });
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'Your account has been rejected. Please contact support.' }, { status: 403 });
    }

    if (user.status === 'inactive') {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 });
    }

    // Check if MFA is enabled for this user
    if (!user.mfaEnabled) {
      // MFA is disabled - proceed with direct login without OTP
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

      // Generate JWT token directly
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log direct login activity
      const Activity = await import('../../../../lib/db/models/Activity');
      const loginActivity = new Activity.default({
        type: 'user_login',
        description: `User ${user.name} (${user.email}) logged in without MFA`,
        userId: user._id,
        userEmail: user.email,
        metadata: {
          role: user.role,
          loginMethod: 'password_only',
          mfaEnabled: false,
        },
      });
      await loginActivity.save();

      // Get client IP address
      const forwarded = request.headers.get('x-forwarded-for');
      const realIP = request.headers.get('x-real-ip');
      const clientIP = forwarded ? forwarded.split(',')[0] : realIP || 'unknown';

      // Update user's last login time and IP
      user.lastLoginAt = new Date();
      user.lastLoginIP = clientIP;
      await user.save();

      return NextResponse.json({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          mfaEnabled: user.mfaEnabled,
          emailVerified: user.emailVerified,
          status: user.status,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    }

    // MFA is enabled - send OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Create new OTP document
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      code: otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpDoc.save();

    // Send OTP via email
    const { sendOTPEmail } = await import('../../../../lib/api/email');
    const emailSent = await sendOTPEmail(email.toLowerCase(), otp, user.name);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      requiresOtp: true,
      mfaEnabled: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
