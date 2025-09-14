import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  _id: string;
  type: 'user_signup' | 'user_login' | 'profile_approved' | 'profile_rejected' | 'user_activated' | 'user_deactivated' | 'email_sent' | 'password_reset' | 'admin_action' | 'email_verification' | 'admin_create_user' | 'user_verified' | 'password_changed' | 'profile_updated' | 'avatar_updated' | 'quotation_viewed' | 'quotation_action';
  description: string;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  adminEmail?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['user_signup', 'user_login', 'profile_approved', 'profile_rejected', 'user_activated', 'user_deactivated', 'email_sent', 'password_reset', 'admin_action', 'email_verification', 'admin_create_user', 'user_verified', 'password_changed', 'profile_updated', 'avatar_updated', 'quotation_viewed', 'quotation_action'],
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: false,
  },
  adminId: {
    type: String,
    required: false,
  },
  adminEmail: {
    type: String,
    required: false,
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Create indexes
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ adminId: 1 });
ActivitySchema.index({ createdAt: -1 });

// Force model recompilation by deleting existing model
if (mongoose.models.Activity) {
  delete mongoose.models.Activity;
}

export default mongoose.model<IActivity>('Activity', ActivitySchema);
