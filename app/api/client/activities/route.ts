import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import Activity from '../../../../lib/db/models/Activity';
import { verifyToken } from '../../../../lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query - only show activities for the authenticated client
    const query: {
      userId: string;
      type?: string;
      createdAt?: { $gte?: Date; $lte?: Date };
      $or?: Array<{ description?: { $regex: string; $options: string } } | { userEmail?: { $regex: string; $options: string } }>;
    } = {
      userId: decoded.userId,
    };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get client activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
