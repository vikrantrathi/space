import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    // Connect to database
    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      profilePicture: user.profilePicture,
      mfaEnabled: user.mfaEnabled,
      emailVerified: user.emailVerified,
      status: user.status,
      isApproved: user.isApproved,
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt,
      rejectionReason: user.rejectionReason,
      lastLoginAt: user.lastLoginAt,
      lastLoginIP: user.lastLoginIP,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
