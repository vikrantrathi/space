import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '../../../../lib/utils/s3';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (5MB limit for avatars)
    S3Service.validateFileSize(buffer, 5);

    // Upload to S3
    const uploadResult = await S3Service.uploadImage(buffer, file.name, 'avatars');

    // Update user profile picture in database
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(user.userId, {
      profilePicture: uploadResult.url
    });

    // Log activity
    const Activity = await import('../../../../lib/db/models/Activity');
    const avatarUpdateActivity = new Activity.default({
      type: 'avatar_updated',
      description: `User ${updatedUser?.name} (${updatedUser?.email}) updated their profile picture`,
      userId: updatedUser?._id,
      userEmail: updatedUser?.email,
      metadata: {
        role: updatedUser?.role,
        avatarUrl: uploadResult.url,
        s3Key: uploadResult.key,
        timestamp: new Date().toISOString(),
      },
    });
    await avatarUpdateActivity.save();

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);

    let errorMessage = 'Failed to upload avatar';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('credentials')) {
        errorMessage = 'AWS credentials not configured properly';
        statusCode = 500;
      } else if (error.message.includes('bucket')) {
        errorMessage = 'S3 bucket not configured or accessible';
        statusCode = 500;
      } else if (error.message.includes('size')) {
        errorMessage = 'File size exceeds 5MB limit';
        statusCode = 400;
      } else if (error.message.includes('Invalid image file')) {
        errorMessage = 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP';
        statusCode = 400;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}