export interface Client {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export interface CreateQuotationFormData {
  title: string;
  templateType: 'landing' | 'dashboard';
  currency?: 'USD' | 'INR';
  features: string[];
  benefits: string[];
  terms?: string[];
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  clientAddress?: string;
  country?: string;
  projectDescription?: string;
  projectDeadline?: string;
  paymentTerms?: string;
  selectedClientId?: string;
  // Dashboard specific fields
  quotationNo?: string;
  quotationDate?: string;
  expirationDate?: string;
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
  paymentMilestones?: Array<{
    milestone: string;
    percentage: number;
    amount: number;
    dueDate?: string;
  }>;
  coverImage?: string;
}

export type PricingItem = NonNullable<CreateQuotationFormData['quantityPricing']>[number];
export type PaymentMilestone = NonNullable<CreateQuotationFormData['paymentMilestones']>[number];

export interface UploadResponse {
  url?: string;
  Location?: string;
  data?: {
    url?: string;
  };
  error?: string;
}

export interface StandardContentData {
  companyDetails: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    website: string;
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
  }>;
  previousWork: Array<{
    title: string;
    description: string;
    image: string;
    link?: string;
  }>;
}
