import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  _id: string;
  email: string;
  code: string;
  expires: Date;
  used: boolean;
  attempts: number; // Track failed attempts
  type: 'signup' | 'login' | 'quotation_action'; // Type of OTP
  signupData?: string; // JSON string containing signup data
  quotationData?: string; // JSON string for quotation actions
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
  },
  code: {
    type: String,
    required: true,
    length: 6,
    match: [/^\d{6}$/, 'OTP must be exactly 6 digits'],
  },
  expires: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  used: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 OTP attempts allowed'],
  },
  type: {
    type: String,
    enum: ['signup', 'login', 'quotation_action'],
    default: 'signup',
  },
  signupData: {
    type: String,
    required: false,
    validate: {
      validator: function(value?: string) {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'signupData must be valid JSON'
    }
  },
  quotationData: {
    type: String,
    required: false,
    validate: {
      validator: function(value?: string) {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'quotationData must be valid JSON'
    }
  },
}, {
  timestamps: true,
});

// Create indexes
OTPSchema.index({ email: 1 });
OTPSchema.index({ code: 1 }, { unique: true }); // Ensure unique OTP codes
OTPSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
OTPSchema.index({ email: 1, used: 1 }); // Compound index for quick lookups
OTPSchema.index({ createdAt: 1 }); // For rate limiting queries

// Static method for validation
OTPSchema.statics.validateOTP = function(code: string): boolean {
  return /^\d{6}$/.test(code);
};

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
