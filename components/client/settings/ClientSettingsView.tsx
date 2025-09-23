'use client';

import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Switch, Typography, Avatar, Upload, Space, Divider, Tabs,
  theme
} from 'antd';
import {
  UserOutlined, LockOutlined, SafetyOutlined, UploadOutlined, MailOutlined
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import ThemeModeSelect from '@/components/UI/ThemeModeSelect';

const { Title, Text } = Typography;


const ClientSettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { token } = theme.useToken();
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);

  // Sync local MFA state with auth context
  useEffect(() => {
    if (user?.mfaEnabled !== undefined) {
      setMfaEnabled(user.mfaEnabled);
    }
  }, [user?.mfaEnabled]);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || '');

  // Sync avatarUrl with user profile picture
  useEffect(() => {
    if (user?.profilePicture && user.profilePicture !== avatarUrl) {
      setAvatarUrl(user.profilePicture);
    }
  }, [user?.profilePicture, avatarUrl]);

  const notification = useNotification();

  const handleAvatarUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setAvatarUrl(result.url);

      // Update global user state
      updateUser({ profilePicture: result.url });

      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.LOGO_UPLOAD_SUCCESS;
      notification.success(msg.message, msg.description, msg.duration);

      return result.url;
    } catch (error) {
      const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
      notification.error(msg.message, msg.description, msg.duration);
      throw error;
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
        return;
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Password change failed' }));
        throw new Error(errorData.error || 'Password change failed');
      }

      const msg = NOTIFICATION_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS;
      notification.success(msg.message, msg.description, msg.duration);
      passwordForm.resetFields();
    } catch {
      const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: { name: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
        return;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Profile update failed' }));
        throw new Error(errorData.error || 'Profile update failed');
      }

      await response.json();

      const msg = NOTIFICATION_MESSAGES.GENERAL.SUCCESS || { message: 'Profile Updated Successfully', description: 'Your profile has been updated.', duration: 4 };
      notification.success(msg.message, msg.description, msg.duration);
    } catch {
      const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaToggle = async (checked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
        return;
      }

      const response = await fetch('/api/auth/toggle-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: checked }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'MFA toggle failed' }));
        throw new Error(errorData.error || 'MFA toggle failed');
      }
      
      setMfaEnabled(checked);
      // Update the global auth context
      updateUser({ mfaEnabled: checked });
      const msg = checked ? NOTIFICATION_MESSAGES.AUTH.MFA_ENABLED : NOTIFICATION_MESSAGES.AUTH.MFA_DISABLED;
      notification.success(msg.message, msg.description, msg.duration);
    } catch (error) {
      console.error('MFA toggle error:', error);
      const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Appearance" style={{ width: '100%' }}>
            <ThemeModeSelect />
          </Card>
          {/* Profile Settings */}
          <Card title="Profile Information" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar
                size={64}
                src={avatarUrl || undefined}
                icon={<UserOutlined />}
                style={{ marginRight: 16 }}
              />
              <div>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                      notification.error(msg.message, msg.description, msg.duration);
                      return false;
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                      notification.error(msg.message, msg.description, msg.duration);
                      return false;
                    }
                    handleAvatarUpload(file);
                    return false; // Prevent default upload
                  }}
                >
                  <Button icon={<UploadOutlined />}>Change Avatar</Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Supported formats: JPEG, PNG, GIF, WebP • Max size: 5MB
                  </Text>
                </div>
              </div>
            </div>

            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                name: user?.name,
                email: user?.email,
              }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
              >
                <Input
                  prefix={<MailOutlined />}
                  disabled
                  value={user?.email}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Password Settings */}
          <Card title="Change Password" style={{ width: '100%' }}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <Card title="Security Settings" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ margin: 0 }}>
                <SafetyOutlined style={{ marginRight: 8 }} />
                Multi-Factor Authentication (MFA)
              </Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {mfaEnabled
                  ? 'MFA is enabled. You will need to verify with OTP when logging in.'
                  : 'MFA is disabled. Enable for enhanced account security with OTP verification.'}
              </Text>
            </div>
            <Switch
              checked={mfaEnabled}
              onChange={handleMfaToggle}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </div>

          <div style={{
            background: mfaEnabled ? token.colorSuccessBg : token.colorWarningBg,
            border: `1px solid ${mfaEnabled ? token.colorSuccessBorder : token.colorWarningBorder}`,
            padding: 12,
            borderRadius: 6,
            marginBottom: 24
          }}>
            <Text style={{ fontSize: 12 }}>
              {mfaEnabled
                ? '🔐 Enhanced security is active. You will receive an OTP via email during login.'
                : '⚠️ Consider enabling MFA for better account protection. OTP will be required for login.'}
            </Text>
          </div>

          <Divider />

          <div>
            <Title level={4} style={{ margin: 0 }}>
              Account Role
            </Title>
            <Text type="secondary">
              Your current role: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
            </Text>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Settings</Title>

      <Tabs
        defaultActiveKey="profile"
        items={tabItems}
        type="card"
        size="large"
      />
    </div>
  );
};

export default ClientSettingsView;