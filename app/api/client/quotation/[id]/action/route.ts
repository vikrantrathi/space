import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../../lib/db/mongodb';
import Quotation from '../../../../../../lib/db/models/Quotation';
import OTP from '../../../../../../lib/db/models/OTP';
import Activity from '../../../../../../lib/db/models/Activity';
import { sendOTPEmail } from '../../../../../../lib/api/email';
import { QuotationEmailService } from '../../../../../../lib/api/quotationEmailService';
import { updateStatusTimeline, getStatusTimelineDescription } from '../../../../../../lib/utils/statusTimeline';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, email, phone, action, reason } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['accept', 'reject', 'revision'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if ((action === 'reject' || action === 'revision') && !reason) {
      return NextResponse.json({ error: 'Reason required for reject/revision' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (quotation.status !== 'sent') {
      return NextResponse.json({ error: 'Quotation not available for actions' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email and quotation
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'quotation_action' });

    // Create new OTP document
    const quotationData = {
      quotationId: id,
      name,
      email: email.toLowerCase(),
      phone,
      action,
      reason,
    };
    console.log('Creating OTP with quotationData:', quotationData);
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      code: otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      type: 'quotation_action',
      quotationData: JSON.stringify(quotationData),
    });

    await otpDoc.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send quotation action OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { otp } = await request.json();

    // Validate OTP
    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Valid OTP required' }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find valid OTP
    const otpDoc = await OTP.findOne({
      code: otp,
      type: 'quotation_action',
      used: false,
      expires: { $gt: new Date() }
    });

    if (!otpDoc || !otpDoc.quotationData) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Parse quotation data
    const quotationData = JSON.parse(otpDoc.quotationData);
    console.log('OTP verification - quotationData:', quotationData);
    if (quotationData.quotationId !== id) {
      return NextResponse.json({ error: 'OTP not for this quotation' }, { status: 400 });
    }

    // Find quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Update quotation with client info and action
    quotation.clientName = quotationData.name;
    quotation.clientEmail = quotationData.email;
    quotation.clientPhone = quotationData.phone;

    // Add action to history
    quotation.actions.push({
      action: quotationData.action,
      reason: quotationData.reason,
      timestamp: new Date(),
      verified: true,
    });

    // Update quotation status based on action
    let newStatus = quotation.status;
    if (quotationData.action === 'accept') {
      newStatus = 'accepted';
    } else if (quotationData.action === 'reject') {
      newStatus = 'rejected';
    } else if (quotationData.action === 'revision') {
      newStatus = 'revision';
    }

    // Update status timeline
    if (newStatus !== quotation.status) {
      quotation.status = newStatus;
      const description = getStatusTimelineDescription(newStatus, quotationData.action, quotationData.reason);
      quotation.statusTimeline = updateStatusTimeline(quotation, newStatus, description);
    }

    await quotation.save();

    // Send email notification for client action
    try {
      const emailAction = quotationData.action === 'accept' ? 'accepted' : 
                         quotationData.action === 'reject' ? 'rejected' : 
                         'revision_requested';
      
      await QuotationEmailService.sendQuotationActionEmail({
        quotation,
        clientName: quotationData.name,
        clientEmail: quotationData.email,
        action: emailAction,
        reason: quotationData.reason,
      });
    } catch (emailError) {
      console.error('Failed to send quotation action email:', emailError);
      // Don't fail the entire request if email fails
    }

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    // Get client IP address and user agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log activity
    console.log('Creating activity with quotationData.name:', quotationData.name);
    const activity = new Activity({
      type: 'quotation_action',
      description: `Client ${quotationData.name} (${quotationData.email}) ${quotationData.action}ed quotation: ${quotation.title}`,
      userEmail: quotationData.email,
      metadata: {
        quotationId: quotation._id.toString(),
        action: quotationData.action,
        reason: quotationData.reason,
        isAuthenticated: false,
        clientName: quotationData.name,
        clientPhone: quotationData.phone
      },
      ipAddress: ip,
      userAgent: userAgent
    });
    await activity.save();
    console.log('Activity created with description:', activity.description);

    // Create specific success messages based on action
    let successMessage = '';
    switch (quotationData.action) {
      case 'accept':
        successMessage = 'Quotation accepted successfully';
        break;
      case 'reject':
        successMessage = 'Quotation rejected successfully';
        break;
      case 'revision':
        successMessage = 'Revision Requested Successfully. Actions Disabled till Revision Received from admin.';
        break;
      default:
        successMessage = `Quotation ${quotationData.action}ed successfully`;
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      action: quotationData.action,
    });
  } catch (error) {
    console.error('Verify quotation action OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}