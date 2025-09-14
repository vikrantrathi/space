'use client';

import React from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Spin,
  theme,
  Tabs
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/lib/auth/auth-context';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  RocketOutlined,
  StarOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';
import {
  QuotationHeader,
  QuotationHero,
  QuotationCTA,
  FloatingWhatsApp,
  OverviewTab,
  FeaturesBenefitsTab,
  PricingTimelineTab,
  ProcessWorkflowTab,
  TestimonialsPortfolioTab,
  TermsConditionsTab,
  ProcessVideoWidget
} from './dashboard-quotation-view';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ActionData {
  name: string;
  email: string;
  phone: string;
  reason?: string;
}

interface ExtendedCompanyDetails {
  name?: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  tagline?: string;
  featuresDescription?: string;
  benefitsDescription?: string;
  pricingDescription?: string;
  termsDescription?: string;
  ctaDescription?: string;
}

interface QuotationDashboardTemplateProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  onAction: (action: string, data: ActionData) => void;
  onOtpSubmit?: (values: { otp: string }) => void;
  loading?: boolean;
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

const QuotationDashboardTemplate: React.FC<QuotationDashboardTemplateProps> = ({
  quotation,
  standardContent,
  onAction,
  onOtpSubmit,
  loading = false,
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
  // Template rendering
  const { token } = theme.useToken();
  const { resolved } = useTheme();
  const { isAuthenticated, user } = useAuth();

  // Currency utility function
  const getCurrencySymbol = (currency: string) => {
    return currency === 'INR' ? '₹' : '$';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = getCurrencySymbol(currency || 'USD');
    const numericAmount = typeof amount === 'number' && isFinite(amount) ? amount : 0;
    return `${symbol}${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [activeTab, setActiveTab] = React.useState('overview');

  // Merge quotation and standard content data
  const mergedData = React.useMemo(() => {
    const quotationCompanyDetails = (quotation.companyDetails || {}) as ExtendedCompanyDetails;
    const standardCompanyDetails = (standardContent?.companyDetails || {}) as ExtendedCompanyDetails;
    
    // Pass raw data to components - let them handle merging
    const features = quotation.features || [];
    const benefits = quotation.benefits || [];
    const terms = quotation.terms || standardContent?.defaultTerms || '';
    const processSteps = quotation.processSteps?.length ? quotation.processSteps : (standardContent?.processSteps || []);
    const testimonials = quotation.testimonials?.length ? quotation.testimonials : (standardContent?.testimonials || []);
    const previousWork = quotation.previousWork?.length ? quotation.previousWork : (standardContent?.previousWork || []);

    return {
      ...quotation,
      companyDetails: {
        name: quotationCompanyDetails.name || standardCompanyDetails.name || '',
        logo: quotationCompanyDetails.logo || standardCompanyDetails.logo || '',
        email: quotationCompanyDetails.email || standardCompanyDetails.email || '',
        phone: quotationCompanyDetails.phone || standardCompanyDetails.phone || '',
        website: quotationCompanyDetails.website || standardCompanyDetails.website || '',
        tagline: standardCompanyDetails.tagline || '', // Only from standard content
        featuresDescription: standardCompanyDetails.featuresDescription || '', // Only from standard content
        benefitsDescription: standardCompanyDetails.benefitsDescription || '', // Only from standard content
        pricingDescription: standardCompanyDetails.pricingDescription || '', // Only from standard content
        termsDescription: standardCompanyDetails.termsDescription || '', // Only from standard content
        ctaDescription: standardCompanyDetails.ctaDescription || '', // Only from standard content
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

  const displayQuotation = mergedData as IQuotation & { companyDetails: ExtendedCompanyDetails };

  const handleAction = (action: string) => {
    console.log('Template handleAction called:', { action, isAuthenticated, user: !!user });
    if (isAuthenticated && user) {
      // For logged-in users, use the parent's onAction logic which handles authentication properly
      onAction(action, {
        name: user.name || '',
        email: user.email || '',
        phone: '', // Phone not available in user object
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'revision': return 'blue';
      default: return 'blue';
    }
  };

  // Use displayQuotation instead of quotation for all rendering



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: resolved === 'dark'
        ? 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      {/* Header Component */}
      <QuotationHeader 
        quotation={quotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer,
          colorPrimary: token.colorPrimary,
          colorTextSecondary: token.colorTextSecondary,
          colorBorder: token.colorBorder
        }}
      />

      {/* Hero Section Component */}
      <QuotationHero 
        quotation={quotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer
        }}
      />

      {/* Desktop: Two Separate Sections */}
      <div className="hidden md:block">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left Section: Tabs */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Card style={{
              borderRadius: '16px',
              background: token.colorBgContainer,
              boxShadow: resolved === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                  {
                    key: 'overview',
                    label: (
                <Space>
                        <FileTextOutlined />
                        Overview
                      </Space>
                    ),
                    children: (
                      <OverviewTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                        getStatusColor={getStatusColor}
                      />
                    )
                  },
                  {
                    key: 'features',
                    label: (
                      <Space>
                        <CheckCircleOutlined />
                        Features & Benefits
                </Space>
                    ),
                    children: (
                      <FeaturesBenefitsTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                      />
                    )
                  },
                  {
                    key: 'pricing',
                    label: (
                <Space>
                        <DollarOutlined />
                        Project Pricing
                </Space>
                    ),
                    children: (
                      <PricingTimelineTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                        formatCurrency={formatCurrency}
                      />
                    )
                  },
                  {
                    key: 'process',
                    label: (
                      <Space>
                        <RocketOutlined />
                        Process & Timeline
                      </Space>
                    ),
                    children: (
                      <ProcessWorkflowTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                        getStatusColor={getStatusColor}
                      />
                    )
                  },
                  {
                    key: 'testimonials',
                    label: (
                      <Space>
                        <StarOutlined />
                        Testimonials & Portfolio
                      </Space>
                    ),
                    children: (
                      <TestimonialsPortfolioTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                      />
                    )
                  },
                  {
                    key: 'terms',
                    label: (
                      <Space>
                        <FileTextOutlined />
                        Terms & Conditions
                      </Space>
                    ),
                    children: (
                      <TermsConditionsTab 
                        quotation={displayQuotation}
                        standardContent={standardContent}
                      />
                    )
                  }
                ]}
              />
            </Card>
          </div>
          
          {/* Right Section: 
          
          Widget */}
          <div style={{ width: '400px', marginTop: '8px', flexShrink: 0 }}>
            <ProcessVideoWidget 
              standardContent={standardContent}
              theme={{
                colorBgContainer: token.colorBgContainer,
                colorPrimary: token.colorPrimary,
                colorTextSecondary: token.colorTextSecondary,
                colorBorder: token.colorBorder
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Widget Layout */}
      <div className="block md:hidden">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Overview Widget */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Overview
              </Space>
            }
            style={{
          borderRadius: '12px',
          background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <OverviewTab 
              quotation={displayQuotation}
              standardContent={standardContent}
              getStatusColor={getStatusColor}
            />
        </Card>

          {/* Features & Benefits Widget */}
          <Card 
            title={
              <Space>
                <CheckCircleOutlined />
                Features & Benefits
              </Space>
            }
            style={{
          borderRadius: '12px',
          background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <FeaturesBenefitsTab 
              quotation={displayQuotation}
              standardContent={standardContent}
            />
        </Card>

          {/* Pricing & Timeline Widget */}
          <Card 
            title={
              <Space>
                <DollarOutlined />
              Pricing
              </Space>
            }
            style={{
              borderRadius: '12px',
              background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <PricingTimelineTab 
              quotation={displayQuotation}
              standardContent={standardContent}
              formatCurrency={formatCurrency}
            />
            </Card>

          {/* Process & Workflow Widget */}
          <Card 
            title={
              <Space>
                <RocketOutlined />
                Process & Timeline
              </Space>
            }
            style={{
            borderRadius: '12px',
            background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <ProcessWorkflowTab 
              quotation={displayQuotation}
              standardContent={standardContent}
              getStatusColor={getStatusColor}
            />
          </Card>

          {/* Process Video Widget - Mobile */}
          <ProcessVideoWidget 
            standardContent={standardContent}
            theme={{
              colorBgContainer: token.colorBgContainer,
              colorPrimary: token.colorPrimary,
              colorTextSecondary: token.colorTextSecondary,
              colorBorder: token.colorBorder
            }}
          />

          {/* Testimonials & Portfolio Widget */}
          <Card 
            title={
              <Space>
                <StarOutlined />
                Testimonials & Portfolio
              </Space>
            }
            style={{
          borderRadius: '12px',
          background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <TestimonialsPortfolioTab 
              quotation={displayQuotation}
              standardContent={standardContent}
            />
          </Card>

          {/* Terms & Conditions Widget */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Terms & Conditions
              </Space>
            }
            style={{
            borderRadius: '12px',
            background: token.colorBgContainer,
              border: '1px solid ' + token.colorBorder
            }}
          >
            <TermsConditionsTab 
              quotation={displayQuotation}
              standardContent={standardContent}
            />
          </Card>
        </Space>
      </div>

      {/* CTA Section Component */}
      <QuotationCTA 
        quotation={quotation}
        standardContent={standardContent}
        theme={{
          colorBgContainer: token.colorBgContainer,
          colorPrimary: token.colorPrimary,
          colorSuccess: token.colorSuccess,
          colorError: token.colorError,
          colorWarning: token.colorWarning
        }}
        onActionClick={handleAction}
      />

      {/* Floating WhatsApp Component */}
      <FloatingWhatsApp 
        quotation={quotation}
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

export default QuotationDashboardTemplate;