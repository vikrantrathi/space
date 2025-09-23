import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import Activity from '../../../../lib/db/models/Activity';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const quotationId = searchParams.get('quotationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: {
      type?: string;
      userId?: string;
      'metadata.quotationId'?: string;
      createdAt?: { $gte?: Date; $lte?: Date };
      $or?: Array<{ description?: { $regex: string; $options: string } } | { userEmail?: { $regex: string; $options: string } }>;
      $and?: Array<{ type?: { $ne: string } }>;
    } = {};

    // Always exclude quotation_viewed logs unless specifically requested
    if (type === 'quotation_viewed') {
      query.type = type;
    } else {
      // Exclude quotation_viewed logs by default
      query.$and = [{ type: { $ne: 'quotation_viewed' } }];
      if (type) query.type = type;
    }
    
    if (userId) query.userId = userId;
    if (quotationId) query['metadata.quotationId'] = quotationId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ] as Array<{ [key: string]: { $regex: string; $options: string } }>;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Activity.countDocuments(query);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .populate('adminId', 'name email')
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
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters for deletion
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    if (!period) {
      return NextResponse.json({ error: 'Period parameter is required' }, { status: 400 });
    }

    // Calculate cutoff date based on period
    const now = new Date();
    let cutoffDate: Date;
    let queryCondition: {
      createdAt?: { $gte?: Date; $lte?: Date; $lt?: Date };
    } = {};

    switch (period) {
      case 'today':
        // Delete activities from today (from start of today to now)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        queryCondition = {
          createdAt: { $gte: startOfToday, $lte: now }
        };
        break;
      case 'yesterday':
        // Delete activities from yesterday
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        queryCondition = {
          createdAt: { $gte: startOfYesterday, $lt: endOfYesterday }
        };
        break;
      case '7days':
        cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        queryCondition = {
          createdAt: { $lt: cutoffDate }
        };
        break;
      case '30days':
        cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        queryCondition = {
          createdAt: { $lt: cutoffDate }
        };
        break;
      case 'all':
        queryCondition = {}; // Delete all activities
        break;
      default:
        return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }

    // Delete activities based on the query condition
    const deleteResult = await Activity.deleteMany(queryCondition);

    return NextResponse.json({
      message: `Deleted ${deleteResult.deletedCount} activities`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
