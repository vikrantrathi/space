'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, App } from 'antd';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import { LockOutlined, MailOutlined, KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../lib/auth/auth-context';
import { useGlobalLoader } from '../../../components/shared/GlobalLoader';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const notification = useNotification();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { login, verifyOtp, sendOtp } = useAuth();

  // Show global loader immediately and hide after page loads
  useEffect(() => {
    setGlobalLoading(true);
    
    // Hide loader after a short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setGlobalLoading(false);
      setIsPageLoading(false);
    }, 1500); // Slightly longer to ensure CSS is loaded

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Check if user has MFA enabled
      if (data.token) {
        // MFA is disabled - direct login successful
        localStorage.setItem('token', data.token);
        
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_SUCCESS;
        notification.success(msg.message, msg.description, msg.duration);

        // Redirect based on user role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/dashboard/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }, 1000);
      } else if (data.requiresOtp || data.mfaEnabled) {
        // MFA is enabled - proceed to OTP verification
        setStep('otp');
        const msg = NOTIFICATION_MESSAGES.AUTH.OTP_SENT;
        notification.success(msg.message, msg.description, msg.duration);
      } else {
        // Fallback - try the old way
        await login(values.email, values.password);
      }
    } catch (error) {
      // Handle specific approval status errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('pending approval')) {
        const msg = NOTIFICATION_MESSAGES.AUTH.ACCOUNT_PENDING_APPROVAL;
        notification.warning(msg.message, msg.description, msg.duration);
      } else if (errorMessage.includes('rejected')) {
        const msg = NOTIFICATION_MESSAGES.AUTH.ACCOUNT_REJECTED;
        notification.error(msg.message, msg.description, msg.duration);
      } else if (errorMessage.includes('deactivated')) {
        const msg = NOTIFICATION_MESSAGES.AUTH.ACCOUNT_DEACTIVATED;
        notification.error(msg.message, msg.description, msg.duration);
      } else {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    setOtpLoading(true);
    try {
      await verifyOtp(values.otp);
      const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_SUCCESS;
      notification.success(msg.message, msg.description, msg.duration);
      // Redirect is handled by verifyOtp function in auth context
    } catch (error) {
      const msg = NOTIFICATION_MESSAGES.AUTH.INVALID_OTP;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    const email = form.getFieldValue('email');
    if (email) {
      try {
        await sendOtp(email);
        const msg = NOTIFICATION_MESSAGES.AUTH.OTP_RESENT;
        notification.success(msg.message, msg.description, msg.duration);
      } catch (error) {
        const msg = NOTIFICATION_MESSAGES.AUTH.OTP_RESEND_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
      }
    }
  };

  // Show loading state while page is loading
  if (isPageLoading) {
    return null; // Let global loader handle the display
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ marginBottom: -60, marginTop: -50, display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/PNG.webp"
              alt="Startupzila Space Logo"
              width={240}
              height={240}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <Title level={2}>Startupzila Space</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {step === 'form' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Log In
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Link href="/auth/forgot-password">Forgot password?</Link>
                <Text>Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link></Text>
              </Space>
            </div>
          </Form>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>Verify Your Email</Title>
              <Text>We&apos;ve sent a 6-digit code to your email</Text>
            </div>

            <Form
              form={otpForm}
              onFinish={handleVerifyOtp}
              autoComplete="off"
            >
              <Form.Item
                name="otp"
                rules={[{ required: true, message: 'Please input the OTP!' }]}
              >
                <Input
                  prefix={<KeyOutlined />}
                  placeholder="Enter 6-digit code"
                  size="large"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                />
              </Form.Item>

              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={otpLoading}
                    block
                    size="large"
                  >
                    Verify & Log In
                  </Button>

                  <Button
                    type="link"
                    onClick={resendOtp}
                    block
                  >
                    Resend OTP
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <Button type="link" onClick={() => setStep('form')}>
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
