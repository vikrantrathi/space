import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import Quotation from '../../../../lib/db/models/Quotation';
import Activity from '../../../../lib/db/models/Activity';
import { authMiddleware } from '../../../../lib/auth/auth-middleware';

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

    // Connect to database
    await connectToDatabase();

    // Get all quotations
    const quotations = await Quotation.find({})
      .populate('associatedUser', 'name email')
      .sort({ createdAt: -1 });

    // Get all quotation IDs for efficient view count query
    const quotationIds = quotations.map(q => q._id.toString());
    
    // Get view counts for all quotations in a single aggregation query
    const viewCounts = await Activity.aggregate([
      {
        $match: {
          type: 'quotation_viewed',
          'metadata.quotationId': { $in: quotationIds }
        }
      },
      {
        $group: {
          _id: '$metadata.quotationId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup
    const viewCountMap = new Map();
    viewCounts.forEach(item => {
      viewCountMap.set(item._id, item.count);
    });

    // Combine quotations with their view counts
    const quotationsWithViews = quotations.map(quotation => ({
      ...quotation.toObject(),
      viewCount: viewCountMap.get(quotation._id.toString()) || 0
    }));

    return NextResponse.json({ quotations: quotationsWithViews });
  } catch (error) {
    console.error('Get quotations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const requestData = await request.json();
    const {
      title,
      templateType,
      currency,
      features,
      benefits,
      terms,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      clientAddress,
      country,
      projectDescription,
      projectDeadline,
      paymentTerms,
      quotationNo,
      quotationDate,
      expirationDate,
      quantityPricing,
      paymentMilestones,
      coverImage,
      associatedUser
    } = requestData;


    // Validate required fields
    if (!title || !terms || (Array.isArray(terms) && terms.length === 0)) {
      return NextResponse.json({ error: 'Missing required fields: title and terms are required' }, { status: 400 });
    }


    // Connect to database
    await connectToDatabase();

    // For dashboard templates, merge with standard content
    const mergedData = {
      title,
      templateType: templateType || 'landing',
      currency: currency || 'USD',
      features: features || [],
      benefits: benefits || [],
      terms,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      clientAddress,
      country,
      projectDescription,
      projectDeadline,
      paymentTerms,
      quotationNo,
      quotationDate: quotationDate ? new Date(quotationDate) : new Date(),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      quantityPricing,
      paymentMilestones,
      coverImage,
      associatedUser: (() => {
        if (!associatedUser) return undefined;
        if (typeof associatedUser === 'string') return associatedUser;
        if (typeof associatedUser === 'object' && associatedUser !== null) {
          const id = associatedUser._id || associatedUser.id || associatedUser.toString();
          return (id && id !== '[object Object]' && id.length === 24) ? id : undefined;
        }
        return undefined;
      })(),
      status: 'draft',
    };



    // No merging in API - save only what user entered

    // Create new quotation with merged data
    const newQuotation = new Quotation(mergedData);

    await newQuotation.save();

    // Log activity
    const activity = new Activity({
      type: 'admin_action',
      description: `Admin created quotation: ${title}`,
      adminId: user.userId,
      adminEmail: user.email,
      metadata: { quotationId: newQuotation._id.toString(), action: 'create_quotation' },
    });
    await activity.save();

    return NextResponse.json({
      success: true,
      quotation: newQuotation,
      message: 'Quotation created successfully'
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
