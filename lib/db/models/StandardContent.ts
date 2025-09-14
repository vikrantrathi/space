import mongoose, { Schema, Document } from 'mongoose';

export interface IStandardContent extends Document {
  _id: mongoose.Types.ObjectId;
  companyDetails: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    website: string;
    tagline?: string;
    featuresDescription?: string;
    benefitsDescription?: string;
    pricingDescription?: string;
    termsDescription?: string;
    ctaDescription?: string;
  };
  defaultFeatures: string[];
  defaultBenefits: string[];
  defaultTerms: string;
  processSteps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  processVideo?: string;
  testimonials: Array<{
    name: string;
    company: string;
    message: string;
    rating: number;
    avatar: string;
  }>;
  previousWork: Array<{
    title: string;
    description: string;
    image: string;
    link?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StandardContentSchema: Schema = new Schema({
  companyDetails: {
    name: { type: String, required: true },
    logo: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, required: true },
    tagline: { type: String },
    featuresDescription: { type: String },
    benefitsDescription: { type: String },
    pricingDescription: { type: String },
    termsDescription: { type: String },
    ctaDescription: { type: String }
  },
  defaultFeatures: [{ type: String }],
  defaultBenefits: [{ type: String }],
  defaultTerms: { type: String, required: true },
  processSteps: [{
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  processVideo: { type: String },
  testimonials: [{
    name: { type: String, required: true },
    company: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    avatar: { type: String, required: true }
  }],
  previousWork: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String }
  }],
}, {
  timestamps: true,
});

// Clear the model cache to prevent stale data issues
if (mongoose.models.StandardContent) {
  delete mongoose.models.StandardContent;
}

export default mongoose.model<IStandardContent>('StandardContent', StandardContentSchema);