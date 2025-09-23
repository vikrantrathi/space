/**
 * Default Email Templates Configuration
 *
 * To add a new email template:
 * 1. Add the template type to EmailTemplate model enum
 * 2. Add template here with proper structure
 * 3. Template will be automatically seeded
 * 4. Use in your module with EmailService.sendTemplate()
 */

export const defaultTemplates = [
  // ===== AUTHENTICATION TEMPLATES =====
  {
    name: 'Welcome Email',
    type: 'auth_welcome',
    subject: 'Welcome to Startupzila Space!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1890ff;">Welcome to Startupzila Space!</h1>
        <p>Dear {{name}},</p>
        <p>Welcome to Startupzila Space! We're excited to have you join our community.</p>
        <p>Your account has been created successfully with the email: <strong>{{email}}</strong></p>
        <p>You can now access your dashboard and start managing your projects.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your profile</li>
            <li>Explore available projects</li>
            <li>Connect with team members</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Welcome to Startupzila Space!

      Dear {{name}},

      Welcome to Startupzila Space! We're excited to have you join our community.

      Your account has been created successfully with the email: {{email}}

      You can now access your dashboard and start managing your projects.

      Next Steps:
      - Complete your profile
      - Explore available projects
      - Connect with team members

      If you have any questions, feel free to contact our support team.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}', '{{email}}'],
  },
  {
    name: 'Profile Approval',
    type: 'auth_approval',
    subject: 'Your Profile Has Been Approved!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #52c41a;">Profile Approved! 🎉</h1>
        <p>Dear {{name}},</p>
        <p>Great news! Your profile has been reviewed and approved by our admin team.</p>
        <p>You can now fully access all features of Startupzila Space:</p>
        <div style="background-color: #f6ffed; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #52c41a;">
          <h3>✅ What you can do now:</h3>
          <ul>
            <li>Access your full dashboard</li>
            <li>Create and manage projects</li>
            <li>Collaborate with team members</li>
            <li>Access all platform features</li>
          </ul>
        </div>
        <p>Welcome aboard! We're excited to have you as part of our community.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Profile Approved! 🎉

      Dear {{name}},

      Great news! Your profile has been reviewed and approved by our admin team.

      You can now fully access all features of Startupzila Space:

      ✅ What you can do now:
      - Access your full dashboard
      - Create and manage projects
      - Collaborate with team members
      - Access all platform features

      Welcome aboard! We're excited to have you as part of our community.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}'],
  },
  {
    name: 'Profile Rejection',
    type: 'auth_rejection',
    subject: 'Profile Review Update',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d4f;">Profile Review Update</h1>
        <p>Dear {{name}},</p>
        <p>Thank you for your interest in Startupzila Space.</p>
        <p>After careful review, we regret to inform you that your profile application has been rejected.</p>
        <div style="background-color: #fff2f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ff4d4f;">
          <h3>Reason for rejection:</h3>
          <p>{{reason}}</p>
        </div>
        <p>If you believe this decision was made in error or if you have additional information to provide, please contact our support team.</p>
        <p>You can also apply again after addressing the concerns mentioned above.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Profile Review Update

      Dear {{name}},

      Thank you for your interest in Startupzila Space.

      After careful review, we regret to inform you that your profile application has been rejected.

      Reason for rejection:
      {{reason}}

      If you believe this decision was made in error or if you have additional information to provide, please contact our support team.

      You can also apply again after addressing the concerns mentioned above.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}', '{{reason}}'],
  },
  {
    name: 'OTP Verification',
    type: 'auth_otp',
    subject: 'Your Verification Code',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1890ff;">Verify Your Email</h1>
        <p>Dear {{name}},</p>
        <p>Please use the following 6-digit code to verify your email address:</p>
        <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #1890ff;">
          <h2 style="color: #1890ff; font-size: 32px; letter-spacing: 8px; margin: 0;">{{otp}}</h2>
        </div>
        <p>This code will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Verify Your Email

      Dear {{name}},

      Please use the following 6-digit code to verify your email address:

      {{otp}}

      This code will expire in 10 minutes for security reasons.

      If you didn't request this verification, please ignore this email.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}', '{{otp}}'],
  },
  {
    name: 'Password Reset',
    type: 'auth_password_reset',
    subject: 'Reset Your Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #faad14;">Reset Your Password</h1>
        <p>Dear {{name}},</p>
        <p>We received a request to reset your password for your Startupzila Space account.</p>
        <p>If you made this request, click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" style="background-color: #faad14; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Reset Your Password

      Dear {{name}},

      We received a request to reset your password for your Startupzila Space account.

      If you made this request, visit the following link to reset your password:
      {{resetLink}}

      This link will expire in 1 hour for security reasons.

      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}', '{{resetLink}}'],
  },
  {
    name: 'Admin Notification',
    type: 'auth_admin_notification',
    subject: 'New User Registration Alert',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #722ed1;">New User Registration</h1>
        <p>A new user has registered and requires approval:</p>
        <div style="background-color: #f9f0ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #722ed1;">
          <h3>User Details:</h3>
          <p><strong>Name:</strong> {{name}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Registration Date:</strong> {{date}}</p>
        </div>
        <p>Please review this application in the admin dashboard and take appropriate action.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{adminLink}}" style="background-color: #722ed1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review in Admin Panel</a>
        </div>
        <p>Best regards,<br>Startupzila Space System</p>
      </div>
    `,
    textContent: `
      New User Registration

      A new user has registered and requires approval:

      User Details:
      Name: {{name}}
      Email: {{email}}
      Registration Date: {{date}}

      Please review this application in the admin dashboard and take appropriate action.

      Review in Admin Panel: {{adminLink}}

      Best regards,
      Startupzila Space System
    `,
    variables: ['{{name}}', '{{email}}', '{{date}}', '{{adminLink}}'],
  },
  {
    name: 'Profile Submitted',
    type: 'auth_profile_submitted',
    subject: 'Profile Submitted for Approval - Startupzila Space',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1890ff;">Profile Submitted Successfully! ✅</h1>
        <p>Dear {{name}},</p>
        <p>Thank you for registering with Startupzila Space. Your profile has been successfully submitted and is now under review by our admin team.</p>
        <div style="background-color: #f6ffed; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #52c41a;">
          <h3>What happens next?</h3>
          <ul>
            <li>Our admin team will review your profile</li>
            <li>You'll receive an email notification once the review is complete</li>
            <li>If approved, you'll be able to access your dashboard</li>
            <li>If additional information is needed, we'll contact you</li>
          </ul>
        </div>
        <div style="background-color: #e6f7ff; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1890ff;">
          <p style="margin: 0;"><strong>⏱️ Estimated review time:</strong> 1-2 business days</p>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:support@startupzila.com" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
        </div>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Profile Submitted Successfully! ✅

      Dear {{name}},

      Thank you for registering with Startupzila Space. Your profile has been successfully submitted and is now under review by our admin team.

      What happens next?
      - Our admin team will review your profile
      - You'll receive an email notification once the review is complete
      - If approved, you'll be able to access your dashboard
      - If additional information is needed, we'll contact you

      ⏱️ Estimated review time: 1-2 business days

      If you have any questions, please don't hesitate to contact our support team.

      Contact Support: support@startupzila.com

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}'],
  },
  {
    name: 'Profile Re-Approval',
    type: 'auth_reapproval',
    subject: 'Profile Re-Approved - Startupzila Space',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #52c41a;">Profile Re-Approved! 🎉</h1>
        <p>Dear {{name}},</p>
        <p>Great news! Your profile has been re-approved by our admin team after the previous review.</p>
        <p>You can now log in to your Startupzila Space dashboard and access all features.</p>
        <div style="background-color: #f6ffed; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #52c41a;">
          <h3>✅ What you can do now:</h3>
          <ul>
            <li>Access your dashboard</li>
            <li>Update your profile information</li>
            <li>Explore all available features</li>
            <li>Connect with other members</li>
            <li>Start or join projects</li>
          </ul>
        </div>
        <p>We appreciate your patience during the review process and look forward to your active participation in our community.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/auth/login" style="background-color: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In Now</a>
        </div>
        <p>Welcome back to Startupzila Space!</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Profile Re-Approved! 🎉

      Dear {{name}},

      Great news! Your profile has been re-approved by our admin team after the previous review.

      You can now log in to your Startupzila Space dashboard and access all features.

      ✅ What you can do now:
      - Access your dashboard
      - Update your profile information
      - Explore all available features
      - Connect with other members
      - Start or join projects

      We appreciate your patience during the review process and look forward to your active participation in our community.

      Log In Now: ${process.env.NEXTAUTH_URL}/auth/login

      Welcome back to Startupzila Space!

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}'],
  },
  {
    name: 'Admin User Verification',
    type: 'auth_admin_user_verification',
    subject: 'Complete Your Account Setup - Startupzila Space',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1890ff;">Welcome to Startupzila Space!</h1>
        <p>Dear {{name}},</p>
        <p>An administrator has created an account for you on Startupzila Space. To complete your account setup and start using the platform, please verify your email address.</p>
        <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1890ff;">
          <h3>Complete Your Account Setup</h3>
          <p>Click the button below to verify your email and set up your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationLink}}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Setup</a>
          </div>
          <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
        </div>
        <div style="background-color: #fff2f0; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #ff4d4f;">
          <p style="margin: 0;"><strong>Security Note:</strong> If you didn't expect this email, please contact our support team immediately.</p>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 12px;">{{verificationLink}}</p>
        <p>Once you complete your setup, you'll be able to:</p>
        <ul>
          <li>Access your personal dashboard</li>
          <li>Manage your projects and tasks</li>
          <li>Connect with team members</li>
          <li>Use all platform features</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Startupzila Space Team</p>
      </div>
    `,
    textContent: `
      Welcome to Startupzila Space!

      Dear {{name}},

      An administrator has created an account for you on Startupzila Space. To complete your account setup and start using the platform, please verify your email address.

      Complete Your Account Setup
      Click the link below to verify your email and set up your password:
      {{verificationLink}}

      Important: This link will expire in 24 hours for security reasons.

      Security Note: If you didn't expect this email, please contact our support team immediately.

      If the link doesn't work, you can copy and paste this URL into your browser:
      {{verificationLink}}

      Once you complete your setup, you'll be able to:
      - Access your personal dashboard
      - Manage your projects and tasks
      - Connect with team members
      - Use all platform features

      If you have any questions, please don't hesitate to contact our support team.

      Best regards,
      The Startupzila Space Team
    `,
    variables: ['{{name}}', '{{email}}', '{{verificationLink}}', '{{token}}'],
  },
  // ===== QUOTATION TEMPLATES =====
  {
    name: 'Quotation Sent',
    type: 'quotation_sent',
    subject: 'Your Quotation is Ready - {{quotationTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1890ff;">Your Quotation is Ready! 📋</h1>
        <p>Dear {{clientName}},</p>
        <p>We're excited to share your personalized quotation for <strong>{{quotationTitle}}</strong>.</p>
        <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1890ff;">
          <h3>📋 Quotation Details:</h3>
          <p><strong>Project:</strong> {{quotationTitle}}</p>
          <p><strong>Quotation #:</strong> {{quotationNumber}}</p>
          <p><strong>Valid Until:</strong> {{validUntil}}</p>
          <p><strong>Total Amount:</strong> {{totalAmount}}</p>
        </div>
        <p>Please review the quotation carefully and let us know your decision. You can:</p>
        <ul>
          <li>✅ Accept the quotation if everything looks good</li>
          <li>⚠️ Request changes if you need modifications</li>
          <li>❌ Reject if it doesn't meet your requirements</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{quotationLink}}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Quotation</a>
        </div>
        <p>If you have any questions or need clarification on any aspect of the quotation, please don't hesitate to contact us.</p>
        <p>Best regards,<br>{{companyName}} Team</p>
      </div>
    `,
    textContent: `
      Your Quotation is Ready! 📋

      Dear {{clientName}},

      We're excited to share your personalized quotation for {{quotationTitle}}.

      📋 Quotation Details:
      Project: {{quotationTitle}}
      Quotation #: {{quotationNumber}}
      Valid Until: {{validUntil}}
      Total Amount: {{totalAmount}}

      Please review the quotation carefully and let us know your decision. You can:
      - ✅ Accept the quotation if everything looks good
      - ⚠️ Request changes if you need modifications
      - ❌ Reject if it doesn't meet your requirements

      View Quotation: {{quotationLink}}

      If you have any questions or need clarification on any aspect of the quotation, please don't hesitate to contact us.

      Best regards,
      {{companyName}} Team
    `,
    variables: ['{{clientName}}', '{{quotationTitle}}', '{{quotationNumber}}', '{{validUntil}}', '{{totalAmount}}', '{{quotationLink}}', '{{companyName}}'],
  },
  {
    name: 'Quotation Accepted',
    type: 'quotation_accepted',
    subject: 'Quotation Accepted - {{quotationTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #52c41a;">Quotation Accepted! 🎉</h1>
        <p>Dear {{clientName}},</p>
        <p>Thank you for accepting our quotation for <strong>{{quotationTitle}}</strong>!</p>
        <div style="background-color: #f6ffed; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #52c41a;">
          <h3>✅ Next Steps:</h3>
          <ul>
            <li>Our team will contact you within 24 hours to discuss project details</li>
            <li>We'll provide you with a detailed project timeline</li>
            <li>Payment instructions will be sent separately</li>
            <li>Project kickoff meeting will be scheduled</li>
          </ul>
        </div>
        <div style="background-color: #e6f7ff; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1890ff;">
          <p style="margin: 0;"><strong>📋 Quotation Details:</strong></p>
          <p style="margin: 5px 0;"><strong>Project:</strong> {{quotationTitle}}</p>
          <p style="margin: 5px 0;"><strong>Quotation #:</strong> {{quotationNumber}}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> {{totalAmount}}</p>
        </div>
        <p>We're excited to work with you on this project and look forward to delivering exceptional results!</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>{{companyName}} Team</p>
      </div>
    `,
    textContent: `
      Quotation Accepted! 🎉

      Dear {{clientName}},

      Thank you for accepting our quotation for {{quotationTitle}}!

      ✅ Next Steps:
      - Our team will contact you within 24 hours to discuss project details
      - We'll provide you with a detailed project timeline
      - Payment instructions will be sent separately
      - Project kickoff meeting will be scheduled

      📋 Quotation Details:
      Project: {{quotationTitle}}
      Quotation #: {{quotationNumber}}
      Total Amount: {{totalAmount}}

      We're excited to work with you on this project and look forward to delivering exceptional results!

      If you have any questions, please don't hesitate to contact us.

      Best regards,
      {{companyName}} Team
    `,
    variables: ['{{clientName}}', '{{quotationTitle}}', '{{quotationNumber}}', '{{totalAmount}}', '{{companyName}}'],
  },
  {
    name: 'Quotation Rejected',
    type: 'quotation_rejected',
    subject: 'Quotation Feedback - {{quotationTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff4d4f;">Quotation Feedback Received</h1>
        <p>Dear {{clientName}},</p>
        <p>Thank you for your feedback regarding our quotation for <strong>{{quotationTitle}}</strong>.</p>
        <div style="background-color: #fff2f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ff4d4f;">
          <h3>Your Feedback:</h3>
          <p style="font-style: italic;">"{{rejectionReason}}"</p>
        </div>
        <p>We understand that our initial proposal didn't meet your expectations, and we appreciate you taking the time to provide feedback.</p>
        <div style="background-color: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1890ff;">
          <h3>💡 How We Can Help:</h3>
          <ul>
            <li>We can revise the quotation based on your feedback</li>
            <li>We can discuss alternative approaches to meet your needs</li>
            <li>We can provide a completely new proposal</li>
            <li>We can schedule a call to better understand your requirements</li>
          </ul>
        </div>
        <p>We're committed to providing you with the best solution for your project. Please let us know if you'd like us to:</p>
        <ul>
          <li>Revise the current quotation</li>
          <li>Create a new proposal</li>
          <li>Schedule a discussion call</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:{{companyEmail}}" style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Us</a>
        </div>
        <p>Thank you for considering our services, and we hope to have the opportunity to work with you in the future.</p>
        <p>Best regards,<br>{{companyName}} Team</p>
      </div>
    `,
    textContent: `
      Quotation Feedback Received

      Dear {{clientName}},

      Thank you for your feedback regarding our quotation for {{quotationTitle}}.

      Your Feedback:
      "{{rejectionReason}}"

      We understand that our initial proposal didn't meet your expectations, and we appreciate you taking the time to provide feedback.

      💡 How We Can Help:
      - We can revise the quotation based on your feedback
      - We can discuss alternative approaches to meet your needs
      - We can provide a completely new proposal
      - We can schedule a call to better understand your requirements

      We're committed to providing you with the best solution for your project. Please let us know if you'd like us to:
      - Revise the current quotation
      - Create a new proposal
      - Schedule a discussion call

      Contact Us: {{companyEmail}}

      Thank you for considering our services, and we hope to have the opportunity to work with you in the future.

      Best regards,
      {{companyName}} Team
    `,
    variables: ['{{clientName}}', '{{quotationTitle}}', '{{rejectionReason}}', '{{companyEmail}}', '{{companyName}}'],
  },
  {
    name: 'Quotation Revision Requested',
    type: 'quotation_revision_requested',
    subject: 'Revision Request Received - {{quotationTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #fa8c16;">Revision Request Received 📝</h1>
        <p>Dear {{clientName}},</p>
        <p>Thank you for your revision request for <strong>{{quotationTitle}}</strong>. We've received your feedback and will work on updating the quotation accordingly.</p>
        <div style="background-color: #fff7e6; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fa8c16;">
          <h3>📝 Your Revision Request:</h3>
          <p style="font-style: italic;">"{{revisionReason}}"</p>
        </div>
        <div style="background-color: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1890ff;">
          <h3>⏱️ What Happens Next:</h3>
          <ul>
            <li>Our team will review your revision request</li>
            <li>We'll update the quotation based on your feedback</li>
            <li>You'll receive the revised quotation within 1-2 business days</li>
            <li>We'll notify you once the revision is ready for review</li>
          </ul>
        </div>
        <p>We appreciate your patience as we work to incorporate your requested changes. Our goal is to provide you with a quotation that perfectly matches your requirements.</p>
        <p>If you have any additional questions or need to clarify anything about your revision request, please don't hesitate to contact us.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:{{companyEmail}}" style="background-color: #fa8c16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Us</a>
        </div>
        <p>Thank you for your continued interest in our services!</p>
        <p>Best regards,<br>{{companyName}} Team</p>
      </div>
    `,
    textContent: `
      Revision Request Received 📝

      Dear {{clientName}},

      Thank you for your revision request for {{quotationTitle}}. We've received your feedback and will work on updating the quotation accordingly.

      📝 Your Revision Request:
      "{{revisionReason}}"

      ⏱️ What Happens Next:
      - Our team will review your revision request
      - We'll update the quotation based on your feedback
      - You'll receive the revised quotation within 1-2 business days
      - We'll notify you once the revision is ready for review

      We appreciate your patience as we work to incorporate your requested changes. Our goal is to provide you with a quotation that perfectly matches your requirements.

      If you have any additional questions or need to clarify anything about your revision request, please don't hesitate to contact us.

      Contact Us: {{companyEmail}}

      Thank you for your continued interest in our services!

      Best regards,
      {{companyName}} Team
    `,
    variables: ['{{clientName}}', '{{quotationTitle}}', '{{revisionReason}}', '{{companyEmail}}', '{{companyName}}'],
  },
  {
    name: 'Quotation Revision Sent',
    type: 'quotation_revision_sent',
    subject: 'Revised Quotation Ready - {{quotationTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #52c41a;">Revised Quotation Ready! ✏️</h1>
        <p>Dear {{clientName}},</p>
        <p>Great news! We've updated your quotation for <strong>{{quotationTitle}}</strong> based on your revision request.</p>
        <div style="background-color: #f6ffed; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #52c41a;">
          <h3>✅ What's Updated:</h3>
          <p>We've incorporated your requested changes and updated the quotation accordingly. The revised quotation now reflects your specific requirements and feedback.</p>
        </div>
        <div style="background-color: #e6f7ff; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1890ff;">
          <p style="margin: 0;"><strong>📋 Revised Quotation Details:</strong></p>
          <p style="margin: 5px 0;"><strong>Project:</strong> {{quotationTitle}}</p>
          <p style="margin: 5px 0;"><strong>Quotation #:</strong> {{quotationNumber}}</p>
          <p style="margin: 5px 0;"><strong>Valid Until:</strong> {{validUntil}}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> {{totalAmount}}</p>
        </div>
        <p>Please review the revised quotation and let us know your decision. You can now:</p>
        <ul>
          <li>✅ Accept the revised quotation</li>
          <li>⚠️ Request additional changes if needed</li>
          <li>❌ Reject if it still doesn't meet your requirements</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{quotationLink}}" style="background-color: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Revised Quotation</a>
        </div>
        <p>We're confident that the revised quotation now better aligns with your project needs. If you have any questions about the changes or need further clarification, please don't hesitate to contact us.</p>
        <p>Best regards,<br>{{companyName}} Team</p>
      </div>
    `,
    textContent: `
      Revised Quotation Ready! ✏️

      Dear {{clientName}},

      Great news! We've updated your quotation for {{quotationTitle}} based on your revision request.

      ✅ What's Updated:
      We've incorporated your requested changes and updated the quotation accordingly. The revised quotation now reflects your specific requirements and feedback.

      📋 Revised Quotation Details:
      Project: {{quotationTitle}}
      Quotation #: {{quotationNumber}}
      Valid Until: {{validUntil}}
      Total Amount: {{totalAmount}}

      Please review the revised quotation and let us know your decision. You can now:
      - ✅ Accept the revised quotation
      - ⚠️ Request additional changes if needed
      - ❌ Reject if it still doesn't meet your requirements

      View Revised Quotation: {{quotationLink}}

      We're confident that the revised quotation now better aligns with your project needs. If you have any questions about the changes or need further clarification, please don't hesitate to contact us.

      Best regards,
      {{companyName}} Team
    `,
    variables: ['{{clientName}}', '{{quotationTitle}}', '{{quotationNumber}}', '{{validUntil}}', '{{totalAmount}}', '{{quotationLink}}', '{{companyName}}'],
  },
];
