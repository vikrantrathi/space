import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../../../lib/db/mongodb';
import Quotation from '../../../../../../../lib/db/models/Quotation';
import Activity from '../../../../../../../lib/db/models/Activity';
import { authMiddleware } from '../../../../../../../lib/auth/auth-middleware';
import { QuotationEmailService } from '../../../../../../../lib/api/quotationEmailService';
import { updateStatusTimeline, getStatusTimelineDescription } from '../../../../../../../lib/utils/statusTimeline';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
    name?: string;
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    if (user.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can take actions' }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await request.json();

    if (!['accept', 'reject', 'revision'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if ((action === 'reject' || action === 'revision') && !reason) {
      return NextResponse.json({ error: 'Reason required for reject/revision' }, { status: 400 });
    }

    await connectToDatabase();

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Ownership check: client associated by email or user id
    const isOwner = quotation.clientEmail === user.email || (quotation.associatedUser && quotation.associatedUser.toString() === user.userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized for this quotation' }, { status: 403 });
    }

    if (quotation.status !== 'sent' && quotation.status !== 'revision') {
      return NextResponse.json({ error: 'Quotation not available for actions' }, { status: 400 });
    }

    // Update client info if missing
    if (!quotation.clientName) quotation.clientName = user.name || quotation.clientName;
    if (!quotation.clientEmail) quotation.clientEmail = user.email;

    // Coerce legacy/invalid template types to a valid enum to avoid validation failure
    const allowedTemplateTypes = ['landing', 'dashboard'];
    if (!allowedTemplateTypes.includes(quotation.templateType)) {
      quotation.templateType = 'landing';
    }

    // Append action and update status
    quotation.actions = quotation.actions || [];
    quotation.actions.push({
      action,
      reason,
      timestamp: new Date(),
      verified: true,
    });

    // Update status
    let newStatus: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revision' = quotation.status;
    if (action === 'accept') newStatus = 'accepted';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'revision') newStatus = 'revision';

    // Update status timeline
    if (newStatus !== quotation.status) {
      quotation.status = newStatus;
      const description = getStatusTimelineDescription(newStatus, action, reason);
      quotation.statusTimeline = updateStatusTimeline(quotation, newStatus, description);
    }

    await quotation.save();

    // Send email notification for client action
    try {
      const emailAction = action === 'accept' ? 'accepted' : 
                         action === 'reject' ? 'rejected' : 
                         'revision_requested';
      
      await QuotationEmailService.sendQuotationActionEmail({
        quotation,
        clientName: user.name || user.email,
        clientEmail: user.email,
        action: emailAction,
        reason: reason,
      });
    } catch (emailError) {
      console.error('Failed to send quotation action email:', emailError);
      // Don't fail the entire request if email fails
    }

    // Log activity
    const activity = new Activity({
      type: 'quotation_action',
      description: `Client ${user.name || user.email} ${action}ed quotation: ${quotation.title}`,
      userId: user.userId,
      userEmail: user.email,
      metadata: { 
        quotationId: quotation._id.toString(), 
        action,
        reason: reason || null,
        isAuthenticated: true
      },
    });
    try { await activity.save(); } catch { /* ignore activity failure */ }

    return NextResponse.json({ success: true, status: quotation.status });
  } catch (error) {
    console.error('Client action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


