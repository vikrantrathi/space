'use client';

import React from 'react';
import { Card, Space, Input, Select, DatePicker, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, ReloadOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export interface ActivitiesFiltersProps {
  searchText: string;
  onSearchTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userIdFilter: string;
  onUserIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  onDateRangeChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  clearMenuItems: MenuProps['items'];
  clearLoading: boolean;
  loading?: boolean;
}

/**
 * Responsive filters bar for Admin Activities page
 */
const ActivitiesFilters: React.FC<ActivitiesFiltersProps> = ({
  searchText,
  onSearchTextChange,
  userIdFilter,
  onUserIdChange,
  filterType,
  onFilterTypeChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExportCSV,
  clearMenuItems,
  clearLoading,
  loading,
}) => {
  return (
    <Card style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap size="middle" style={{ flex: 1, minWidth: 260 }}>
          <Input
            placeholder="Search activities or user emails"
            value={searchText}
            onChange={onSearchTextChange}
            style={{ minWidth: 220, flex: 1 }}
            allowClear
            prefix={<span style={{ color: '#999' }}>🔍</span>}
          />

          <Input
            placeholder="Filter by User ID"
            value={userIdFilter}
            onChange={onUserIdChange}
            style={{ minWidth: 180 }}
            allowClear
            prefix={<UserOutlined style={{ color: '#999' }} />}
          />

          <Select
            placeholder="Filter by activity type"
            style={{ minWidth: 200 }}
            allowClear
            value={filterType || undefined}
            onChange={onFilterTypeChange}
            options={[
              { value: 'user_signup', label: 'User Signup' },
              { value: 'user_login', label: 'User Login' },
              { value: 'profile_approved', label: 'Profile Approved' },
              { value: 'profile_rejected', label: 'Profile Rejected' },
              { value: 'user_activated', label: 'User Activated' },
              { value: 'user_deactivated', label: 'User Deactivated' },
              { value: 'email_sent', label: 'Email Sent' },
              { value: 'password_reset', label: 'Password Reset' },
              { value: 'admin_action', label: 'Admin Action' },
              { value: 'quotation_viewed', label: 'Quotation Viewed' },
              { value: 'quotation_action', label: 'Quotation Action' },
            ]}
          />

          <RangePicker
            placeholder={['Start Date', 'End Date']}
            value={dateRange}
            onChange={onDateRangeChange}
            style={{ minWidth: 260 }}
          />
        </Space>

        <Space wrap size="middle">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={onExportCSV}
            type="default"
          >
            Export CSV
          </Button>
          <Dropdown
            menu={{ items: clearMenuItems }}
            trigger={['click']}
            disabled={clearLoading}
          >
            <Button
              icon={<ClearOutlined />}
              danger
              loading={clearLoading}
            >
              Delete Activity
            </Button>
          </Dropdown>
        </Space>
      </Space>
    </Card>
  );
};

export default ActivitiesFilters;