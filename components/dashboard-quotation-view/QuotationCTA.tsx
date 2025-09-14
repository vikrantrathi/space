'use client';

import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Alert
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';
import { useAuth } from '@/lib/auth/auth-context';

const { Title, Text } = Typography;

interface QuotationCTAProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorBgContainer: string;
    colorPrimary: string;
    colorSuccess: string;
    colorError: string;
    colorWarning: string;
  };
  onActionClick: (action: string) => void;
}

const QuotationCTA: React.FC<QuotationCTAProps> = ({
  quotation,
  standardContent,
  theme,
  onActionClick
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // Merge company details
  const quotationCompanyDetails = quotation.companyDetails || {};
  const standardCompanyDetails = standardContent?.companyDetails || {};
  
  const companyDetails = {
    ctaDescription: (quotationCompanyDetails as { ctaDescription?: string }).ctaDescription || (standardCompanyDetails as { ctaDescription?: string }).ctaDescription || '',
  };

  // Check if quotation is expired
  const isExpired = () => {
    if (!quotation.expirationDate) return false;
    return new Date() > new Date(quotation.expirationDate);
  };

  // Check if quotation is valid for actions
  const isValidForActions = () => {
    // If status is not 'sent' or 'revision', actions are not valid
    if (quotation.status !== 'sent' && quotation.status !== 'revision') {
      return false;
    }
    
    // Check if client has requested revision
    const hasClientRevision = quotation.actions?.some(action => 
      action.action === 'revision' && 
      action.reason !== 'Admin sent revised quotation to client' && 
      action.reason !== 'Admin updated quotation based on revision request'
    );
    
    // Check if admin sent revision back
    const hasAdminRevision = quotation.actions?.some(action => 
      action.action === 'revision' && 
      (action.reason === 'Admin sent revised quotation to client' || 
       action.reason === 'Admin updated quotation based on revision request')
    );
    
    // If client has requested revision AND admin hasn't sent revision back, disable actions
    if (hasClientRevision && !hasAdminRevision) {
      return false;
    }
    
    return true;
  };

  // Check if client has requested revision (for display purposes)
  const hasClientRequestedRevision = () => {
    return quotation.actions?.some(action => 
      action.action === 'revision' && 
      action.reason !== 'Admin sent revised quotation to client' && 
      action.reason !== 'Admin updated quotation based on revision request'
    );
  };

  // Check if admin has sent revision back
  const hasAdminSentRevision = () => {
    return quotation.actions?.some(action => 
      action.action === 'revision' && 
      (action.reason === 'Admin sent revised quotation to client' || 
       action.reason === 'Admin updated quotation based on revision request')
    );
  };

  const handleActionClick = (action: string) => {
    if (isExpired()) {
      return; // Don't allow actions on expired quotations
    }
    onActionClick(action);
  };

  return (
    <Card style={{
      marginTop: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      background: theme.colorBgContainer,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: 'none'
    }}>
      {quotation.status === 'accepted' ? (
        <div>
          <CheckCircleOutlined style={{ fontSize: '64px', color: theme.colorSuccess, marginBottom: '16px' }} />
          <Title level={2} style={{ color: theme.colorSuccess, marginBottom: '8px' }}>
            Quotation Accepted
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {(() => {
              const accepted = quotation.actions?.filter((a: { action: string; timestamp?: Date }) => a.action === 'accept').slice(-1)[0];
              const date = accepted?.timestamp ? new Date(accepted.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
              return `Accepted on ${date.toLocaleDateString()}`;
            })()}
          </Text>
        </div>
      ) : isExpired() ? (
        <div>
          <ClockCircleOutlined style={{ fontSize: '64px', color: theme.colorWarning, marginBottom: '16px' }} />
          <Title level={2} style={{ color: theme.colorWarning, marginBottom: '8px' }}>
            Quotation Expired
          </Title>
          <Alert
            message="This quotation has expired"
            description="The validity period for this quotation has ended. Please contact support to extend the validity period if needed."
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Expired on {quotation.expirationDate ? new Date(quotation.expirationDate).toLocaleDateString() : 'Unknown date'}
          </Text>
        </div>
      ) : hasClientRequestedRevision() && !hasAdminSentRevision() ? (
        <div>
          <ClockCircleOutlined style={{ fontSize: '64px', color: theme.colorWarning, marginBottom: '16px' }} />
          <Title level={2} style={{ color: theme.colorWarning, marginBottom: '8px' }}>
            Revision Requested
          </Title>
          <Alert
            message="Revision Requested Successfully"
            description="Actions Disabled till Revision Received from admin. Please wait for admin response."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {(() => {
              const revisionAction = quotation.actions?.find(action => 
                action.action === 'revision' && 
                action.reason !== 'Admin sent revised quotation to client' && 
                action.reason !== 'Admin updated quotation based on revision request'
              );
              const date = revisionAction?.timestamp ? new Date(revisionAction.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
              return `Requested on ${date.toLocaleDateString()}`;
            })()}
          </Text>
        </div>
      ) : hasAdminSentRevision() ? (
        <div>
          <CheckCircleOutlined style={{ fontSize: '64px', color: theme.colorSuccess, marginBottom: '16px' }} />
          <Title level={2} style={{ color: theme.colorSuccess, marginBottom: '8px' }}>
            Revision Received
          </Title>
          <Alert
            message="Revision Received from Admin"
            description="Please review the updated quotation and take action."
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            {(() => {
              const revisionAction = quotation.actions?.find(action => 
                action.action === 'revision' && 
                (action.reason === 'Admin sent revised quotation to client' || 
                 action.reason === 'Admin updated quotation based on revision request')
              );
              const date = revisionAction?.timestamp ? new Date(revisionAction.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
              return `Received on ${date.toLocaleDateString()}`;
            })()}
          </Text>
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => handleActionClick('accept')}
              style={{ 
                background: theme.colorSuccess, 
                borderColor: theme.colorSuccess,
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Accept Quotation
            </Button>
            <Button
              size="large"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleActionClick('revision')}
              style={{
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Request Changes
            </Button>
            <Button
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => handleActionClick('reject')}
              style={{
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px',
                color: theme.colorError,
                borderColor: theme.colorError
              }}
            >
              Reject Quotation
            </Button>
          </Space>
        </div>
      ) : !isValidForActions() ? (
        <div>
          <ExclamationCircleOutlined style={{ fontSize: '64px', color: theme.colorWarning, marginBottom: '16px' }} />
          <Title level={2} style={{ color: theme.colorWarning, marginBottom: '8px' }}>
            Quotation Not Available for Actions
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            This quotation is currently in {quotation.status} status and cannot be modified.
          </Text>
        </div>
      ) : (
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>
            {companyDetails.ctaDescription || 'Ready to Get Started?'}
          </Title>
          <Text style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Take action on this quotation
          </Text>
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => handleActionClick('accept')}
              style={{ 
                background: theme.colorSuccess, 
                borderColor: theme.colorSuccess,
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Accept Quotation
            </Button>
            <Button
              size="large"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleActionClick('revision')}
              style={{ 
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Request Changes
            </Button>
            <Button
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => handleActionClick('reject')}
              style={{ 
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Decline
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default QuotationCTA;
