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

interface TermsConditionsTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
}

const TermsConditionsTab: React.FC<TermsConditionsTabProps> = ({
  quotation,
  standardContent
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
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Card 
          title={
            <Space>
              <FileTextOutlined />
              Terms & Conditions
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)'
          }}
        >
          
          {/* Terms & Conditions List */}
          {allTerms.length > 0 ? (
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '16px', color: 'var(--ant-color-text)' }}>
                Terms & Conditions
              </Title>
              <div style={{ 
                paddingLeft: '0px',
                fontSize: '15px',
                lineHeight: '1.8',
                color: 'var(--ant-color-text)'
              }}>
                {allTerms.map((term, index) => (
                  <div key={index} style={{ 
                    marginBottom: '8px',
                    padding: '12px 16px',
                    background: 'var(--ant-color-fill-quaternary)',
                    borderRadius: '8px',
                    border: '1px solid var(--ant-color-border)',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--ant-color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      {index + 1}.
                    </div>
                    <Text style={{ 
                      fontSize: '15px', 
                      lineHeight: '1.6',
                      flex: 1
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
              padding: '40px 20px',
              color: 'var(--ant-color-text-secondary)'
            }}>
              <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4} type="secondary">No Terms & Conditions Available</Title>
              <Text type="secondary">Terms and conditions will be provided upon request.</Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default TermsConditionsTab;
