import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db/mongodb';
import Activity from '../../../lib/db/models/Activity';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get recent activities
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Get quotation_viewed activities specifically
    const quotationViews = await Activity.find({ type: 'quotation_viewed' })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      recentActivities: recentActivities.map(a => ({
        type: a.type,
        description: a.description,
        createdAt: a.createdAt,
        userEmail: a.userEmail,
        ipAddress: a.ipAddress
      })),
      quotationViews: quotationViews.map(a => ({
        type: a.type,
        description: a.description,
        createdAt: a.createdAt,
        userEmail: a.userEmail,
        ipAddress: a.ipAddress,
        metadata: a.metadata
      })),
      totalActivities: await Activity.countDocuments(),
      totalQuotationViews: await Activity.countDocuments({ type: 'quotation_viewed' })
    });
  } catch (error) {
    console.error('Test activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
