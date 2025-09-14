import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get quotation statistics
    const total = await Quotation.countDocuments();
    const sent = await Quotation.countDocuments({ status: 'sent' });
    const accepted = await Quotation.countDocuments({ status: 'accepted' });
    const draft = await Quotation.countDocuments({ status: 'draft' });

    // Calculate acceptance rate
    const acceptanceRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

    return NextResponse.json({
      total,
      sent,
      accepted,
      draft,
      acceptanceRate
    });
  } catch (error) {
    console.error('Get quotation stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
