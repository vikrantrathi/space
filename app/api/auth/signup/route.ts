import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import OTP from '../../../../lib/db/models/OTP';
import Activity from '../../../../lib/db/models/Activity';
import { sendOTPEmail } from '../../../../lib/api/email';

// Rate limiting helper
const checkRateLimit = async (email: string): Promise<boolean> => {
  const recentOTPs = await OTP.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
  });
  return recentOTPs < 3; // Max 3 OTP requests per 5 minutes
};

// Input validation helper
const validateSignupInput = (email: string, password: string, name: string) => {
  const errors: string[] = [];
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }
  
  // Password validation
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  return errors;
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let email: string, password: string, name: string;
    try {
      const body = await request.json();
      ({ email, password, name } = body);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields: email, password, and name are required' }, { status: 400 });
    }

    // Validate input format
    const validationErrors = validateSignupInput(email, password, name);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join('; ') }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Check rate limiting
    const withinRateLimit = await checkRateLimit(email);
    if (!withinRateLimit) {
      return NextResponse.json({
        error: 'Too many OTP requests. Please wait 5 minutes before trying again.'
      }, { status: 429 });
    }

    // Hash password first
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.status === 'active') {
        return NextResponse.json({ error: 'User already exists. Please login instead.' }, { status: 409 });
      } else if (existingUser.status === 'pending_approval') {
        return NextResponse.json({ error: 'Your profile is already submitted for approval. Please wait for admin approval or contact support.' }, { status: 409 });
      } else if (existingUser.status === 'rejected') {
        // Allow re-signup for rejected users - we'll handle this in verify-otp
        // Debug log removed
      } else if (existingUser.status === 'inactive') {
        return NextResponse.json({ error: 'Your account has been deactivated. Please contact support to reactivate.' }, { status: 409 });
      }
    }

    // Generate secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email to prevent conflicts
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Create OTP document with user data for later use
    const signupData = JSON.stringify({
      name: name.trim(),
      password: hashedPassword,
      existingUserId: existingUser?._id?.toString(),
      isResignup: existingUser?.status === 'rejected'
    });

    const otpDoc = new OTP({
      email: email.toLowerCase(),
      code: otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      signupData: signupData,
      attempts: 0
    });

    // Debug log removed

    const savedOtp = await otpDoc.save();
    // Debug log removed

    // Send OTP via email
    const emailSent = await sendOTPEmail(email.toLowerCase(), otp, name.trim());

    if (!emailSent) {
      // Clean up failed OTP
      await OTP.deleteOne({ _id: savedOtp._id });
      return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 });
    }

    // Log signup attempt activity
    const signupActivity = new Activity({
      type: 'user_signup',
      description: `Signup OTP sent for email ${email.toLowerCase()}`,
      userEmail: email.toLowerCase(),
      metadata: {
        name: name.trim(),
        isResignup: existingUser?.status === 'rejected',
        otpSent: emailSent,
        stage: 'otp_sent'
      },
    });
    await signupActivity.save();

    return NextResponse.json({
      message: 'OTP sent successfully. Please check your email.',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      // Handle specific mongoose validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json({ error: 'Validation failed: ' + error.message }, { status: 400 });
      }
      if (error.name === 'MongoError' && error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Internal server error. Please try again later.' }, { status: 500 });
  }
}
