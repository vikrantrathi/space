import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  features: string[]; // Page 2
  benefits: string[]; // Page 3
  terms?: string[]; // Page 5
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revision';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  clientAddress?: string;
  country?: string;
  projectDescription?: string;
  projectDeadline?: string;
  paymentTerms?: string;
  quotationValidity?: number; // Validity period in days
  associatedUser?: mongoose.Types.ObjectId; // Reference to User model
  templateType: 'landing' | 'dashboard';
  currency: 'USD' | 'INR';
  // Dashboard template specific fields
  quotationNo?: string;
  quotationDate?: Date;
  expirationDate?: Date;
  companyDetails?: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    website: string;
  };
  quantityPricing?: Array<{
    item: string;
    description?: string;
    quantity: number;
    price: number;
    discountPercentage?: number;
    discountedPrice?: number;
    taxPercentage?: number;
    taxAmount?: number;
    subtotal: number;
    total: number;
  }>;
  projectTimeline?: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  paymentMilestones?: Array<{
    milestone: string;
    percentage: number;
    amount: number;
    dueDate: Date;
  }>;
  processSteps?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  processVideo?: string;
  statusTimeline?: Array<{
    status: string;
    date: Date;
    description: string;
  }>;
  testimonials?: Array<{
    name: string;
    company: string;
    message: string;
    rating: number;
    avatar?: string;
  }>;
  previousWork?: Array<{
    title: string;
    description: string;
    image: string;
    link?: string;
  }>;
  coverImage?: string;
  coverTitle?: string;
  actions: Array<{
    action: 'accept' | 'reject' | 'revision';
    reason?: string;
    timestamp: Date;
    verified: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema: Schema = new Schema({
  title: { type: String, required: true },
  features: [{ type: String }],
  benefits: [{ type: String }],
  terms: [{ type: String }],
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected', 'revision'], default: 'draft' },
  clientName: { type: String },
  clientEmail: { type: String },
  clientPhone: { type: String },
  clientCompany: { type: String },
  clientAddress: { type: String },
  country: { type: String },
  projectDescription: { type: String },
  projectDeadline: { type: String },
  paymentTerms: { type: String },
  quotationValidity: { type: Number, min: 1, max: 365 }, // Validity period in days (1-365)
  associatedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  templateType: { type: String, enum: ['landing', 'dashboard'], required: true, default: 'landing' },
  currency: { type: String, enum: ['USD', 'INR'], required: true, default: 'USD' },
  quotationNo: { type: String },
  quotationDate: { type: Date, default: Date.now },
  expirationDate: { type: Date },
  companyDetails: {
    name: { type: String },
    logo: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String }
  },
  quantityPricing: [{
    item: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    discountedPrice: { type: Number },
    taxPercentage: { type: Number, default: 0 },
    taxAmount: { type: Number },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  projectTimeline: [{
    phase: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true }
  }],
  paymentMilestones: [{
    milestone: { type: String, required: true },
    percentage: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true }
  }],
  processSteps: [{
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  processVideo: { type: String },
  statusTimeline: [{
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true }
  }],
  testimonials: [{
    name: { type: String, required: true },
    company: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    avatar: { type: String }
  }],
  previousWork: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String }
  }],
  coverImage: { type: String },
  coverTitle: { type: String },
  actions: [{
    action: { type: String, enum: ['accept', 'reject', 'revision'], required: true },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
}, {
  timestamps: true,
});

// In dev, Next.js hot-reloads can keep an old compiled model around without new fields.
// Ensure the model is refreshed so newly added schema paths (e.g., clientAddress, country, projectDeadline)
// are actually persisted instead of being stripped by strict mode.
if (mongoose.models.Quotation) {
  delete mongoose.models.Quotation;
}

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);
