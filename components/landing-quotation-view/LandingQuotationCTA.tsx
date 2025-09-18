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

interface LandingQuotationCTAProps {
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
  isDark?: boolean;
}

const LandingQuotationCTA: React.FC<LandingQuotationCTAProps> = ({
  quotation,
  standardContent,
  theme,
  onActionClick,
  isDark = false
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
    <div style={{
      padding: 'clamp(40px, 6vw, 60px) 20px',
      background: isDark 
        ? '#0f0f23'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Card style={{
          borderRadius: '24px',
          textAlign: 'center',
          background: isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}>
          {quotation.status === 'accepted' ? (
            <div style={{ padding: '60px 40px' }}>
              <CheckCircleOutlined style={{ 
                fontSize: '100px', 
                color: '#10b981', 
                marginBottom: '30px',
                filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
              }} />
              <Title level={1} style={{ 
                color: '#10b981', 
                marginBottom: '20px', 
                fontSize: '48px',
                fontWeight: '800'
              }}>
                Quotation Accepted
              </Title>
              <Text style={{ 
                fontSize: '20px', 
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
                {(() => {
                  const accepted = quotation.actions?.filter((a: { action: string; timestamp?: Date }) => a.action === 'accept').slice(-1)[0];
                  const date = accepted?.timestamp ? new Date(accepted.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
                  return `Accepted on ${date.toLocaleDateString()}`;
                })()}
              </Text>
            </div>
          ) : isExpired() ? (
            <div style={{ padding: '60px 40px' }}>
              <ClockCircleOutlined style={{ 
                fontSize: '100px', 
                color: '#f59e0b', 
                marginBottom: '30px',
                filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))'
              }} />
              <Title level={1} style={{ 
                color: '#f59e0b', 
                marginBottom: '20px', 
                fontSize: '48px',
                fontWeight: '800'
              }}>
                Quotation Expired
              </Title>
              <Alert
                message="This quotation has expired"
                description="The validity period for this quotation has ended. Please contact support to extend the validity period if needed."
                type="warning"
                showIcon
                style={{ 
                  marginBottom: '30px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
              <Text style={{ 
                fontSize: '20px', 
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
                Expired on {quotation.expirationDate ? new Date(quotation.expirationDate).toLocaleDateString() : 'Unknown date'}
              </Text>
            </div>
          ) : hasClientRequestedRevision() && !hasAdminSentRevision() ? (
            <div style={{ padding: '60px 40px' }}>
              <ClockCircleOutlined style={{ 
                fontSize: '100px', 
                color: '#f59e0b', 
                marginBottom: '30px',
                filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))'
              }} />
              <Title level={1} style={{ 
                color: '#f59e0b', 
                marginBottom: '20px', 
                fontSize: '48px',
                fontWeight: '800'
              }}>
                Revision Requested
              </Title>
              <Alert
                message="Revision Requested Successfully"
                description="Actions Disabled till Revision Received from admin. Please wait for admin response."
                type="info"
                showIcon
                style={{ 
                  marginBottom: '30px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
              <Text style={{ 
                fontSize: '20px', 
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
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
            <div style={{ padding: '60px 40px' }}>
              <CheckCircleOutlined style={{ 
                fontSize: '100px', 
                color: '#10b981', 
                marginBottom: '30px',
                filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
              }} />
              <Title level={1} style={{ 
                color: '#10b981', 
                marginBottom: '20px', 
                fontSize: '48px',
                fontWeight: '800'
              }}>
                Revision Received
              </Title>
              <Alert
                message="Revision Received from Admin"
                description="Please review the updated quotation and take action."
                type="success"
                showIcon
                style={{ 
                  marginBottom: '30px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
              <Text style={{ 
                fontSize: '20px', 
                marginBottom: '40px', 
                display: 'block',
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
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
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center justify-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleActionClick('accept')}
                  className="w-full sm:w-auto"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    border: 'none',
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Accept Quotation
                </Button>
                <Button
                  size="large"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => handleActionClick('revision')}
                  className="w-full sm:w-auto"
                  style={{
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    background: isDark ? '#2d3748' : 'white',
                    borderColor: isDark ? '#4a5568' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#4a5568',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  Request Changes
                </Button>
                <Button
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleActionClick('reject')}
                  className="w-full sm:w-auto"
                  style={{
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ef4444',
                    borderColor: '#ef4444',
                    background: isDark ? '#2d3748' : 'white',
                    boxShadow: isDark ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Reject Quotation
                </Button>
              </div>
            </div>
          ) : !isValidForActions() ? (
            <div style={{ padding: '60px 40px' }}>
              <ExclamationCircleOutlined style={{ 
                fontSize: '100px', 
                color: '#f59e0b', 
                marginBottom: '30px',
                filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))'
              }} />
              <Title level={1} style={{ 
                color: '#f59e0b', 
                marginBottom: '20px', 
                fontSize: '48px',
                fontWeight: '800'
              }}>
                Quotation Not Available for Actions
              </Title>
              <Text style={{ 
                fontSize: '20px', 
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
                This quotation is currently in {quotation.status} status and cannot be modified.
              </Text>
            </div>
          ) : (
            <div style={{ padding: '60px 40px' }}>
              <Title level={1} style={{ 
                marginBottom: '20px', 
                fontSize: 'clamp(32px, 6vw, 48px)',
                fontWeight: '800',
                color: isDark ? '#ffffff' : '#1a202c'
              }}>
                {companyDetails.ctaDescription || 'Ready to Get Started?'}
              </Title>
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 20px auto',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }} />
              <Text style={{ 
                fontSize: '20px', 
                marginBottom: '40px', 
                display: 'block',
                color: isDark ? '#a0aec0' : '#6b7280',
                fontWeight: '500'
              }}>
                Take action on this quotation
              </Text>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleActionClick('accept')}
                  className="w-full sm:w-auto"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    border: 'none',
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Accept Quotation
                </Button>
                <Button
                  size="large"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => handleActionClick('revision')}
                  className="w-full sm:w-auto"
                  style={{ 
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    background: isDark ? '#2d3748' : 'white',
                    borderColor: isDark ? '#4a5568' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#4a5568',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  Request Changes
                </Button>
                <Button
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleActionClick('reject')}
                  className="w-full sm:w-auto"
                  style={{ 
                    borderRadius: '16px',
                    height: '64px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ef4444',
                    borderColor: '#ef4444',
                    background: isDark ? '#2d3748' : 'white',
                    boxShadow: isDark ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LandingQuotationCTA;

