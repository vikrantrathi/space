'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Card,
  Avatar,
  Typography,
  Tooltip,
  Tabs,
  App,
  theme
} from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

interface CreateUserFormData {
  name: string;
  email: string;
}

const AdminUsersView: React.FC = () => {
  const { modal, notification } = App.useApp();
  const { token } = theme.useToken();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        notification.error({
          message: 'Failed to Fetch Users',
          description: 'Unable to load user data. Please try again.',
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Fetching Users',
        description: 'Network error occurred while loading users.',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    if (activeTab === 'pending') {
      return users.filter(user => user.status === 'pending_approval');
    }
    return users;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user actions
  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId,
          adminId: currentUser?.id,
          reason,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful`,
          description: `User ${action} action completed successfully.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });

        if (result.emailSent) {
          notification.success({
            message: 'Notification Sent',
            description: 'Email notification sent to the user.',
            icon: <MailOutlined style={{ color: '#1890ff' }} />,
            duration: 3,
          });
        }

        fetchUsers(); // Refresh the list
      } else {
        notification.error({
          message: `Failed to ${action} User`,
          description: 'Unable to complete the requested action.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: `Error Performing ${action} Action`,
        description: 'Network error occurred. Please try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Show reject confirmation
  const showRejectConfirm = (user: User) => {
    setSelectedUser(user);
    setRejectModalVisible(true);
  };

  // Handle reject with reason
  const handleReject = () => {
    if (selectedUser && rejectReason.trim()) {
      handleUserAction(selectedUser._id, 'reject', rejectReason);
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedUser(null);
    } else {
      notification.error({
        message: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting the user.',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        duration: 4,
      });
    }
  };

  // Handle create user
  const handleCreateUser = async (values: CreateUserFormData) => {
    setCreateLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          adminId: currentUser?.id,
          userData: values,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'User Invitation Sent',
          description: `An invitation has been sent to ${values.name} at ${values.email}. They will receive instructions to set up their account.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });

        if (result.emailSent) {
          notification.success({
            message: 'Welcome Email Sent',
            description: 'A welcome email has been sent to the new user.',
            icon: <MailOutlined style={{ color: '#1890ff' }} />,
            duration: 3,
          });
        }

        setCreateModalVisible(false);
        createForm.resetFields();
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        notification.error({
          message: 'Failed to Create User',
          description: error.error || 'Unable to create user.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Creating User',
        description: 'Network error occurred. Please try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Get status tag
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

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User) => getStatusTag(record.status, record.isApproved),
    },
    {
      title: 'Email Verified',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: (verified: boolean) => (
        verified ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        )
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Last Login IP',
      dataIndex: 'lastLoginIP',
      key: 'lastLoginIP',
      render: (ip?: string) => ip || '-',
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="View Profile">
            <Link href={`/dashboard/admin/users/${record._id}/profile`}>
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
              >
                View Profile
              </Button>
            </Link>
          </Tooltip>
          {record.status === 'pending_approval' && (
            <>
              <Tooltip title="Approve User">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading === record._id}
                  onClick={() => handleUserAction(record._id, 'approve')}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject User">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => showRejectConfirm(record)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'active' && (
            <Tooltip title="Deactivate User">
              <Button
                danger
                size="small"
                icon={<UserSwitchOutlined />}
                loading={actionLoading === record._id}
                onClick={() => handleUserAction(record._id, 'deactivate')}
              >
                Deactivate
              </Button>
            </Tooltip>
          )}
          {record.status === 'rejected' && (
            <Tooltip title="Re-Approve User">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={actionLoading === record._id}
                onClick={() => handleUserAction(record._id, 'reapprove')}
              >
                Re-Approve
              </Button>
            </Tooltip>
          )}
          {record.status === 'inactive' && (
            <Tooltip title="Activate User">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={actionLoading === record._id}
                onClick={() => handleUserAction(record._id, 'activate')}
              >
                Activate
              </Button>
            </Tooltip>
          )}
          {record.role !== 'admin' && (
            <Tooltip title="Delete User">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={actionLoading === record._id}
                onClick={() => {
                  modal.confirm({
                    title: 'Delete User',
                    content: `Are you sure you want to permanently delete ${record.name}? This action cannot be undone.`,
                    okText: 'Delete',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: () => handleUserAction(record._id, 'delete'),
                  });
                }}
              >
                Delete
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <UserOutlined />
          All Users ({users.length})
        </span>
      ),
      children: (
        <UnifiedTable<User>
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 800 }}
        />
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined />
          Waiting Approval ({users.filter(u => u.status === 'pending_approval').length})
        </span>
      ),
      children: (
        <UnifiedTable<User>
          columns={columns}
          dataSource={getFilteredUsers()}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pending users`,
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No users waiting for approval' }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2}>
            <UserOutlined style={{ marginRight: 8 }} />
            User Management
          </Title>
          <Text type="secondary" style={{ display: 'block' }}>
            Manage user accounts, approvals, and access controls
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => setCreateModalVisible(true)}
          size="large"
        >
          Create User
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={tabItems}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Reject User Application"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedUser(null);
        }}
        okText="Reject"
        okType="danger"
      >
        <p>Please provide a reason for rejecting {selectedUser?.name}&apos;s application:</p>
        <TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter the user\'s full name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must be less than 100 characters' }
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
              >
                Create User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersView;