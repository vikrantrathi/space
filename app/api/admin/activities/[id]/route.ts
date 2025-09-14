import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Activity from '../../../../../lib/db/models/Activity';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await connectToDatabase();

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    // Delete the specific activity
    const deleteResult = await Activity.findByIdAndDelete(id);

    if (!deleteResult) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Activity deleted successfully',
      deletedActivity: deleteResult
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}