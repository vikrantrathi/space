import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db/mongodb';
import User, { IUser } from '../../../../lib/db/models/User';
import Activity from '../../../../lib/db/models/Activity';
import { sendApprovalEmail, sendRejectionEmail, sendReApprovalEmail, sendWelcomeEmail, sendAdminUserVerificationEmail } from '../../../../lib/api/email';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get all users (only admins can access this)
    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, adminId, reason, userData } = await request.json();

    // Connect to database
    await connectToDatabase();

    // Request context info for auditing
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : realIP || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find the admin performing the action
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the target user (not needed for create action)
    let user: IUser | null = null;
    if (action !== 'create') {
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    let activityType: string;
    let activityDescription: string;
    let emailSent = false;
    let newUser: IUser | null = null;

    switch (action) {
      case 'create':
        // Validate userData
        if (!userData || !userData.name || !userData.email) {
          return NextResponse.json({ error: 'Missing required user data' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
          return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new user with pending verification
        newUser! = new User({
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          role: 'client', // Default to client, can be changed later if needed
          status: 'pending_verification',
          isApproved: false,
          emailVerified: false,
          verificationToken,
          verificationTokenExpiry: tokenExpiry,
          createdBy: adminId,
        });

        await newUser!.save();

        activityType = 'admin_create_user';
        activityDescription = `Admin initiated user creation for ${newUser!.email}`;

        // Send verification email
        emailSent = await sendAdminUserVerificationEmail(newUser!.email, newUser!.name, verificationToken);
        break;

      case 'approve':
        user!.status = 'active';
        user!.isApproved = true;
        user!.approvedAt = new Date();
        user!.approvedBy = adminId;
        // Clean up any stale rejection info
        user!.rejectedAt = undefined;
        user!.rejectedBy = undefined;
        user!.rejectionReason = undefined;
        await user!.save();

        activityType = 'profile_approved';
        activityDescription = `Profile approved for user ${user!.email}`;

        // Send approval email
        emailSent = await sendApprovalEmail(user!.email, user!.name);
        break;

      case 'reject':
        user!.status = 'rejected';
        user!.isApproved = false;
        user!.rejectedAt = new Date();
        user!.rejectedBy = adminId;
        user!.rejectionReason = reason || 'Profile rejected by admin';
        await user!.save();

        activityType = 'profile_rejected';
        activityDescription = `Profile rejected for user ${user!.email}`;

        // Send rejection email
        emailSent = await sendRejectionEmail(user!.email, user!.name, reason);
        break;

      case 'reapprove':
        // Re-approve a previously rejected profile
        user!.isApproved = true;
        user!.status = 'active';
        user!.reapprovedAt = new Date();
        user!.reapprovedBy = adminId;
        // Clear previous rejection metadata
        user!.rejectedAt = undefined;
        user!.rejectedBy = undefined;
        user!.rejectionReason = undefined;
        await user!.save();

        activityType = 'profile_approved';
        activityDescription = `Profile re-approved for user ${user!.email}`;

        // Send re-approval email
        emailSent = await sendReApprovalEmail(user!.email, user!.name);
        break;

      case 'activate':
        user!.status = 'active';
        user!.reactivatedAt = new Date();
        user!.reactivatedBy = adminId;
        await user!.save();

        activityType = 'user_activated';
        activityDescription = `User ${user!.email} activated`;
        break;

      case 'deactivate':
        user!.status = 'inactive';
        user!.deactivatedAt = new Date();
        user!.deactivatedBy = adminId;
        await user!.save();

        activityType = 'user_deactivated';
        activityDescription = `User ${user!.email} deactivated`;
        break;

      case 'delete':
        // Prevent deletion of admin users
        if (user!.role === 'admin') {
          return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        activityType = 'admin_action';
        activityDescription = `User ${user!.email} permanently deleted`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log activity
    let activityUserId: string;
    let activityUserEmail: string;
    let activityStatus: string;
    let activityIsApproved: boolean;

    if (action === 'create' && newUser!) {
      activityUserId = newUser!._id.toString();
      activityUserEmail = newUser!.email;
      activityStatus = newUser!.status;
      activityIsApproved = newUser!.isApproved;
    } else if (action === 'delete') {
      activityUserId = userId;
      activityUserEmail = user!.email;
      activityStatus = 'deleted';
      activityIsApproved = false;
    } else {
      activityUserId = userId;
      activityUserEmail = user!.email;
      activityStatus = user!.status;
      activityIsApproved = user!.isApproved;
    }

    const activity = new Activity({
      type: activityType,
      description: activityDescription,
      userId: activityUserId,
      userEmail: activityUserEmail,
      adminId: adminId,
      adminEmail: admin.email,
      ipAddress,
      userAgent,
      metadata: {
        action,
        reason,
        emailSent,
        status: activityStatus,
        isApproved: activityIsApproved,
      },
    });
    await activity.save();

    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`,
      emailSent,
    });
  } catch (error) {
    console.error('User management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
