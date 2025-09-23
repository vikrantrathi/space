/**
 * Centralized Notification Messages
 * 
 * This file contains all notification messages used across the application.
 * Modify messages here to update them everywhere in the codebase.
 */

export const NOTIFICATION_MESSAGES = {
  // Authentication Messages
  AUTH: {
    LOGOUT_SUCCESS: {
      message: 'Logged Out Successfully',
      description: 'You have been logged out.',
      duration: 2,
    },
    AUTHENTICATION_ERROR: {
      message: 'Authentication Error',
      description: 'No authentication token found. Please log in again.',
      duration: 4,
    },
    LOGIN_SUCCESS: {
      message: 'Login Successful',
      description: 'Welcome back! ',
      duration: 3,
    },
    SIGNUP_SUCCESS: {
      message: 'Account Created',
      description: 'Your account has been created successfully. Please verify your email.',
      duration: 4,
    },
    PASSWORD_RESET_SUCCESS: {
      message: 'Password Reset Successful',
      description: 'Your password has been reset successfully.',
      duration: 3,
    },
    OTP_SENT: {
      message: 'OTP Sent',
      description: 'A 6-digit code has been sent to your email address.',
      duration: 4,
    },
    OTP_RESENT: {
      message: 'OTP Resent',
      description: 'A new 6-digit code has been sent to your email.',
      duration: 3,
    },
    INVALID_OTP: {
      message: 'Invalid OTP',
      description: 'Please check the code and try again.',
      duration: 4,
    },
    OTP_RESEND_FAILED: {
      message: 'Failed to Resend OTP',
      description: 'Please try again in a few moments.',
      duration: 4,
    },
    ACCOUNT_PENDING_APPROVAL: {
      message: 'Account Pending Approval',
      description: 'Your account is waiting for admin approval. You will be notified once approved.',
      duration: 6,
    },
    ACCOUNT_REJECTED: {
      message: 'Account Rejected',
      description: 'Your account has been rejected. Please contact support for more information.',
      duration: 5,
    },
    ACCOUNT_DEACTIVATED: {
      message: 'Account Deactivated',
      description: 'Your account has been deactivated. Please contact support.',
      duration: 5,
    },
    LOGIN_FAILED: {
      message: 'Login Failed',
      description: 'Please check your credentials and try again.',
      duration: 4,
    },
    MFA_ENABLED: {
      message: 'MFA Enabled Successfully',
      description: 'Multi-factor authentication has been enabled. You will now need to verify with OTP when logging in.',
      duration: 6,
    },
    MFA_DISABLED: {
      message: 'MFA Disabled Successfully',
      description: 'Multi-factor authentication has been disabled. You will no longer need OTP verification for login.',
      duration: 6,
    },
  },

  // Email Template Messages
  EMAIL_TEMPLATES: {
    REFRESH_SUCCESS: {
      message: 'Templates Refreshed',
      description: 'Email templates have been refreshed successfully.',
      duration: 3,
    },
    FETCH_ERROR: {
      message: 'Failed to Fetch Templates',
      description: 'Unable to load email templates.',
      duration: 4,
    },
    FETCH_NETWORK_ERROR: {
      message: 'Error Fetching Templates',
      description: 'Network error occurred while loading templates.',
      duration: 4,
    },
    CREATE_SUCCESS: {
      message: 'Template Created',
      description: 'Email template has been created successfully.',
      duration: 4,
    },
    UPDATE_SUCCESS: {
      message: 'Template Updated',
      description: 'Email template has been updated successfully.',
      duration: 4,
    },
    SAVE_ERROR: {
      message: 'Failed to Save Template',
      description: 'Unable to save the email template.',
      duration: 4,
    },
    SAVE_NETWORK_ERROR: {
      message: 'Error Saving Template',
      description: 'Network error occurred while saving.',
      duration: 4,
    },
    ACTIVATE_SUCCESS: {
      message: 'Template Activated',
      description: 'Email template has been activated successfully.',
      duration: 3,
    },
    DEACTIVATE_SUCCESS: {
      message: 'Template Deactivated',
      description: 'Email template has been deactivated successfully.',
      duration: 3,
    },
    TOGGLE_ERROR: {
      message: 'Failed to Update Template',
      description: 'Unable to update template status.',
      duration: 4,
    },
    TOGGLE_NETWORK_ERROR: {
      message: 'Error Updating Template',
      description: 'Network error occurred while updating.',
      duration: 4,
    },
    EXPORT_SUCCESS: {
      message: 'Export Successful',
      description: 'Email templates exported to CSV successfully.',
      duration: 3,
    },
    EXPORT_ERROR: {
      message: 'Export Failed',
      description: 'Failed to export email templates. Please try again.',
      duration: 4,
    },
  },

  // Standard Content Messages
  STANDARD_CONTENT: {
    LOAD_ERROR: {
      message: 'Error Loading Standard Content',
      description: 'Network error occurred while loading standard content.',
      duration: 4,
    },
    UPDATE_SUCCESS: {
      message: 'Standard Content Updated',
      description: 'Standard content has been updated successfully.',
      duration: 4,
    },
    UPDATE_ERROR: {
      message: 'Failed to Update Standard Content',
      description: 'Unable to update standard content.',
      duration: 4,
    },
    UPDATE_NETWORK_ERROR: {
      message: 'Error Updating Standard Content',
      description: 'Network error occurred. Please try again.',
      duration: 4,
    },
  },

  // File Upload Messages
  FILE_UPLOAD: {
    INVALID_TYPE: {
      message: 'Invalid File Type',
      description: 'Only image files are allowed',
      duration: 3,
    },
    FILE_TOO_LARGE: {
      message: 'File Too Large',
      description: 'Image must be smaller than 10MB',
      duration: 3,
    },
    LOGO_UPLOAD_SUCCESS: {
      message: 'Logo Uploaded Successfully',
      description: 'Logo has been uploaded successfully',
      duration: 3,
    },
    AVATAR_UPLOAD_SUCCESS: {
      message: 'Avatar Uploaded Successfully',
      description: 'Avatar has been uploaded successfully',
      duration: 3,
    },
    IMAGE_UPLOAD_SUCCESS: {
      message: 'Image Uploaded Successfully',
      description: 'Image has been uploaded successfully',
      duration: 3,
    },
    UPLOAD_WARNING: {
      message: 'Upload Warning',
      description: 'Upload succeeded, but no URL returned',
      duration: 3,
    },
    LOGO_UPLOAD_ERROR: {
      message: 'Logo Upload Failed',
      description: 'Failed to upload logo',
      duration: 3,
    },
    AVATAR_UPLOAD_ERROR: {
      message: 'Avatar Upload Failed',
      description: 'Failed to upload avatar',
      duration: 3,
    },
    IMAGE_UPLOAD_ERROR: {
      message: 'Image Upload Failed',
      description: 'Failed to upload image',
      duration: 3,
    },
    UPLOAD_ERROR: {
      message: 'Upload Failed',
      description: 'Failed to upload file',
      duration: 3,
    },
  },

  // User Management Messages
  USERS: {
    FETCH_ERROR: {
      message: 'Failed to Fetch Users',
      description: 'Unable to load user data. Please try again.',
      duration: 4,
    },
    FETCH_NETWORK_ERROR: {
      message: 'Error Fetching Users',
      description: 'Network error occurred while loading users.',
      duration: 4,
    },
    ACTION_SUCCESS: {
      message: 'Action Successful',
      description: 'User action completed successfully.',
      duration: 3,
    },
    ACTION_ERROR: {
      message: 'Action Failed',
      description: 'Unable to complete the requested action.',
      duration: 4,
    },
    ACTION_NETWORK_ERROR: {
      message: 'Network Error',
      description: 'Network error occurred. Please try again.',
      duration: 4,
    },
    INVITATION_SUCCESS: {
      message: 'User Invitation Sent',
      description: 'An invitation has been sent to the user.',
      duration: 4,
    },
    WELCOME_EMAIL_SENT: {
      message: 'Welcome Email Sent',
      description: 'A welcome email has been sent to the new user.',
      duration: 3,
    },
    CREATE_ERROR: {
      message: 'Failed to Create User',
      description: 'Unable to create user.',
      duration: 4,
    },
    CREATE_NETWORK_ERROR: {
      message: 'Error Creating User',
      description: 'Network error occurred while creating user.',
      duration: 4,
    },
    REJECTION_REASON_REQUIRED: {
      message: 'Rejection Reason Required',
      description: 'Please provide a reason for rejecting the user.',
      duration: 3,
    },
    EXPORT_SUCCESS: {
      message: 'Export Successful',
      description: 'Users exported to CSV successfully.',
      duration: 3,
    },
    EXPORT_ERROR: {
      message: 'Export Failed',
      description: 'Failed to export users. Please try again.',
      duration: 4,
    },
  },

  // Quotation Messages
  QUOTATIONS: {
    FETCH_ERROR: {
      message: 'Failed to Fetch Quotations',
      description: 'Unable to load quotation data. Please try again.',
      duration: 4,
    },
    FETCH_NETWORK_ERROR: {
      message: 'Error Fetching Quotations',
      description: 'Network error occurred while loading quotations.',
      duration: 4,
    },
    CREATE_SUCCESS: {
      message: 'Quotation Created',
      description: 'Quotation has been created successfully.',
      duration: 4,
    },
    CREATE_ERROR: {
      message: 'Failed to Create Quotation',
      description: 'Unable to create quotation.',
      duration: 4,
    },
    CREATE_NETWORK_ERROR: {
      message: 'Error Creating Quotation',
      description: 'Network error occurred while creating quotation.',
      duration: 4,
    },
    UPDATE_SUCCESS: {
      message: 'Quotation Updated',
      description: 'Quotation has been updated successfully.',
      duration: 4,
    },
    UPDATE_ERROR: {
      message: 'Failed to Update Quotation',
      description: 'Unable to update quotation.',
      duration: 4,
    },
    UPDATE_NETWORK_ERROR: {
      message: 'Error Updating Quotation',
      description: 'Network error occurred while updating quotation.',
      duration: 4,
    },
    ACTION_SUCCESS: {
      message: 'Action Successful',
      description: 'Quotation action completed successfully.',
      duration: 3,
    },
    ACTION_ERROR: {
      message: 'Action Failed',
      description: 'Unable to complete the requested action.',
      duration: 4,
    },
    ACTION_NETWORK_ERROR: {
      message: 'Network Error',
      description: 'Network error occurred. Please try again.',
      duration: 4,
    },
    LINK_COPIED: {
      message: 'Link Copied',
      description: 'Public quotation link copied to clipboard.',
      duration: 2,
    },
    EXPORT_SUCCESS: {
      message: 'Export Successful',
      description: 'Quotations exported to CSV successfully.',
      duration: 3,
    },
    EXPORT_ERROR: {
      message: 'Export Failed',
      description: 'Failed to export quotations. Please try again.',
      duration: 4,
    },
  },

  // Activity Messages
  ACTIVITIES: {
    DELETE_SUCCESS: {
      message: 'Activities Deleted',
      description: 'Activities have been deleted successfully.',
      duration: 4,
    },
    DELETE_ERROR: {
      message: 'Delete Failed',
      description: 'Failed to delete activities.',
      duration: 4,
    },
    SINGLE_DELETE_SUCCESS: {
      message: 'Activity Deleted',
      description: 'The activity has been successfully deleted.',
      duration: 3,
    },
    SINGLE_DELETE_ERROR: {
      message: 'Delete Failed',
      description: 'Failed to delete the activity.',
      duration: 4,
    },
    FETCH_ERROR: {
      message: 'Failed to Load Activities',
      description: 'Unable to load your activity log.',
      duration: 4,
    },
    FETCH_NETWORK_ERROR: {
      message: 'Error Loading Activities',
      description: 'Network error occurred while loading activities.',
      duration: 4,
    },
  },

  // General Messages
  GENERAL: {
    SUCCESS: {
      message: 'Success',
      description: 'Operation completed successfully.',
      duration: 3,
    },
    ERROR: {
      message: 'Error',
      description: 'An error occurred. Please try again.',
      duration: 4,
    },
    NETWORK_ERROR: {
      message: 'Network Error',
      description: 'Network error occurred. Please check your connection.',
      duration: 4,
    },
    UNAUTHORIZED: {
      message: 'Unauthorized',
      description: 'You are not authorized to perform this action.',
      duration: 4,
    },
    NOT_FOUND: {
      message: 'Not Found',
      description: 'The requested resource was not found.',
      duration: 4,
    },
  },
} as const;

// Helper function to get message with dynamic values
export const getNotificationMessage = (
  category: keyof typeof NOTIFICATION_MESSAGES,
  key: string,
  dynamicValues?: Record<string, string | number>
) => {
  const categoryMessages = NOTIFICATION_MESSAGES[category] as Record<string, { message: string; description?: string; duration: number }>;
  const message = categoryMessages[key];
  
  if (!message) {
    console.warn(`Notification message not found: ${category}.${key}`);
    return NOTIFICATION_MESSAGES.GENERAL.ERROR;
  }

  if (dynamicValues) {
    return {
      ...message,
      message: replacePlaceholders(message.message, dynamicValues),
      description: message.description ? replacePlaceholders(message.description, dynamicValues) : undefined,
    };
  }

  return message;
};

// Helper function to replace placeholders in strings
const replacePlaceholders = (text: string, values: Record<string, string | number>): string => {
  return Object.entries(values).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, text);
};
