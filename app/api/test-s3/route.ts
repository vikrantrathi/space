import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '../../../lib/utils/s3';

export async function GET(request: NextRequest) {
  try {
    // Test S3 configuration
    const testBuffer = Buffer.from('Test file content for S3 verification');
    const testFileName = 'test-verification.txt';

    // Debug logs removed

    const result = await S3Service.uploadFile(testBuffer, testFileName, 'text/plain', 'test');

    return NextResponse.json({
      success: true,
      message: 'S3 configuration test successful',
      url: result.url,
      key: result.key,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    });

  } catch (error) {
    console.error('S3 test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      config: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
      }
    }, { status: 500 });
  }
}
