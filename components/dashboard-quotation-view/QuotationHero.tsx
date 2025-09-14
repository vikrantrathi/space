'use client';

import React from 'react';
import {
  Card,
  Typography
} from 'antd';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Paragraph } = Typography;

interface QuotationHeroProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorBgContainer: string;
  };
}

const QuotationHero: React.FC<QuotationHeroProps> = ({
  quotation,
  standardContent,
  theme
}) => {
  // Don't render if no cover image
  if (!quotation.coverImage) {
    return null;
  }

  return (
    <Card style={{
      marginBottom: '24px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: theme.colorBgContainer,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: 'none'
    }}>
      <div style={{
        backgroundImage: `url(${quotation.coverImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#f8f9fa',
        borderRadius: '16px'
      }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.7)', 
          padding: '40px', 
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          maxWidth: '80%'
        }}>
          {/* Quotation Title */}
          <Title level={1} style={{ color: 'white', margin: 0, fontSize: '48px', marginBottom: '16px' }}>
            {quotation.coverTitle || quotation.title}
          </Title>
          
          {/* Client Company */}
          {quotation.clientCompany && (
            <Paragraph style={{ 
              color: 'white', 
              fontSize: '20px', 
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              {quotation.clientCompany}
            </Paragraph>
          )}
          
          {/* Call-to-Action Description from standard content */}
          {standardContent?.companyDetails?.ctaDescription && (
            <Paragraph style={{ 
              color: 'white', 
              fontSize: '18px', 
              margin: 0,
              lineHeight: '1.6'
            }}>
              {standardContent.companyDetails.ctaDescription}
            </Paragraph>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuotationHero;
