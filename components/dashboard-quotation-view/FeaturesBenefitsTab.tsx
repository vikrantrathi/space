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

const { Text, Paragraph } = Typography;

interface CompanyDetails {
  phone?: string;
  name?: string;
  featuresDescription?: string;
  benefitsDescription?: string;
}

interface FeaturesBenefitsTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
}

const FeaturesBenefitsTab: React.FC<FeaturesBenefitsTabProps> = ({
  quotation,
  standardContent
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
    
    // Merge logic: quotation features > standard content features
    
    // Merge quotation features with standard content features
    const mergedFeatures = [...validQuotationFeatures, ...validStandardFeatures];
    return mergedFeatures;
  }, [quotation?.features, standardContent?.defaultFeatures]);

  const benefits = React.useMemo(() => {
    // Priority: quotation benefits > standard content benefits > empty array
    const quotationBenefits = quotation?.benefits;
    const standardBenefits = standardContent?.defaultBenefits;
    
    // Merge logic: quotation benefits > standard content benefits
    
    // Validate and filter out empty or invalid entries
    const validQuotationBenefits = Array.isArray(quotationBenefits)
      ? quotationBenefits.filter(benefit => benefit && typeof benefit === 'string' && benefit.trim().length > 0)
      : [];
    
    const validStandardBenefits = Array.isArray(standardBenefits)
      ? standardBenefits.filter(benefit => benefit && typeof benefit === 'string' && benefit.trim().length > 0)
      : [];
    
    // Merge quotation benefits with standard content benefits
    const mergedBenefits = [...validQuotationBenefits, ...validStandardBenefits];
    return mergedBenefits;
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
    );
  }

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <CheckCircleOutlined />
              Features
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ({featuresSource === 'quotation' ? 'Custom' : 'Default'}) • {features.length} items
              </Text>
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)',
            height: '100%'
          }}
        >
          {companyDetails.featuresDescription && (
            <Paragraph style={{ marginBottom: '16px', fontStyle: 'italic', color: 'var(--ant-color-text-secondary)' }}>
              {companyDetails.featuresDescription}
            </Paragraph>
          )}
          
          {hasFeatures ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {features.map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: index < features.length - 1 ? '1px solid var(--ant-color-border)' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ant-color-fill-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                >
                  <CheckCircleOutlined 
                    style={{ 
                      color: 'var(--ant-color-success)', 
                      marginRight: '12px', 
                      marginTop: '2px',
                      fontSize: '16px',
                      flexShrink: 0
                    }} 
                  />
                  <Text style={{ lineHeight: '1.5' }}>{feature}</Text>
                </div>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No features available"
              style={{ padding: '20px 0' }}
            />
          )}
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <TrophyOutlined />
              Benefits
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ({benefitsSource === 'quotation' ? 'Custom' : 'Default'}) • {benefits.length} items
              </Text>
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)',
            height: '100%'
          }}
        >
          {companyDetails.benefitsDescription && (
            <Paragraph style={{ marginBottom: '16px', fontStyle: 'italic', color: 'var(--ant-color-text-secondary)' }}>
              {companyDetails.benefitsDescription}
            </Paragraph>
          )}
          
          {hasBenefits ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {benefits.map((benefit, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: index < benefits.length - 1 ? '1px solid var(--ant-color-border)' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ant-color-fill-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                >
                  <TrophyOutlined 
                    style={{ 
                      color: '#faad14', 
                      marginRight: '12px', 
                      marginTop: '2px',
                      fontSize: '16px',
                      flexShrink: 0
                    }} 
                  />
                  <Text style={{ lineHeight: '1.5' }}>{benefit}</Text>
                </div>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No benefits available"
              style={{ padding: '20px 0' }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default FeaturesBenefitsTab;
