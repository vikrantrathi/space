import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTemplate extends Document {
  _id: string;
  name: string;
  type: string; // Can be any custom type like 'custom_welcome', 'marketing_promo', etc.
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
    trim: true,
    // Removed enum validation to allow custom types
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
