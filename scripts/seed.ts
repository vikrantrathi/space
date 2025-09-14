/*
  Seed script: inserts StandardContent (if missing) and 10 dummy Quotations
  Usage: ts-node scripts/seed.ts  (ensure MONGODB_URI in env)
*/

import dotenv from 'dotenv';
// Prefer .env.local (Next.js convention), fall back to .env
dotenv.config({ path: '.env.local' });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}
import mongoose from 'mongoose';
import StandardContent from '../lib/db/models/StandardContent';
import Quotation from '../lib/db/models/Quotation';

async function upsertStandardContent() {
  const existing = await StandardContent.findOne({});
  if (existing) {
    // Debug log removed
    return existing;
  }

  const standard = await StandardContent.create({
    companyDetails: {
      name: 'Acme Corp',
      email: 'sales@acme.test',
      phone: '+1 555-0100',
      website: 'https://acme.test',
      logo: 'https://via.placeholder.com/120x40?text=ACME',
      tagline: 'Premium Digital Solutions & Innovation Partner',
      featuresDescription: 'Complete feature set designed to exceed your expectations',
      benefitsDescription: 'The advantages that set us apart from the competition',
      pricingDescription: 'Complete project delivery with ongoing support',
      termsDescription: 'Important information about our service agreement',
      ctaDescription: 'Let\'s transform your vision into reality together'
    },
    defaultFeatures: [
      'Responsive UI',
      'Authentication',
      'Admin Dashboard',
      'REST API',
      'Email Notifications'
    ],
    defaultBenefits: [
      'Faster Go-To-Market',
      'Scalable Architecture',
      'Great Developer Experience',
      'Secure by default'
    ],
    defaultTerms: '1) 50% advance, 50% on completion. 2) 30 days support.',
    processSteps: [
      { step: 1, title: 'Discovery', description: 'Understand requirements and goals' },
      { step: 2, title: 'Design', description: 'Wireframes and UI design' },
      { step: 3, title: 'Development', description: 'Build features iteratively' },
      { step: 4, title: 'Testing & Launch', description: 'QA and deployment' },
    ],
    testimonials: [
      { name: 'Jane Doe', company: 'Globex', message: 'Great team and delivery!', rating: 5 },
      { name: 'John Roe', company: 'Initech', message: 'Highly recommended.', rating: 5 },
    ],
    previousWork: [
      { title: 'SaaS Dashboard', description: 'Analytics dashboard', image: 'https://via.placeholder.com/640x360', link: 'https://example.com' },
      { title: 'E-commerce', description: 'Storefront and checkout', image: 'https://via.placeholder.com/640x360' },
    ],
  });

  // Debug log removed
  return standard;
}

function randomPick<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function seedQuotations(count = 10) {
  const std = await StandardContent.findOne({});
  const titles = [
    'Website Revamp',
    'Mobile App MVP',
    'Marketing Landing Pages',
    'Internal Tools Suite',
    'E-commerce Build',
    'CRM Integration',
    'Analytics Dashboard',
    'Design System Setup',
    'Payment Gateway Integration',
    'Customer Portal'
  ];
  const clients = [
    { name: 'Alpha Ltd', email: 'alpha@test.dev' },
    { name: 'Beta LLC', email: 'beta@test.dev' },
    { name: 'Gamma Inc', email: 'gamma@test.dev' },
    { name: 'Delta Co', email: 'delta@test.dev' },
  ];

  for (let i = 0; i < count; i++) {
    const t = titles[i % titles.length];
    const c = clients[i % clients.length];

    const features = std?.defaultFeatures?.length ? randomPick(std.defaultFeatures, Math.min(4, std.defaultFeatures.length)) : ['Feature A', 'Feature B'];
    const benefits = std?.defaultBenefits?.length ? randomPick(std.defaultBenefits, Math.min(3, std.defaultBenefits.length)) : ['Benefit A', 'Benefit B'];
    const processSteps = std?.processSteps?.length ? std.processSteps : [];
    const testimonials = std?.testimonials?.length ? std.testimonials : [];
    const previousWork = std?.previousWork?.length ? std.previousWork : [];
    const companyDetails = std?.companyDetails;

    const doc = await Quotation.create({
      title: `${t} – Proposal`,
      templateType: 'landing',
      features,
      benefits,
      pricing: 'Base: $3,000\nAdd-ons available on request',
      terms: std?.defaultTerms || 'Standard terms apply',
      status: i % 3 === 0 ? 'sent' : 'draft',
      clientName: c.name,
      clientEmail: c.email,
      projectDescription: 'Project to deliver value quickly with best practices.',
      paymentTerms: '50% advance, 50% on completion',
      quotationValidity: 30, // 30 days validity
      companyDetails,
      processSteps,
      testimonials,
      previousWork,
      quotationNo: `Q-${Date.now()}-${i}`,
      quotationDate: new Date(),
    });
    // Debug log removed
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  const { default: connectToDatabase } = await import('../lib/db/mongodb');
  await connectToDatabase();
  await upsertStandardContent();
  await seedQuotations(10);
  await mongoose.connection.close();
  // Debug log removed
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});


