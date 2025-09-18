'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

interface CompanyDetails {
  phone?: string;
  name?: string;
}

interface LandingFloatingWhatsAppProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorPrimary: string;
  };
}

const LandingFloatingWhatsApp: React.FC<LandingFloatingWhatsAppProps> = ({
  quotation,
  standardContent,
  theme
}) => {
  // Merge company details - same logic as dashboard
  const quotationCompanyDetails = (quotation.companyDetails || {}) as CompanyDetails;
  const standardCompanyDetails = (standardContent?.companyDetails || {}) as CompanyDetails;
  
  const companyDetails = {
    phone: quotationCompanyDetails.phone || standardCompanyDetails.phone || '',
    name: quotationCompanyDetails.name || standardCompanyDetails.name || 'Company',
  };

  console.log('WhatsApp Button Debug:', {
    quotationPhone: quotationCompanyDetails.phone,
    standardPhone: standardCompanyDetails.phone,
    finalPhone: companyDetails.phone,
    hasPhone: !!companyDetails.phone
  });

  const handleWhatsAppClick = () => {
    // For testing - use a default phone number if none available
    const phoneNumber = companyDetails.phone || '1234567890';
    const message = `Hi ${companyDetails.name}, I'm interested in the quotation for "${quotation.title}". Can you please provide more details?`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Always show WhatsApp button for testing - remove this later
  // if (!companyDetails.phone) {
  //   console.log('No phone number found for WhatsApp button:', { quotationCompanyDetails, standardCompanyDetails });
  //   return null;
  // }

  return (
    <Tooltip title="Chat on WhatsApp" placement="left">
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<WhatsAppOutlined />}
        onClick={handleWhatsAppClick}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4), 0 0 0 4px rgba(37, 211, 102, 0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 211, 102, 0.6), 0 0 0 8px rgba(37, 211, 102, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 211, 102, 0.4), 0 0 0 4px rgba(37, 211, 102, 0.1)';
        }}
      />
    </Tooltip>
  );
};

export default LandingFloatingWhatsApp;

