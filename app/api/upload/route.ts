import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '../../../lib/utils/s3';
import { authMiddleware } from '../../../lib/auth/auth-middleware';

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
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'pdf'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['image', 'pdf'].includes(type)) {
      return NextResponse.json({ error: 'Invalid file type. Must be "image" or "pdf"' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (10MB limit)
    S3Service.validateFileSize(buffer, 10);

    let uploadResult;

    if (type === 'image') {
      uploadResult = await S3Service.uploadImage(buffer, file.name, 'quotation-images');
    } else {
      uploadResult = await S3Service.uploadPDF(buffer, file.name, 'quotation-pdfs');
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      s3Key: uploadResult.key,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);

    let errorMessage = 'Failed to upload file';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error types
      if (error.message.includes('credentials')) {
        errorMessage = 'AWS credentials not configured properly';
        statusCode = 500;
      } else if (error.message.includes('bucket')) {
        errorMessage = 'S3 bucket not configured or accessible';
        statusCode = 500;
      } else if (error.message.includes('size')) {
        errorMessage = 'File size exceeds limit';
        statusCode = 400;
      } else if (error.message.includes('Invalid image file')) {
        errorMessage = 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP';
        statusCode = 400;
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'Only PDF files are allowed for this upload type';
        statusCode = 400;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
