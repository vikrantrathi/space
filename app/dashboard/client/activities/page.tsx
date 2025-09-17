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
import { useAuth } from '../../../../lib/auth/auth-context';

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

const ClientActivitiesPage: React.FC = () => {
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalActivities, setTotalActivities] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Fetch activities for the current client
  const fetchActivities = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchText && { search: searchText }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(dateRange && {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/client/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setTotalActivities(data.total);
      } else {
        notification.error({
          message: 'Failed to Load Activities',
          description: 'Unable to load your activity log.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error Loading Activities',
        description: 'Network error occurred while loading activities.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage, pageSize, searchText, filterType, dateRange, user?.id]);

  const handleRefresh = () => {
    fetchActivities();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login':
        return <KeyOutlined style={{ color: '#1890ff' }} />;
      case 'user_signup':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      case 'profile_updated':
        return <UserSwitchOutlined style={{ color: '#faad14' }} />;
      case 'email_sent':
        return <MailOutlined style={{ color: '#722ed1' }} />;
      case 'quotation_viewed':
        return <CheckCircleOutlined style={{ color: '#13c2c2' }} />;
      default:
        return <HistoryOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getActivityTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      user_login: { color: 'blue', label: 'Login' },
      user_signup: { color: 'green', label: 'Registration' },
      profile_updated: { color: 'orange', label: 'Profile Update' },
      email_sent: { color: 'purple', label: 'Email Sent' },
      quotation_viewed: { color: 'cyan', label: 'Quotation Viewed' },
      password_reset: { color: 'red', label: 'Password Reset' },
    };

    const typeInfo = typeMap[type] || { color: 'default', label: type };
    return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
  };

  const columns = [
    {
      title: 'Activity',
      key: 'activity',
      render: (record: Activity) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '16px' }}>
            {getActivityIcon(record.type)}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {record.description}
            </div>
            <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
              {record.ipAddress && `IP: ${record.ipAddress}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getActivityTypeTag(type),
      width: 120,
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {dayjs(date).format('MMM DD, YYYY')}
          </div>
          <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
            {dayjs(date).format('HH:mm:ss')}
          </div>
        </div>
      ),
      width: 140,
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'user_login', label: 'Login' },
    { value: 'user_signup', label: 'Registration' },
    { value: 'profile_updated', label: 'Profile Updates' },
    { value: 'email_sent', label: 'Email Sent' },
    { value: 'quotation_viewed', label: 'Quotation Views' },
    { value: 'password_reset', label: 'Password Reset' },
  ];

  return (
    <div className="px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <Title level={2} style={{ margin: 0 }} className="text-lg md:text-2xl">
            <HistoryOutlined style={{ marginRight: 8 }} />
            My Activity Log
          </Title>
          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }} className="text-sm md:text-base">
            Track your account activities and actions
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto sm:min-w-[200px] sm:flex-1">
            <Input
              placeholder="Search activities..."
              value={searchText}
              onChange={handleSearchChange}
              prefix={<HistoryOutlined />}
              allowClear
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Select
              value={filterType}
              onChange={handleFilterChange}
              className="w-full"
              options={filterOptions}
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
              placeholder={['Start Date', 'End Date']}
            />
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </Card>

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
          scroll={{ x: 'max-content' }}
          size="middle"
          style={{ backgroundColor: token.colorBgContainer }}
          locale={{
            emptyText: activities.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <HistoryOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>No Activities Found</div>
                <div style={{ color: token.colorTextSecondary }}>No activities have been recorded yet.</div>
              </div>
            ) : undefined
          }}
        />
      </Card>
    </div>
  );
};

export default ClientActivitiesPage;
