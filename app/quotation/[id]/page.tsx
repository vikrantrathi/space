'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Typography, Spin, theme, App } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import QuotationDashboardTemplate from '@/components/QuotationDashboardTemplate';
import QuotationLandingTemplate from '@/components/QuotationLandingTemplate';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/lib/auth/auth-context';

const { Title, Text } = Typography;

type Quotation = IQuotation & {
  _id: string;
  createdAt: string;
};

const QuotationPage: React.FC = () => {
  const { token } = theme.useToken();
  const { resolved } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { message: messageApi } = App.useApp();
  const params = useParams();
  const id = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [standardContent, setStandardContent] = useState<IStandardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Fetch standard content
  const fetchStandardContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/standard-content', { headers });
      if (response.ok) {
        const data = await response.json();
        setStandardContent(data.standardContent);
      } else {
        // If admin API fails, we'll use the data from quotation API
      }
    } catch (error) {
      console.error('Failed to fetch standard content:', error);
    }
  };

  // Track quotation view
  const trackQuotationView = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`/api/quotation/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({}) // Empty body since auth is handled server-side
      });
    } catch (error) {
      console.error('Error tracking quotation view:', error);
      // Silently fail - don't interrupt user experience
    }
  };

  // Fetch quotation
  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add cache-busting parameter to force fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/client/quotation/${id}${cacheBuster}`, { 
        headers,
        cache: 'no-store' // Force no caching
      });

      if (response.ok) {
        const data = await response.json();
        // Debug log removed
        setQuotation(data.quotation);
        setStandardContent(data.standardContent); // Use standard content from API response
        
        // Track the view after successful fetch
        trackQuotationView();
      } else {
        messageApi.error('Quotation not found or not available');
      }
    } catch (error) {
      messageApi.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  // Action handler for logged-in users (direct action without OTP)
  const handleLoggedInAction = async (action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('Authentication required. Please log in.');
        return;
      }

      const requestBody = {
        action,
        ...(reason && { reason }),
      };
      
      console.log('Sending action request:', requestBody);

      const response = await fetch(`/api/client/user/quotation/${id}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        messageApi.success(`Quotation ${action}ed successfully!`);
        fetchQuotation(); // Refresh the quotation data
      } else {
        const error = await response.json();
        messageApi.error(error.error || `Failed to ${action} quotation`);
      }
    } catch (error) {
      messageApi.error(`Failed to ${action} quotation`);
    } finally {
      setActionLoading(false);
    }
  };

  // Action handler for public users (with OTP flow)
  const handlePublicAction = async (actionData: {
    name: string;
    email: string;
    phone: string;
    action: string;
    reason?: string;
  }) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/client/quotation/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });

      if (response.ok) {
        messageApi.success('OTP sent to your email. Please check your inbox.');
        setActionModalVisible(false);
        setOtpModalVisible(true);
        actionForm.resetFields();
      } else {
        const error = await response.json();
        messageApi.error(error.error || 'Failed to send OTP');
      }
    } catch (error) {
      messageApi.error('Failed to send OTP');
    } finally {
      setActionLoading(false);
    }
  };

  // Unified action handler that routes based on authentication
  const handleAction = async (actionData: {
    name: string;
    email: string;
    phone: string;
    action: string;
    reason?: string;
  }) => {
    if (isAuthenticated && user) {
      // For logged-in users, use the selected action from modal
      const actionToUse = selectedAction || actionData.action;
      await handleLoggedInAction(actionToUse, actionData.reason);
    } else {
      // For public users, use OTP flow
      await handlePublicAction(actionData);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (values: { otp: string }) => {
    setOtpLoading(true);
    try {
      const response = await fetch(`/api/client/quotation/${id}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: values.otp }),
      });

      if (response.ok) {
        const result = await response.json();
        messageApi.success(`Quotation ${result.action}ed successfully!`);
        setOtpModalVisible(false);
        otpForm.resetFields();
        fetchQuotation();
      } else {
        const error = await response.json();
        messageApi.error(error.error || 'Invalid OTP');
      }
    } catch (error) {
      messageApi.error('Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
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

  if (!quotation) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: resolved === 'dark'
          ? 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card style={{
          maxWidth: '500px',
          borderRadius: '20px',
          boxShadow: resolved === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.5)'
            : '0 20px 40px rgba(0,0,0,0.2)',
          background: token.colorBgContainer
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileTextOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '20px' }} />
            <Title level={3} style={{ marginBottom: '10px', color: token.colorText }}>Quotation Not Found</Title>
            <Text type="secondary">The quotation you&apos;re looking for is not available or may have been removed.</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Process dates for both templates
  const processedQuotation = {
    ...quotation,
    quotationDate: quotation.quotationDate ? new Date(quotation.quotationDate) : new Date(),
    expirationDate: quotation.expirationDate ? new Date(quotation.expirationDate) : undefined,
    createdAt: new Date(quotation.createdAt),
    paymentMilestones: quotation.paymentMilestones?.map(milestone => ({
      ...milestone,
      dueDate: new Date(milestone.dueDate)
    })),
    statusTimeline: quotation.statusTimeline?.map(item => ({
      ...item,
      date: new Date(item.date)
    }))
  };

  // Render dashboard template if templateType is 'dashboard'
  if (quotation?.templateType === 'dashboard') {
    return (
      <QuotationDashboardTemplate
        quotation={processedQuotation as Quotation}
        standardContent={standardContent || undefined}
        onAction={(action, data) => {
          if (isAuthenticated && user) {
            // For logged-in users, check if reason is required
            if (action === 'reject' || action === 'revision') {
              // Open modal for reject/revision actions to get reason
              setSelectedAction(action);
              setActionModalVisible(true);
            } else {
              // For accept actions, call directly
              handleLoggedInAction(action, data.reason);
            }
          } else {
            // For public users, use the OTP flow
            handleAction({ ...data, action });
          }
        }}
        onOtpSubmit={handleOtpSubmit}
        loading={loading}
        actionModalVisible={actionModalVisible}
        setActionModalVisible={setActionModalVisible}
        otpModalVisible={otpModalVisible}
        setOtpModalVisible={setOtpModalVisible}
        actionForm={actionForm}
        selectedAction={selectedAction}
        setSelectedAction={setSelectedAction}
        otpForm={otpForm}
        actionLoading={actionLoading}
        otpLoading={otpLoading}
      />
    );
  }

  // Render landing page template
  return (
    <QuotationLandingTemplate
      quotation={processedQuotation as Quotation}
      onAction={(data) => {
        if (isAuthenticated && user) {
          // For logged-in users, check if reason is required
          if (data.action === 'reject' || data.action === 'revision') {
            // Open modal for reject/revision actions to get reason
            setSelectedAction(data.action);
            setActionModalVisible(true);
          } else {
            // For accept actions, call directly
            handleLoggedInAction(data.action, data.reason);
          }
        } else {
          // For public users, use the OTP flow
          handleAction(data);
        }
      }}
      onOtpSubmit={handleOtpSubmit}
      loading={loading}
      actionModalVisible={actionModalVisible}
      setActionModalVisible={setActionModalVisible}
      otpModalVisible={otpModalVisible}
      setOtpModalVisible={setOtpModalVisible}
      actionForm={actionForm}
      otpForm={otpForm}
      actionLoading={actionLoading}
      otpLoading={otpLoading}
    />
  );
      
};

export default QuotationPage;
