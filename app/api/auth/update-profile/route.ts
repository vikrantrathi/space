import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    const { name, profilePicture } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        name: name.trim(),
        ...(profilePicture && { profilePicture }),
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log activity
    const Activity = await import('../../../../lib/db/models/Activity');
    const profileUpdateActivity = new Activity.default({
      type: 'profile_updated',
      description: `User ${updatedUser.name} (${updatedUser.email}) updated their profile`,
      userId: updatedUser._id,
      userEmail: updatedUser.email,
      metadata: {
        role: updatedUser.role,
        changes: {
          name: name.trim() !== updatedUser.name,
          profilePicture: !!profilePicture,
        },
        timestamp: new Date().toISOString(),
      },
    });
    await profileUpdateActivity.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}