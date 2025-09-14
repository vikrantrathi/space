# Activity Logging System Guide

## Overview
This guide explains how to implement consistent activity logging across all modules in the application. Activity logging helps track user actions, admin actions, and system events for auditing, debugging, and analytics.

## 🏗️ Architecture

```
📁 Activity Logging System
├── 📄 lib/activity.ts                    # Main activity service
├── 📄 lib/models/Activity.ts            # Database schema
├── 📄 app/api/admin/activities/         # API endpoints
└── 📄 app/dashboard/admin/activities/   # Admin management UI
```

## 📋 Steps to Add Activity Logging

### Step 1: Update Database Schema (if adding new activity types)
**File:** `lib/models/Activity.ts`

```typescript
export interface IActivity extends Document {
  type: 'user_signup' | 'user_login' | 'profile_approved' | 'profile_rejected' |
        'user_activated' | 'user_deactivated' | 'email_sent' | 'password_reset' |
        'admin_action' | 'email_verification' |
        // Add your new type here
        'your_new_activity_type';
  // ... rest of interface
}

const ActivitySchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'user_signup', 'user_login', 'profile_approved', 'profile_rejected',
      'user_activated', 'user_deactivated', 'email_sent', 'password_reset',
      'admin_action', 'email_verification',
      // Add your new type here
      'your_new_activity_type'
    ],
  },
  // ... rest of schema
});
```

### Step 2: Import Activity Service
**In your module file:**

```typescript
import { logActivity, logUserActivity, logAdminActivity, logSystemActivity } from '../../../lib/activity';
```

### Step 3: Add Activity Logging to Your Functions
**In your API routes or business logic:**

```typescript
// Example: User registration
export const registerUser = async (userData: any, ipAddress?: string, userAgent?: string) => {
  try {
    // Your registration logic here
    const newUser = await User.create(userData);

    // Log the activity
    await logUserActivity(
      'user_signup',
      `User ${userData.email} registered successfully`,
      newUser._id.toString(),
      userData.email,
      {
        registrationMethod: 'email',
        userRole: userData.role
      },
      ipAddress,
      userAgent
    );

    return { success: true, user: newUser };
  } catch (error) {
    // Log failed registration attempt
    await logSystemActivity(
      'user_signup',
      `Failed registration attempt for ${userData.email}`,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: userData.email
      },
      ipAddress,
      userAgent
    );

    throw error;
  }
};
```

## 🎯 Best Practices

### 1. Activity Type Naming Convention
- Use lowercase with underscores: `user_login`, `profile_update`, `project_created`
- Be descriptive and specific: `password_reset_requested`, `admin_user_deactivated`
- Group related activities: `project_created`, `project_updated`, `project_deleted`

### 2. Description Format
- Start with action subject: "User john@example.com logged in"
- Include key identifiers: "Project 'Website Redesign' was created"
- Be concise but informative: "Password reset email sent to user@example.com"

### 3. Metadata Usage
```typescript
// Good: Include relevant context
metadata: {
  projectId: '12345',
  projectName: 'Website Redesign',
  oldStatus: 'draft',
  newStatus: 'in_progress',
  changedBy: 'admin@example.com'
}

// Avoid: Including sensitive data
metadata: {
  password: 'secret123', // ❌ Never log sensitive data
  creditCard: '4111111111111111' // ❌ Never log sensitive data
}
```

### 4. Error Handling
```typescript
try {
  // Your business logic
  await performAction();

  // Log success
  await logUserActivity('action_completed', 'Action completed successfully', userId, userEmail);
} catch (error) {
  // Log failure with error details
  await logUserActivity(
    'action_failed',
    `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    userId,
    userEmail,
    { errorDetails: error }
  );

  throw error;
}
```

### 5. IP Address and User Agent
```typescript
// Extract from request
const ipAddress = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';

const userAgent = request.headers.get('user-agent') || 'unknown';

// Use in activity logging
await logUserActivity('user_login', 'User logged in', userId, userEmail, {}, ipAddress, userAgent);
```

## 📝 Common Activity Types

### Authentication & User Management
- `user_signup` - User registration
- `user_login` - User login
- `user_logout` - User logout
- `password_reset` - Password reset requested
- `email_verification` - Email verification sent
- `profile_updated` - User profile updated
- `account_deactivated` - User account deactivated

### Admin Actions
- `admin_action` - Generic admin action
- `user_activated` - Admin activated user
- `user_deactivated` - Admin deactivated user
- `profile_approved` - Admin approved profile
- `profile_rejected` - Admin rejected profile
- `role_changed` - User role changed by admin

### System Events
- `email_sent` - Email sent to user
- `system_backup` - System backup completed
- `maintenance_mode` - Maintenance mode enabled/disabled
- `security_alert` - Security-related event

## 🔧 Advanced Features

### Conditional Logging
```typescript
// Only log in production or for specific users
if (process.env.NODE_ENV === 'production' || user.role === 'admin') {
  await logAdminActivity('admin_action', 'Admin performed critical action', adminId, adminEmail);
}
```

### Bulk Activity Logging
```typescript
// Log multiple related activities
const activities = [
  { type: 'project_created', description: 'Project created', metadata: { projectId } },
  { type: 'team_assigned', description: 'Team assigned to project', metadata: { projectId, teamId } },
  { type: 'notification_sent', description: 'Notifications sent to team', metadata: { projectId } }
];

for (const activity of activities) {
  await logUserActivity(activity.type, activity.description, userId, userEmail, activity.metadata);
}
```

### Activity Chains
```typescript
// Log a sequence of related activities
await logUserActivity('checkout_started', 'User started checkout', userId, userEmail, { cartId });
await logUserActivity('payment_processed', 'Payment processed successfully', userId, userEmail, { orderId, amount });
await logUserActivity('order_confirmed', 'Order confirmed and email sent', userId, userEmail, { orderId });
```

## 📊 Integration Examples

### Express/Next.js API Route
```typescript
export async function POST(request: NextRequest) {
  const { userId, action } = await request.json();

  try {
    // Your business logic
    await performAction(userId, action);

    // Log success
    await logUserActivity(
      'action_performed',
      `User performed action: ${action}`,
      userId,
      'user@example.com', // Get from auth context
      { action },
      request.headers.get('x-forwarded-for'),
      request.headers.get('user-agent')
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error
    await logUserActivity(
      'action_failed',
      `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userId,
      'user@example.com',
      { action, error: error instanceof Error ? error.message : 'Unknown' }
    );

    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
```

### React Component
```typescript
const handleUserAction = async (actionData: any) => {
  try {
    const response = await fetch('/api/user/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });

    if (response.ok) {
      // Activity logging is handled in the API route
      console.log('Action completed successfully');
    }
  } catch (error) {
    console.error('Action failed:', error);
  }
};
```

### Database Operation Hook
```typescript
// In your database models or services
const logDatabaseChange = async (operation: string, collection: string, documentId: string, userId?: string) => {
  await logActivity({
    type: 'database_operation',
    description: `${operation} performed on ${collection}`,
    userId,
    metadata: {
      operation,
      collection,
      documentId,
      timestamp: new Date().toISOString()
    }
  });
};
```

## 🚨 Important Notes

1. **Privacy**: Never log sensitive information (passwords, credit cards, personal data)
2. **Performance**: Activity logging should not block critical operations
3. **Consistency**: Use consistent naming and formatting across modules
4. **Monitoring**: Regularly review activity logs for security and debugging
5. **Retention**: Consider log retention policies for compliance

## 🐛 Troubleshooting

### Activities Not Appearing
1. Check if activity service is properly imported
2. Verify database connection
3. Check console for logging errors
4. Ensure activity type is in the enum

### Performance Issues
1. Make activity logging asynchronous (don't await if not critical)
2. Use batch logging for bulk operations
3. Consider log levels (debug, info, warn, error)

### Missing Context
1. Always include userId/userEmail for user actions
2. Include adminId/adminEmail for admin actions
3. Add relevant metadata for context

## 📚 Example Implementation

### User Authentication Module
```typescript
// lib/auth/activities.ts
import { logUserActivity, logSystemActivity } from '../activity';

export const logUserLogin = async (user: any, ipAddress: string, userAgent: string) => {
  await logUserActivity(
    'user_login',
    `User ${user.email} logged in successfully`,
    user._id.toString(),
    user.email,
    {
      loginMethod: 'email',
      userRole: user.role,
      lastLogin: user.lastLogin
    },
    ipAddress,
    userAgent
  );
};

export const logFailedLogin = async (email: string, reason: string, ipAddress: string, userAgent: string) => {
  await logSystemActivity(
    'login_failed',
    `Failed login attempt for ${email}`,
    {
      email,
      reason,
      attemptCount: 1 // Could increment in your rate limiting logic
    },
    ipAddress,
    userAgent
  );
};
```

### Project Management Module
```typescript
// lib/project/activities.ts
import { logUserActivity, logAdminActivity } from '../activity';

export const logProjectCreated = async (project: any, user: any) => {
  await logUserActivity(
    'project_created',
    `Project "${project.name}" created by ${user.name}`,
    user._id.toString(),
    user.email,
    {
      projectId: project._id.toString(),
      projectName: project.name,
      projectType: project.type,
      teamSize: project.teamMembers?.length || 0
    }
  );
};

export const logProjectStatusChanged = async (project: any, oldStatus: string, newStatus: string, changedBy: any) => {
  const activityType = changedBy.role === 'admin' ? logAdminActivity : logUserActivity;

  await activityType(
    'project_status_changed',
    `Project "${project.name}" status changed from ${oldStatus} to ${newStatus}`,
    changedBy._id.toString(),
    changedBy.email,
    {
      projectId: project._id.toString(),
      projectName: project.name,
      oldStatus,
      newStatus,
      changedAt: new Date().toISOString()
    }
  );
};
```

This ensures consistent, comprehensive activity logging across your entire application! 🎯