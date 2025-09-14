'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space, theme } from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  CrownOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../lib/auth/auth-context';

const { Title } = Typography;

const AdminDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { token } = theme.useToken();

  // Mock data for admin dashboard
  const recentUsers = [
    { key: '1', name: 'John Doe', email: 'john@example.com', role: 'client', status: 'Active', joinDate: '2024-01-15' },
    { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'client', status: 'Active', joinDate: '2024-01-14' },
    // { key: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'client', status: 'Pending', joinDate: '2024-01-13' },
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">Edit</Button>
          <Button size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <CrownOutlined style={{ marginRight: 8 }} />
        Admin Dashboard
      </Title>
      <Title level={4} style={{ marginTop: 8, color: token.colorTextSecondary }}>
        Welcome back, {user?.name}! Manage your platform from here.
      </Title>

      {/* Admin Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1247}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={89}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={45678}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="System Health"
              value={98.5}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Admin Controls */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Quick Actions" style={{ height: 200 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<UserOutlined />}>
                Manage Users
              </Button>
              <Button block icon={<ProjectOutlined />}>
                View Projects
              </Button>
              <Button block icon={<SettingOutlined />}>
                System Settings
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Recent User Registrations" style={{ height: 200 }}>
            <UnifiedTable
              columns={columns}
              dataSource={recentUsers}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Admin Analytics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="User Growth" style={{ height: 300 }}>
            <p>User registration trends and analytics.</p>
            <p>Chart component would go here...</p>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="System Performance" style={{ height: 300 }}>
            <p>Server metrics, response times, and performance data.</p>
            <p>Monitoring dashboard would go here...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardContent;