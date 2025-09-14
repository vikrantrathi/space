import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';
import User from '../../../../../lib/db/models/User';
import Activity from '../../../../../lib/db/models/Activity';
import { authMiddleware } from '../../../../../lib/auth/auth-middleware';
import { QuotationEmailService } from '../../../../../lib/api/quotationEmailService';
import { updateStatusTimeline, getStatusTimelineDescription } from '../../../../../lib/utils/statusTimeline';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get quotation by ID
    const quotation = await Quotation.findById(id)
      .populate('associatedUser', 'name email');

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Fix undefined currency in existing quotations
    if (!quotation.currency) {
      quotation.currency = 'USD';
      await quotation.save();
    }
    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('Get quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const authResult = authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    
    const requestBody = await request.json();
    const {
      title,
      templateType,
      currency,
      features,
      benefits,
      terms,
      status,
      associatedUserId,
      associatedUser,
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
      isRevision
    } = requestBody;



    // Connect to database
    await connectToDatabase();

    // Find quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // No merging in API - save only what user entered

    // Update fields
    if (title !== undefined) quotation.title = title;
    if (templateType !== undefined) quotation.templateType = templateType;
    if (currency !== undefined) {
      quotation.currency = currency;
      quotation.markModified('currency'); // Force Mongoose to save this field
    }
    if (features !== undefined) quotation.features = features;
    if (benefits !== undefined) quotation.benefits = benefits;
    if (terms !== undefined) quotation.terms = terms;
    // Track status change and append to actions history for admin-triggered updates
    const originalStatus = quotation.status;
    
    // Auto-change status from 'revision' to 'draft' when admin edits
    if (originalStatus === 'revision' && status === undefined) {
      quotation.status = 'draft';
      quotation.actions = quotation.actions || [];
        quotation.actions.push({
          action: 'revision',
          reason: isRevision ? 'Admin sent revised quotation to client' : 'Admin updated quotation based on revision request',
          timestamp: new Date(),
          verified: true,
        });
    }
    
    if (status !== undefined) {
      quotation.status = status;
      if (status !== originalStatus && ['accepted', 'rejected', 'revision'].includes(status)) {
        quotation.actions = quotation.actions || [];
        quotation.actions.push({
          action: status === 'accepted' ? 'accept' : status === 'rejected' ? 'reject' : 'revision',
          reason: isRevision ? 'Admin sent revised quotation to client' : undefined,
          timestamp: new Date(),
          verified: true,
        });
        
        // Update status timeline
        const description = getStatusTimelineDescription(status, undefined, isRevision ? 'Admin sent revised quotation to client' : undefined);
        quotation.statusTimeline = updateStatusTimeline(quotation, status, description);
      } else if (status !== originalStatus && status === 'sent') {
        // For 'sent' status, update timeline and add action if it's a revision
        const description = getStatusTimelineDescription(status, undefined, isRevision ? 'Admin sent revised quotation to client' : undefined);
        quotation.statusTimeline = updateStatusTimeline(quotation, status, description);
        
        // If it's a revision, add action to actions array
        if (isRevision) {
          quotation.actions = quotation.actions || [];
          quotation.actions.push({
            action: 'revision',
            reason: 'Admin sent revised quotation to client',
            timestamp: new Date(),
            verified: true,
          });
        }
      }
    }
    if (clientName !== undefined) quotation.clientName = clientName;
    if (clientEmail !== undefined) quotation.clientEmail = clientEmail;
    if (clientPhone !== undefined) quotation.clientPhone = clientPhone;
    if (clientCompany !== undefined) quotation.clientCompany = clientCompany;
    if (clientAddress !== undefined) quotation.clientAddress = clientAddress;
    if (country !== undefined) quotation.country = country;
    if (projectDescription !== undefined) quotation.projectDescription = projectDescription;
    if (projectDeadline !== undefined) quotation.projectDeadline = projectDeadline;
    if (paymentTerms !== undefined) quotation.paymentTerms = paymentTerms;
    if (quotationNo !== undefined) quotation.quotationNo = quotationNo;
    if (quotationDate !== undefined) quotation.quotationDate = new Date(quotationDate);
    if (expirationDate !== undefined) quotation.expirationDate = new Date(expirationDate);
    if (quantityPricing !== undefined) quotation.quantityPricing = quantityPricing;
    if (paymentMilestones !== undefined) quotation.paymentMilestones = paymentMilestones;
    if (coverImage !== undefined) quotation.coverImage = coverImage;

    // Associate with user if provided
    const userIdToAssociate = associatedUserId || associatedUser;
    if (userIdToAssociate) {
      let userId;
      
      // Handle different cases of userIdToAssociate
      if (typeof userIdToAssociate === 'string') {
        userId = userIdToAssociate;
      } else if (typeof userIdToAssociate === 'object' && userIdToAssociate !== null) {
        userId = userIdToAssociate._id || userIdToAssociate.id || userIdToAssociate.toString();
      } else {
        userId = String(userIdToAssociate);
      }
      
      // Ensure userId is a valid string and not "[object Object]"
      if (userId && userId !== '[object Object]' && userId.length === 24) {
        const userToAssociate = await User.findById(userId);
        if (!userToAssociate) {
          return NextResponse.json({ error: 'Associated user not found' }, { status: 404 });
        }
        quotation.associatedUser = userId;
      }
    }

    // Check if status is being changed to 'sent' and we have client email
    const wasStatusChangedToSent = status === 'sent' && originalStatus !== 'sent';

    await quotation.save();


    // Send email if status changed to 'sent' and client email exists
    if (wasStatusChangedToSent && quotation.clientEmail && quotation.clientName) {
      try {
        const emailAction = isRevision ? 'revision_sent' : 'sent';
        await QuotationEmailService.sendQuotationActionEmail({
          quotation,
          clientName: quotation.clientName,
          clientEmail: quotation.clientEmail,
          action: emailAction,
        });
      } catch (emailError) {
        console.error('Failed to send quotation email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    // Log activity
    const activityDescription = isRevision 
      ? `Admin sent revised quotation to client: ${quotation.title}`
      : `Admin updated quotation: ${quotation.title}`;
      
    const activity = new Activity({
      type: 'admin_action',
      description: activityDescription,
      adminId: user.userId,
      adminEmail: user.email,
      metadata: { 
        quotationId: quotation._id.toString(), 
        action: isRevision ? 'send_revision' : 'update_quotation',
        isRevision: isRevision || false
      },
    });
    await activity.save();

    return NextResponse.json({
      success: true,
      quotation,
      message: 'Quotation updated successfully'
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Find and delete quotation
    const quotation = await Quotation.findByIdAndDelete(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Log activity
    const activity = new Activity({
      type: 'admin_action',
      description: `Admin deleted quotation: ${quotation.title}`,
      adminId: user.userId,
      adminEmail: user.email,
      metadata: { quotationId: id, action: 'delete_quotation' },
    });
    await activity.save();

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}