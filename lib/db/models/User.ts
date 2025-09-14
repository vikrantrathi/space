import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../../../types/user';

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  password?: string; // Optional for OAuth users
  role: UserRole;
  profilePicture?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'pending_approval' | 'pending_verification' | 'rejected';
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  // Admin action audit fields
  deactivatedAt?: Date;
  deactivatedBy?: string;
  reactivatedAt?: Date;
  reactivatedBy?: string;
  reapprovedAt?: Date;
  reapprovedBy?: string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for OAuth
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client',
  },
  profilePicture: {
    type: String,
    required: false,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_approval', 'pending_verification', 'rejected'],
    default: 'pending_approval', // New users need approval
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedAt: {
    type: Date,
    required: false,
  },
  approvedBy: {
    type: String,
    required: false,
  },
  rejectedAt: {
    type: Date,
    required: false,
  },
  rejectedBy: {
    type: String,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  lastLoginAt: {
    type: Date,
    required: false,
  },
  lastLoginIP: {
    type: String,
    required: false,
  },
  // Admin action audit fields
  deactivatedAt: {
    type: Date,
    required: false,
  },
  deactivatedBy: {
    type: String,
    required: false,
  },
  reactivatedAt: {
    type: Date,
    required: false,
  },
  reactivatedBy: {
    type: String,
    required: false,
  },
  reapprovedAt: {
    type: Date,
    required: false,
  },
  reapprovedBy: {
    type: String,
    required: false,
  },
  verificationToken: {
    type: String,
    required: false,
  },
  verificationTokenExpiry: {
    type: Date,
    required: false,
  },
  createdBy: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Create indexes
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
