import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build search query for client users
    const searchQuery: Record<string, unknown> = {
      role: 'client',
      status: 'active',
      isApproved: true
    };

    // Add search functionality for name and email
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get clients with search
    const clients = await User.find(searchQuery)
      .select('_id name email profilePicture createdAt')
      .sort({ name: 1 })
      .limit(limit);

    return NextResponse.json({ 
      clients: clients.map(client => ({
        id: client._id.toString(),
        name: client.name,
        email: client.email,
        profilePicture: client.profilePicture,
        createdAt: client.createdAt
      }))
    });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
