'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Space,
  Spin
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useGlobalLoader } from '../../components/shared/GlobalLoader';
import Image from 'next/image';

const { Title, Text } = Typography;
const { Password } = Input;

interface PasswordSetupFormData {
  password: string;
  confirmPassword: string;
}

interface VerificationUser {
  _id: string;
  name: string;
  email: string;
}

const VerifyEmailContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setLoading: setGlobalLoading } = useGlobalLoader();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [userData, setUserData] = useState<VerificationUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  // Verify token on page load
  useEffect(() => {
    if (!token) {
      setError('Invalid verification link. No token provided.');
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify-admin-user-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid or expired verification link.');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePasswordSetup = async (values: PasswordSetupFormData) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/setup-admin-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to set up password.');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while page is loading
  if (isPageLoading) {
    return null; // Let global loader handle the display
  }

  if (verifying) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <Card style={{ textAlign: 'center', width: 400 }}>
          <div style={{ marginBottom: -50, marginTop: -40, display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/PNG.webp"
              alt="Startupzila Space Logo"
              width={180}
              height={180}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Verifying your account...
          </Title>
          <Text type="secondary">
            Please wait while we verify your account setup link.
          </Text>
        </Card>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <Card style={{ textAlign: 'center', width: 400 }}>
          <div style={{ marginBottom: -50, marginTop: -40, display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/PNG.webp"
              alt="Startupzila Space Logo"
              width={180}
              height={180}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
          <Title level={4} style={{ color: '#ff4d4f' }}>
            Verification Failed
          </Title>
          <Text>{error}</Text>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={() => router.push('/')}
          >
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <Card style={{ textAlign: 'center', width: 400 }}>
          <div style={{ marginBottom: -50, marginTop: -40, display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/PNG.webp"
              alt="Startupzila Space Logo"
              width={180}
              height={180}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4} style={{ color: '#52c41a' }}>
            Account Setup Complete!
          </Title>
          <Text>
            Your password has been set successfully. You can now log in to your account.
          </Text>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Redirecting to login page in 3 seconds...
          </Text>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={() => router.push('/auth/login')}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--background)'
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <div style={{ marginBottom: -60, marginTop: -50, display: 'flex', justifyContent: 'center' }}>
          <Image
            src="/PNG.webp"
            alt="Startupzila Space Logo"
            width={240}
            height={240}
            style={{ borderRadius: '8px' }}
          />
        </div>
        <Title level={3}>Complete Your Account Setup</Title>
        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
          Welcome {userData?.name}! Please set up your password to complete your account.
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handlePasswordSetup}
        >
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              {
                pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
              }
            ]}
          >
            <Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

const VerifyEmailPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <Card style={{ textAlign: 'center', width: 400 }}>
          <div style={{ marginBottom: -50, marginTop: -40, display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/PNG.webp"
              alt="Startupzila Space Logo"
              width={180}
              height={180}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Loading...
          </Title>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
