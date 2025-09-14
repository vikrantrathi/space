'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Row, Col, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, KeyOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../lib/auth/auth-context';
import { useGlobalLoader } from '../../../components/shared/GlobalLoader';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text } = Typography;

const SignupPage: React.FC = () => {
  const { notification } = App.useApp();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { signup, verifyOtp, sendOtp } = useAuth();

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

  const handleSignup = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await signup(values.email, values.password, values.name);
      setStep('otp');
      notification.success({
        message: 'OTP Sent',
        description: 'A 6-digit code has been sent to your email address.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 4,
      });
    } catch (error) {
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists')) {
        notification.error({
          message: 'User Already Exists',
          description: 'An account with this email already exists. Please login instead.',
          icon: <KeyOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      } else if (errorMessage.includes('submitted for approval')) {
        notification.warning({
          message: 'Profile Pending Approval',
          description: 'Your profile is already submitted for approval. Please wait for admin approval.',
          icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
          duration: 6,
        });
      } else if (errorMessage.includes('deactivated')) {
        notification.error({
          message: 'Account Deactivated',
          description: 'Your account has been deactivated. Please contact support to reactivate.',
          icon: <KeyOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      } else {
        notification.error({
          message: 'Signup Failed',
          description: 'Please try again or contact support.',
          icon: <KeyOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    setOtpLoading(true);
    try {
      await verifyOtp(values.otp);
      notification.success({
        message: 'Account Created Successfully!',
        description: 'Your profile has been submitted for admin approval. You will be notified once approved.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 6,
      });
      // Don't redirect to dashboard - user needs approval first
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      notification.error({
        message: 'Verification Failed',
        description: 'Invalid OTP. Please check the code and try again.',
        icon: <KeyOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    const email = form.getFieldValue('email');
    if (email) {
      try {
        await sendOtp(email);
        notification.success({
          message: 'OTP Resent',
          description: 'A new 6-digit code has been sent to your email.',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
      } catch (error) {
        notification.error({
          message: 'Failed to Resend OTP',
          description: 'Please try again in a few moments.',
          icon: <KeyOutlined style={{ color: '#ff4d4f' }} />,
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
          <Text type="secondary">Create your account</Text>
        </div>

        {step === 'form' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSignup}
            autoComplete="off"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full Name"
                size="large"
              />
            </Form.Item>

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
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
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
                placeholder="Confirm Password"
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
                Sign Up
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text>Already have an account? </Text>
              <Link href="/auth/login">Log in</Link>
            </div>
          </Form>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>Verify Your Email</Title>
              <Text>We sent a 6-digit code to your email</Text>
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
                    Verify & Complete Signup
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
                Back to Signup
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignupPage;
