'use client';

import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Typography, Space,
  Modal, Select, Tooltip, App, Spin, Tag, theme
} from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import {
  UserOutlined, LockOutlined, SafetyOutlined, UploadOutlined, MailOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../../../lib/auth/auth-context';

const { Title, Text } = Typography;

interface EmailTemplate {
  _id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EmailTemplatesPage: React.FC = () => {
  const { user } = useAuth();
  const { token } = theme.useToken();
  const [templateForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Email Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const { notification } = App.useApp();

  // Email Template Functions
  const fetchTemplates = async (showNotification: boolean = true) => {
    setTemplateLoading(true);
    try {
      const response = await fetch('/api/admin/email-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        if (showNotification) {
          notification.success({
            message: 'Templates Refreshed',
            description: 'Email templates have been refreshed successfully.',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            duration: 3,
          });
        }
      } else {
        notification.error({
          message: 'Failed to Fetch Templates',
          description: 'Unable to load email templates.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Fetching Templates',
        description: 'Network error occurred while loading templates.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateSubmit = async (values: {
    name: string;
    type: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    variables?: string[];
  }) => {
    try {
      const url = editingTemplate
        ? `/api/admin/email-templates/${editingTemplate._id}`
        : '/api/admin/email-templates';

      const method = editingTemplate ? 'PUT' : 'POST';

      const body = {
        ...values,
        ...(editingTemplate && {
          name: editingTemplate.name,
          type: editingTemplate.type,
        }),
        updatedBy: user?.id,
        createdBy: editingTemplate ? undefined : user?.id,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: editingTemplate ? 'Template Updated' : 'Template Created',
          description: `Email template has been ${editingTemplate ? 'updated' : 'created'} successfully.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });
        setModalVisible(false);
        templateForm.resetFields();
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        notification.error({
          message: 'Failed to Save Template',
          description: 'Unable to save the email template.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Saving Template',
        description: 'Network error occurred while saving.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notification.success({
          message: 'Template Deleted',
          description: 'Email template has been deleted successfully.',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });
        fetchTemplates();
      } else {
        notification.error({
          message: 'Failed to Delete Template',
          description: 'Unable to delete the email template.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Deleting Template',
        description: 'Network error occurred while deleting.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    }
  };

  const handleToggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !isActive,
          updatedBy: user?.id,
        }),
      });

      if (response.ok) {
        notification.success({
          message: `Template ${!isActive ? 'Activated' : 'Deactivated'}`,
          description: `Email template has been ${!isActive ? 'activated' : 'deactivated'} successfully.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
        fetchTemplates();
      } else {
        notification.error({
          message: 'Failed to Update Template',
          description: 'Unable to update template status.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Updating Template',
        description: 'Network error occurred while updating.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    }
  };

  // Fetch templates when component mounts (for admin users)
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTemplates(false);
    }
  }, [user]);

  return (
    <div>
      <Title level={2}>System Email Templates</Title>

      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
              Templates Count -
                <Text type="secondary" style={{ fontSize: '14px', marginLeft: '12px', color: token.colorTextSecondary }}>
                  ({templates.length} total)
                </Text>
              </Title>
              <Text type="secondary">Manage the content of all system emails sent by the platform</Text>
            </div>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => fetchTemplates()}
              loading={templateLoading}
            >
              Refresh Templates
            </Button>
          </div>
        </div>

        <UnifiedTable
          dataSource={templates}
          loading={templateLoading}
          rowKey="_id"
          columns={[
            {
              title: 'Template Name',
              dataIndex: 'name',
              key: 'name',
              render: (name, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{name}</div>
                    <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
                      {record.type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Subject',
              dataIndex: 'subject',
              key: 'subject',
              ellipsis: true,
            },
            {
              title: 'Status',
              dataIndex: 'isActive',
              key: 'isActive',
              render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'} style={{ fontWeight: 'bold' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </Tag>
              ),
            },
            {
              title: 'Last Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              render: (date) => new Date(date).toLocaleDateString(),
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_: unknown, record: EmailTemplate) => (
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    loading={templateLoading}
                    onClick={() => {
                      setEditingTemplate(record);
                      templateForm.setFieldsValue(record);
                      setModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type={record.isActive ? 'default' : 'primary'}
                    icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                    size="small"
                    loading={templateLoading}
                    onClick={() => handleToggleTemplate(record._id, record.isActive)}
                  >
                    {record.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} templates`,
          }}
          locale={{
            emptyText: templates.length === 0 && !templateLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MailOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>No Email Templates Found</div>
                <div style={{ color: token.colorTextSecondary }}>No email templates have been created yet.</div>
              </div>
            ) : undefined
          }}
        />

        {/* Edit Modal */}
        <Modal
          title={`Edit ${editingTemplate?.name || 'Email Template'}`}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingTemplate(null);
            templateForm.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form
            form={templateForm}
            layout="vertical"
            onFinish={handleTemplateSubmit}
          >
            <Form.Item
              name="subject"
              label="Email Subject"
              rules={[{ required: true, message: 'Please enter email subject' }]}
            >
              <Input placeholder="e.g., Welcome to Startupzila Space!" />
            </Form.Item>

            <Form.Item
              name="htmlContent"
              label="Email Content (HTML)"
              rules={[{ required: true, message: 'Please enter email content' }]}
            >
              <Input.TextArea
                rows={12}
                placeholder="Enter your email content here..."
              />
            </Form.Item>

            <Form.Item
              name="textContent"
              label="Plain Text Version (Optional)"
              help="Plain text version for email clients that don't support HTML"
            >
              <Input.TextArea
                rows={6}
                placeholder="Plain text version of the email..."
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingTemplate(null);
                  templateForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default EmailTemplatesPage;