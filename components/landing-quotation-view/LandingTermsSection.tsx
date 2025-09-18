'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Alert,
  Collapse,
  Space
} from 'antd';
import {
  FileTextOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface LandingTermsSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  isDark?: boolean;
}

const LandingTermsSection: React.FC<LandingTermsSectionProps> = ({
  quotation,
  standardContent,
  isDark = false
}) => {
  // Merge terms arrays from both quotation and standard content
  const quotationTerms = Array.isArray(quotation.terms) ? quotation.terms : [];
  const standardTerms = Array.isArray(standardContent?.defaultTerms) ? standardContent.defaultTerms : [];
  
  // If standard terms is a string, split it by newlines
  const standardTermsArray = typeof standardContent?.defaultTerms === 'string' 
    ? standardContent.defaultTerms.split('\n').filter(term => term.trim())
    : standardTerms;
  
  const allTerms = [...quotationTerms, ...standardTermsArray];
  
  // Get company details for descriptions
  const companyDetails = quotation.companyDetails || standardContent?.companyDetails || {};

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
            Terms & Conditions
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

        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <FileTextOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Terms & Conditions
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                {/* Terms & Conditions List */}
                {allTerms.length > 0 ? (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      paddingLeft: '0px',
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: isDark ? '#ffffff' : '#1a202c'
                    }}>
                      {allTerms.map((term, index) => (
                        <div key={index} style={{ 
                          marginBottom: '16px',
                          padding: '24px',
                          background: isDark ? '#2d3748' : '#f8fafc',
                          borderRadius: '16px',
                          border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'flex-start',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = isDark ? '#4a5568' : '#e2e8f0';
                        }}
                        >
                          <div style={{
                            minWidth: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginRight: '20px',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                          }}>
                            {index + 1}
                          </div>
                          <Text style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.7',
                            flex: 1,
                            color: isDark ? '#cbd5e0' : '#4a5568',
                            fontWeight: '500'
                          }}>
                            {term}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 20px',
                    color: '#6b7280'
                  }}>
                    <FileTextOutlined style={{ 
                      fontSize: '80px', 
                      marginBottom: '24px',
                      color: '#d1d5db'
                    }} />
                    <Title level={3} style={{ 
                      color: '#6b7280',
                      fontSize: '24px',
                      marginBottom: '12px'
                    }}>
                      No Terms & Conditions Available
                    </Title>
                    <Text style={{ 
                      fontSize: '16px',
                      color: '#9ca3af'
                    }}>
                      Terms and conditions will be provided upon request.
                    </Text>
                  </div>
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

export default LandingTermsSection;

