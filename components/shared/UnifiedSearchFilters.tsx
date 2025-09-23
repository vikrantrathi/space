'use client';

import React from 'react';
import { Card, Space, Input, Select, DatePicker, Button, Dropdown, theme } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, ReloadOutlined, DownloadOutlined, ClearOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export interface SearchFilterOption {
  value: string;
  label: string;
}

export interface UnifiedSearchFiltersProps {
  // Search functionality
  searchText: string;
  onSearchTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  
  // Additional filters
  filters?: Array<{
    key: string;
    type: 'input' | 'select' | 'dateRange';
    placeholder?: string;
    value: string | number | [string, string] | undefined;
    onChange: (value: string | number | [string, string] | undefined) => void;
    options?: SearchFilterOption[];
    prefix?: React.ReactNode;
  }>;
  
  // Actions
  onRefresh: () => void;
  onExport?: () => void;
  onClear?: () => void;
  onReset?: () => void;
  clearMenuItems?: MenuProps['items'];
  
  // Loading states
  loading?: boolean;
  clearLoading?: boolean;
  exportLoading?: boolean;
  
  // Customization
  showRefresh?: boolean;
  showExport?: boolean;
  showClear?: boolean;
  showReset?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Unified search and filter component that can be reused across different table views
 */
const UnifiedSearchFilters: React.FC<UnifiedSearchFiltersProps> = ({
  searchText,
  onSearchTextChange,
  searchPlaceholder = "Search...",
  filters = [],
  onRefresh,
  onExport,
  onClear,
  onReset,
  clearMenuItems,
  loading = false,
  clearLoading = false,
  exportLoading = false,
  showRefresh = true,
  showExport = true,
  showClear = false,
  showReset = true,
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const renderFilter = (filter: {
    key: string;
    type: 'input' | 'select' | 'dateRange';
    placeholder?: string;
    value: string | number | [string, string] | undefined;
    onChange: (value: string | number | [string, string] | undefined) => void;
    options?: SearchFilterOption[];
    prefix?: React.ReactNode;
  }) => {
    switch (filter.type) {
      case 'input':
        return (
          <Input
            placeholder={filter.placeholder}
            value={filter.value as string}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[180px]"
            allowClear
            prefix={filter.prefix}
            size="large"
          />
        );
      
      case 'select':
        return (
          <Select
            placeholder={filter.placeholder}
            className="w-full sm:w-auto sm:min-w-[160px]"
            allowClear
            value={filter.value || undefined}
            onChange={filter.onChange}
            options={filter.options}
            size="large"
          />
        );
      
      case 'dateRange':
        return (
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            value={Array.isArray(filter.value) && filter.value.length === 2 
              ? [dayjs(filter.value[0]), dayjs(filter.value[1])] 
              : null}
            onChange={(dates) => filter.onChange(dates ? [dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || ''] : undefined)}
            className="w-full sm:w-auto sm:min-w-[240px]"
            size="large"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card 
      style={{ 
        marginBottom: 16, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
        ...style 
      }}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main search input */}
          <Input
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={onSearchTextChange}
            className="w-full lg:w-auto lg:min-w-[300px] lg:flex-1"
            allowClear
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            size="large"
          />

          {/* Additional filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {filters.map((filter, index) => (
              <React.Fragment key={filter.key || index}>
                {renderFilter(filter)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex flex-row gap-2 justify-end">
          {showRefresh && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              className="min-w-[100px]"
              size="large"
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}
          
          {showExport && onExport && (
            <Button
              icon={<DownloadOutlined />}
              onClick={onExport}
              loading={exportLoading}
              type="default"
              className="min-w-[120px]"
              size="large"
            >
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          )}
          
          {showClear && (clearMenuItems ? (
            <Dropdown
              menu={{ items: clearMenuItems }}
              trigger={['click']}
              disabled={clearLoading}
            >
              <Button
                icon={<ClearOutlined />}
                danger
                loading={clearLoading}
                className="min-w-[100px]"
                size="large"
              >
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </Dropdown>
          ) : (
            <Button
              icon={<ClearOutlined />}
              onClick={onClear}
              danger
              loading={clearLoading}
              className="min-w-[100px]"
              size="large"
            >
              <span className="hidden sm:inline">Clear</span>
            </Button>
          ))}
          
          {showReset && onReset && (
            <Button
              icon={<UndoOutlined />}
              onClick={onReset}
              type="default"
              className="min-w-[100px]"
              size="large"
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UnifiedSearchFilters;
