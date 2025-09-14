'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  Spin,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  List,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending_approval' | 'pending_verification' | 'rejected';
  isApproved: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
}

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>User not found</Title>
        <Link href="/dashboard/admin/users">
          <Button icon={<ArrowLeftOutlined />}>Back to Users</Button>
        </Link>
      </div>
    );
  }

  const getStatusTag = (status: string, isApproved: boolean) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'inactive':
        return <Tag color="orange">Inactive</Tag>;
      case 'pending_approval':
        return <Tag color="blue">Pending Approval</Tag>;
      case 'pending_verification':
        return <Tag color="purple">Pending Verification</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <div>
          <Descriptions title="Basic Information" bordered column={2}>
            <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">{getStatusTag(user.status, user.isApproved)}</Descriptions.Item>
            <Descriptions.Item label="Email Verified">
              {user.emailVerified ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Joined">{new Date(user.createdAt).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Login IP">{user.lastLoginIP || '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'billing',
      label: 'Billing',
      children: (
        <div>
          <Title level={4}>Billing Information</Title>
          <Text type="secondary">Billing details will be displayed here.</Text>
        </div>
      ),
    },
    {
      key: 'quotations',
      label: 'Quotations',
      children: (
        <div>
          <Title level={4}>Quotations</Title>
          <Text type="secondary">User quotations will be listed here.</Text>
        </div>
      ),
    },
    {
      key: 'projects',
      label: 'Projects',
      children: (
        <div>
          <Title level={4}>Projects</Title>
          <Text type="secondary">User projects will be displayed here.</Text>
        </div>
      ),
    },
    {
      key: 'assets',
      label: 'Assets',
      children: (
        <div>
          <Title level={4}>Assets</Title>
          <Text type="secondary">User assets will be listed here.</Text>
        </div>
      ),
    },
    {
      key: 'support_tickets',
      label: 'Support Tickets',
      children: (
        <div>
          <Title level={4}>Support Tickets</Title>
          <Text type="secondary">Support tickets will be displayed here.</Text>
        </div>
      ),
    },
    {
      key: 'chats',
      label: 'Chats',
      children: (
        <div>
          <Title level={4}>Chats</Title>
          <Text type="secondary">Chat history will be shown here.</Text>
        </div>
      ),
    },
    {
      key: 'feedback_testimonial',
      label: 'Feedback & Testimonial',
      children: (
        <div>
          <Title level={4}>Feedback & Testimonials</Title>
          <Text type="secondary">User feedback and testimonials will be listed here.</Text>
        </div>
      ),
    },
    {
      key: 'meetings',
      label: 'Meetings',
      children: (
        <div>
          <Title level={4}>Meetings</Title>
          <Text type="secondary">Scheduled meetings will be displayed here.</Text>
        </div>
      ),
    },
    {
      key: 'wallet_points',
      label: 'Wallet Points',
      children: (
        <div>
          <Title level={4}>Wallet Points</Title>
          <Text type="secondary">Wallet balance and points history will be shown here.</Text>
        </div>
      ),
    },
    {
      key: 'referrals',
      label: 'Referrals',
      children: (
        <div>
          <Title level={4}>Referrals</Title>
          <Text type="secondary">Referral information will be displayed here.</Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/admin/users">
          <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
            Back to Users
          </Button>
        </Link>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size={80} icon={<UserOutlined />} />
            <div style={{ marginLeft: 24 }}>
              <Title level={2} style={{ margin: 0 }}>{user.name}</Title>
              <Space>
                <MailOutlined />
                <Text>{user.email}</Text>
              </Space>
              <div style={{ marginTop: 8 }}>
                {getStatusTag(user.status, user.isApproved)}
                <Tag color={user.role === 'admin' ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                  {user.role.toUpperCase()}
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          type="card"
          size="large"
        />
      </Card>
    </div>
  );
};

export default UserProfilePage;