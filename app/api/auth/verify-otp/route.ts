import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import OTP from '../../../../lib/db/models/OTP';
import Activity from '../../../../lib/db/models/Activity';
import { sendWelcomeEmail, sendProfileSubmittedEmail } from '../../../../lib/api/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let otp: string;
    try {
      const body = await request.json();
      ({ otp } = body);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate input
    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    // Ensure OTP is a string, trim whitespace, and normalize
    const cleanOtp = String(otp).trim().replace(/\s/g, '');
    
    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ error: 'OTP must be a 6-digit number' }, { status: 400 });
    }

    // Debug log removed

    // Connect to database
    await connectToDatabase();

    // Find valid OTP document with better error checking
    const otpDoc = await OTP.findOne({
      code: cleanOtp,
      used: false,
      expires: { $gt: new Date() }
    });

    if (!otpDoc) {
      // Check if OTP exists but is expired, used, or has too many attempts
      const existingOtp = await OTP.findOne({ code: cleanOtp });
      if (existingOtp) {
        // Increment attempts for tracking
        await OTP.updateOne({ code: cleanOtp }, { $inc: { attempts: 1 } });
        
        if (existingOtp.used) {
          return NextResponse.json({ error: 'This OTP has already been used. Please request a new one.' }, { status: 400 });
        }
        if (existingOtp.expires <= new Date()) {
          return NextResponse.json({ error: 'This OTP has expired. Please request a new one.' }, { status: 400 });
        }
        if (existingOtp.attempts >= 3) {
          // Mark as used to prevent further attempts
          await OTP.updateOne({ code: cleanOtp }, { used: true });
          return NextResponse.json({ error: 'Too many failed attempts. Please request a new OTP.' }, { status: 400 });
        }
      }
      return NextResponse.json({ error: 'Invalid OTP. Please check the code and try again.' }, { status: 400 });
    }

    // Debug log removed

    // Check attempt count before proceeding
    if (otpDoc.attempts >= 3) {
      otpDoc.used = true;
      await otpDoc.save();
      return NextResponse.json({ error: 'Too many failed attempts. Please request a new OTP.' }, { status: 400 });
    }

    // Mark OTP as used immediately to prevent reuse
    otpDoc.used = true;
    await otpDoc.save();

    // Check if this OTP contains signup data (new signup flow)
    let signupData = null;
    if (otpDoc.signupData) {
      try {
        signupData = JSON.parse(otpDoc.signupData);
        // Debug log removed
      } catch (error) {
        console.error('Error parsing signup data:', error);
        return NextResponse.json({ error: 'Invalid signup data in OTP' }, { status: 400 });
      }
    }

    if (signupData && signupData.name && signupData.password) {
      // This is a signup verification - create or update the user
      let user;

      try {
        if (signupData.isResignup && signupData.existingUserId) {
          // Update existing rejected user
          user = await User.findById(signupData.existingUserId);
          if (!user) {
            return NextResponse.json({ error: 'Original user not found for re-signup' }, { status: 404 });
          }
          
          user.name = signupData.name;
          user.password = signupData.password;
          user.status = 'pending_approval';
          user.isApproved = false;
          user.emailVerified = true;
          user.rejectedAt = undefined;
          user.rejectedBy = undefined;
          user.rejectionReason = undefined;
          await user.save();

          // Log re-signup activity
          const reSignupActivity = new Activity({
            type: 'user_signup',
            description: `Rejected user ${user.name} (${user.email}) re-signed up and verified email`,
            userId: user._id,
            userEmail: user.email,
            metadata: {
              role: user.role,
              status: user.status,
              isResignup: true,
            },
          });
          await reSignupActivity.save();
        } else {
          // Create new user
          user = new User({
            email: otpDoc.email,
            name: signupData.name,
            password: signupData.password,
            role: 'client',
            status: 'pending_approval',
            isApproved: false,
            mfaEnabled: false,
            emailVerified: true,
          });

          await user.save();

          // Log signup activity
          const signupActivity = new Activity({
            type: 'user_signup',
            description: `New user ${user.name} (${user.email}) signed up and verified email`,
            userId: user._id,
            userEmail: user.email,
            metadata: {
              role: user.role,
              status: user.status,
            },
          });
          await signupActivity.save();
        }

        // Send profile submitted email notification
        const profileSubmittedEmailSent = await sendProfileSubmittedEmail(user.email, user.name);
        // Debug log removed

        // Clean up used OTP
        await OTP.deleteMany({ email: otpDoc.email, used: true });

        return NextResponse.json({
          message: 'Email verified successfully. Your profile has been submitted for admin approval.',
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
      } catch (error) {
        console.error('Error creating/updating user:', error);
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }
    }

    // Existing user verification (login flow)
    const user = await User.findOne({ email: otpDoc.email });
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Debug log removed

    try {
      // Update user email verification status if not already verified
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();

        // Log verification activity
        const verificationActivity = new Activity({
          type: 'email_verification',
          description: `User ${user.name} (${user.email}) verified email during login`,
          userId: user._id,
          userEmail: user.email,
          metadata: {
            role: user.role,
            status: user.status,
          },
        });
        await verificationActivity.save();
      }

      // Enforce approval and active status before issuing token (for login)
      if (user.status === 'pending_approval') {
        return NextResponse.json(
          { error: 'Your profile is pending admin approval. Please wait for admin approval.' },
          { status: 403 }
        );
      }
      if (user.status === 'rejected') {
        return NextResponse.json(
          { error: 'Your profile was rejected. Please contact support or re-register.' },
          { status: 403 }
        );
      }
      if (user.status === 'inactive') {
        return NextResponse.json(
          { error: 'Your account has been deactivated. Please contact support.' },
          { status: 403 }
        );
      }
      if (user.status !== 'active' || !user.isApproved) {
        return NextResponse.json(
          { error: 'Your account is not active. Please contact support.' },
          { status: 403 }
        );
      }

      // Generate JWT for successful login
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log login activity
      const loginActivity = new Activity({
        type: 'user_login',
        description: `User ${user.name} (${user.email}) logged in via OTP`,
        userId: user._id,
        userEmail: user.email,
        metadata: {
          role: user.role,
          loginMethod: 'otp',
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

      // Clean up used OTPs
      await OTP.deleteMany({ email: user.email, used: true });

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
    } catch (error) {
      console.error('Error processing login verification:', error);
      return NextResponse.json({ error: 'Failed to process login verification' }, { status: 500 });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
