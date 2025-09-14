import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '../../../../lib/api/email';
import connectToDatabase from '../../../../lib/db/mongodb';
import OTP from '../../../../lib/db/models/OTP';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Generate OTP
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
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
