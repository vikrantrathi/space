'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, App } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useGlobalLoader } from '../../../components/shared/GlobalLoader';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const { notification } = App.useApp();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  const [emailForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [verifiedOtp, setVerifiedOtp] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  const handleSendOtp = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send OTP' }));
        throw new Error(errorData.error || 'Failed to send OTP');
      }
      
      setUserEmail(values.email);
      setStep('otp');
      notification.success({
        message: 'Reset Code Sent',
        description: 'A 6-digit reset code has been sent to your email address.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 4,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Send Reset Code',
        description: error instanceof Error ? error.message : 'Please check your email and try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    setOtpLoading(true);
    try {
      // Just validate the OTP format for now, actual verification happens during password reset
      const cleanOtp = String(values.otp).trim().replace(/\s/g, '');
      
      if (!/^\d{6}$/.test(cleanOtp)) {
        throw new Error('OTP must be a 6-digit number');
      }
      
      setVerifiedOtp(cleanOtp);
      setStep('reset');
      notification.success({
        message: 'Ready to Reset Password',
        description: 'You can now set your new password.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 4,
      });
    } catch (error) {
      notification.error({
        message: 'Invalid Code Format',
        description: error instanceof Error ? error.message : 'Please check the code and try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (values: { password: string; confirmPassword: string }) => {
    setResetLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          otp: verifiedOtp,
          password: values.password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Password reset failed' }));
        throw new Error(errorData.error || 'Password reset failed');
      }
      
      notification.success({
        message: 'Password Reset Successful!',
        description: 'Your password has been updated successfully. Redirecting to login...',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 5,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      notification.error({
        message: 'Password Reset Failed',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const resendOtp = async () => {
    if (userEmail) {
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to resend OTP' }));
          throw new Error(errorData.error || 'Failed to resend OTP');
        }
        
        notification.success({
          message: 'Reset Code Resent',
          description: 'A new 6-digit code has been sent to your email.',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });
      } catch (error) {
        notification.error({
          message: 'Failed to Resend Code',
          description: error instanceof Error ? error.message : 'Please try again in a few moments.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
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
          <Text type="secondary">Reset your password</Text>
        </div>

        {step === 'email' && (
          <Form
            form={emailForm}
            layout="vertical"
            onFinish={handleSendOtp}
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Send Reset Code
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link href="/auth/login">Back to Login</Link>
            </div>
          </Form>
        )}

        {step === 'otp' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>Enter Reset Code</Title>
              <Text>We&apos;ve sent a 6-digit reset code to {userEmail}</Text>
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
                    Verify Code
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
              <Button type="link" onClick={() => setStep('email')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'reset' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>Set New Password</Title>
              <Text>Choose a strong password for your account</Text>
            </div>
            
            <Form
              form={resetForm}
              layout="vertical"
              onFinish={handleResetPassword}
              autoComplete="off"
            >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                block
                size="large"
              >
                Reset Password
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link href="/auth/login">Back to Login</Link>
            </div>
          </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
