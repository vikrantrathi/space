'use client';

import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import {
  Card,
  Typography,
  Tag,
  Select,
  Space,
  Avatar,
  Tooltip,
  DatePicker,
  Input,
  Button,
  Modal,
  Dropdown,
  theme
} from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import {
  HistoryOutlined,
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserSwitchOutlined,
  KeyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ClearOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ActivitiesFilters from '@/components/admin/activities/ActivitiesFilters';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Activity {
  _id: string;
  type: string;
  description: string;
  userId?: { name: string; email: string };
  userEmail?: string;
  adminId?: { name: string; email: string };
  adminEmail?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const AdminActivitiesPage: React.FC = () => {
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [clearLoading, setClearLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
    period: string;
  }>({
    visible: false,
    title: '',
    content: '',
    period: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    activityId: string;
    description: string;
  }>({
    visible: false,
    activityId: '',
    description: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch activities
  const fetchActivities = async (
    type?: string,
    dates?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    search?: string,
    userId?: string,
    page: number = 1,
    size: number = pageSize
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (dates && dates[0] && dates[1]) {
        params.append('startDate', dates[0].toISOString());
        params.append('endDate', dates[1].toISOString());
      }
      if (search) params.append('search', search);
      if (userId) params.append('userId', userId);
      params.append('page', page.toString());
      params.append('limit', size.toString());

      const response = await fetch(`/api/admin/activities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setTotalActivities(data.total || 0);

      } else {
        console.error('Failed to load activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(filterType || undefined, dateRange, searchText || undefined, userIdFilter || undefined, currentPage, pageSize);
  }, [filterType, dateRange, searchText, userIdFilter, currentPage, pageSize]);

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterType(value);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, _dateStrings?: [string, string]) => {
    setDateRange(dates);
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle user ID change
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserIdFilter(e.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    const currentFilters = {
      type: filterType || undefined,
      dateRange: dateRange,
      search: searchText || undefined,
      userId: userIdFilter || undefined
    };

    fetchActivities(currentFilters.type, currentFilters.dateRange, currentFilters.search, currentFilters.userId);

  };

  // Show confirmation modal
  const showConfirmModal = (title: string, content: string, period: string) => {
    setConfirmModal({
      visible: true,
      title,
      content,
      period
    });
  };

  // Handle confirm modal OK
  const handleConfirmModalOk = () => {
    handleClearActivity(confirmModal.period);
    setConfirmModal({ visible: false, title: '', content: '', period: '' });
  };

  // Handle confirm modal cancel
  const handleConfirmModalCancel = () => {
    setConfirmModal({ visible: false, title: '', content: '', period: '' });
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (activities.length === 0) {
      console.warn('No activities to export');
      return;
    }

    try {
      const headers = ['Date', 'Type', 'Description', 'User', 'User Email', 'Admin', 'Admin Email', 'IP Address', 'User Agent'];
      const csvData = activities.map(activity => [
        dayjs(activity.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        activity.type,
        activity.description,
        activity.userId?.name || '',
        activity.userEmail || '',
        activity.adminId?.name || '',
        activity.adminEmail || '',
        activity.ipAddress || '',
        activity.userAgent || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activities_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Handle clear activity
  const handleClearActivity = async (period: string) => {
    setClearLoading(true);
    try {
      // Debug log removed
      const response = await fetch(`/api/admin/activities?period=${period}`, {
        method: 'DELETE',
      });

      // Debug logs removed

      if (response.ok) {
        const data = await response.json();
        // Debug log removed

        notification.success({
          message: 'Activities Deleted',
          description: `Successfully deleted ${data.deletedCount} activities`,
          duration: 4,
        });

        // Refresh the activities list
        fetchActivities(filterType || undefined, dateRange, searchText || undefined, userIdFilter || undefined, 1, pageSize);
        setCurrentPage(1); // Reset to first page on clear
      } else {
        const error = await response.json();
        console.error('Failed to clear activities:', error.error);
        notification.error({
          message: 'Delete Failed',
          description: error.error || 'Failed to delete activities',
          duration: 4,
        });
      }
    } catch (error) {
      console.error('Clear activities error:', error);
    } finally {
      setClearLoading(false);
    }
  };

  // Handle delete single activity
  const handleDeleteActivity = async (activityId: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notification.success({
          message: 'Activity Deleted',
          description: 'The activity has been successfully deleted',
          duration: 3,
        });

        // Remove the deleted activity from the state
        setActivities(prev => prev.filter(activity => activity._id !== activityId));
        setTotalActivities(prev => prev - 1);

        // Handle pagination adjustment
        const remainingItems = activities.filter(activity => activity._id !== activityId).length;
        if (remainingItems === 0 && currentPage > 1) {
          // If current page is empty and not the first page, go to previous page
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          fetchActivities(filterType || undefined, dateRange, searchText || undefined, userIdFilter || undefined, newPage, pageSize);
        } else if (remainingItems < pageSize && totalActivities - 1 > (currentPage - 1) * pageSize) {
          // If current page has fewer items than pageSize, refetch to ensure consistency
          fetchActivities(filterType || undefined, dateRange, searchText || undefined, userIdFilter || undefined, currentPage, pageSize);
        }
      } else {
        const error = await response.json();
        console.error('Failed to delete activity:', error.error);
        notification.error({
          message: 'Delete Failed',
          description: error.error || 'Failed to delete the activity',
          duration: 4,
        });
      }
    } catch (error) {
      console.error('Delete activity error:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteModal({ visible: false, activityId: '', description: '' });
    }
  };

  // Show delete confirmation modal
  const showDeleteModal = (activityId: string, description: string) => {
    setDeleteModal({
      visible: true,
      activityId,
      description
    });
  };

  // Handle delete modal OK
  const handleDeleteModalOk = () => {
    handleDeleteActivity(deleteModal.activityId);
  };

  // Handle delete modal cancel
  const handleDeleteModalCancel = () => {
    setDeleteModal({ visible: false, activityId: '', description: '' });
  };

  // Clear activity menu items
  const clearMenuItems = [
    {
      key: 'today',
      label: 'Clear Today\'s Activities',
      onClick: () => showConfirmModal(
        'Clear Today\'s Activities',
        'Are you sure you want to delete all activities from today? This action cannot be undone.',
        'today'
      ),
    },
    {
      key: 'yesterday',
      label: 'Clear Yesterday\'s Activities',
      onClick: () => showConfirmModal(
        'Clear Yesterday\'s Activities',
        'Are you sure you want to delete all activities from yesterday? This action cannot be undone.',
        'yesterday'
      ),
    },
    {
      key: '7days',
      label: 'Clear Activities Older Than 7 Days',
      onClick: () => showConfirmModal(
        'Clear Activities Older Than 7 Days',
        'Are you sure you want to delete all activities older than 7 days? This action cannot be undone.',
        '7days'
      ),
    },
    {
      key: '30days',
      label: 'Clear Activities Older Than 30 Days',
      onClick: () => showConfirmModal(
        'Clear Activities Older Than 30 Days',
        'Are you sure you want to delete all activities older than 30 days? This action cannot be undone.',
        '30days'
      ),
    },
    {
      key: 'all',
      label: 'Clear All Activities',
      danger: true,
      onClick: () => showConfirmModal(
        'Clear All Activities',
        'Are you sure you want to delete ALL activities? This action cannot be undone and will permanently remove all activity logs.',
        'all'
      ),
    },
  ];

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'user_login':
        return <KeyOutlined style={{ color: '#52c41a' }} />;
      case 'profile_approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'profile_rejected':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'user_activated':
        return <UserSwitchOutlined style={{ color: '#52c41a' }} />;
      case 'user_deactivated':
        return <UserSwitchOutlined style={{ color: '#ff4d4f' }} />;
      case 'email_sent':
        return <MailOutlined style={{ color: '#1890ff' }} />;
      default:
        return <HistoryOutlined style={{ color: token.colorTextSecondary }} />;
    }
  };

  // Get activity type tag
  const getActivityTypeTag = (type: string) => {
    const typeColors: Record<string, string> = {
      user_signup: 'blue',
      user_login: 'green',
      profile_approved: 'green',
      profile_rejected: 'red',
      user_activated: 'green',
      user_deactivated: 'orange',
      email_sent: 'blue',
      password_reset: 'purple',
      admin_action: 'red',
    };

    return (
      <Tag color={typeColors[type] || 'default'}>
        {type.replace('_', ' ').toUpperCase()}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Activity',
      key: 'activity',
      width: '25%',
      sorter: (a: Activity, b: Activity) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (record: Activity) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          backgroundColor: 'transparent'
        }}>
          {getActivityIcon(record.type)}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.description}</div>
            <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>
              {dayjs(record.createdAt).format('MMM DD, YYYY HH:mm')}
            </div>
            {/* Show additional details for client actions */}
            {record.type === 'quotation_action' && record.metadata && (() => {
              const metadata = record.metadata as { clientName?: string; clientPhone?: string; reason?: string };
              return (
                <div style={{ marginTop: '4px', fontSize: '11px', color: token.colorTextTertiary }}>
                  {metadata.clientName && (
                    <div>Name: {metadata.clientName}</div>
                  )}
                  {metadata.clientPhone && (
                    <div>Phone: {metadata.clientPhone}</div>
                  )}
                  {metadata.reason && (
                    <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
                      Reason: {metadata.reason}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      sorter: (a: Activity, b: Activity) => a.type.localeCompare(b.type),
      render: (type: string) => getActivityTypeTag(type),
    },
    {
      title: 'User',
      key: 'user',
      width: '20%',
      sorter: (a: Activity, b: Activity) => {
        const aName = a.userId?.name || a.userEmail || '';
        const bName = b.userId?.name || b.userEmail || '';
        return aName.localeCompare(bName);
      },
      render: (record: Activity) => {
        const userName = record.userId?.name || record.userEmail;
        if (!userName) return <Text type="secondary">N/A</Text>;

        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500' }}>{userName}</div>
              {record.userEmail && (
                <div style={{ color: token.colorTextSecondary, fontSize: '11px' }}>
                  {record.userEmail}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Admin',
      key: 'admin',
      width: '20%',
      sorter: (a: Activity, b: Activity) => {
        const aName = a.adminId?.name || a.adminEmail || '';
        const bName = b.adminId?.name || b.adminEmail || '';
        return aName.localeCompare(bName);
      },
      render: (record: Activity) => {
        const adminName = record.adminId?.name || record.adminEmail;
        if (!adminName) return <Text type="secondary">System</Text>;

        return (
          <Space>
            <Avatar size="small" style={{ backgroundColor: '#ff4d4f' }}>
              A
            </Avatar>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500' }}>{adminName}</div>
              {record.adminEmail && (
                <div style={{ color: token.colorTextSecondary, fontSize: '11px' }}>
                  {record.adminEmail}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Details',
      key: 'details',
      width: '10%',
      render: (record: Activity) => {
        const details = [];

        // Metadata details
        if (record.metadata) {
          if (record.metadata.emailSent) {
            details.push('📧 Email sent');
          }
          if (record.metadata.reason) {
            details.push(`📝 ${record.metadata.reason}`);
          }
          if (record.metadata.action) {
            details.push(`⚡ ${record.metadata.action}`);
          }
        }

        // IP Address
        if (record.ipAddress) {
          details.push(`🌐 ${record.ipAddress}`);
        }

        // User Agent (truncated for display)
        if (record.userAgent) {
          const truncatedUA = record.userAgent.length > 50
            ? record.userAgent.substring(0, 50) + '...'
            : record.userAgent;
          details.push(`📱 ${truncatedUA}`);
        }

        if (details.length === 0) return <Text type="secondary">No details</Text>;

        return (
          <div>
            {details.map((detail, index) => (
              <div key={index} style={{ fontSize: '11px', color: token.colorTextSecondary, lineHeight: '1.4' }}>
                {detail}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (record: Activity) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => showDeleteModal(record._id, record.description)}
          loading={deleteLoading && deleteModal.activityId === record._id}
          size="small"
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            Activity Log
          </Title>
          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
            Monitor all system activities and user actions
          </Text>
        </div>
      </div>

      {/* Filters */}
      <ActivitiesFilters
        searchText={searchText}
        onSearchTextChange={handleSearchChange}
        userIdFilter={userIdFilter}
        onUserIdChange={handleUserIdChange}
        filterType={filterType}
        onFilterTypeChange={handleFilterChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        clearMenuItems={clearMenuItems}
        clearLoading={clearLoading}
        loading={loading}
      />

      {/* Activities Table */}
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <UnifiedTable
          columns={columns}
          dataSource={activities}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalActivities,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} activities`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 800 }}
          size="middle"
          style={{ backgroundColor: token.colorBgContainer }}
        />
      </Card>

      {/* Delete Activity Confirmation Modal */}
      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={handleConfirmModalOk}
        onCancel={handleConfirmModalCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={clearLoading}
        centered
      >
        <p>{confirmModal.content}</p>
      </Modal>

      {/* Delete Activity Confirmation Modal */}
      <Modal
        title="Delete Activity"
        open={deleteModal.visible}
        onOk={handleDeleteModalOk}
        onCancel={handleDeleteModalCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={deleteLoading}
        centered
      >
        <p>Are you sure you want to delete this activity?</p>
        <p><strong>Description:</strong> {deleteModal.description}</p>
        <p style={{ color: '#ff4d4f' }}>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AdminActivitiesPage;
