import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db/mongodb';
import Quotation from '../../../../../lib/db/models/Quotation';
import StandardContent from '../../../../../lib/db/models/StandardContent';
import { authMiddleware } from '../../../../../lib/auth/auth-middleware';

interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Try to authenticate user (optional for public access)
    let user = null;
    try {
      const authResult = authMiddleware(request);
      if (!authResult) {
        user = (request as AuthenticatedRequest).user;
      }
    } catch (error) {
      // Authentication failed, treat as public access
      user = null;
    }

    // Connect to database
    await connectToDatabase();

    const { id } = await params;

    // Get quotation by ID
    const quotation = await Quotation.findById(id)
      .populate('associatedUser', 'name email');

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Get standard content for fallback data - force fresh data
    const standardContent = await StandardContent.findOne({})
      .lean()
      .select('+defaultFeatures +defaultBenefits +companyDetails +defaultTerms +processSteps +processVideo +testimonials +previousWork +createdAt +updatedAt');

    // Check access permissions
    const isOwner = user && (
      quotation.clientEmail === user.email ||
      quotation.associatedUser?._id.toString() === user.userId
    );

    const isAdmin = user && user.role === 'admin';

    // Allow access if:
    // 1. User is admin (can see all quotations)
    // 2. User is owner AND quotation is not draft
    // 3. Quotation is sent, revision, accepted, or rejected (public access)
    if (!isAdmin && !isOwner && quotation.status !== 'sent' && quotation.status !== 'revision' && quotation.status !== 'accepted' && quotation.status !== 'rejected') {
      return NextResponse.json({ error: 'Quotation not available' }, { status: 404 });
    }
    
    // Even owners cannot access draft quotations (only admins can)
    if (isOwner && !isAdmin && quotation.status === 'draft') {
      return NextResponse.json({ error: 'Quotation not available' }, { status: 404 });
    }

    // Create default standard content if none exists
    const defaultStandardContent = {
      companyDetails: {
        name: 'STARTUPZILA',
        email: 'contact@startupzila.com',
        phone: '+91 98765 43210',
        website: 'www.startupzila.com',
        tagline: 'Premium Digital Solutions & Innovation Partner',
        featuresDescription: 'Complete feature set designed to exceed your expectations',
        benefitsDescription: 'The advantages that set us apart from the competition',
        pricingDescription: 'Complete project delivery with ongoing support',
        termsDescription: 'Important information about our service agreement',
        ctaDescription: 'Let\'s transform your vision into reality together'
      },
      defaultFeatures: [
        'Responsive Web Design',
        'Modern UI/UX',
        'Cross-browser Compatibility',
        'SEO Optimized',
        'Fast Loading Speed'
      ],
      defaultBenefits: [
        'Professional and Modern Design',
        'Mobile-First Approach',
        'Search Engine Friendly',
        'Fast Performance',
        'Easy to Maintain'
      ],
      defaultTerms: `1. Payment terms: 50% advance, 50% on completion
2. Project timeline: As discussed and agreed upon
3. Revisions: Up to 3 rounds of revisions included
4. Delivery: Final files delivered upon full payment
5. Support: 30 days post-delivery support included`,
      processSteps: [
        {
          step: 1,
          title: 'Requirement Analysis',
          description: 'Understanding your business needs and project requirements'
        },
        {
          step: 2,
          title: 'Design & Planning',
          description: 'Creating wireframes and design mockups'
        },
        {
          step: 3,
          title: 'Development',
          description: 'Building the solution with latest technologies'
        },
        {
          step: 4,
          title: 'Testing & Launch',
          description: 'Quality assurance and deployment'
        }
      ],
      testimonials: [
        {
          name: 'John Smith',
          company: 'Tech Innovators',
          message: 'Outstanding work! The team delivered exactly what we needed.',
          rating: 5
        },
        {
          name: 'Sarah Johnson',
          company: 'Digital Solutions',
          message: 'Professional service and excellent communication throughout.',
          rating: 5
        }
      ],
      previousWork: [
        {
          title: 'E-commerce Platform',
          description: 'Complete e-commerce solution with payment integration',
          image: 'https://via.placeholder.com/300x200',
          link: '#'
        },
        {
          title: 'Business Dashboard',
          description: 'Analytics dashboard for business intelligence',
          image: 'https://via.placeholder.com/300x200',
          link: '#'
        }
      ]
    };

    // Use standard content from database or default
    const effectiveStandardContent = standardContent || defaultStandardContent;

    // Return raw quotation data without merging - let components handle merging
    const rawQuotationData = {
      _id: quotation._id,
      title: quotation.title,
      backgroundImage: quotation.coverImage,
      features: quotation.features,
      benefits: quotation.benefits,
      pricing: quotation.quantityPricing,
      terms: quotation.terms,
      templateType: quotation.templateType,
      currency: quotation.currency || 'USD',
      status: quotation.status,
      createdAt: quotation.createdAt,
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientPhone: quotation.clientPhone,
      clientCompany: quotation.clientCompany,
      clientAddress: quotation.clientAddress,
      country: quotation.country,
      projectDescription: quotation.projectDescription,
      projectDeadline: quotation.projectDeadline,
      paymentTerms: quotation.paymentTerms,
      quotationValidity: quotation.quotationValidity,
      // Return raw company details - no merging here
      companyDetails: quotation.companyDetails,
      // Dashboard template fields
      quotationNo: quotation.quotationNo,
      quotationDate: quotation.quotationDate,
      expirationDate: quotation.expirationDate,
      quantityPricing: quotation.quantityPricing,
      projectTimeline: quotation.projectTimeline,
      paymentMilestones: quotation.paymentMilestones,
      processSteps: quotation.processSteps,
      processVideo: quotation.processVideo,
      testimonials: quotation.testimonials,
      previousWork: quotation.previousWork,
      coverImage: quotation.coverImage,
      coverTitle: quotation.coverTitle,
      statusTimeline: quotation.statusTimeline,
      actions: quotation.actions,
    };

    
    return NextResponse.json({
      quotation: rawQuotationData,
      standardContent: standardContent, // Also return standard content separately
      standardContentUsed: !standardContent // Debug info
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}