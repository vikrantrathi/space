# Email Template System Guide

## Overview
This guide explains how to properly extend the email template system while maintaining centralized control and automatic seeding.

## 🏗️ Architecture

```
📁 Email Template System
├── 📄 lib/defaultEmailTemplates.ts     # All default templates
├── 📄 lib/models/EmailTemplate.ts      # Database schema
├── 📄 lib/email.ts                     # Email service
├── 📄 app/api/admin/email-templates/   # API endpoints
└── 📄 app/dashboard/settings/          # Admin management UI
```

## 📋 Steps to Add New Email Templates

### Step 1: Update Database Schema
**File:** `lib/models/EmailTemplate.ts`

```typescript
type: {
  type: String,
  required: true,
  enum: [
    // Existing types...
    'welcome', 'approval', 'rejection', 'otp', 'password_reset',
    'admin_notification', 'profile_submitted', 'reapproval',
    // Add your new type here
    'your_new_template_type'
  ],
},
```

### Step 2: Add Template to Default Templates
**File:** `lib/defaultEmailTemplates.ts`

```typescript
{
  name: 'Your Template Name',
  type: 'your_new_template_type',
  subject: 'Your Email Subject {{variable}}',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Your Template Title</h1>
      <p>Dear {{name}},</p>
      <p>Your message content with {{variables}}.</p>
      <p>Best regards,<br>Your Team</p>
    </div>
  `,
  textContent: `
    Your Template Title

    Dear {{name}},

    Your message content with {{variables}}.

    Best regards,
    Your Team
  `,
  variables: ['{{name}}', '{{variable}}'],
}
```

### Step 3: Use in Your Module
**File:** `your-module/api/route.ts` or `your-module/page.tsx`

```typescript
import { sendEmailTemplate } from '../../../lib/email';

// In your API route or component
const result = await sendEmailTemplate({
  to: user.email,
  templateType: 'your_new_template_type',
  variables: {
    name: user.name,
    variable: 'custom value'
  }
});
```

## 🎯 Best Practices

### 1. Template Naming Convention
- Use lowercase with underscores: `password_reset`, `profile_approval`
- Be descriptive: `project_invitation`, `payment_failed`

### 2. Variable Naming
- Use double curly braces: `{{name}}`, `{{email}}`, `{{projectName}}`
- Keep consistent across templates
- Document all variables in the template

### 3. HTML Structure
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1890ff;">Title</h1>
  <p>Content with {{variables}}</p>
  <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <p>Additional content</p>
  </div>
</div>
```

### 4. Error Handling
```typescript
try {
  await sendEmailTemplate({
    to: email,
    templateType: 'your_template',
    variables: { name: 'User' }
  });
} catch (error) {
  console.error('Email sending failed:', error);
  // Handle error appropriately
}
```

## 📝 Common Template Types

### Authentication
- `welcome` - User registration confirmation
- `password_reset` - Password reset instructions
- `email_verification` - Email verification
- `account_locked` - Account security alert

### User Management
- `profile_approved` - Profile approval notification
- `profile_rejected` - Profile rejection with reason
- `role_changed` - User role update
- `account_deactivated` - Account deactivation

### Business Logic
- `project_invitation` - Invite to project
- `task_assigned` - Task assignment
- `deadline_reminder` - Upcoming deadline
- `payment_receipt` - Payment confirmation

## 🔧 Advanced Features

### Conditional Templates
```typescript
// Check if template exists before sending
const template = await EmailTemplate.findOne({
  type: 'your_template',
  isActive: true
});

if (template) {
  await sendEmailTemplate({ ... });
}
```

### Bulk Email Sending
```typescript
const users = await User.find({ active: true });
const emailPromises = users.map(user =>
  sendEmailTemplate({
    to: user.email,
    templateType: 'newsletter',
    variables: { name: user.name }
  })
);

await Promise.allSettled(emailPromises);
```

### Template Variables with Defaults
```typescript
const variables = {
  name: user.name || 'Valued User',
  company: process.env.COMPANY_NAME || 'Our Company',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
};
```

## 🚨 Important Notes

1. **Automatic Seeding**: New templates are automatically added to the database when accessed
2. **Centralized Management**: All templates managed from admin settings
3. **Version Control**: Template changes are tracked in code
4. **Type Safety**: TypeScript ensures correct variable usage
5. **Validation**: Schema validation prevents invalid templates

## 🐛 Troubleshooting

### Template Not Appearing
1. Check if type is added to enum in `EmailTemplate.ts`
2. Verify template is in `defaultEmailTemplates.ts`
3. Restart development server if schema changed
4. Check console logs for seeding errors

### Email Not Sending
1. Verify template exists and is active
2. Check email service configuration
3. Validate all required variables are provided
4. Check email service logs

### Variables Not Replacing
1. Ensure variables use double curly braces: `{{name}}`
2. Check variable names match exactly
3. Verify variables object is passed correctly

## 📚 Example Implementation

### Adding a Project Invitation Template

1. **Update Schema:**
```typescript
enum: [..., 'project_invitation']
```

2. **Add Template:**
```typescript
{
  name: 'Project Invitation',
  type: 'project_invitation',
  subject: 'You\'re invited to join {{projectName}}',
  htmlContent: `...`,
  textContent: `...`,
  variables: ['{{name}}', '{{projectName}}', '{{inviterName}}']
}
```

3. **Use in Code:**
```typescript
await sendEmailTemplate({
  to: invitee.email,
  templateType: 'project_invitation',
  variables: {
    name: invitee.name,
    projectName: project.name,
    inviterName: inviter.name
  }
});
```

This ensures all email templates remain centralized, maintainable, and automatically seeded! 🎉