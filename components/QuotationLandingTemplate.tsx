'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Spin,
  message,
  Divider,
  List,
  Row,
  Col,
  Badge,
  Steps,
  Tooltip,
  theme,
  Table,
  Rate
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/lib/auth/auth-context';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined,
  RocketOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';
import {
  LandingQuotationHeader,
  LandingQuotationHero,
  LandingQuotationCTA,
  LandingFloatingWhatsApp,
  LandingOverviewSection,
  LandingFeaturesBenefitsSection,
  LandingPricingSection,
  LandingProcessSection,
  LandingTestimonialsSection,
  LandingTermsSection,
  LandingProcessVideoWidget
} from './landing-quotation-view';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ActionData {
  name: string;
  email: string;
  phone: string;
  action: string;
  reason?: string;
}

interface QuotationLandingTemplateProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  onAction: (action: string, data: ActionData) => void;
  onOtpSubmit?: (values: { otp: string }) => void;
  loading?: boolean;
  printMode?: boolean;
  actionModalVisible?: boolean;
  setActionModalVisible?: (visible: boolean) => void;
  otpModalVisible?: boolean;
  setOtpModalVisible?: (visible: boolean) => void;
  actionForm?: FormInstance;
  otpForm?: FormInstance;
  actionLoading?: boolean;
  otpLoading?: boolean;
  selectedAction?: string;
  setSelectedAction?: (action: string) => void;
}

const QuotationLandingTemplate: React.FC<QuotationLandingTemplateProps> = ({
  quotation,
  standardContent,
  onAction,
  onOtpSubmit,
  loading = false,
  printMode = false,
  actionModalVisible = false,
  setActionModalVisible,
  otpModalVisible = false,
  setOtpModalVisible,
  actionForm,
  otpForm,
  actionLoading = false,
  otpLoading = false,
  selectedAction = '',
  setSelectedAction
}) => {
  const { token } = theme.useToken();
  const { resolved } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  // Currency utility function
  const getCurrencySymbol = (currency: string) => {
    return currency === 'INR' ? '₹' : '$';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = getCurrencySymbol(currency || 'USD');
    const numericAmount = typeof amount === 'number' && isFinite(amount) ? amount : 0;
    return `${symbol}${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'revision': return 'blue';
      default: return 'blue';
    }
  };

  // Merge quotation and standard content data - SAME LOGIC AS DASHBOARD
  const mergedData = React.useMemo(() => {
    const quotationCompanyDetails = quotation.companyDetails || {};
    const standardCompanyDetails = standardContent?.companyDetails || {};
    
    // Type guard to ensure companyDetails has the expected structure
    const safeQuotationDetails = {
      name: (quotationCompanyDetails as Record<string, unknown>)?.name as string || '',
      logo: (quotationCompanyDetails as Record<string, unknown>)?.logo as string || '',
      email: (quotationCompanyDetails as Record<string, unknown>)?.email as string || '',
      phone: (quotationCompanyDetails as Record<string, unknown>)?.phone as string || '',
      website: (quotationCompanyDetails as Record<string, unknown>)?.website as string || ''
    };
    
    const safeStandardDetails = {
      name: (standardCompanyDetails as Record<string, unknown>)?.name as string || '',
      logo: (standardCompanyDetails as Record<string, unknown>)?.logo as string || '',
      email: (standardCompanyDetails as Record<string, unknown>)?.email as string || '',
      phone: (standardCompanyDetails as Record<string, unknown>)?.phone as string || '',
      website: (standardCompanyDetails as Record<string, unknown>)?.website as string || '',
      tagline: (standardCompanyDetails as Record<string, unknown>)?.tagline as string || '',
      featuresDescription: (standardCompanyDetails as Record<string, unknown>)?.featuresDescription as string || '',
      benefitsDescription: (standardCompanyDetails as Record<string, unknown>)?.benefitsDescription as string || '',
      pricingDescription: (standardCompanyDetails as Record<string, unknown>)?.pricingDescription as string || '',
      termsDescription: (standardCompanyDetails as Record<string, unknown>)?.termsDescription as string || '',
      ctaDescription: (standardCompanyDetails as Record<string, unknown>)?.ctaDescription as string || ''
    };
    
    // Merge features and benefits arrays properly
    const quotationFeatures = Array.isArray(quotation.features) ? quotation.features : [];
    const standardFeatures = Array.isArray(standardContent?.defaultFeatures) ? standardContent.defaultFeatures : [];
    const features = [...quotationFeatures, ...standardFeatures];
    
    const quotationBenefits = Array.isArray(quotation.benefits) ? quotation.benefits : [];
    const standardBenefits = Array.isArray(standardContent?.defaultBenefits) ? standardContent.defaultBenefits : [];
    const benefits = [...quotationBenefits, ...standardBenefits];
    
    // Merge terms - quotation terms take priority
    const terms = quotation.terms || standardContent?.defaultTerms || '';
    
    // Process steps - quotation takes priority, fallback to standard
    const processSteps = quotation.processSteps?.length ? quotation.processSteps : (standardContent?.processSteps || []);
    
    // Testimonials - quotation takes priority, fallback to standard
    const testimonials = quotation.testimonials?.length ? quotation.testimonials : (standardContent?.testimonials || []);
    
    // Previous work - quotation takes priority, fallback to standard
    const previousWork = quotation.previousWork?.length ? quotation.previousWork : (standardContent?.previousWork || []);

    return {
      ...quotation,
      companyDetails: {
        name: safeQuotationDetails.name || safeStandardDetails.name || '',
        logo: safeQuotationDetails.logo || safeStandardDetails.logo || '',
        email: safeQuotationDetails.email || safeStandardDetails.email || '',
        phone: safeQuotationDetails.phone || safeStandardDetails.phone || '',
        website: safeQuotationDetails.website || safeStandardDetails.website || '',
        tagline: safeStandardDetails.tagline || '', // Only from standard content
        featuresDescription: safeStandardDetails.featuresDescription || '', // Only from standard content
        benefitsDescription: safeStandardDetails.benefitsDescription || '', // Only from standard content
        pricingDescription: safeStandardDetails.pricingDescription || '', // Only from standard content
        termsDescription: safeStandardDetails.termsDescription || '', // Only from standard content
        ctaDescription: safeStandardDetails.ctaDescription || '', // Only from standard content
      },
      features,
      benefits,
      terms,
      processSteps,
      testimonials,
      previousWork,
      processVideo: quotation.processVideo || standardContent?.processVideo
    };
  }, [quotation, standardContent]);

  const displayQuotation = mergedData as unknown as IQuotation;

  const handleAction = (action: string) => {
    console.log('Template handleAction called:', { action, isAuthenticated, user: !!user });
    if (isAuthenticated && user) {
      // For logged-in users, use the parent's onAction logic which handles authentication properly
      onAction(action, {
        name: user.name || '',
        email: user.email || '',
        phone: '', // Phone not available in user object
        action,
        reason: action === 'reject' || action === 'revision' ? '' : undefined
      });
    } else {
      // For public users, open modal to collect details first
      console.log('Opening modal for public user');
      setSelectedAction?.(action);
      setActionModalVisible?.(true);
    }
  };

  const handleActionSubmit = (values: ActionData) => {
    if (isAuthenticated && user) {
      // For logged-in users, call action directly
      onAction(selectedAction, values);
      setActionModalVisible?.(false);
      actionForm?.resetFields();
    } else {
      // For public users, start OTP flow
      onAction(selectedAction, values);
      // Don't close modal yet - it will be closed when OTP is sent
    }
  };

  const handleOtpSubmit = (values: { otp: string }) => {
    onOtpSubmit?.(values);
    setOtpModalVisible?.(false);
    otpForm?.resetFields();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: token.colorBgContainer
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: resolved === 'dark'
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0'
    }}>

      {/* Header Component */}
      <LandingQuotationHeader 
        quotation={displayQuotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer,
          colorPrimary: token.colorPrimary,
          colorTextSecondary: token.colorTextSecondary,
          colorBorder: token.colorBorder
        }}
        isDark={resolved === 'dark'}
      />

      {/* Hero Section Component */}
      <LandingQuotationHero 
        quotation={displayQuotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer
        }}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
        isDark={resolved === 'dark'}
      />

      {/* Overview Section */}
      <LandingOverviewSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        getStatusColor={getStatusColor}
        isDark={resolved === 'dark'}
      />

      {/* Features & Benefits Section */}
      <LandingFeaturesBenefitsSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        isDark={resolved === 'dark'}
      />

        {/* Pricing Section */}
      <LandingPricingSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        formatCurrency={formatCurrency}
        isDark={resolved === 'dark'}
      />

      {/* Process Section */}
      <LandingProcessSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        getStatusColor={getStatusColor}
        isDark={resolved === 'dark'}
      />

      {/* Testimonials Section */}
      <LandingTestimonialsSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        isDark={resolved === 'dark'}
      />

      {/* Terms Section */}
      <LandingTermsSection 
        quotation={displayQuotation}
        standardContent={standardContent}
        isDark={resolved === 'dark'}
      />

      {/* CTA Section Component */}
      <LandingQuotationCTA 
        quotation={displayQuotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer,
          colorPrimary: token.colorPrimary,
          colorSuccess: token.colorSuccess,
          colorError: token.colorError,
          colorWarning: token.colorWarning
        }}
        onActionClick={handleAction}
        isDark={resolved === 'dark'}
      />

      {/* Floating WhatsApp Component */}
      <LandingFloatingWhatsApp 
        quotation={displayQuotation}
        standardContent={standardContent}
        theme={{
          colorPrimary: token.colorPrimary
        }}
      />


      {/* Enhanced Action Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', paddingBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
              {selectedAction === 'accept' ? 'Accept Quotation' : 
               selectedAction === 'reject' ? 'Decline Quotation' : 
               'Request Changes'}
            </Title>
            <Text type="secondary">
              {selectedAction === 'accept' ? 'Please provide your details to accept this quotation' :
               selectedAction === 'reject' ? 'Please provide a reason for declining this quotation' :
               'Please provide details about the changes you would like'}
            </Text>
          </div>
        }
        open={actionModalVisible}
        onCancel={() => setActionModalVisible?.(false)}
        footer={null}
        width={500}
        style={{ borderRadius: '16px' }}
        styles={{ body: { padding: '24px' } }}
      >
        <Form form={actionForm} onFinish={handleActionSubmit} layout="vertical">
          {/* Only show name, email, phone fields for public users */}
          {!isAuthenticated && (
            <>
                  <Form.Item
                    name="name"
                label={<Text strong>Full Name</Text>} 
                rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input
                      size="large"
                  placeholder="Enter your full name"
                  style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
              <Form.Item
                name="email"
                label={<Text strong>Email Address</Text>} 
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                    size="large"
                  placeholder="Enter your email address"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
              <Form.Item 
                name="phone" 
                label={<Text strong>Phone Number</Text>} 
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input 
                  size="large"
                  placeholder="Enter your phone number"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </>
          )}
          {(selectedAction === 'reject' || selectedAction === 'revision') && (
          <Form.Item
            name="reason"
              label={<Text strong>Reason</Text>} 
              rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea
              rows={4}
                placeholder={
                  selectedAction === 'reject' 
                    ? 'Please explain why you are declining this quotation...'
                    : 'Please describe the changes you would like to request...'
                }
                style={{ borderRadius: '8px' }}
            />
          </Form.Item>
          )}
          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Button
                onClick={() => setActionModalVisible?.(false)}
                size="large"
                style={{
                  borderRadius: '8px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  height: '48px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={actionLoading}
                size="large"
                style={{
                  borderRadius: '8px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  height: '48px',
                  background: selectedAction === 'reject' ? token.colorError : token.colorPrimary,
                  borderColor: selectedAction === 'reject' ? token.colorError : token.colorPrimary
                }}
              >
                {selectedAction === 'accept' ? 'Accept Quotation' :
                 selectedAction === 'reject' ? 'Decline Quotation' :
                 'Request Changes'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Enhanced OTP Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', paddingBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
              Email Verification
            </Title>
            <Text type="secondary">Enter the 6-digit code sent to your email</Text>
          </div>
        }
        open={otpModalVisible}
        onCancel={() => {
          setOtpModalVisible?.(false);
          otpForm?.resetFields();
        }}
        footer={null}
        width={500}
        style={{ borderRadius: '16px' }}
        styles={{ body: { padding: '24px' } }}
      >
        <Form
          form={otpForm}
          layout="vertical"
          onFinish={handleOtpSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="otp"
            label={<Text strong>Verification Code</Text>}
            rules={[
              { required: true, message: 'Please enter the verification code' },
              { pattern: /^\d{6}$/, message: 'Code must be 6 digits' }
            ]}
          >
            <Input
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                textAlign: 'center',
                fontSize: '24px',
                letterSpacing: '8px',
                height: '60px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Button
                onClick={() => {
                  setOtpModalVisible?.(false);
                  otpForm?.resetFields();
                }}
                size="large"
                style={{
                  borderRadius: '8px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  height: '48px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={otpLoading}
                size="large"
                style={{
                  borderRadius: '8px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  height: '48px',
                  background: token.colorSuccess,
                  borderColor: token.colorSuccess
                }}
              >
                Verify & Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuotationLandingTemplate;