import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

// Register fonts - using default fonts for better compatibility
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2'
// });

interface CompanyDetails {
  name: string;
  tagline?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
}

interface ReactPDFOptions {
  quotation: IQuotation;
  companyDetails: CompanyDetails;
  standardContent?: IStandardContent;
  quotationUrl: string;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 25,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 35,
    paddingBottom: 25,
    borderBottomWidth: 4,
    borderBottomColor: '#2563eb',
    backgroundColor: '#f8fafc',
    padding: 25,
    borderRadius: 12,
    border: '2px solid #e2e8f0',
  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 20,
    fontWeight: '500',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
    pageBreakInside: 'avoid',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewGrid: {
    marginBottom: 20,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  overviewLabel: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 12,
    flex: 1,
  },
  overviewValue: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  contentBox: {
    backgroundColor: '#f8fafc',
    padding: 18,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    marginBottom: 18,
    border: '1px solid #e2e8f0',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 20,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
  },
  checkmark: {
    color: '#059669',
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
    backgroundColor: '#d1fae5',
    borderRadius: 50,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5,
    fontWeight: '500',
  },
  table: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: 12,
    fontSize: 12,
    flex: 1,
    color: '#374151',
    fontWeight: '500',
  },
  tableCellHeader: {
    padding: 12,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testimonial: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#0ea5e9',
    border: '1px solid #bae6fd',
  },
  testimonialText: {
    fontStyle: 'italic',
    marginBottom: 12,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 1.6,
    fontWeight: '500',
  },
  testimonialAuthor: {
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
  },
  testimonialRating: {
    color: '#f59e0b',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  timelinePhase: {
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineDuration: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 8,
    fontWeight: '500',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  clientInfo: {
    backgroundColor: '#f0fdf4',
    padding: 18,
    borderRadius: 10,
    marginBottom: 18,
    border: '1px solid #bbf7d0',
  },
  clientDetails: {
    marginBottom: 12,
  },
  clientDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #dcfce7',
  },
  clientLabel: {
    fontWeight: 'bold',
    color: '#166534',
    fontSize: 12,
    flex: 1,
  },
  clientValue: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  ctaSection: {
    backgroundColor: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: '#ffffff',
    padding: 25,
    borderRadius: 12,
    textAlign: 'center',
    marginBottom: 25,
    border: '2px solid #1e40af',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#ffffff',
  },
  ctaText: {
    fontSize: 15,
    marginBottom: 18,
    color: '#ffffff',
    lineHeight: 1.6,
    fontWeight: '500',
  },
  footer: {
    marginTop: 35,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  coverTitle: {
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 30,
    fontSize: 26,
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 10,
    border: '2px solid #e2e8f0',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#059669',
    fontSize: 13,
    backgroundColor: '#d1fae5',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  status: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: '#d1fae5',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  normalText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.6,
    fontWeight: '500',
  },
  boldText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 4,
  },
});

// Helper function to create star rating
const createStarRating = (rating: number) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

// Main PDF Document Component
const QuotationPDFDocument: React.FC<ReactPDFOptions> = ({ quotation, companyDetails, standardContent, quotationUrl }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyDetails.name}</Text>
          {companyDetails.tagline && (
            <Text style={styles.tagline}>{companyDetails.tagline}</Text>
          )}
          <View style={styles.contactInfo}>
            {companyDetails.email && <Text>📧 {companyDetails.email}</Text>}
            {companyDetails.phone && <Text>📞 {companyDetails.phone}</Text>}
            {companyDetails.website && <Text>🌐 {companyDetails.website}</Text>}
          </View>
        </View>

        {/* Cover Title */}
        {quotation.coverTitle && (
          <View style={styles.section}>
            <Text style={styles.coverTitle}>{quotation.coverTitle}</Text>
          </View>
        )}

        {/* Overview Section - Quotation Details, Client Information, Project Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          
          {/* Quotation Details */}
          <Text style={styles.subTitle}>Quotation Details</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Quotation Title:</Text>
              <Text style={styles.overviewValue}>{quotation.title || 'N/A'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Quotation Number:</Text>
              <Text style={styles.overviewValue}>{quotation.quotationNo || 'N/A'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Quotation Date:</Text>
              <Text style={styles.overviewValue}>
                {quotation.quotationDate?.toLocaleDateString() || new Date().toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Expiration Date:</Text>
              <Text style={styles.overviewValue}>
                {quotation.expirationDate?.toLocaleDateString() || 'N/A'}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Status:</Text>
              <Text style={[styles.overviewValue, styles.status]}>
                {quotation.status?.toUpperCase() || 'DRAFT'}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Currency:</Text>
              <Text style={styles.overviewValue}>{quotation.currency || 'INR'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Project Deadline:</Text>
              <Text style={styles.overviewValue}>{quotation.projectDeadline || 'N/A'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Validity (Days):</Text>
              <Text style={styles.overviewValue}>
                {quotation.quotationValidity ? `${quotation.quotationValidity} days` : 'N/A'}
              </Text>
            </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Total Amount:</Text>
            <Text style={[styles.overviewValue, styles.totalAmount]}>
              {quotation.quantityPricing && quotation.quantityPricing.length > 0
                ? `${quotation.currency || 'INR'} ${quotation.quantityPricing.reduce((sum, item) => sum + item.total, 0).toLocaleString()}`
                : 'N/A'
              }
            </Text>
          </View>
          </View>

          {/* Client Information */}
          <Text style={styles.subTitle}>Client Information</Text>
          <View style={styles.clientInfo}>
            <View style={styles.clientDetails}>
              {quotation.clientName && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Client Name:</Text>
                  <Text style={styles.clientValue}>{quotation.clientName}</Text>
                </View>
              )}
              {quotation.clientEmail && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Client Email:</Text>
                  <Text style={styles.clientValue}>{quotation.clientEmail}</Text>
                </View>
              )}
              {quotation.clientPhone && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Client Phone:</Text>
                  <Text style={styles.clientValue}>{quotation.clientPhone}</Text>
                </View>
              )}
              {quotation.clientCompany && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Company:</Text>
                  <Text style={styles.clientValue}>{quotation.clientCompany}</Text>
                </View>
              )}
              {quotation.clientAddress && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Address:</Text>
                  <Text style={styles.clientValue}>{quotation.clientAddress}</Text>
                </View>
              )}
              {quotation.country && (
                <View style={styles.clientDetail}>
                  <Text style={styles.clientLabel}>Country:</Text>
                  <Text style={styles.clientValue}>{quotation.country}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Project Description */}
          <Text style={styles.subTitle}>Project Description</Text>
          {quotation.projectDescription ? (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>{quotation.projectDescription}</Text>
            </View>
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>No project description provided.</Text>
            </View>
          )}
        </View>

        {/* Features & Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURES & BENEFITS</Text>
          
          {/* Quotation Features */}
          {quotation.features && quotation.features.length > 0 && (
            <>
              <Text style={styles.subTitle}>Key Features</Text>
              <View style={styles.featuresList}>
                {quotation.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Standard Content Features */}
          {standardContent?.defaultFeatures && standardContent.defaultFeatures.length > 0 && (
            <>
              <Text style={styles.subTitle}>Our Standard Features</Text>
              <View style={styles.featuresList}>
                {standardContent.defaultFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Quotation Benefits */}
          {quotation.benefits && quotation.benefits.length > 0 && (
            <>
              <Text style={styles.subTitle}>Key Benefits</Text>
              <View style={styles.featuresList}>
                {quotation.benefits.map((benefit, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Standard Content Benefits */}
          {standardContent?.defaultBenefits && standardContent.defaultBenefits.length > 0 && (
            <>
              <Text style={styles.subTitle}>Our Standard Benefits</Text>
              <View style={styles.featuresList}>
                {standardContent.defaultBenefits.map((benefit, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Company Descriptions */}
          {standardContent?.companyDetails?.featuresDescription && (
            <View style={[styles.contentBox, { backgroundColor: '#e3f2fd' }]}>
              <Text style={[styles.boldText, { color: '#007bff', marginBottom: 8 }]}>
                Why Choose Us
              </Text>
              <Text style={styles.normalText}>
                {standardContent.companyDetails.featuresDescription}
              </Text>
            </View>
          )}
          
          {standardContent?.companyDetails?.benefitsDescription && (
            <View style={[styles.contentBox, { backgroundColor: '#e8f5e8' }]}>
              <Text style={[styles.boldText, { color: '#28a745', marginBottom: 8 }]}>
                Our Benefits
              </Text>
              <Text style={styles.normalText}>
                {standardContent.companyDetails.benefitsDescription}
              </Text>
            </View>
          )}
          
          {/* Default content if no features/benefits */}
          {(!quotation.features || quotation.features.length === 0) && 
           (!quotation.benefits || quotation.benefits.length === 0) && 
           (!standardContent?.defaultFeatures || standardContent.defaultFeatures.length === 0) && 
           (!standardContent?.defaultBenefits || standardContent.defaultBenefits.length === 0) && (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                We provide comprehensive solutions tailored to your business needs. Our team of experts ensures quality delivery and exceptional customer service.
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Custom Development Solutions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>24/7 Technical Support</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Modern Technology Stack</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Scalable Architecture</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>SEO Optimized Solutions</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Project Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECT PRICING</Text>
          {quotation.quantityPricing && quotation.quantityPricing.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>Item</Text>
                <Text style={styles.tableCellHeader}>Description</Text>
                <Text style={styles.tableCellHeader}>Quantity</Text>
                <Text style={styles.tableCellHeader}>Rate</Text>
                <Text style={styles.tableCellHeader}>Total</Text>
              </View>
              {quotation.quantityPricing.map((item, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCell}>{item.item || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.description || 'N/A'}</Text>
                  <Text style={styles.tableCell}>{item.quantity || 0}</Text>
                  <Text style={styles.tableCell}>
                    {quotation.currency || 'INR'} {(item.price || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>
                    {quotation.currency || 'INR'} {(item.total || 0).toLocaleString()}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, { backgroundColor: '#f8f9fa', fontWeight: 'bold' }]}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL AMOUNT:</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}></Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                  {quotation.currency || 'INR'} {quotation.quantityPricing && quotation.quantityPricing.length > 0 
                    ? quotation.quantityPricing.reduce((sum, item) => sum + item.total, 0).toLocaleString()
                    : '0'
                  }
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                Pricing will be discussed based on your specific requirements. Contact us for a detailed quote tailored to your project needs.
              </Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCellHeader}>Service</Text>
                  <Text style={styles.tableCellHeader}>Description</Text>
                  <Text style={styles.tableCellHeader}>Starting From</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Web Development</Text>
                  <Text style={styles.tableCell}>Custom websites and web applications</Text>
                  <Text style={styles.tableCell}>₹25,000</Text>
                </View>
                <View style={styles.tableRowEven}>
                  <Text style={styles.tableCell}>Mobile App Development</Text>
                  <Text style={styles.tableCell}>iOS and Android applications</Text>
                  <Text style={styles.tableCell}>₹50,000</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>E-commerce Solutions</Text>
                  <Text style={styles.tableCell}>Online stores and payment integration</Text>
                  <Text style={styles.tableCell}>₹35,000</Text>
                </View>
                <View style={styles.tableRowEven}>
                  <Text style={styles.tableCell}>Maintenance & Support</Text>
                  <Text style={styles.tableCell}>Ongoing support and updates</Text>
                  <Text style={styles.tableCell}>₹5,000/month</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Project Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECT TIMELINE</Text>
          {quotation.projectTimeline && quotation.projectTimeline.length > 0 ? (
            quotation.projectTimeline.map((phase, index) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>Phase {index + 1}: {phase.phase}</Text>
                <Text style={styles.timelineDuration}>Duration: {phase.duration}</Text>
                <Text style={styles.normalText}>{phase.description}</Text>
              </View>
            ))
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                Our typical project timeline includes consultation, planning, development, testing, and deployment phases. Specific timelines will be discussed based on your project requirements.
              </Text>
              <View style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>Phase 1: Discovery & Planning</Text>
                <Text style={styles.timelineDuration}>Duration: 1-2 weeks</Text>
                <Text style={styles.normalText}>Initial consultation, requirement analysis, project planning, and design mockups.</Text>
              </View>
              <View style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>Phase 2: Development</Text>
                <Text style={styles.timelineDuration}>Duration: 3-6 weeks</Text>
                <Text style={styles.normalText}>Core development, feature implementation, and regular progress updates.</Text>
              </View>
              <View style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>Phase 3: Testing & Quality Assurance</Text>
                <Text style={styles.timelineDuration}>Duration: 1-2 weeks</Text>
                <Text style={styles.normalText}>Comprehensive testing, bug fixes, and performance optimization.</Text>
              </View>
              <View style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>Phase 4: Deployment & Launch</Text>
                <Text style={styles.timelineDuration}>Duration: 3-5 days</Text>
                <Text style={styles.normalText}>Final deployment, launch support, and handover documentation.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Process Workflow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROCESS & TIMELINE</Text>
          <Text style={styles.subTitle}>Our Process</Text>
          {quotation.processSteps && quotation.processSteps.length > 0 ? (
            <View style={styles.featuresList}>
              {quotation.processSteps.map((step, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.checkmark}>{step.step}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      {step.title}
                    </Text>
                    <Text style={styles.featureText}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                Our process typically includes: Initial consultation, requirement analysis, project planning, development, testing, and deployment. We ensure regular communication and updates throughout the project lifecycle.
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>1</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      Initial Consultation
                    </Text>
                    <Text style={styles.featureText}>Understanding your requirements and business goals</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>2</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      Project Planning
                    </Text>
                    <Text style={styles.featureText}>Creating detailed project roadmap and timeline</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>3</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      Development
                    </Text>
                    <Text style={styles.featureText}>Building your solution with regular updates</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>4</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      Testing & Quality Assurance
                    </Text>
                    <Text style={styles.featureText}>Thorough testing and bug fixing</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>5</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.featureText, { fontWeight: 'bold' }]}>
                      Deployment & Launch
                    </Text>
                    <Text style={styles.featureText}>Final deployment and go-live support</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          {quotation.processVideo && (
            <View style={[styles.contentBox, { backgroundColor: '#e8f5e8' }]}>
              <Text style={[styles.boldText, { color: '#28a745', marginBottom: 8 }]}>
                Process Video
              </Text>
              <Text style={styles.normalText}>
                Watch our process video: {quotation.processVideo}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Milestones */}
        {quotation.paymentMilestones && quotation.paymentMilestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAYMENT MILESTONES</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>Milestone</Text>
                <Text style={styles.tableCellHeader}>Percentage</Text>
                <Text style={styles.tableCellHeader}>Amount</Text>
                <Text style={styles.tableCellHeader}>Due Date</Text>
              </View>
              {quotation.paymentMilestones.map((milestone, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCell}>{milestone.milestone}</Text>
                  <Text style={styles.tableCell}>{milestone.percentage}%</Text>
                  <Text style={styles.tableCell}>
                    {quotation.currency || 'INR'} {milestone.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>
                    {milestone.dueDate.toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Testimonials & Portfolio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TESTIMONIALS & PORTFOLIO</Text>
          
          {/* Testimonials */}
          <Text style={styles.subTitle}>Client Testimonials</Text>
          {quotation.testimonials && quotation.testimonials.length > 0 ? (
            quotation.testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonial}>
                {testimonial.rating && (
                  <Text style={styles.testimonialRating}>
                    {createStarRating(testimonial.rating)}
                  </Text>
                )}
                <Text style={styles.testimonialText}>&ldquo;{testimonial.message}&rdquo;</Text>
                <Text style={styles.testimonialAuthor}>
                  - {testimonial.name}{testimonial.company ? `, ${testimonial.company}` : ''}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                &ldquo;We are committed to delivering exceptional results and building long-term relationships with our clients. Our satisfied customers speak to the quality of our work and dedication to excellence.&rdquo;
              </Text>
              <Text style={[styles.normalText, { textAlign: 'right', marginTop: 10, fontStyle: 'italic' }]}>
                - Our Team
              </Text>
            </View>
          )}

          {/* Portfolio */}
          <Text style={styles.subTitle}>Our Previous Work</Text>
          {quotation.previousWork && quotation.previousWork.length > 0 ? (
            quotation.previousWork.map((work, index) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.timelinePhase}>{work.title}</Text>
                <Text style={styles.normalText}>{work.description}</Text>
                {work.link && (
                  <Text style={[styles.normalText, { color: '#007bff', marginTop: 5 }]}>
                    View Project: {work.link}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.contentBox}>
              <Text style={styles.normalText}>
                We have successfully completed numerous projects across various industries. Our portfolio includes web applications, mobile apps, e-commerce solutions, and custom software development. Contact us to see specific examples relevant to your project.
              </Text>
            </View>
          )}
        </View>

        {/* Terms & Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
          {quotation.terms && quotation.terms.length > 0 && (
            <View style={styles.contentBox}>
              <Text style={[styles.boldText, { marginBottom: 10 }]}>Quotation Terms:</Text>
              {quotation.terms.map((term, index) => (
                <Text key={index} style={[styles.normalText, { marginBottom: 8 }]}>
                  {index + 1}. {term}
                </Text>
              ))}
            </View>
          )}
          {standardContent?.defaultTerms && (
            <View style={[styles.contentBox, { backgroundColor: '#f0f8ff' }]}>
              <Text style={[styles.boldText, { marginBottom: 10, color: '#007bff' }]}>Standard Terms:</Text>
              {Array.isArray(standardContent.defaultTerms) ? (
                standardContent.defaultTerms.map((term, index) => (
                  <Text key={index} style={[styles.normalText, { marginBottom: 8 }]}>
                    {index + 1}. {term}
                  </Text>
                ))
              ) : (
                <Text style={styles.normalText}>
                  {standardContent.defaultTerms}
                </Text>
              )}
            </View>
          )}
          {quotation.paymentTerms && (
            <View style={[styles.contentBox, { backgroundColor: '#fff3cd' }]}>
              <Text style={[styles.boldText, { color: '#856404', marginBottom: 8 }]}>
                Payment Terms
              </Text>
              <Text style={styles.normalText}>{quotation.paymentTerms}</Text>
            </View>
          )}
          {quotation.quotationValidity && (
            <View style={[styles.contentBox, { backgroundColor: '#d1ecf1' }]}>
              <Text style={[styles.boldText, { color: '#0c5460', marginBottom: 8 }]}>
                Quotation Validity
              </Text>
              <Text style={styles.normalText}>
                This quotation is valid for {quotation.quotationValidity} days from the date of issue.
              </Text>
            </View>
          )}
        </View>



        {/* Company Information */}
        {standardContent?.companyDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMPANY INFORMATION</Text>
            <View style={styles.clientInfo}>
              <View style={styles.clientDetails}>
                {standardContent.companyDetails.name && (
                  <View style={styles.clientDetail}>
                    <Text style={styles.clientLabel}>Company Name:</Text>
                    <Text style={styles.clientValue}>{standardContent.companyDetails.name}</Text>
                  </View>
                )}
                {standardContent.companyDetails.email && (
                  <View style={styles.clientDetail}>
                    <Text style={styles.clientLabel}>Email:</Text>
                    <Text style={styles.clientValue}>{standardContent.companyDetails.email}</Text>
                  </View>
                )}
                {standardContent.companyDetails.phone && (
                  <View style={styles.clientDetail}>
                    <Text style={styles.clientLabel}>Phone:</Text>
                    <Text style={styles.clientValue}>{standardContent.companyDetails.phone}</Text>
                  </View>
                )}
                {standardContent.companyDetails.website && (
                  <View style={styles.clientDetail}>
                    <Text style={styles.clientLabel}>Website:</Text>
                    <Text style={styles.clientValue}>{standardContent.companyDetails.website}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Begin?</Text>
          <Text style={styles.ctaText}>
            Ready to get started? Contact us today to discuss your project requirements and begin the journey towards your digital success.
          </Text>
          <Text style={[styles.ctaText, { fontSize: 12, marginTop: 10 }]}>
            View Live Quotation: {quotationUrl}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a digital quotation. For the live interactive version, visit:</Text>
          <Text style={{ margin: '10px 0', color: '#007bff' }}>{quotationUrl}</Text>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export { QuotationPDFDocument };
