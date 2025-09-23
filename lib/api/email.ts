import nodemailer from 'nodemailer';
import connectToDatabase from '../db/mongodb';
import EmailTemplate from '../db/models/EmailTemplate';
import { logSystemActivity } from '../utils/activity';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to render template with variables
const renderTemplate = (template: string, variables: Record<string, string>): string => {
  let rendered = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    rendered = rendered.replace(regex, value);
  });
  return rendered;
};

// Function to get active template by type
const getActiveTemplate = async (type: string) => {
  try {
    await connectToDatabase();
    const template = await EmailTemplate.findOne({ type, isActive: true });
    return template;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
};

export const sendOTPEmail = async (email: string, otp: string, name?: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_otp');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name || 'User',
        '{{otp}}': otp,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Your OTP for Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">Startupzila Space</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h3>Your One-Time Password (OTP)</h3>
            <div style="font-size: 32px; font-weight: bold; color: #1890ff; margin: 20px 0; letter-spacing: 4px;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `OTP email sent to ${email}`,
      {
        templateType: 'auth_otp',
        recipient: email,
        recipientName: name || 'User',
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_welcome');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
        '{{email}}': email,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Welcome to Startupzila Space!';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">Welcome to Startupzila Space!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name}!</h3>
            <p>Thank you for joining Startupzila Space. Your account has been successfully created and verified.</p>
            <p>You can now access your dashboard and start managing your projects.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard"
                 style="background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Welcome email sent to ${email}`,
      {
        templateType: 'auth_welcome',
        recipient: email,
        recipientName: name,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendApprovalEmail = async (email: string, name: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_approval');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Profile Approved - Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #52c41a; text-align: center;">Profile Approved!</h2>
          <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name}!</h3>
            <p>Congratulations! Your profile has been approved by our admin team.</p>
            <p>You can now log in to your Startupzila Space dashboard and access all features.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/auth/login"
                 style="background: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Log In Now
              </a>
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Approval email sent to ${email}`,
      {
        templateType: 'auth_approval',
        recipient: email,
        recipientName: name,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
};

export const sendRejectionEmail = async (email: string, name: string, reason?: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_rejection');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
        '{{reason}}': reason || 'Profile rejected by admin',
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Profile Status Update - Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff4d4f; text-align: center;">Profile Status Update</h2>
          <div style="background: #fff2f0; border: 1px solid #ffccc7; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name},</h3>
            <p>We regret to inform you that your profile application has not been approved at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>Please contact our support team if you have any questions or would like to reapply.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:support@startupzila.com"
                 style="background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Contact Support
              </a>
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Rejection email sent to ${email}`,
      {
        templateType: 'auth_rejection',
        recipient: email,
        recipientName: name,
        reason: reason || 'Not specified',
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return false;
  }
};

export const sendProfileSubmittedEmail = async (email: string, name: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_profile_submitted');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Profile Submitted for Approval - Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">Profile Submitted Successfully!</h2>
          <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name}!</h3>
            <p>Thank you for registering with Startupzila Space. Your profile has been successfully submitted and is now under review by our admin team.</p>
            <div style="background: #fff; border: 1px solid #d9d9d9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1890ff;">What happens next?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our admin team will review your profile</li>
                <li>You'll receive an email notification once the review is complete</li>
                <li>If approved, you'll be able to access your dashboard</li>
                <li>If additional information is needed, we'll contact you</li>
              </ul>
            </div>
            <p><strong>Estimated review time:</strong> 1-2 business days</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:support@startupzila.com"
                 style="background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Contact Support
              </a>
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Profile submitted email sent to ${email}`,
      {
        templateType: 'auth_profile_submitted',
        recipient: email,
        recipientName: name,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending profile submitted email:', error);
    return false;
  }
};

export const sendAdminUserVerificationEmail = async (email: string, name: string, token: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_admin_user_verification');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
        '{{email}}': email,
        '{{verificationLink}}': `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`,
        '{{token}}': token,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Complete Your Account Setup - Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">Welcome to Startupzila Space!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name}!</h3>
            <p>An administrator has created an account for you. To complete your account setup and start using the platform, please click the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${token}"
                 style="background: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Account Setup
              </a>
            </div>
            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              ${process.env.NEXTAUTH_URL}/verify-email?token=${token}
            </p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Admin user verification email sent to ${email}`,
      {
        templateType: 'auth_admin_user_verification',
        recipient: email,
        recipientName: name,
        verificationToken: token,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending admin user verification email:', error);
    return false;
  }
};

export const sendReApprovalEmail = async (email: string, name: string) => {
  try {
    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('auth_reapproval');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{name}}': name,
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = 'Profile Re-Approved - Startupzila Space';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #52c41a; text-align: center;">Profile Re-Approved!</h2>
          <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 20px; border-radius: 8px;">
            <h3>Hello ${name}!</h3>
            <p>Great news! Your profile has been re-approved by our admin team after the previous review.</p>
            <p>You can now log in to your Startupzila Space dashboard and access all features.</p>
            <div style="background: #fff; border: 1px solid #d9d9d9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #52c41a;">What you can do now:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Access your dashboard</li>
                <li>Update your profile information</li>
                <li>Explore all available features</li>
                <li>Connect with other members</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/auth/login"
                 style="background: #52c41a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Log In Now
              </a>
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from Startupzila Space. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Re-approval email sent to ${email}`,
      {
        templateType: 'auth_reapproval',
        recipient: email,
        recipientName: name,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending re-approval email:', error);
    return false;
  }
};

export const sendQuotationEmail = async (options: {
  to: string;
  clientName: string;
  quotationTitle: string;
  quotationId: string;
  quotationUrl: string;
  companyName?: string;
  isRevision?: boolean;
}) => {
  try {
    const { to, clientName, quotationTitle, quotationId, quotationUrl, companyName, isRevision = false } = options;

    // Try to get template, fallback to default if not found
    const template = await getActiveTemplate('quotation');

    let subject: string;
    let htmlContent: string;

    if (template) {
      // Use template
      const variables: Record<string, string> = {
        '{{clientName}}': clientName,
        '{{quotationTitle}}': quotationTitle,
        '{{quotationId}}': quotationId,
        '{{quotationUrl}}': quotationUrl,
        '{{companyName}}': companyName || 'Our Company',
      };

      subject = renderTemplate(template.subject, variables);
      htmlContent = renderTemplate(template.htmlContent, variables);
    } else {
      // Fallback to default
      subject = isRevision ? `Revised Quotation: ${quotationTitle}` : `Quotation: ${quotationTitle}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">${isRevision ? 'Revised Quotation Available' : 'New Quotation Available'}</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Hello ${clientName}!</h3>
            <p>${isRevision ? 'We have updated the quotation based on your feedback. Please review the revised details below:' : 'We have prepared a quotation for your review. Please find the details below:'}</p>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1890ff;">
              <h4 style="margin: 0 0 10px 0; color: #1890ff;">Quotation Details</h4>
              <p><strong>Title:</strong> ${quotationTitle}</p>
              <p><strong>Reference ID:</strong> ${quotationId}</p>
              ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${quotationUrl}"
                 style="background: #1890ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                ${isRevision ? 'View Revised Quotation' : 'View Quotation'}
              </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">Next Steps:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>Review the quotation details</li>
                <li>Accept, reject, or request revisions</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>

            <p>If you have any questions or need clarification, please don't hesitate to contact our team.</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from ${companyName || 'Our Company'}. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Quotation email sent to ${options.to}`,
      {
        templateType: 'quotation',
        recipient: options.to,
        recipientName: options.clientName,
        quotationTitle: options.quotationTitle,
        quotationId: options.quotationId,
        sentAt: new Date().toISOString()
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending quotation email:', error);
    return false;
  }
};

/**
 * Generic function to send email using any template type
 * This is the recommended way to send emails for new templates
 */
export const sendEmailTemplate = async (options: {
  to: string;
  templateType: string;
  variables: Record<string, string>;
  from?: string;
}) => {
  try {
    const { to, templateType, variables, from } = options;

    // Get the template
    const template = await getActiveTemplate(templateType);

    if (!template) {
      throw new Error(`No active template found for type: ${templateType}`);
    }

    // Render subject and content with variables
    const subject = renderTemplate(template.subject, variables);
    const htmlContent = renderTemplate(template.htmlContent, variables);
    const textContent = template.textContent
      ? renderTemplate(template.textContent, variables)
      : undefined;

    const mailOptions = {
      from: from || process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log email activity
    await logSystemActivity(
      'email_sent',
      `Email sent using template "${templateType}" to ${to}`,
      {
        templateType,
        recipient: to,
        messageId: info.messageId,
        sentAt: new Date().toISOString()
      }
    );
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email with template "${options.templateType}":`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Helper function to create and register a new email template
 * Use this in your modules to add new templates programmatically
 */
export const createEmailTemplate = async (templateData: {
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  createdBy?: string;
}) => {
  try {
    await connectToDatabase();

    // Check if template type exists in enum (this will throw if invalid)
    const testTemplate = new EmailTemplate({
      ...templateData,
      isActive: false, // Don't activate until validated
    });

    // If validation passes, save the template
    const savedTemplate = await testTemplate.save();
    // Debug log removed
    return { success: true, template: savedTemplate };
  } catch (error) {
    console.error(`❌ Error creating email template:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
