/**
 * Activity Logging Examples
 *
 * This file shows how to implement activity logging in different modules
 * for consistent tracking across the application.
 *
 * Note: This is a reference file. Copy the patterns to your actual modules.
 */

// ===== AUTHENTICATION MODULE EXAMPLES =====

/*
// In your auth API routes (e.g., lib/auth/activities.ts)
import { logUserActivity, logSystemActivity } from '../activity';

export const logUserRegistration = async (user: any, ipAddress: string, userAgent: string) => {
  await logUserActivity(
    'user_signup',
    `New user ${user.email} registered successfully`,
    user._id.toString(),
    user.email,
    {
      registrationMethod: 'email',
      userRole: user.role,
      emailVerified: user.emailVerified
    },
    ipAddress,
    userAgent
  );
};

export const logUserLogin = async (user: any, ipAddress: string, userAgent: string) => {
  await logUserActivity(
    'user_login',
    `User ${user.email} logged in`,
    user._id.toString(),
    user.email,
    {
      loginMethod: 'credentials',
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount
    },
    ipAddress,
    userAgent
  );
};

export const logPasswordReset = async (user: any, ipAddress: string, userAgent: string) => {
  await logUserActivity(
    'password_reset',
    `Password reset initiated for ${user.email}`,
    user._id.toString(),
    user.email,
    {
      resetMethod: 'email',
      resetTokenExpiry: new Date(Date.now() + 3600000).toISOString() // 1 hour
    },
    ipAddress,
    userAgent
  );
};

export const logFailedLogin = async (email: string, reason: string, ipAddress: string, userAgent: string) => {
  await logSystemActivity(
    'user_login',
    `Failed login attempt for ${email}: ${reason}`,
    {
      email,
      failureReason: reason,
      attemptedAt: new Date().toISOString()
    },
    ipAddress,
    userAgent
  );
};
*/

// ===== USER MANAGEMENT MODULE EXAMPLES =====

/*
// In your user management API routes (e.g., lib/user/activities.ts)
import { logAdminActivity, logUserActivity } from '../activity';

export const logProfileUpdate = async (user: any, changes: any, updatedBy: any) => {
  const activityType = updatedBy.role === 'admin' ? logAdminActivity : logUserActivity;

  await activityType(
    'profile_updated',
    `Profile updated for ${user.email}`,
    updatedBy._id.toString(),
    updatedBy.email,
    user._id.toString(),
    user.email,
    {
      changes: Object.keys(changes),
      updatedFields: changes,
      updateTimestamp: new Date().toISOString()
    }
  );
};

export const logUserActivation = async (user: any, admin: any) => {
  await logAdminActivity(
    'user_activated',
    `User ${user.email} activated by admin`,
    admin._id.toString(),
    admin.email,
    user._id.toString(),
    user.email,
    {
      activationReason: 'Manual activation',
      previousStatus: user.status,
      newStatus: 'active'
    }
  );
};

export const logUserDeactivation = async (user: any, admin: any, reason: string) => {
  await logAdminActivity(
    'user_deactivated',
    `User ${user.email} deactivated by admin`,
    admin._id.toString(),
    admin.email,
    user._id.toString(),
    user.email,
    {
      deactivationReason: reason,
      previousStatus: user.status,
      newStatus: 'inactive',
      deactivatedAt: new Date().toISOString()
    }
  );
};
*/

// ===== PROJECT MANAGEMENT MODULE EXAMPLES =====

/*
// In your project API routes (e.g., lib/project/activities.ts)
import { logUserActivity, logAdminActivity } from '../activity';

export const logProjectCreation = async (project: any, creator: any) => {
  await logUserActivity(
    'project_created',
    `Project "${project.name}" created`,
    creator._id.toString(),
    creator.email,
    {
      projectId: project._id.toString(),
      projectName: project.name,
      projectType: project.type,
      initialStatus: project.status,
      teamMembers: project.teamMembers?.length || 0
    }
  );
};

export const logProjectUpdate = async (project: any, changes: any, updatedBy: any) => {
  const activityType = updatedBy.role === 'admin' ? logAdminActivity : logUserActivity;

  await activityType(
    'project_updated',
    `Project "${project.name}" updated`,
    updatedBy._id.toString(),
    updatedBy.email,
    creator._id.toString(),
    creator.email,
    {
      projectId: project._id.toString(),
      projectName: project.name,
      changes: Object.keys(changes),
      updatedFields: changes,
      previousValues: {}, // You might want to track these
      updateTimestamp: new Date().toISOString()
    }
  );
};

export const logTeamMemberAdded = async (project: any, member: any, addedBy: any) => {
  const activityType = addedBy.role === 'admin' ? logAdminActivity : logUserActivity;

  await activityType(
    'team_member_added',
    `${member.name} added to project "${project.name}"`,
    addedBy._id.toString(),
    addedBy.email,
    member._id.toString(),
    member.email,
    {
      projectId: project._id.toString(),
      projectName: project.name,
      memberId: member._id.toString(),
      memberName: member.name,
      memberRole: member.role,
      addedAt: new Date().toISOString()
    }
  );
};
*/

// ===== EMAIL SYSTEM MODULE EXAMPLES =====

/*
// In your email service (e.g., lib/email/activities.ts)
import { logSystemActivity } from '../activity';

export const logEmailSent = async (templateType: string, recipient: string, userId?: string) => {
  await logSystemActivity(
    'email_sent',
    `Email sent using template "${templateType}" to ${recipient}`,
    {
      templateType,
      recipient,
      userId,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'sent' // Could be updated later with actual delivery status
    }
  );
};

export const logEmailDeliveryFailed = async (templateType: string, recipient: string, error: string) => {
  await logSystemActivity(
    'email_delivery_failed',
    `Email delivery failed for template "${templateType}" to ${recipient}`,
    {
      templateType,
      recipient,
      error,
      failedAt: new Date().toISOString()
    }
  );
};
*/

// ===== ADMIN PANEL MODULE EXAMPLES =====

/*
// In your admin API routes (e.g., lib/admin/activities.ts)
import { logAdminActivity } from '../activity';

export const logBulkUserAction = async (admin: any, action: string, affectedUsers: any[], reason: string) => {
  await logAdminActivity(
    'admin_bulk_action',
    `Admin performed bulk ${action} on ${affectedUsers.length} users`,
    admin._id.toString(),
    admin.email,
    undefined, // No specific user
    undefined,
    {
      action,
      affectedUserCount: affectedUsers.length,
      affectedUserIds: affectedUsers.map(u => u._id.toString()),
      reason,
      performedAt: new Date().toISOString()
    }
  );
};

export const logSystemConfigurationChange = async (admin: any, configKey: string, oldValue: any, newValue: any) => {
  await logAdminActivity(
    'admin_system_config',
    `System configuration "${configKey}" changed by admin`,
    admin._id.toString(),
    admin.email,
    undefined,
    undefined,
    {
      configKey,
      oldValue,
      newValue,
      changeType: typeof oldValue === typeof newValue ? 'update' : 'type_change',
      changedAt: new Date().toISOString()
    }
  );
};
*/

// ===== HOW TO INTEGRATE IN YOUR API ROUTES =====

/*
// Example: In your Next.js API route
import { logUserActivity, logAdminActivity } from '../../../../lib/activity';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    // Your business logic here
    const result = await performBusinessLogic(userId, action, data);

    // Log the activity
    await logUserActivity(
      'user_action_performed',
      `User performed action: ${action}`,
      userId,
      'user@example.com', // Get from your auth system
      {
        action,
        data,
        result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      },
      request.headers.get('x-forwarded-for'),
      request.headers.get('user-agent')
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    // Log the error
    await logSystemActivity(
      'api_error',
      `API error in user action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        endpoint: '/api/user/action',
        error: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      },
      request.headers.get('x-forwarded-for'),
      request.headers.get('user-agent')
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/

// ===== HOW TO INTEGRATE IN REACT COMPONENTS =====

/*
// Example: In your React component
const UserDashboard = () => {
  const handleUserAction = async (actionData) => {
    try {
      const response = await fetch('/api/user/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      if (response.ok) {
        // Activity logging is handled in the API route
        // Debug log removed
      } else {
        console.error('Action failed');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Note: Page visit logging is better handled in API routes
  // to avoid spamming logs and ensure proper authentication

  return <div>Your component JSX here</div>;
};
*/

// ===== UTILITY FUNCTIONS FOR COMMON PATTERNS =====

/*
// Utility functions you can create in your modules
import { logActivity } from '../activity';

// Generic function for logging CRUD operations
export const logCrudOperation = async (
  operation: 'create' | 'read' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  entityName: string,
  user: any,
  metadata: any = {}
) => {
  const operationDescriptions = {
    create: `Created ${entityType}: ${entityName}`,
    read: `Viewed ${entityType}: ${entityName}`,
    update: `Updated ${entityType}: ${entityName}`,
    delete: `Deleted ${entityType}: ${entityName}`
  };

  await logUserActivity(
    `${entityType}_${operation}`,
    operationDescriptions[operation],
    user._id.toString(),
    user.email,
    {
      entityType,
      entityId,
      entityName,
      operation,
      ...metadata
    }
  );
};

// Function for logging permission changes
export const logPermissionChange = async (
  targetUser: any,
  permission: string,
  action: 'granted' | 'revoked',
  changedBy: any,
  reason?: string
) => {
  const activityType = changedBy.role === 'admin' ? logAdminActivity : logUserActivity;

  await activityType(
    'permission_changed',
    `Permission "${permission}" ${action} for user ${targetUser.email}`,
    changedBy._id.toString(),
    changedBy.email,
    targetUser._id.toString(),
    targetUser.email,
    {
      permission,
      action,
      reason,
      changedAt: new Date().toISOString()
    }
  );
};
*/

export { }; // Make this a module
