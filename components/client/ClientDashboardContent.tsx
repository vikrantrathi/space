'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space, Progress, Tag, message, theme } from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import {
  UserOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth/auth-context';

const { Title } = Typography;

interface Quotation {
  _id: string;
  title: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revision';
  templateType: 'system' | 'pdf';
  createdAt: string;
  clientName?: string;
  clientEmail?: string;
  actions?: Array<{
    action: 'accept' | 'reject' | 'revision';
    reason?: string;
    timestamp: Date;
    verified: boolean;
  }>;
}

const ClientDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { token } = theme.useToken();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);

  // Fetch user's quotations
  const fetchUserQuotations = async () => {
    if (!user?.email) return;

    setLoadingQuotations(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        setLoadingQuotations(false);
        return;
      }

      const response = await fetch('/api/client/user/quotations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuotations(data.quotations);
      } else {
        message.error('Failed to load quotations');
      }
    } catch (error) {
      message.error('Failed to load quotations');
    } finally {
      setLoadingQuotations(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserQuotations();
    }
  }, [user?.email]);

  // Get status tag
  const getStatusTag = (status: string, quotation?: Quotation) => {
    switch (status) {
      case 'draft':
        return <Tag color="default">Draft</Tag>;
      case 'sent':
        return <Tag color="blue">Sent</Tag>;
      case 'accepted':
        return <Tag color="green">Accepted</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      case 'revision':
        // Check if the latest action was sent by admin
        const latestAction = quotation?.actions?.[quotation.actions.length - 1];
        const isAdminSent = latestAction?.reason?.includes('Admin sent revised quotation');
        return <Tag color="orange">{isAdminSent ? 'Revision Sent' : 'Revision Requested'}</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const quotationColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Quotation) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>
            {record.templateType === 'pdf' ? 'PDF Template' : 'System Template'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Quotation) => getStatusTag(status, record),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Quotation) => (
        <div>
          {record.status === 'accepted' ? (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green">Accepted</Tag>
                <div style={{ fontSize: '12px', marginTop: 4 }}>
                  {(() => {
                    const accepted = record.actions?.filter(a => a.action === 'accept').slice(-1)[0];
                    const date = accepted?.timestamp ? new Date(accepted.timestamp) : new Date(record.createdAt);
                    return `on ${date.toLocaleDateString()}`;
                  })()}
                </div>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Button
                  type="default"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(`/quotation/${record._id}`, '_blank')}
                >
                  View
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '4px' }}>
                <Button
                  type="default"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(`/quotation/${record._id}`, '_blank')}
                >
                  View
                </Button>
              </div>
            </>
          )}
          {record.actions && record.actions.length > 0 && (
            <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
              <div>Last action: <strong>{record.actions[record.actions.length - 1].action}</strong></div>
              <div>{new Date(record.actions[record.actions.length - 1].timestamp).toLocaleDateString()}</div>
              {record.actions[record.actions.length - 1].verified && (
                <Tag color="green">Verified</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Client Dashboard</Title>
      <Title level={4} style={{ marginTop: 8, color: token.colorTextSecondary }}>
        Welcome back, {user?.name}! Manage your projects and tasks here.
      </Title>

      {/* Client Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="My Projects"
              value={5}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={28}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={7}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Quick Actions" style={{ height: 200 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<ProjectOutlined />}>
                New Project
              </Button>
              <Button block icon={<FileTextOutlined />}>
                Create Task
              </Button>
              <Button block icon={<UserOutlined />}>
                Invite Team Member
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Project Progress" style={{ height: 200 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Website Redesign</span>
                <span>75%</span>
              </div>
              <Progress percent={75} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Mobile App</span>
                <span>45%</span>
              </div>
              <Progress percent={45} status="active" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>API Integration</span>
                <span>90%</span>
              </div>
              <Progress percent={90} status="success" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Tasks */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Recent Activity" style={{ height: 300 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Project Updated</div>
              <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>Website Redesign - 2 hours ago</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>New Task Assigned</div>
              <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>API Documentation - 4 hours ago</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Team Member Added</div>
              <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>John Doe joined the project - 1 day ago</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Milestone Completed</div>
              <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>Phase 1 delivery - 2 days ago</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Upcoming Tasks" style={{ height: 300 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Review Design Mockups</div>
                  <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>Due: Today, 5:00 PM</div>
                </div>
                <Button size="small" type="primary">View</Button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Client Meeting</div>
                  <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>Due: Tomorrow, 10:00 AM</div>
                </div>
                <Button size="small">View</Button>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Update Project Timeline</div>
                  <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>Due: Friday, 3:00 PM</div>
                </div>
                <Button size="small">View</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quotations Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <div style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              My Quotations ({quotations.length})
            </Title>
          </div>
          <UnifiedTable
            columns={quotationColumns}
            dataSource={quotations}
            loading={loadingQuotations}
            rowKey="_id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} quotations`,
            }}
            locale={{ emptyText: 'No quotations found' }}
            scroll={{ x: 600 }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboardContent;