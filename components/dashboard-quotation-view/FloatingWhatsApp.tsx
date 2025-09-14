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

interface FloatingWhatsAppProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorPrimary: string;
  };
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  quotation,
  standardContent,
  theme
}) => {
  // Merge company details
  const quotationCompanyDetails = (quotation.companyDetails || {}) as CompanyDetails;
  const standardCompanyDetails = (standardContent?.companyDetails || {}) as CompanyDetails;
  
  const companyDetails = {
    phone: quotationCompanyDetails.phone || standardCompanyDetails.phone || '',
    name: quotationCompanyDetails.name || standardCompanyDetails.name || 'Company',
  };

  const handleWhatsAppClick = () => {
    if (companyDetails.phone) {
      const message = `Hi ${companyDetails.name}, I'm interested in the quotation for "${quotation.title}". Can you please provide more details?`;
      const whatsappUrl = `https://wa.me/${companyDetails.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Don't render if no phone number
  if (!companyDetails.phone) {
    return null;
  }

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
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          borderColor: '#25D366',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.transition = 'transform 0.2s ease';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    </Tooltip>
  );
};

export default FloatingWhatsApp;
