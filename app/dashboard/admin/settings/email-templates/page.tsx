'use client';

import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Typography, Space,
  Modal, Tag, theme, Tabs, Card
} from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import UnifiedSearchFilters from '@/components/shared/UnifiedSearchFilters';
import UnifiedSummaryCards from '@/components/shared/UnifiedSummaryCards';
import { exportData } from '@/utils/exportUtils';
import {
  MailOutlined,
  PlusOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../../../lib/auth/auth-context';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import dayjs from 'dayjs';

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
  // Email Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} templates`,
  });

  const notification = useNotification();
  const notificationRef = React.useRef(notification);
  notificationRef.current = notification;

  // Email Template Functions
  const fetchTemplates = async (showSuccessNotification: boolean = true) => {
    setTemplateLoading(true);
    try {
      const response = await fetch('/api/admin/email-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        if (showSuccessNotification) {
          const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.REFRESH_SUCCESS;
          notificationRef.current.success(msg.message, msg.description, msg.duration);
        }
      } else {
        const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.FETCH_ERROR;
        notificationRef.current.error(msg.message, msg.description, msg.duration);
      }
    } catch {
      const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.FETCH_NETWORK_ERROR;
      notificationRef.current.error(msg.message, msg.description, msg.duration);
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
        await response.json();
        const msg = editingTemplate ? NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.UPDATE_SUCCESS : NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.CREATE_SUCCESS;
        notification.success(msg.message, msg.description, msg.duration);
        setModalVisible(false);
        templateForm.resetFields();
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.SAVE_ERROR;
        notification.error(msg.message, msg.description, msg.duration);
      }
    } catch {
      const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.SAVE_NETWORK_ERROR;
      notification.error(msg.message, msg.description, msg.duration);
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
        const msg = !isActive ? NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.ACTIVATE_SUCCESS : NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.DEACTIVATE_SUCCESS;
        notification.success(msg.message, msg.description, msg.duration);
        fetchTemplates();
      } else {
        const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.TOGGLE_ERROR;
        notification.error(msg.message, msg.description, msg.duration);
      }
    } catch {
      const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.TOGGLE_NETWORK_ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    }
  };

  // Filter templates based on search and filters
  const getFilteredTemplates = () => {
    let filtered = getCurrentTabTemplates();

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower) ||
        template.type.toLowerCase().includes(searchLower) ||
        template.htmlContent.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(template => 
        statusFilter === 'active' ? template.isActive : !template.isActive
      );
    }

    // Apply type filter
    if (typeFilter) {
      if (typeFilter === 'auth') {
        filtered = filtered.filter(template => template.type.startsWith('auth_'));
      } else if (typeFilter === 'quotation') {
        filtered = filtered.filter(template => template.type.startsWith('quotation_'));
      } else {
        filtered = filtered.filter(template => template.type === typeFilter);
      }
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(template => {
        const createdAt = dayjs(template.createdAt);
        return createdAt.isAfter(startDate) && createdAt.isBefore(endDate);
      });
    }

    return filtered;
  };

  // Define system types once
  const systemTypes = [
    'auth_welcome', 'auth_approval', 'auth_rejection', 'auth_otp', 'auth_password_reset', 
    'auth_admin_notification', 'auth_profile_submitted', 'auth_reapproval', 'auth_admin_user_verification',
    'quotation_sent', 'quotation_accepted', 'quotation_rejected', 
    'quotation_revision_requested', 'quotation_revision_sent'
  ];

  // Get system templates
  const getSystemTemplates = () => {
    return templates.filter(template => systemTypes.includes(template.type));
  };

  // Get user templates (templates that are not in system types)
  const getUserTemplates = () => {
    return templates.filter(template => !systemTypes.includes(template.type));
  };

  // Get templates for current tab
  const getCurrentTabTemplates = () => {
    if (activeTab === 'system') {
      return getSystemTemplates();
    } else if (activeTab === 'user') {
      return getUserTemplates();
    } else {
      return templates; // All templates
    }
  };

  const currentTabTemplates = getCurrentTabTemplates();
  const systemTemplates = getSystemTemplates();
  const userTemplates = getUserTemplates();

  // Summary cards data
  const summaryData = [
    {
      title: 'All Templates',
      value: templates.length,
      icon: <MailOutlined />,
      color: '#1890ff',
    },
    {
      title: 'System Templates',
      value: systemTemplates.length,
      icon: <MailOutlined />,
      color: '#52c41a',
    },
    {
      title: 'User Templates',
      value: userTemplates.length,
      icon: <PlusOutlined />,
      color: '#faad14',
    },
    {
      title: 'Active Templates',
      value: currentTabTemplates.filter(t => t.isActive).length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Inactive Templates',
      value: currentTabTemplates.filter(t => !t.isActive).length,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
    },
   
  ];

  // Export function
  const handleExport = () => {
    setExportLoading(true);
    try {
      const filteredData = getFilteredTemplates();
      const columns = [
        { key: 'name', title: 'Template Name' },
        { key: 'type', title: 'Type' },
        { key: 'subject', title: 'Subject' },
        { key: 'isActive', title: 'Status', render: (value: boolean) => value ? 'Active' : 'Inactive' },
        { key: 'createdAt', title: 'Created Date' },
        { key: 'updatedAt', title: 'Last Updated' },
      ];
      exportData(filteredData, columns, `email_templates_${new Date().toISOString().split('T')[0]}.csv`);
      const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.EXPORT_SUCCESS;
      notification.success(msg.message, `Exported ${filteredData.length} email templates to CSV`, msg.duration);
    } catch {
      const msg = NOTIFICATION_MESSAGES.EMAIL_TEMPLATES.EXPORT_ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setExportLoading(false);
    }
  };

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleStatusFilterChange = (value: string | number | [string, string] | undefined) => {
    setStatusFilter(value as string);
  };

  const handleTypeFilterChange = (value: string | number | [string, string] | undefined) => {
    setTypeFilter(value as string);
  };

  const handleDateRangeChange = (value: string | number | [string, string] | undefined) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      setDateRange([
        start ? dayjs(start) : null,
        end ? dayjs(end) : null
      ]);
    } else {
      setDateRange(null);
    }
  };

  const handleRefresh = () => {
    fetchTemplates();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setTypeFilter('');
    setDateRange(null);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    templateForm.setFieldsValue({
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
    });
    setModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Clear filters when switching tabs
    setSearchText('');
    setStatusFilter('');
    setTypeFilter('');
    setDateRange(null);
    // Reset pagination when switching tabs
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Pagination handlers
  const handleTableChange = (paginationConfig: { current?: number; pageSize?: number }) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current || prev.current,
      pageSize: paginationConfig.pageSize || prev.pageSize,
    }));
  };

  // Fetch templates when component mounts (for admin users)
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTemplates(false);
    }
  }, [user?.role]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
        <div className="mb-4 lg:mb-0">
          <Title level={2} className="text-lg md:text-2xl">
            <MailOutlined style={{ marginRight: 8 }} />
            Email Templates
          </Title>
          <Text type="secondary" style={{ display: 'block' }} className="text-sm md:text-base">
            Manage the content of all system emails sent by the platform
                </Text>
            </div>
            <Button
              type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTemplate(null);
            templateForm.resetFields();
            setModalVisible(true);
          }}
          size="large"
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Create Template</span>
            </Button>
          </div>

      {/* Summary Cards */}
      <UnifiedSummaryCards 
        data={summaryData}
        loading={templateLoading}
        style={{ marginBottom: 24 }}
      />

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          items={[
          {
            key: 'all',
            label: (
              <span>
                <MailOutlined />
                All Templates ({templates.length})
              </span>
            ),
            children: (
              <div>
                {/* Search and Filters */}
                <UnifiedSearchFilters
                  searchText={searchText}
                  onSearchTextChange={handleSearchChange}
                  searchPlaceholder="Search all templates by name, subject, or content..."
                  filters={[
                    {
                      key: 'status',
                      type: 'select',
                      placeholder: 'Filter by status',
                      value: statusFilter,
                      onChange: handleStatusFilterChange,
                      options: [
                        { value: '', label: 'All Status' },
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ],
                    },
                    {
                      key: 'type',
                      type: 'select',
                      placeholder: 'Filter by type',
                      value: typeFilter,
                      onChange: handleTypeFilterChange,
                      options: [
                        { value: '', label: 'All Types' },
                        { value: 'auth', label: 'Authentication Module' },
                        { value: 'quotation', label: 'Quotation Module' },
                      ],
                    },
                    {
                      key: 'dateRange',
                      type: 'dateRange',
                      value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
                      onChange: handleDateRangeChange,
                    },
                  ]}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                  onReset={handleResetFilters}
                  loading={templateLoading}
                  exportLoading={exportLoading}
                />

                <UnifiedTable
                  dataSource={getFilteredTemplates()}
                  loading={templateLoading}
                  rowKey="_id"
                  pagination={{
                    ...pagination,
                    total: getFilteredTemplates().length,
                  }}
                  onChange={handleTableChange}
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
                        <Tag color={isActive ? 'green' : 'red'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Type',
                      dataIndex: 'type',
                      key: 'type',
                      render: (type) => {
                        const isSystem = systemTypes.includes(type);
                        return (
                          <Tag color={isSystem ? 'blue' : 'green'}>
                            {isSystem ? 'System' : 'User Created'}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: 'Created Date',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => dayjs(date).format('MMM DD, YYYY'),
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTemplate(record)}
                            size="small"
                          >
                            Edit
                          </Button>
                          <Button
                            type="link"
                            onClick={() => handleToggleTemplate(record._id, !record.isActive)}
                            size="small"
                            style={{ color: record.isActive ? '#ff4d4f' : '#52c41a' }}
                          >
                            {record.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: 'system',
            label: (
              <span>
                <MailOutlined />
                System Templates ({systemTemplates.length})
              </span>
            ),
            children: (
              <div>
                {/* Search and Filters */}
                <UnifiedSearchFilters
                  searchText={searchText}
                  onSearchTextChange={handleSearchChange}
                  searchPlaceholder="Search system templates by name, subject, or content..."
                  filters={[
                    {
                      key: 'status',
                      type: 'select',
                      placeholder: 'Filter by status',
                      value: statusFilter,
                      onChange: handleStatusFilterChange,
                      options: [
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ],
                    },
                    {
                      key: 'type',
                      type: 'select',
                      placeholder: 'Filter by type',
                      value: typeFilter,
                      onChange: handleTypeFilterChange,
                      options: [
                        { value: '', label: 'All Types' },
                        { value: 'auth', label: 'Authentication Module' },
                        { value: 'quotation', label: 'Quotation Module' },
                      ],
                    },
                    {
                      key: 'dateRange',
                      type: 'dateRange',
                      value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
                      onChange: handleDateRangeChange,
                    },
                  ]}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                  onReset={handleResetFilters}
                  loading={templateLoading}
                  exportLoading={exportLoading}
                />

        <UnifiedTable
                  dataSource={getFilteredTemplates()}
          loading={templateLoading}
          rowKey="_id"
                  pagination={{
                    ...pagination,
                    total: getFilteredTemplates().length,
                  }}
                  onChange={handleTableChange}
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
              </div>
            ),
          },
          {
            key: 'user',
            label: (
              <span>
                <PlusOutlined />
                User Created ({userTemplates.length})
              </span>
            ),
            children: (
              <div>
                {/* Search and Filters */}
                <UnifiedSearchFilters
                  searchText={searchText}
                  onSearchTextChange={handleSearchChange}
                  searchPlaceholder="Search user-created templates by name, subject, or content..."
                  filters={[
                    {
                      key: 'status',
                      type: 'select',
                      placeholder: 'Filter by status',
                      value: statusFilter,
                      onChange: handleStatusFilterChange,
                      options: [
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ],
                    },
                    {
                      key: 'type',
                      type: 'select',
                      placeholder: 'Filter by type',
                      value: typeFilter,
                      onChange: handleTypeFilterChange,
                      options: [
                        { value: '', label: 'All Types' },
                        { value: 'custom', label: 'Custom' },
                        { value: 'marketing', label: 'Marketing' },
                        { value: 'newsletter', label: 'Newsletter' },
                        { value: 'promotional', label: 'Promotional' },
                        { value: 'announcement', label: 'Announcement' },
                        { value: 'notification', label: 'Notification' },
                        { value: 'reminder', label: 'Reminder' },
                        { value: 'alert', label: 'Alert' },
                      ],
                    },
                    {
                      key: 'dateRange',
                      type: 'dateRange',
                      value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
                      onChange: handleDateRangeChange,
                    },
                  ]}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                  onReset={handleResetFilters}
                  loading={templateLoading}
                  exportLoading={exportLoading}
                />

                <UnifiedTable
                  dataSource={getFilteredTemplates()}
                  loading={templateLoading}
                  rowKey="_id"
                  pagination={{
                    ...pagination,
                    total: getFilteredTemplates().length,
                  }}
                  onChange={handleTableChange}
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
          locale={{
                    emptyText: currentTabTemplates.length === 0 && !templateLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <MailOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>No User Templates Found</div>
                        <div style={{ color: token.colorTextSecondary }}>No user-created templates have been created yet.</div>
                      </div>
                    ) : undefined
                  }}
                />
              </div>
            ),
          },
        ]}
        />
      </Card>

      {/* Create/Edit Modal */}
        <Modal
          title={`${editingTemplate ? 'Edit' : 'Create'} Email Template`}
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
            {!editingTemplate && (
              <>
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[{ required: true, message: 'Please enter template name' }]}
                >
                  <Input placeholder="e.g., Welcome Email Template" />
                </Form.Item>
                
                <Form.Item
                  name="type"
                  label="Template Type"
                  rules={[{ required: true, message: 'Please enter template type' }]}
                >
                  <Input placeholder="e.g., custom_welcome, marketing_promo, newsletter_weekly" />
                </Form.Item>
              </>
            )}
            
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
  );
};

export default EmailTemplatesPage;