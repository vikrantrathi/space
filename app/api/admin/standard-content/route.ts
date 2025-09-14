import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import StandardContent from '@/lib/db/models/StandardContent';
import { authMiddleware } from '@/lib/auth/auth-middleware';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    // Force fresh data by using lean() and specific field selection
    const standardContent = await StandardContent.findOne({})
      .lean()
      .select('+defaultFeatures +defaultBenefits +companyDetails +defaultTerms +processSteps +processVideo +testimonials +previousWork +createdAt +updatedAt');

    return NextResponse.json({
      success: true,
      standardContent: standardContent || null,
      timestamp: new Date().toISOString() // Add timestamp to help with caching
    });
  } catch (error) {
    console.error('Error fetching standard content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standard content' },
      { status: 500 }
    );
  }
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

    await connectToDatabase();

    const body = await request.json();
    const {
      companyDetails,
      defaultFeatures,
      defaultBenefits,
      defaultTerms,
      processSteps,
      processVideo,
      testimonials,
      previousWork
    } = body;

    // Validate required fields
    if (!companyDetails?.name || !companyDetails?.email || !companyDetails?.phone || !companyDetails?.website) {
      return NextResponse.json(
        { error: 'Company details are required' },
        { status: 400 }
      );
    }

    if (!defaultTerms) {
      return NextResponse.json(
        { error: 'Default terms are required' },
        { status: 400 }
      );
    }

    // Find existing standard content or create new
    let standardContent = await StandardContent.findOne({});

    if (standardContent) {
      // Update existing - use set() to ensure all fields are updated
      standardContent.set({
        companyDetails,
        defaultFeatures: defaultFeatures || [],
        defaultBenefits: defaultBenefits || [],
        defaultTerms,
        processSteps: processSteps || [],
        processVideo,
        testimonials: testimonials || [],
        previousWork: previousWork || []
      });
      await standardContent.save();
    } else {
      // Create new
      standardContent = new StandardContent({
        companyDetails,
        defaultFeatures: defaultFeatures || [],
        defaultBenefits: defaultBenefits || [],
        defaultTerms,
        processSteps: processSteps || [],
        processVideo,
        testimonials: testimonials || [],
        previousWork: previousWork || []
      });
      await standardContent.save();
    }

    // Force refresh by clearing any potential caches
    await StandardContent.collection.dropIndexes().catch(() => {}); // Ignore errors if no indexes

    return NextResponse.json({
      success: true,
      message: 'Standard content updated successfully',
      standardContent
    });
  } catch (error) {
    console.error('Error updating standard content:', error);
    return NextResponse.json(
      { error: 'Failed to update standard content' },
      { status: 500 }
    );
  }
}