import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTemplate extends Document {
  _id: string;
  name: string;
  type: string; // 'welcome', 'approval', 'rejection', 'otp', 'password_reset', 'admin_notification', 'profile_submitted', 'reapproval'
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[]; // Array of variable names like ['{{name}}', '{{email}}']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

const EmailTemplateSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['welcome', 'approval', 'rejection', 'otp', 'password_reset', 'admin_notification', 'profile_submitted', 'reapproval', 'admin_user_verification'],
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: false,
  },
  variables: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: false,
  },
  updatedBy: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Create indexes
EmailTemplateSchema.index({ type: 1 });
EmailTemplateSchema.index({ isActive: 1 });

// Force model recompilation to ensure schema changes take effect
if (mongoose.models.EmailTemplate) {
  delete mongoose.models.EmailTemplate;
}

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
