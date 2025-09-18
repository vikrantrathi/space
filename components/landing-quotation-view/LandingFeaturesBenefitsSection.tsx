'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Empty,
  Alert
} from 'antd';
import {
  CheckCircleOutlined,
  TrophyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Text, Paragraph, Title } = Typography;

interface CompanyDetails {
  phone?: string;
  name?: string;
  featuresDescription?: string;
  benefitsDescription?: string;
}

interface LandingFeaturesBenefitsSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  isDark?: boolean;
}

const LandingFeaturesBenefitsSection: React.FC<LandingFeaturesBenefitsSectionProps> = ({
  quotation,
  standardContent,
  isDark = false
}) => {
  // Enhanced data merging with better fallback logic and validation
  const features = React.useMemo(() => {
    // Priority: quotation features > standard content features > empty array
    const quotationFeatures = quotation?.features;
    const standardFeatures = standardContent?.defaultFeatures;
    
    // Validate and filter out empty or invalid entries
    const validQuotationFeatures = Array.isArray(quotationFeatures) 
      ? quotationFeatures.filter(feature => feature && typeof feature === 'string' && feature.trim().length > 0)
      : [];
    
    const validStandardFeatures = Array.isArray(standardFeatures)
      ? standardFeatures.filter(feature => feature && typeof feature === 'string' && feature.trim().length > 0)
      : [];
    
    // If quotation has features, use only quotation features
    // Otherwise, use standard content features
    const finalFeatures = validQuotationFeatures.length > 0 ? validQuotationFeatures : validStandardFeatures;
    return finalFeatures;
  }, [quotation?.features, standardContent?.defaultFeatures]);

  const benefits = React.useMemo(() => {
    // Priority: quotation benefits > standard content benefits > empty array
    const quotationBenefits = quotation?.benefits;
    const standardBenefits = standardContent?.defaultBenefits;
    
    // Validate and filter out empty or invalid entries
    const validQuotationBenefits = Array.isArray(quotationBenefits)
      ? quotationBenefits.filter(benefit => benefit && typeof benefit === 'string' && benefit.trim().length > 0)
      : [];
    
    const validStandardBenefits = Array.isArray(standardBenefits)
      ? standardBenefits.filter(benefit => benefit && typeof benefit === 'string' && benefit.trim().length > 0)
      : [];
    
    // If quotation has benefits, use only quotation benefits
    // Otherwise, use standard content benefits
    const finalBenefits = validQuotationBenefits.length > 0 ? validQuotationBenefits : validStandardBenefits;
    return finalBenefits;
  }, [quotation?.benefits, standardContent?.defaultBenefits]);
  
  // Enhanced company details merging
  const companyDetails = React.useMemo(() => {
    const quotationDetails = quotation?.companyDetails || {};
    const standardDetails = standardContent?.companyDetails || {};
    
    return {
      ...standardDetails,
      ...quotationDetails, // Quotation details override standard content
    } as CompanyDetails;
  }, [quotation?.companyDetails, standardContent?.companyDetails]);

  // Check if we have any data to display
  const hasFeatures = features.length > 0;
  const hasBenefits = benefits.length > 0;
  const hasAnyData = hasFeatures || hasBenefits;
  
  // Determine data source for better user feedback
  const featuresSource = quotation?.features?.length ? 'quotation' : 'standard';
  const benefitsSource = quotation?.benefits?.length ? 'quotation' : 'standard';

  // Show alert if no data is available
  if (!hasAnyData) {
    return (
      <div style={{ marginBottom: '40px' }}>
        <Title level={2} style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          Features & Benefits
        </Title>
        <Alert
          message="No Features & Benefits Available"
          description="This quotation doesn't have any features or benefits defined yet. Please contact the administrator to add this information."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{
            borderRadius: '12px',
            margin: '16px 0'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: 'clamp(40px, 6vw, 60px) 20px',
      background: isDark ? '#0f0f23' : 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={2} style={{
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: '700',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: isDark ? '#ffffff' : '#1a202c'
          }}>
            Features & Benefits
          </Title>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '0 auto',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }} />
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <CheckCircleOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Features
                  </Title>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  ({featuresSource === 'quotation' ? 'Custom' : 'Default'}) • {features.length} items
                </Text>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px', maxHeight: '450px', overflowY: 'auto' }}>
                {companyDetails.featuresDescription && (
                  <div style={{
                    background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: isDark ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Paragraph style={{ 
                      margin: 0, 
                      fontStyle: 'italic', 
                      color: isDark ? '#cbd5e0' : '#4a5568', 
                      fontSize: '16px',
                      lineHeight: '1.6',
                      fontWeight: '500'
                    }}>
                      {companyDetails.featuresDescription}
                    </Paragraph>
                  </div>
                )}
                
                {hasFeatures ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {features.map((feature, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        padding: '18px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '12px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#f1f5f9';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <CheckCircleOutlined 
                          style={{ 
                            color: '#10b981', 
                            marginRight: '16px', 
                            marginTop: '4px',
                            fontSize: '20px',
                            flexShrink: 0
                          }} 
                        />
                        <Text style={{ 
                          lineHeight: '1.6', 
                          fontSize: '16px',
                          color: isDark ? '#ffffff' : '#1a202c',
                          fontWeight: '500'
                        }}>
                          {feature}
                        </Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No features available"
                    style={{ padding: '40px 0' }}
                  />
                )}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <TrophyOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Benefits
                  </Title>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  ({benefitsSource === 'quotation' ? 'Custom' : 'Default'}) • {benefits.length} items
                </Text>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px', maxHeight: '450px', overflowY: 'auto' }}>
                {companyDetails.benefitsDescription && (
                  <div style={{
                    background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.1)'
                  }}>
                    <Paragraph style={{ 
                      margin: 0, 
                      fontStyle: 'italic', 
                      color: isDark ? '#cbd5e0' : '#4a5568', 
                      fontSize: '16px',
                      lineHeight: '1.6',
                      fontWeight: '500'
                    }}>
                      {companyDetails.benefitsDescription}
                    </Paragraph>
                  </div>
                )}
                
                {hasBenefits ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {benefits.map((benefit, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        padding: '18px',
                        background: isDark ? '#2d3748' : '#fef3c7',
                        borderRadius: '12px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #fbbf24',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#fde68a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#fef3c7';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <TrophyOutlined 
                          style={{ 
                            color: '#f59e0b', 
                            marginRight: '16px', 
                            marginTop: '4px',
                            fontSize: '20px',
                            flexShrink: 0
                          }} 
                        />
                        <Text style={{ 
                          lineHeight: '1.6', 
                          fontSize: '16px',
                          color: isDark ? '#ffffff' : '#1a202c',
                          fontWeight: '500'
                        }}>
                          {benefit}
                        </Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No benefits available"
                    style={{ padding: '40px 0' }}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Section Separator */}
      <div style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
        margin: '60px 0 0 0'
      }} />
    </div>
  );
};

export default LandingFeaturesBenefitsSection;

